import sqlite3

from datetime import datetime
from contextlib import contextmanager


# The path to our SQLite database file
DB_PATH = "quizzes.db"


def init_db():
    """
    Initializes the database schema with thread-safe connection.
    This creates the necessary tables if they do not already exist.
    """
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        
        # Table to store scraped Wikipedia articles and their raw content
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE,
                title TEXT,
                scraped_text TEXT,
                raw_html TEXT,
                created_at TEXT
            )
        """)
        
        # Table to store generated quizzes associated with articles
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quizzes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                article_id INTEGER,
                quiz_json TEXT,
                llm_model TEXT,
                prompt_version TEXT,
                created_at TEXT,
                FOREIGN KEY(article_id) REFERENCES articles(id)
            )
        """)
        
        # Table to store user attempts and scores for specific quizzes
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                quiz_id INTEGER,
                score INTEGER,
                total INTEGER,
                user_answers TEXT,
                created_at TEXT,
                FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
            )
        """)
        
        conn.commit()


@contextmanager
def get_db():
    """
    Context manager for database connections.
    Ensures that each thread or request gets its own connection
    to avoid 'Recursive use of cursors' errors in FastAPI.
    """
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    try:
        yield conn
    finally:
        conn.close()


# Initialize the database schema immediately upon module import
try:
    init_db()
except Exception as e:
    print(f"⚠️  Database initialization warning: {e}")
    print("This is expected on read-only environments like Vercel Serverless.")
    print("Consider using Vercel Postgres for persistent storage.")

