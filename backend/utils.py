import re
from fastapi import HTTPException

def validate_wikipedia_url(url: str) -> bool:
    """Check if the URL is a valid English Wikipedia article URL."""
    pattern = r'^https?://en\.wikipedia\.org/wiki/[^#?]+$'
    return bool(re.match(pattern, url))

def http_422(detail: str):
    raise HTTPException(status_code=422, detail=detail)

def http_404(detail: str):
    raise HTTPException(status_code=404, detail=detail)

def http_500(detail: str):
    raise HTTPException(status_code=500, detail=detail)

def score_attempt(quiz_json: list, user_answers: dict):
    """
    Scores the user's quiz attempt.
    user_answers format: {"0": "A", "1": "C", ...}
    """
    score = 0
    total = len(quiz_json)
    breakdown = []

    for i, q in enumerate(quiz_json):
        user_ans = user_answers.get(str(i))
        is_correct = user_ans == q['answer']
        if is_correct:
            score += 1
        
        breakdown.append({
            "question_index": i,
            "user_answer": user_ans,
            "correct_answer": q['answer'],
            "is_correct": is_correct,
            "explanation": q.get('explanation', "")
        })

    return score, total, breakdown