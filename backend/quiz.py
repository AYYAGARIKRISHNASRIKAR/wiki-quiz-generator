from llm import generate_quiz_from_text, extract_related_topics_from_content
import json

def build_quiz_from_text(text: str, title: str = "Wikipedia Article") -> list:
    """
    Build quiz from Wikipedia text with error handling.
    
    Generates 6 questions: 2 easy, 2 medium, 2 hard
    Automatically switches to title-based generation if text is too short.
    
    Args:
        text: The Wikipedia article text
        title: The article title (used for fallback generation)
    
    Returns:
        list: Array of 6 quiz questions (2 easy, 2 medium, 2 hard)
    
    Raises:
        Exception: With descriptive error messages
    """
    try:
        # Generate quiz - passes title for fallback mode
        # Returns 6 questions: 2 easy, 2 medium, 2 hard
        quiz = generate_quiz_from_text(text, title)
        
        if not quiz:
            raise ValueError("Empty quiz generated")
        
        if not isinstance(quiz, list):
            raise ValueError("Invalid quiz format")
        
        if len(quiz) < 6:
            raise ValueError(f"Quiz has only {len(quiz)} questions (need 6: 2 easy, 2 medium, 2 hard)")
        
        print(f"✅ Quiz built: {len(quiz)} questions (2 easy, 2 medium, 2 hard)")
        return quiz
        
    except Exception as e:
        raise Exception(str(e))


def get_related_topics_from_content(title: str, content: str) -> dict:
    """
    Extract related topics and Wikipedia links from article content using AI.
    
    Strategy:
    1. First, extract section headers from content (See Also, Related topics, etc.)
    2. Use AI to identify 5 most relevant related topics from the article itself
    3. Generate corresponding Wikipedia links
    4. Fallback to AI extraction if no explicit sections found
    
    Args:
        title: The Wikipedia article title
        content: The full article content/text
    
    Returns:
        dict: Contains 'topics' (list of 5) and 'related_links' (list of 5 URLs)
    """
    
    try:
        print(f"🔗 Extracting related topics from article content for: {title}")
        
        # Try to extract from content using AI
        related = extract_related_topics_from_content(title, content)
        
        if related and len(related.get("topics", [])) >= 5:
            print(f"✅ Extracted 5 related topics from article content")
            return related
        else:
            print(f"⚠️  Could not extract 5 topics from content, using fallback")
            raise Exception("Insufficient topics extracted")
            
    except Exception as e:
        print(f"⚠️  Error extracting topics from content: {str(e)}")
        
        # Fallback: Return minimal structure
        return {
            "topics": [],
            "related_links": []
        }