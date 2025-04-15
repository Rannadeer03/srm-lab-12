from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class User:
    def __init__(self, id: int, email: str, hashed_password: str):
        self.id = id
        self.email = email
        self.hashed_password = hashed_password

class Question(BaseModel):
    question_text: str = Field(..., description="The text of the question")
    question_image: Optional[str] = Field(None, description="URL to the question image if any")
    options: List[str] = Field(..., description="List of answer options")
    correct_answer: int = Field(..., description="Index of the correct answer (0-based)")
    marks: int = Field(1, description="Marks for this question")
    negative_marks: float = Field(0.25, description="Negative marks for wrong answer")

class Test(BaseModel):
    title: str = Field(..., description="Title of the test")
    subject_id: str = Field(..., description="ID of the subject")
    duration: int = Field(..., description="Duration of test in minutes")
    total_marks: int = Field(..., description="Total marks for the test")
    instructions: str = Field(..., description="Test instructions")
    questions: List[Question] = Field(..., description="List of questions")
    created_by: str = Field(..., description="ID of the teacher who created the test")
    created_at: datetime = Field(default_factory=datetime.now)
    is_active: bool = Field(True, description="Whether the test is active")

class TestResult(BaseModel):
    test_id: str = Field(..., description="ID of the test")
    student_id: str = Field(..., description="ID of the student")
    answers: List[int] = Field(..., description="List of selected answers (indexes)")
    score: float = Field(..., description="Total score obtained")
    time_taken: int = Field(..., description="Time taken in seconds")
    submitted_at: datetime = Field(default_factory=datetime.now) 