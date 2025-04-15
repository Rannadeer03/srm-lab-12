from fastapi import APIRouter, HTTPException, status, UploadFile, File, Form
from typing import List
from datetime import datetime
import os
import shutil
import uuid
from ..models import Test, Question, TestResult
from ..utils import serialize_doc

router = APIRouter(prefix="/api/tests", tags=["tests"])

# Path for test images
TEST_IMAGES_FOLDER = './uploads/test_images'
os.makedirs(TEST_IMAGES_FOLDER, exist_ok=True)

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_test(
    title: str = Form(...),
    subject_id: str = Form(...),
    duration: int = Form(...),
    total_marks: int = Form(...),
    instructions: str = Form(...),
    created_by: str = Form(...),
    questions: str = Form(...)  # JSON string of questions
):
    try:
        # Parse questions from JSON string
        import json
        questions_data = json.loads(questions)
        
        # Create test data
        test_data = {
            "title": title,
            "subject_id": subject_id,
            "duration": duration,
            "total_marks": total_marks,
            "instructions": instructions,
            "questions": questions_data,
            "created_by": created_by,
            "created_at": datetime.now(),
            "is_active": True
        }
        
        # Save to database
        result = db.tests.insert_one(test_data)
        test_data['_id'] = str(result.inserted_id)
        
        return test_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{test_id}/upload-image")
async def upload_question_image(
    test_id: str,
    question_index: int = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(TEST_IMAGES_FOLDER, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update test question with image path
        test = db.tests.find_one({"_id": ObjectId(test_id)})
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")
        
        if question_index >= len(test['questions']):
            raise HTTPException(status_code=400, detail="Invalid question index")
        
        # Update question with image path
        test['questions'][question_index]['question_image'] = f"/test_images/{unique_filename}"
        db.tests.update_one(
            {"_id": ObjectId(test_id)},
            {"$set": {"questions": test['questions']}}
        )
        
        return {"image_path": f"/test_images/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
def get_all_tests():
    tests = db.tests.find()
    return [serialize_doc(t) for t in tests]

@router.get("/{test_id}")
def get_test(test_id: str):
    test = db.tests.find_one({"_id": ObjectId(test_id)})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    return serialize_doc(test)

@router.get("/subject/{subject_id}")
def get_tests_by_subject(subject_id: str):
    tests = db.tests.find({"subject_id": subject_id})
    return [serialize_doc(t) for t in tests]

@router.post("/{test_id}/submit")
async def submit_test(test_id: str, result: TestResult):
    try:
        # Calculate score
        test = db.tests.find_one({"_id": ObjectId(test_id)})
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")
        
        score = 0
        for i, (question, answer) in enumerate(zip(test['questions'], result.answers)):
            if answer == question['correct_answer']:
                score += question['marks']
            else:
                score -= question['negative_marks']
        
        # Save result
        result_data = result.model_dump()
        result_data['score'] = max(0, score)  # Ensure score doesn't go below 0
        result_data['test_id'] = test_id
        
        db.test_results.insert_one(result_data)
        return {"message": "Test submitted successfully", "score": score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/results/{test_id}")
def get_test_results(test_id: str):
    results = db.test_results.find({"test_id": test_id})
    return [serialize_doc(r) for r in results]

@router.get("/student/{student_id}/results")
def get_student_results(student_id: str):
    results = db.test_results.find({"student_id": student_id})
    return [serialize_doc(r) for r in results] 