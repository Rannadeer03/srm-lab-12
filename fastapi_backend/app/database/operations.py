from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from ..models.test import Question, Test, TestResult

async def create_question(db: AsyncIOMotorDatabase, question: Question) -> Question:
    question_dict = question.dict(by_alias=True)
    result = await db.questions.insert_one(question_dict)
    created_question = await db.questions.find_one({"_id": result.inserted_id})
    return Question(**created_question)

async def get_questions_by_subject(db: AsyncIOMotorDatabase, subject_id: str) -> List[Question]:
    questions = await db.questions.find({"subject_id": subject_id}).to_list(length=100)
    return [Question(**question) for question in questions]

async def create_test(db: AsyncIOMotorDatabase, test: Test) -> Test:
    test_dict = test.dict(by_alias=True)
    result = await db.tests.insert_one(test_dict)
    created_test = await db.tests.find_one({"_id": result.inserted_id})
    return Test(**created_test)

async def get_test(db: AsyncIOMotorDatabase, test_id: str) -> Optional[Test]:
    if not ObjectId.is_valid(test_id):
        return None
    test = await db.tests.find_one({"_id": ObjectId(test_id)})
    return Test(**test) if test else None

async def get_tests_by_teacher(db: AsyncIOMotorDatabase, teacher_id: str) -> List[Test]:
    tests = await db.tests.find({"teacher_id": teacher_id}).to_list(length=100)
    return [Test(**test) for test in tests]

async def get_available_tests(db: AsyncIOMotorDatabase, subject_id: Optional[str] = None) -> List[Test]:
    query = {"is_active": True}
    if subject_id:
        query["subject_id"] = subject_id
    tests = await db.tests.find(query).to_list(length=100)
    return [Test(**test) for test in tests]

async def create_test_result(db: AsyncIOMotorDatabase, test_result: TestResult) -> TestResult:
    test_result_dict = test_result.dict(by_alias=True)
    result = await db.test_results.insert_one(test_result_dict)
    created_result = await db.test_results.find_one({"_id": result.inserted_id})
    return TestResult(**created_result)

async def get_test_results_by_student(db: AsyncIOMotorDatabase, student_id: str) -> List[TestResult]:
    results = await db.test_results.find({"student_id": student_id}).to_list(length=100)
    return [TestResult(**result) for result in results]

async def get_test_results_by_test(db: AsyncIOMotorDatabase, test_id: str) -> List[TestResult]:
    results = await db.test_results.find({"test_id": test_id}).to_list(length=100)
    return [TestResult(**result) for result in results]

async def update_test_status(db: AsyncIOMotorDatabase, test_id: str, is_active: bool) -> bool:
    if not ObjectId.is_valid(test_id):
        return False
    result = await db.tests.update_one(
        {"_id": ObjectId(test_id)},
        {"$set": {"is_active": is_active}}
    )
    return result.modified_count > 0 