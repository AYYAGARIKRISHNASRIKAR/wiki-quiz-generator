from pydantic import BaseModel
from typing import List


class QuizRequest(BaseModel):
    url: str


class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    answer: str
    difficulty: str
    explanation: str


class QuizResponse(BaseModel):
    url: str
    title: str
    quiz: List[QuizQuestion]


class AttemptRequest(BaseModel):
    answers: dict


class QuizHistoryItem(BaseModel):
    id: int
    title: str
    url: str
    created_at: str
