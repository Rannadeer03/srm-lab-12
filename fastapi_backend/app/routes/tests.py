from datetime import datetime
from fastapi import APIRouter, HTTPException, status
from ..models import Test, Question, TestResult, UserAnswer
from ..schemas import TestCreate, Test as TestSchema, TestResult as TestResultSchema
from ..utils import validate_test_data, format_response

router = APIRouter(prefix="/api/tests", tags=["tests"])

# In-memory storage
tests_db = {}
test_results_db = {}
next_test_id = 1
next_result_id = 1

@router.post("", response_model=TestSchema)
def create_test(test: TestCreate):
    global next_test_id
    
    if not validate_test_data(test.dict()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid test data"
        )
    
    new_test = Test(
        id=next_test_id,
        title=test.title,
        subject=test.subject,
        duration=test.duration
    )
    
    # Store test and increment ID
    tests_db[next_test_id] = new_test
    next_test_id += 1
    
    return format_response(new_test)

@router.post("/{test_id}/submit", response_model=TestResultSchema)
def submit_test(test_id: int, result: TestResultSchema):
    global next_result_id
    
    # Check if test exists
    if test_id not in tests_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )
    
    new_result = TestResult(
        id=next_result_id,
        user_id=result.user_id,
        test_id=test_id,
        score=result.score,
        time_spent=result.time_spent,
        submitted_at=datetime.now()
    )
    
    # Store result and increment ID
    test_results_db[next_result_id] = new_result
    next_result_id += 1
    
    return format_response(new_result)
