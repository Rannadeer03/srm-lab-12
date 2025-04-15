from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from ..dependencies import get_db
from ...models.test import Question, Test, TestResult
from ...database.operations import (
    create_question,
    get_questions_by_subject,
    create_test,
    get_test,
    get_tests_by_teacher,
    get_available_tests,
    create_test_result,
    get_test_results_by_student,
    get_test_results_by_test,
    update_test_status
)

router = APIRouter()

@router.post("/questions", response_model=Question)
async def create_question_endpoint(question: Question, db=Depends(get_db)):
    return await create_question(db, question)

@router.get("/questions", response_model=List[Question])
async def get_questions_endpoint(subject_id: str, db=Depends(get_db)):
    return await get_questions_by_subject(db, subject_id)

@router.post("/tests", response_model=Test)
async def create_test_endpoint(test: Test, db=Depends(get_db)):
    return await create_test(db, test)

@router.get("/tests/{test_id}", response_model=Test)
async def get_test_endpoint(test_id: str, db=Depends(get_db)):
    test = await get_test(db, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return test

@router.get("/tests/teacher/{teacher_id}", response_model=List[Test])
async def get_teacher_tests_endpoint(teacher_id: str, db=Depends(get_db)):
    return await get_tests_by_teacher(db, teacher_id)

@router.get("/tests/available", response_model=List[Test])
async def get_available_tests_endpoint(
    subject_id: Optional[str] = None,
    db=Depends(get_db)
):
    return await get_available_tests(db, subject_id)

@router.post("/test-results", response_model=TestResult)
async def create_test_result_endpoint(test_result: TestResult, db=Depends(get_db)):
    return await create_test_result(db, test_result)

@router.get("/test-results/student/{student_id}", response_model=List[TestResult])
async def get_student_results_endpoint(student_id: str, db=Depends(get_db)):
    return await get_test_results_by_student(db, student_id)

@router.get("/test-results/test/{test_id}", response_model=List[TestResult])
async def get_test_results_endpoint(test_id: str, db=Depends(get_db)):
    return await get_test_results_by_test(db, test_id)

@router.patch("/tests/{test_id}/status")
async def update_test_status_endpoint(
    test_id: str,
    is_active: bool,
    db=Depends(get_db)
):
    success = await update_test_status(db, test_id, is_active)
    if not success:
        raise HTTPException(status_code=404, detail="Test not found")
    return {"message": "Test status updated successfully"} 