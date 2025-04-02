from fastapi import APIRouter, HTTPException, status
from ..schemas import QuestionCreate, QuestionUpdate, Question
from typing import List

router = APIRouter(prefix="/api/questions", tags=["questions"])

# In-memory storage for questions
questions_db = {}
next_question_id = 1

@router.post("/", response_model=Question)
def create_question(question: QuestionCreate):
    global next_question_id
    
    try:
        # Create new question
        new_question = Question(
            id=str(next_question_id),
            test_id=question.test_id,
            question_text=question.question_text,
            type=question.type,
            options=question.options,
            correct_option=question.correct_option,
            difficulty_level=question.difficulty_level,
            explanation=question.explanation
        )
        
        # Store question and increment ID
        questions_db[str(next_question_id)] = new_question
        next_question_id += 1
        
        return new_question
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create question: {str(e)}"
        )

@router.get("/{question_id}", response_model=Question)
def get_question(question_id: str):
    if question_id not in questions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    return questions_db[question_id]

@router.get("/test/{test_id}", response_model=List[Question])
def get_test_questions(test_id: str):
    try:
        # Filter questions by test_id
        test_questions = [
            question for question in questions_db.values()
            if question.test_id == test_id
        ]
        return test_questions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get test questions: {str(e)}"
        )

@router.put("/{question_id}", response_model=Question)
def update_question(question_id: str, question: QuestionUpdate):
    if question_id not in questions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    try:
        # Update question while preserving id and test_id
        updated_question = Question(
            id=question_id,
            test_id=questions_db[question_id].test_id,
            question_text=question.question_text,
            type=question.type,
            options=question.options,
            correct_option=question.correct_option,
            difficulty_level=question.difficulty_level,
            explanation=question.explanation
        )
        
        questions_db[question_id] = updated_question
        return updated_question
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update question: {str(e)}"
        )

@router.delete("/{question_id}")
def delete_question(question_id: str):
    if question_id not in questions_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    try:
        del questions_db[question_id]
        return {"message": "Question deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete question: {str(e)}"
        ) 