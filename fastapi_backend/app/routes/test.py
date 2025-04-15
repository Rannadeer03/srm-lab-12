from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from app.models.test import Question, Test, TestResult
from app.db.operations.test import (
    create_question,
    get_questions_by_subject,
    create_test,
    get_test_by_id,
    get_tests_by_teacher,
    get_available_tests,
    update_test_status,
    create_test_result,
    get_test_results_by_student,
    get_test_results_by_test
)
from app.auth.auth import get_current_user
from app.database.mongodb import get_database

router = APIRouter(prefix="/tests", tags=["tests"])

@router.post("/questions", response_model=Question)
async def add_question(question: Question, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create questions")
    question.teacher_id = current_user["id"]
    db = get_database()
    return await create_question(db, question)

@router.get("/questions/{subject_id}", response_model=List[Question])
async def get_subject_questions(subject_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    return await get_questions_by_subject(db, subject_id)

@router.post("", response_model=Test)
async def add_test(test: Test, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create tests")
    test.teacher_id = current_user["id"]
    db = get_database()
    return await create_test(db, test)

@router.get("/{test_id}", response_model=Test)
async def get_test(test_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    return await get_test_by_id(db, test_id)

@router.get("/teacher/{teacher_id}", response_model=List[Test])
async def get_teacher_tests(teacher_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher" or current_user["id"] != teacher_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these tests")
    db = get_database()
    return await get_tests_by_teacher(db, teacher_id)

@router.get("/available", response_model=List[Test])
async def get_available_tests_route(subject_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    db = get_database()
    return await get_available_tests(db, subject_id)

@router.patch("/{test_id}/status", response_model=Test)
async def update_test_status_route(test_id: str, is_active: bool, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can update test status")
    db = get_database()
    test = await get_test_by_id(db, test_id)
    if test.teacher_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this test")
    return await update_test_status(db, test_id, is_active)

@router.post("/results", response_model=TestResult)
async def submit_test_result(result: TestResult, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Only students can submit test results")
    result.student_id = current_user["id"]
    db = get_database()
    return await create_test_result(db, result)

@router.get("/results/student/{student_id}", response_model=List[TestResult])
async def get_student_results(student_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student" or current_user["id"] != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these results")
    db = get_database()
    return await get_test_results_by_student(db, student_id)

@router.get("/results/test/{test_id}", response_model=List[TestResult])
async def get_test_results(test_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can view test results")
    db = get_database()
    test = await get_test_by_id(db, test_id)
    if test.teacher_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to view these results")
    return await get_test_results_by_test(db, test_id) 