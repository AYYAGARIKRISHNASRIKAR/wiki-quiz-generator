import requests
from bs4 import BeautifulSoup
from utils import http_500


def scrape_wikipedia(url: str) -> dict:
    """
    Scrapes an English Wikipedia article.
    Extracts the title, full text content, and section-wise text.
    """
    headers = {
        'User-Agent': 'WikiQuizGenerator/1.0 (Educational Project; contact: your@email.com)'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except Exception as e:
        http_500(f"Failed to fetch Wikipedia article: {str(e)}")
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 1. Extract Title
    title_tag = soup.find(id="firstHeading")
    title = title_tag.get_text() if title_tag else "Wikipedia Topic"
    
    # 2. Extract Main Content Body
    # We focus on the mw-parser-output class which contains the actual article text
    content_div = soup.find(id="mw-content-text")
    
    if content_div:
        parser_output = content_div.find(class_="mw-parser-output")
    else:
        parser_output = None
    
    if not parser_output:
        http_500("Could not identify the main content area of this article.")
    
    full_text_list = []
    section_texts = {}
    current_section = "Introduction"
    section_texts[current_section] = []
    
    # 3. Iterate through elements to organize by sections and build full text
    for el in parser_output.children:
        if el.name in ["h2", "h3"]:
            # New section header found - clean the title (remove [edit] etc)
            current_section = el.get_text(" ", strip=True).replace("[edit]", "").strip()
            section_texts[current_section] = []
        elif el.name == "p":
            # Paragraph text found
            para_text = el.get_text(" ", strip=True)
            if para_text:
                section_texts[current_section].append(para_text)
                full_text_list.append(para_text)
    
    # Clean up empty sections and join paragraphs
    final_sections = {
        k: "\n".join(v)
        for k, v in section_texts.items()
        if v
    }
    
    full_text = "\n\n".join(full_text_list)
    
    return {
        "title": title,
        "text": full_text,
        "sections": list(final_sections.keys()),
        "section_texts": final_sections,
        "raw_html": response.text
    }
