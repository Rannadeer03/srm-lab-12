from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from ..models import Test, Question, TestResult, UserAnswer
from ..schemas import TestCreate, Test as TestSchema, TestResult as TestResultSchema, TestUpdate
from ..utils import validate_test_data, format_response

router = APIRouter(prefix="/api", tags=["tests"])

# In-memory storage
tests_db = {}
test_results_db = {}
next_test_id = 1
next_result_id = 1

@router.post("/tests", response_model=TestSchema)
def create_test(test: TestCreate):
    global next_test_id
    
    try:
        # Create new test with all fields
        new_test = Test(
            id=str(next_test_id),
            title=test.title,
            subject=test.subject,
            duration=test.duration,
            questions=test.questions,
            participants=test.participants or [],
            test_schedule=test.test_schedule,
            difficulty_distribution=test.difficulty_distribution,
            target_ratio=test.target_ratio
        )
        
        # Store test and increment ID
        tests_db[str(next_test_id)] = new_test
        next_test_id += 1
        
        print(f"Created test: {new_test.dict()}")  # Debug log
        return format_response(new_test)
    except Exception as e:
        print(f"Error creating test: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create test: {str(e)}"
        )

@router.put("/tests/{test_id}", response_model=TestSchema)
def update_test(test_id: str, test: TestUpdate):
    if test_id not in tests_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    existing_test = tests_db[test_id]
    
    # Update only provided fields
    updated_test = Test(
        id=test_id,
        title=test.title or existing_test.title,
        subject=test.subject or existing_test.subject,
        duration=test.duration or existing_test.duration,
        questions=test.questions or existing_test.questions,
        participants=test.participants or existing_test.participants,
        test_schedule=test.test_schedule or existing_test.test_schedule,
        difficulty_distribution=test.difficulty_distribution or existing_test.difficulty_distribution,
        target_ratio=test.target_ratio or existing_test.target_ratio
    )
    
    # Update in database
    tests_db[test_id] = updated_test
    
    return format_response(updated_test)

@router.get("/tests", response_model=list[TestSchema])
def get_tests():
    try:
        return [format_response(test) for test in tests_db.values()]
    except Exception as e:
        print(f"Error getting tests: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get tests: {str(e)}"
        )

@router.get("/student/tests", response_model=list[TestSchema])
def get_student_tests():
    try:
        # For now, return all tests. In production, filter by student's email
        return [format_response(test) for test in tests_db.values()]
    except Exception as e:
        print(f"Error getting student tests: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get student tests: {str(e)}"
        )

@router.get("/student/tests/{test_id}", response_model=TestSchema)
def get_student_test(test_id: str):
    try:
        if test_id not in tests_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test not found"
            )
        return format_response(tests_db[test_id])
    except Exception as e:
        print(f"Error getting student test: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get student test: {str(e)}"
        )

@router.post("/student/tests/{test_id}/submit", response_model=TestResultSchema)
def submit_test(test_id: str, result: TestResultSchema):
    global next_result_id
    
    try:
        # Check if test exists
        if test_id not in tests_db:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Test not found"
            )
        
        # Create new result
        new_result = TestResult(
            id=str(next_result_id),
            user_id=result.user_id,
            test_id=test_id,
            score=result.score,
            time_spent=result.time_spent,
            submitted_at=datetime.now(),
            answers=result.answers
        )
        
        # Store result and increment ID
        test_results_db[str(next_result_id)] = new_result
        next_result_id += 1
        
        print(f"Submitted test result: {new_result.dict()}")  # Debug log
        return format_response(new_result)
    except Exception as e:
        print(f"Error submitting test result: {str(e)}")  # Debug log
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit test result: {str(e)}"
        )
