from dotenv import load_dotenv

load_dotenv()

from tenacity import retry, stop_after_attempt, wait_fixed
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
import json
import os
import time

# ============ API KEY VERIFICATION ============
print("\n" + "="*50)
api_key_check = os.getenv("GOOGLE_API_KEY")
if api_key_check:
    masked_key = api_key_check[:10] + "..." + api_key_check[-5:]
    print(f"✅ GOOGLE_API_KEY LOADED: {masked_key}")
else:
    print("❌ ERROR: GOOGLE_API_KEY NOT FOUND!")
    print("   Make sure you have .env file with: GOOGLE_API_KEY=your_key")
print("="*50 + "\n")

# ============ LLM INITIALIZATION ============
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
    temperature=0.3
)

# ============ PROMPT TEMPLATE (FROM TEXT) ============
PROMPT = PromptTemplate(
    input_variables=["section", "text", "difficulty"],
    template="""
You are an expert educator.

Create EXACTLY 1 multiple-choice question from the SECTION below.

Rules:
- Use ONLY the SECTION TEXT
- 4 options (A–D)
- Correct answer must be one of A–D
- Difficulty MUST be: {difficulty}
- Add a 1–2 line explanation quoting the section
- Return ONLY valid JSON (no markdown)

JSON:
{{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "answer": "A|B|C|D",
  "difficulty": "{difficulty}",
  "section": "{section}",
  "explanation": "..."
}}

SECTION TEXT:
{text}
"""
)

# ============ PROMPT TEMPLATE (FROM TITLE - FALLBACK) ============
PROMPT_FALLBACK = PromptTemplate(
    input_variables=["title", "difficulty"],
    template="""
You are an expert educator creating educational quiz questions about "{title}".

Create EXACTLY 1 multiple-choice question at {difficulty} level.

Rules:
- Question must be factual about "{title}"
- 4 options (A–D)
- Correct answer must be one of A–D
- Add a 1–2 line explanation
- Return ONLY valid JSON (no markdown)

JSON:
{{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "answer": "A|B|C|D",
  "difficulty": "{difficulty}",
  "section": "{title}",
  "explanation": "..."
}}
"""
)

# ============ PROMPT FOR EXTRACTING RELATED TOPICS ============
PROMPT_EXTRACT_TOPICS = PromptTemplate(
    input_variables=["title", "content"],
    template="""
You are an expert content analyst analyzing a Wikipedia article.

Article Title: "{title}"

Article Content (excerpt):
{content}

Task: Identify the 5 most relevant related topics/subjects mentioned or implied in this article.

Rules:
- Topics should be actual concepts, subjects, or areas covered in the article
- NOT metadata or generic categories
- Topics should be things someone interested in this article would want to learn more about
- Each topic should be specific and related to the article content
- Return ONLY valid JSON (no markdown, no explanations)

JSON Format:
{{
  "topics": [
    "Topic 1",
    "Topic 2",
    "Topic 3",
    "Topic 4",
    "Topic 5"
  ],
  "wiki_links": [
    "https://en.wikipedia.org/wiki/Topic_1_name",
    "https://en.wikipedia.org/wiki/Topic_2_name",
    "https://en.wikipedia.org/wiki/Topic_3_name",
    "https://en.wikipedia.org/wiki/Topic_4_name",
    "https://en.wikipedia.org/wiki/Topic_5_name"
  ]
}}

Create proper Wikipedia URLs by replacing spaces with underscores.
"""
)

# ============ RETRY DECORATOR FOR ROBUSTNESS ============
@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def generate_one(section: str, text: str, difficulty: str):
    """
    Generate a single multiple-choice question with retry logic.
    
    Args:
        section: Section name or title
        text: The text content to generate question from
        difficulty: easy, medium, or hard
    
    Returns:
        dict: Question object or None if failed
    """
    try:
        # Invoke LLM with prompt
        resp = llm.invoke(
            PROMPT.format(
                section=section,
                text=text[:2500],
                difficulty=difficulty
            ),
            timeout=20
        )
        
        # Extract and clean response
        raw = resp.content.strip()
        if raw.startswith("```"):
            raw = raw.replace("```json", "").replace("```", "").strip()
        
        # Parse JSON
        return json.loads(raw)
    
    except json.JSONDecodeError:
        print(f"⚠️  Failed to parse JSON for {section} ({difficulty})")
        return None
    except Exception as e:
        print(f"⚠️  Error generating question for {section}: {str(e)}")
        return None

# ============ FALLBACK: GENERATE FROM TITLE ============
@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def generate_one_from_title(title: str, difficulty: str):
    """
    Fallback: Generate a single question from just the title.
    Used when article text is too short.
    
    Args:
        title: The Wikipedia article title
        difficulty: easy, medium, or hard
    
    Returns:
        dict: Question object or None if failed
    """
    try:
        print(f"📝 Using fallback mode: Generating from title '{title}'")
        
        # Invoke LLM with fallback prompt
        resp = llm.invoke(
            PROMPT_FALLBACK.format(
                title=title,
                difficulty=difficulty
            ),
            timeout=20
        )
        
        # Extract and clean response
        raw = resp.content.strip()
        if raw.startswith("```"):
            raw = raw.replace("```json", "").replace("```", "").strip()
        
        # Parse JSON
        return json.loads(raw)
    
    except json.JSONDecodeError:
        print(f"⚠️  Failed to parse JSON from title ({difficulty})")
        return None
    except Exception as e:
        print(f"⚠️  Error generating question from title: {str(e)}")
        return None

# ============ EXTRACT RELATED TOPICS FROM CONTENT USING AI ============
@retry(stop=stop_after_attempt(3), wait=wait_fixed(2))
def extract_related_topics_from_content(title: str, content: str) -> dict:
    """
    Use AI to extract 5 related topics from article content.
    Topics are extracted from actual article content, NOT metadata.
    
    Args:
        title: Article title
        content: Full article text
    
    Returns:
        dict: {'topics': [5 topics], 'related_links': [5 Wikipedia URLs]}
    """
    try:
        print(f"🤖 Using AI to extract related topics from '{title}'")
        
        # Limit content to first 3000 chars for API efficiency
        content_excerpt = content[:3000] if len(content) > 3000 else content
        
        # Invoke LLM to extract topics
        resp = llm.invoke(
            PROMPT_EXTRACT_TOPICS.format(
                title=title,
                content=content_excerpt
            ),
            timeout=20
        )
        
        # Extract and clean response
        raw = resp.content.strip()
        if raw.startswith("```"):
            raw = raw.replace("```json", "").replace("```", "").strip()
        
        # Parse JSON
        result = json.loads(raw)
        
        # Validate structure
        if "topics" in result and "wiki_links" in result:
            topics = result.get("topics", [])[:5]
            links = result.get("wiki_links", [])[:5]
            
            if len(topics) >= 5 and len(links) >= 5:
                print(f"✅ AI extracted 5 related topics from content")
                return {
                    "topics": topics,
                    "related_links": links
                }
        
        print(f"⚠️  Extracted topics but structure invalid")
        return None
        
    except json.JSONDecodeError:
        print(f"⚠️  Failed to parse AI-extracted topics JSON")
        return None
    except Exception as e:
        print(f"⚠️  Error extracting topics: {str(e)}")
        return None

# ============ BATCH GENERATION (WITH FALLBACK) - 6 QUESTIONS ============
def generate_quiz_from_text(text: str, title: str = "Wikipedia Article", retries: int = 3) -> list:
    """
    Generate a complete quiz from Wikipedia article text.
    Generates 6 questions: 2 easy, 2 medium, 2 hard
    Falls back to title-based generation if text is too short.
    
    Args:
        text: Full Wikipedia article text
        title: Article title (for fallback mode)
        retries: Number of retry attempts (default 3)
    
    Returns:
        list: Array of 6 quiz questions (2 easy, 2 medium, 2 hard)
    """
    
    quiz = []
    # 2 questions for each difficulty level
    difficulties = ["easy", "easy", "medium", "medium", "hard", "hard"]
    use_fallback = False
    
    # Check if text is too short
    if not text or len(text) < 500:
        print(f"⚠️  Text too short ({len(text)} chars). Switching to title-based generation.")
        use_fallback = True
    
    # Try to generate 6 questions (2 easy, 2 medium, 2 hard)
    for i, difficulty in enumerate(difficulties):
        for attempt in range(retries):
            try:
                if use_fallback:
                    # Use fallback: generate from title
                    print(f"🤖 Generating {difficulty} question #{i+1} from title (attempt {attempt + 1}/{retries})...")
                    
                    question = generate_one_from_title(
                        title=title,
                        difficulty=difficulty
                    )
                else:
                    # Use normal: generate from text
                    print(f"🤖 Generating {difficulty} question #{i+1} (attempt {attempt + 1}/{retries})...")
                    
                    question = generate_one(
                        section=f"Section {i+1}",
                        text=text,
                        difficulty=difficulty
                    )
                
                if question and "question" in question:
                    quiz.append(question)
                    print(f"✅ Generated {difficulty} question")
                    break
                else:
                    if attempt == retries - 1:
                        print(f"⚠️  Failed to generate {difficulty} question after {retries} attempts")
            
            except Exception as e:
                error_msg = str(e)
                
                # Rate limit handling
                if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                    if attempt < retries - 1:
                        print(f"⏱️  Rate limit hit. Waiting before retry...")
                        time.sleep(5)
                        continue
                    else:
                        raise Exception("Rate limit exceeded. Free tier: 60 requests/minute. Wait 1-2 minutes and try again.")
                
                # API Key issues
                elif "401" in error_msg or "UNAUTHENTICATED" in error_msg:
                    raise Exception(f"API Key Error: {error_msg}")
                
                # Other errors
                else:
                    if attempt < retries - 1:
                        print(f"⚠️  Attempt {attempt + 1} failed: {error_msg}")
                        continue
                    else:
                        raise Exception(f"Failed to generate questions: {error_msg}")
    
    if len(quiz) < 6:
        raise ValueError(f"Generated only {len(quiz)} questions (need at least 6: 2 easy, 2 medium, 2 hard)")
    
    print(f"✅ Quiz complete: {len(quiz)} questions generated (2 easy, 2 medium, 2 hard)")
    return quiz