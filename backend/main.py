import json
from datetime import datetime, timezone
from typing import List
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import get_db
from schemas import QuizRequest, QuizResponse, AttemptRequest, QuizHistoryItem
from scraper import scrape_wikipedia
from utils import (
    validate_wikipedia_url,
    http_422,
    http_404,
    http_500,
    score_attempt,
)
from quiz import build_quiz_from_text, get_related_topics_from_content
from llm import extract_related_topics_from_content

app = FastAPI(title="AI Wiki Quiz Generator")

# ========================
# CORS Configuration
# ========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# Health Check
# ========================

@app.get("/", operation_id="health_check")
def health():
    return {
        "status": "running",
        "message": "Backend is alive 🚀",
        "version": "1.0"
    }

# ========================
# Quiz History
# ========================

@app.get("/api/quizzes", response_model=List[QuizHistoryItem], operation_id="list_quizzes")
def list_quizzes():
    """Retrieve all previously generated quizzes from database"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            rows = cursor.execute("""
                SELECT q.id, a.title, a.url, q.created_at
                FROM quizzes q
                JOIN articles a ON q.article_id = a.id
                ORDER BY q.id DESC
            """).fetchall()
            
            return [
                {"id": r[0], "title": r[1], "url": r[2], "created_at": r[3]}
                for r in rows
            ]
    except Exception as e:
        http_500(f"Failed to retrieve quizzes: {str(e)}")

# ========================
# Generate Quiz (Main Endpoint)
# ========================

@app.post("/api/quizzes", operation_id="create_quiz")
def generate_quiz(payload: QuizRequest):
    """
    Generate a quiz from a Wikipedia article URL.
    
    Returns:
    - Quiz with 6 questions (2 easy, 2 medium, 2 hard)
    - 5 related topics (AI-extracted from article content)
    - 5 related Wikipedia links (AI-generated)
    
    Process:
    1. Validate the Wikipedia URL
    2. Check if article is cached (avoid re-scraping)
    3. Check if quiz is cached (avoid re-generation)
    4. If needed: Scrape article
    5. If needed: Generate quiz via Gemini AI
    6. Use AI to extract related topics from article content
    7. Cache result in database
    8. Return quiz + AI-extracted related topics + links to frontend
    """
    
    # Step 1: Validate URL
    if not validate_wikipedia_url(payload.url):
        http_422("Invalid URL. Only en.wikipedia.org/wiki/* URLs are supported.")
    
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            # ========== STEP 2: Check Article Cache ==========
            article = cursor.execute(
                "SELECT id, title, scraped_text FROM articles WHERE url = ?",
                (payload.url,)
            ).fetchone()
            
            if article:
                article_id, title, text = article
                print(f"✅ Using cached article: {title}")
            else:
                # ========== STEP 4: Scrape Article ==========
                try:
                    print(f"🔄 Scraping: {payload.url}")
                    scraped = scrape_wikipedia(payload.url)
                    
                    cursor.execute(
                        """
                        INSERT INTO articles (url, title, scraped_text, raw_html, created_at)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            payload.url,
                            scraped["title"],
                            scraped["text"],
                            scraped["raw_html"],
                            datetime.now(timezone.utc).isoformat()
                        )
                    )
                    conn.commit()
                    
                    article_id = cursor.lastrowid
                    title = scraped["title"]
                    text = scraped["text"]
                    print(f"✅ Article scraped: {title}")
                    
                except Exception as e:
                    error_msg = str(e)
                    if "timeout" in error_msg.lower():
                        http_500("Wikipedia request timed out. Please try again.")
                    else:
                        http_500(f"Scraping failed: {error_msg}")
            
            # ========== STEP 3: Check Quiz Cache ==========
            quiz_row = cursor.execute(
                "SELECT id, quiz_json FROM quizzes WHERE article_id = ?",
                (article_id,)
            ).fetchone()
            
            if quiz_row:
                quiz_id, quiz_json = quiz_row
                quiz = json.loads(quiz_json)
                print(f"✅ Using cached quiz for: {title}")
            else:
                # ========== STEP 5: Generate Quiz ==========
                try:
                    print(f"🤖 Generating quiz for: {title}")
                    # Pass title to quiz generation for fallback mode
                    quiz = build_quiz_from_text(text, title)
                    
                    cursor.execute(
                        """
                        INSERT INTO quizzes (article_id, quiz_json, llm_model, prompt_version, created_at)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            article_id,
                            json.dumps(quiz),
                            "gemini-2.5-flash",
                            "v1",
                            datetime.now(timezone.utc).isoformat()
                        )
                    )
                    conn.commit()
                    quiz_id = cursor.lastrowid
                    print(f"✅ Quiz generated: {len(quiz)} questions")
                    
                except Exception as e:
                    error_msg = str(e)
                    
                    # Error categorization for better UX
                    if "Rate limit" in error_msg:
                        http_500(
                            "⏱️ Gemini API rate limit reached (60 requests/minute free tier). "
                            "Please wait 1-2 minutes and try again. Already generated quizzes are cached."
                        )
                    elif "API Key" in error_msg or "UNAUTHENTICATED" in error_msg:
                        http_500(
                            "❌ Google API Key is invalid or missing. "
                            "Check your .env file: GOOGLE_API_KEY=your_key_here"
                        )
                    elif "Authentication" in error_msg or "401" in error_msg or "403" in error_msg:
                        http_500(
                            "❌ Google API authentication failed. "
                            "Verify your API Key has Gemini AI permissions enabled."
                        )
                    elif "Model" in error_msg or "NOT_FOUND" in error_msg:
                        http_500(
                            "❌ Gemini 2.5 Flash model not available. "
                            "Verify your API project has Gemini enabled."
                        )
                    elif "quota" in error_msg.lower():
                        http_500(
                            "⏱️ API quota exceeded. Upgrade to paid tier for higher limits. "
                            "Free tier: 60 requests/minute, 1500 requests/day"
                        )
                    else:
                        http_500(f"Quiz generation failed: {error_msg}")
            
            # ========== STEP 6: AI Extract Related Topics from Content ==========
            try:
                print(f"🤖 AI extracting related topics from article content for: {title}")
                related = extract_related_topics_from_content(title, text)
                
                if related and len(related.get("topics", [])) >= 5:
                    print(f"✅ AI extracted 5 related topics from content")
                else:
                    print(f"⚠️  AI could not extract enough topics, using empty arrays")
                    related = {
                        "topics": [],
                        "related_links": []
                    }
            except Exception as e:
                print(f"⚠️  Error during AI topic extraction: {str(e)}")
                related = {
                    "topics": [],
                    "related_links": []
                }
            
            # ========== STEP 8: Return Quiz + AI-Extracted Topics ==========
            return {
                "id": quiz_id,
                "url": payload.url,
                "title": title,
                "quiz": quiz,
                "related_topics": related.get("topics", []),
                "related_links": related.get("related_links", [])
            }
            
    except Exception as e:
        # Catch-all for unexpected database errors
        http_500(f"Backend error: {str(e)}")

# ========================
# Quiz Detail (Retrieve Specific Quiz)
# ========================

@app.get("/api/quizzes/{quiz_id}", operation_id="quiz_detail")
def quiz_detail(quiz_id: int):
    """Retrieve a specific quiz by ID"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            row = cursor.execute("""
                SELECT a.title, a.url, a.scraped_text, q.quiz_json
                FROM quizzes q
                JOIN articles a ON q.article_id = a.id
                WHERE q.id = ?
            """, (quiz_id,)).fetchone()
            
            if not row:
                http_404("Quiz not found")
            
            title, url, text, quiz_json = row
            
            # Extract related topics for this quiz
            try:
                related = extract_related_topics_from_content(title, text)
                if not related or len(related.get("topics", [])) < 5:
                    related = {"topics": [], "related_links": []}
            except:
                related = {"topics": [], "related_links": []}
            
            return {
                "id": quiz_id,
                "title": title,
                "url": url,
                "quiz": json.loads(quiz_json),
                "related_topics": related.get("topics", []),
                "related_links": related.get("related_links", [])
            }
    except Exception as e:
        http_500(f"Failed to retrieve quiz: {str(e)}")

# ========================
# Attempt Quiz (Submit Answers)
# ========================

@app.post("/api/quizzes/{quiz_id}/attempt", operation_id="attempt_quiz")
def attempt_quiz(quiz_id: int, payload: AttemptRequest):
    """Submit answers and get score"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            
            row = cursor.execute(
                "SELECT quiz_json FROM quizzes WHERE id = ?",
                (quiz_id,)
            ).fetchone()
            
            if not row:
                http_404("Quiz not found")
            
            quiz = json.loads(row[0])
            score, total, breakdown = score_attempt(quiz, payload.answers)
            
            cursor.execute(
                """
                INSERT INTO attempts (quiz_id, score, total, user_answers, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    quiz_id,
                    score,
                    total,
                    json.dumps(payload.answers),
                    datetime.now(timezone.utc).isoformat()
                )
            )
            conn.commit()
            
            return {
                "quiz_id": quiz_id,
                "score": score,
                "total": total,
                "percentage": round((score / total * 100) if total > 0 else 0, 2),
                "breakdown": breakdown
            }
    except Exception as e:
        http_500(f"Failed to process attempt: {str(e)}")

# ========================
# Server Startup Message
# ========================

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*50)
    print("🚀 AI Wiki Quiz Generator Backend")
    print("="*50)
    print("✅ Server started successfully")
    print("📚 API Docs: http://127.0.0.1:8000/docs")
    print("🤖 AI Features: Quiz generation + AI topic extraction")
    print("📊 Response: 6 questions + AI-extracted topics + Wikipedia links")
    print("="*50 + "\n")