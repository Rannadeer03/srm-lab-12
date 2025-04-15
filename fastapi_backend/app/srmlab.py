from fastapi import FastAPI, HTTPException, Depends, status, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGODB_URL)
db = client.srm_lab_db

# Models
class Question(BaseModel):
    question_text: str
    options: List[str]
    correct_option: str
    difficulty_level: str
    type: str
    image_url: Optional[str] = None
    marks: Optional[float] = 1.0
    negative_marks: Optional[float] = 0.0
    subject_id: str

class Test(BaseModel):
    title: str
    subject_id: str
    duration: int
    total_marks: int
    instructions: str
    questions: List[Question]
    created_by: str
    created_at: datetime = datetime.now()
    is_active: bool = True

# Test creation endpoint
@app.post("/tests", status_code=status.HTTP_201_CREATED)
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
        print("Received test creation request")
        print(f"Title: {title}")
        print(f"Subject ID: {subject_id}")
        print(f"Questions: {questions}")
        
        # Parse questions from JSON string
        questions_data = json.loads(questions)
        
        # Validate questions
        validated_questions = []
        for q in questions_data:
            question = Question(
                question_text=q["question_text"],
                options=q["options"],
                correct_option=q["correct_option"],
                difficulty_level=q["difficulty_level"],
                type=q["type"],
                image_url=q.get("image_url"),
                marks=q.get("marks", 1.0),
                negative_marks=q.get("negative_marks", 0.0),
                subject_id=subject_id
            )
            validated_questions.append(question.dict())
        
        # Create test data
        test_data = {
            "title": title,
            "subject_id": subject_id,
            "duration": duration,
            "total_marks": total_marks,
            "instructions": instructions,
            "questions": validated_questions,
            "created_by": created_by,
            "created_at": datetime.now(),
            "is_active": True
        }
        
        print("Saving test data to database:", test_data)
        
        # Save to database
        result = await db.tests.insert_one(test_data)
        test_data["_id"] = str(result.inserted_id)
        
        print("Test created successfully with ID:", test_data["_id"])
        return test_data
    except json.JSONDecodeError as e:
        print("JSON decode error:", str(e))
        raise HTTPException(status_code=400, detail="Invalid questions data format")
    except Exception as e:
        print("Error creating test:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Image upload endpoint
@app.post("/tests/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    question_index: int = Form(...)
):
    try:
        # Create uploads directory if it doesn't exist
        os.makedirs("uploads/test_images", exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{datetime.now().timestamp()}_{question_index}.{file_extension}"
        file_path = f"uploads/test_images/{unique_filename}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {"image_path": file_path}
    except Exception as e:
        print("Error uploading image:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Get all tests endpoint
@app.get("/tests")
async def get_tests():
    try:
        tests = []
        cursor = db.tests.find({"is_active": True})
        async for test in cursor:
            test["_id"] = str(test["_id"])
            tests.append(test)
        return tests
    except Exception as e:
        print("Error getting tests:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

# Get single test endpoint
@app.get("/tests/{test_id}")
async def get_test(test_id: str):
    try:
        test = await db.tests.find_one({"_id": ObjectId(test_id)})
        if test:
            test["_id"] = str(test["_id"])
            return test
        raise HTTPException(status_code=404, detail="Test not found")
    except Exception as e:
        print("Error getting test:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 