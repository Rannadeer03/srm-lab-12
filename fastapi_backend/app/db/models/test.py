from datetime import datetime
from typing import List
from bson import ObjectId
from pydantic import BaseModel, Field

class QuestionDB(BaseModel):
    _id: ObjectId = Field(default_factory=ObjectId)
    text: str
    options: List[str]
    correct_answer: int
    subject_id: str
    teacher_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TestDB(BaseModel):
    _id: ObjectId = Field(default_factory=ObjectId)
    title: str
    description: str
    subject_id: str
    teacher_id: str
    questions: List[ObjectId]
    duration_minutes: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TestResultDB(BaseModel):
    _id: ObjectId = Field(default_factory=ObjectId)
    test_id: ObjectId
    student_id: str
    score: float
    total_questions: int
    correct_answers: int
    started_at: datetime
    completed_at: datetime
    answers: List[int] 