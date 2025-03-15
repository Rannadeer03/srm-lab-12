from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    hashed_password: str
    
    class Config:
        from_attributes = True


class TestBase(BaseModel):
    title: str
    subject: str
    duration: int

class TestCreate(BaseModel):
    title: str
    subject: str
    duration: int
    questions: List['Question']
    participants: List[str]
    test_schedule: Optional['TestSchedule'] = None
    difficulty_distribution: Optional[Dict[str, int]] = None
    target_ratio: Optional[Dict[str, int]] = None

class TestUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    duration: Optional[int] = None
    questions: Optional[List['Question']] = None
    participants: Optional[List[str]] = None
    test_schedule: Optional['TestSchedule'] = None
    difficulty_distribution: Optional[Dict[str, int]] = None
    target_ratio: Optional[Dict[str, int]] = None

class TestOut(TestCreate):
    id: str

class Test(TestBase):
    id: int
    
    class Config:
        orm_mode = True

class QuestionBase(BaseModel):
    text: str
    options: List[str]
    correct_answer: int

class QuestionCreate(QuestionBase):
    test_id: int

class Question(BaseModel):
    text: str
    type: str
    image_url: Optional[str] = None
    options: List[str]
    correct_answer: int
    difficulty_level: str
    subject: str
    explanation: Optional[str] = None

class TestSchedule(BaseModel):
    is_scheduled: bool = False
    scheduled_date: Optional[str] = None
    scheduled_time: Optional[str] = None
    time_limit: Optional[int] = None
    allow_late_submissions: Optional[bool] = False
    access_window: Optional[Dict[str, str]] = None  # e.g., {"start": "...", "end": "..."}

class Question(QuestionBase):
    id: int
    test_id: int
    
    class Config:
        orm_mode = True

class UserAnswerBase(BaseModel):
    question_id: int
    selected_option: int

class TestResultBase(BaseModel):
    user_id: int
    test_id: int
    score: float
    time_spent: int
    submitted_at: datetime

class TestResultCreate(BaseModel):
    user_id: str
    answers: List[Dict[str, Any]]  # Structure depends on frontend
    time_spent: int
    score: int

class TestResultOut(TestResultCreate):
    id: str
    test_id: str

class TestResult(TestResultBase):
    id: int
    
    class Config:
        orm_mode = True
