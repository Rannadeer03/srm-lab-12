from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

class Question(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    text: str
    options: List[str]
    correct_answer: int
    subject_id: str
    teacher_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True

class Test(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    title: str
    description: str
    subject_id: str
    teacher_id: str
    questions: List[PyObjectId]
    duration_minutes: int
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True

class TestResult(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id")
    test_id: PyObjectId
    student_id: str
    score: float
    total_questions: int
    correct_answers: int
    started_at: datetime
    completed_at: datetime
    answers: List[int]

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True 