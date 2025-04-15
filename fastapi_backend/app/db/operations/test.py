from typing import List, Optional, Type
from datetime import datetime
from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.test import Question, Test, TestResult

# Question operations
async def create_question(db: AsyncIOMotorDatabase, question: Type[Question]) -> Type[Question]:
    question_dict = question.dict(by_alias=True)
    result = await db.questions.insert_one(question_dict)
    created_question = await db.questions.find_one({"_id": result.inserted_id})
    return Question(**created_question)

async def get_questions_by_subject(db: AsyncIOMotorDatabase, subject_id: str) -> List[Type[Question]]:
    questions = await db.questions.find({"subject_id": subject_id}).to_list(length=100)
    return [Question(**question) for question in questions]

# Test operations
async def create_test(db: AsyncIOMotorDatabase, test: Type[Test]) -> Type[Test]:
    test_dict = test.dict(by_alias=True)
    result = await db.tests.insert_one(test_dict)
    created_test = await db.tests.find_one({"_id": result.inserted_id})
    return Test(**created_test)

async def get_test_by_id(db: AsyncIOMotorDatabase, test_id: str) -> Optional[Type[Test]]:
    if not ObjectId.is_valid(test_id):
        raise HTTPException(status_code=400, detail="Invalid test ID")
    test = await db.tests.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return Test(**test)

async def get_tests_by_teacher(db: AsyncIOMotorDatabase, teacher_id: str) -> List[Type[Test]]:
    tests = await db.tests.find({"teacher_id": teacher_id}).to_list(length=100)
    return [Test(**test) for test in tests]

async def get_available_tests(db: AsyncIOMotorDatabase, subject_id: Optional[str] = None) -> List[Type[Test]]:
    query = {"is_active": True}
    if subject_id:
        query["subject_id"] = subject_id
    tests = await db.tests.find(query).to_list(length=100)
    return [Test(**test) for test in tests]

async def update_test_status(db: AsyncIOMotorDatabase, test_id: str, is_active: bool) -> Type[Test]:
    if not ObjectId.is_valid(test_id):
        raise HTTPException(status_code=400, detail="Invalid test ID")
    result = await db.tests.update_one(
        {"_id": ObjectId(test_id)},
        {"$set": {"is_active": is_active}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Test not found")
    return await get_test_by_id(db, test_id)

# Test result operations
async def create_test_result(db: AsyncIOMotorDatabase, result: Type[TestResult]) -> Type[TestResult]:
    result_dict = result.dict(by_alias=True)
    result_dict["test_id"] = ObjectId(result_dict["test_id"])
    inserted_result = await db.test_results.insert_one(result_dict)
    created_result = await db.test_results.find_one({"_id": inserted_result.inserted_id})
    return TestResult(**created_result)

async def get_test_results_by_student(db: AsyncIOMotorDatabase, student_id: str) -> List[Type[TestResult]]:
    results = await db.test_results.find({"student_id": student_id}).to_list(length=100)
    return [TestResult(**result) for result in results]

async def get_test_results_by_test(db: AsyncIOMotorDatabase, test_id: str) -> List[Type[TestResult]]:
    if not ObjectId.is_valid(test_id):
        raise HTTPException(status_code=400, detail="Invalid test ID")
    results = await db.test_results.find({"test_id": ObjectId(test_id)}).to_list(length=100)
    return [TestResult(**result) for result in results] 