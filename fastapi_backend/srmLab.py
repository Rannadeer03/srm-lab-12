import os
import shutil
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from bson import ObjectId
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
import mimetypes
import uuid

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection with error handling
client = AsyncIOMotorClient('mongodb://localhost:27017/')
db = client.srmLab

# Paths for File Storage
UPLOAD_FOLDER = './uploads'
ASSIGNMENT_FOLDER = UPLOAD_FOLDER + '/assignments'
STUDY_MATERIAL = UPLOAD_FOLDER + '/materials'
COURSE_MATERIAL_FOLDER = UPLOAD_FOLDER + '/course_materials'

# Create all directories if they don't exist
for folder in [UPLOAD_FOLDER, ASSIGNMENT_FOLDER, STUDY_MATERIAL, COURSE_MATERIAL_FOLDER]:
    os.makedirs(folder, exist_ok=True)

print("All folders created or already exist.")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Subject model
class Subject(BaseModel):
    name: str = Field(..., description="Name of the subject")
    code: str = Field(..., description="Subject code", pattern="^[0-9]{3}$")  # Enforce 3-digit format

# Default subjects
DEFAULT_SUBJECTS = [
    {"name": "Engineering Mathematics", "code": "001"},
    {"name": "Electric Circuits", "code": "002"},
    {"name": "Electromagnetic Fields", "code": "003"},
    {"name": "Signals and Systems", "code": "004"},
    {"name": "Electrical Machines", "code": "005"},
    {"name": "Power Systems", "code": "006"},
    {"name": "Control Systems", "code": "007"},
    {"name": "Electrical and Electronic Measurements", "code": "008"},
    {"name": "Analog and Digital Electronics", "code": "009"},
    {"name": "Power Electronics", "code": "010"}
]

# Assignment model
class Assignment(BaseModel):
    subject_id: str = Field(..., description="Subject ID")
    title: str = Field(..., description="Title of the assignment")
    description: str = Field(..., description="Description of the assignment")
    due_date: str = Field(..., description="Due date of the assignment")

# Course Material model
class CourseMaterial(BaseModel):
    subject_id: str = Field(..., description="Subject ID")
    title: str = Field(..., description="Title of the course material")
    description: str = Field(..., description="Description of the course material")
    material_type: str = Field(..., description="Type of the course material")

# Question model
class Question(BaseModel):
    text: str = Field(..., description="The question text")
    options: List[str] = Field(..., min_items=2, description="List of answer options")
    correct_answer: str = Field(..., description="The correct answer")
    subject_id: str = Field(..., description="ID of the subject")
    teacher_id: str = Field(..., description="ID of the teacher")

class QuestionCreate(BaseModel):
    text: str = Field(..., description="The question text")
    options: List[str] = Field(..., min_items=2, description="List of answer options")
    correct_answer: str = Field(..., description="The correct answer")

# Test model with validation
class Test(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the test")
    description: str = Field(..., min_length=1, description="Description of the test")
    subject_id: str = Field(..., min_length=1, description="ID of the subject")
    teacher_id: str = Field(..., min_length=1, description="ID of the teacher")
    questions: List[QuestionCreate] = Field(..., min_items=1, description="List of questions")
    duration_minutes: int = Field(..., gt=0, description="Duration of the test in minutes")
    status: str = Field(default="active", description="Status of the test")

# Teacher: Add a Subject
@app.post('/teacher/subjects')
async def add_subject(subject: Subject):
    subject_dict = subject.dict()
    result = await db.subjects.insert_one(subject_dict)
    return {"id": str(result.inserted_id), **subject_dict}

# Teacher: Get All Subjects
@app.get('/teacher/subjects')
async def get_subjects():
    subjects = await db.subjects.find().to_list(length=100)
    return [serialize_doc(subject) for subject in subjects]

# Teacher: Delete Subject
@app.delete('/teacher/subjects/{subject_id}')
async def delete_subject(subject_id: str):
    if not ObjectId.is_valid(subject_id):
        raise HTTPException(status_code=400, detail="Invalid subject ID")
    result = await db.subjects.delete_one({"_id": ObjectId(subject_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subject not found")
    return {"message": "Subject deleted successfully"}

# ObjectId -> string in _id
def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc

# Teacher: Upload Assignment
@app.post('/teacher/assignments', status_code=status.HTTP_201_CREATED)
async def upload_assignment(
    subject_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    due_date: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Get subject information
        subject = await db.subjects.find_one({"_id": ObjectId(subject_id)})
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Create assignment directory if it doesn't exist
        os.makedirs(ASSIGNMENT_FOLDER, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(ASSIGNMENT_FOLDER, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Store assignment metadata in database
        assignment_data = {
            "subject_id": subject_id,
            "title": title,
            "description": description,
            "due_date": due_date,
            "file_path": unique_filename,
            "path": f"assignments/{unique_filename}",
            "filename": file.filename,
            "subject_name": subject["name"],
            "subject_code": subject["code"],
            "created_at": datetime.now().isoformat()
        }
        
        result = await db.assignments.insert_one(assignment_data)
        assignment_data['_id'] = str(result.inserted_id)
        return assignment_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Teacher: Get Assignments by Subject
@app.get("/assignments/{subject_id}")
async def get_assignments_by_subject(subject_id: str):
    try:
        # Check if database is connected
        if not db:
            logger.error("Database connection not established")
            raise HTTPException(status_code=500, detail="Database connection error")
            
        logger.info(f"Fetching assignments for subject {subject_id}")
        assignments = await db.assignments.find({"subject_id": subject_id}).to_list(length=100)
        logger.info(f"Found {len(assignments)} assignments")
        return [serialize_doc(a) for a in assignments]
    except Exception as e:
        logger.error(f"Error fetching assignments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch assignments: {str(e)}")

# Teacher: Get All Assignments
@app.get("/teacher/assignments")
async def get_all_assignments():
    try:
        # Check if database is connected by trying to list collections
        try:
            await db.list_collection_names()
        except Exception as e:
            logger.error(f"Database connection error: {str(e)}")
            raise HTTPException(status_code=500, detail="Database connection error")
            
        logger.info("Fetching all assignments")
        assignments = await db.assignments.find().to_list(length=100)
        logger.info(f"Found {len(assignments)} assignments")
        return [serialize_doc(a) for a in assignments]
    except Exception as e:
        logger.error(f"Error fetching all assignments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch assignments: {str(e)}")

# Teacher: Delete Assignment
@app.delete('/teacher/assignments/{assignment_id}')
async def delete_assignment(assignment_id: str):
    try:
        # Get assignment details
        assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        # Delete file
        file_path = os.path.join(ASSIGNMENT_FOLDER, assignment['file_path'])
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        result = await db.assignments.delete_one({"_id": ObjectId(assignment_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        return {"message": "Assignment deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Student: Get All Assignments
@app.get('/student/assignments')
async def get_student_assignments():
    try:
        logger.info("Fetching student assignments")
        assignments = await db.assignments.find().to_list(length=100)
        
        # Add subject information to each assignment if missing
        for assignment in assignments:
            if 'subject_name' not in assignment or 'subject_code' not in assignment:
                subject = await db.subjects.find_one({"_id": ObjectId(assignment['subject_id'])})
                if subject:
                    assignment['subject_name'] = subject['name']
                    assignment['subject_code'] = subject['code']
                if 'file_path' in assignment and 'path' not in assignment:
                    assignment['path'] = f"assignments/{assignment['file_path']}"
        
        logger.info(f"Found {len(assignments)} assignments")
        return [serialize_doc(a) for a in assignments]
    except Exception as e:
        logger.error(f"Error fetching student assignments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch assignments: {str(e)}")

# Student: Get Assignments by Subject
@app.get('/student/assignments/{subject_id}')
async def get_student_assignments_by_subject(subject_id: str):
    try:
        logger.info(f"Fetching student assignments for subject_id: {subject_id}")
        assignments = await db.assignments.find({"subject_id": subject_id}).to_list(length=100)
        
        # Add subject information to each assignment if missing
        subject = await db.subjects.find_one({"_id": ObjectId(subject_id)})
        if subject:
            for assignment in assignments:
                assignment['subject_name'] = subject['name']
                assignment['subject_code'] = subject['code']
                if 'file_path' in assignment and 'path' not in assignment:
                    assignment['path'] = f"assignments/{assignment['file_path']}"
        
        logger.info(f"Found {len(assignments)} assignments")
        return [serialize_doc(a) for a in assignments]
    except Exception as e:
        logger.error(f"Error fetching student assignments: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch assignments: {str(e)}")

# Student: Download Assignment
@app.get('/student/assignments/{assignment_id}/download')
async def download_assignment(assignment_id: str):
    try:
        assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        file_path = os.path.join(ASSIGNMENT_FOLDER, assignment['file_path'])
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        return FileResponse(
            file_path,
            filename=assignment['file_path'],
            media_type='application/octet-stream'
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Teacher: Create Study Material Folder
@app.post('/teacher/study-material/folders')
def create_folder(folder_name: str):
    folder_path = os.path.join(STUDY_MATERIAL, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    return {"message": "Folder created successfully"}

# Teacher: Upload Study Material
@app.post('/teacher/study-material/upload')
async def upload_file(subject: str = Form(...), file: UploadFile = File(...)):
    try:
        # Create subject directory if it doesn't exist
        subject_folder = os.path.join(STUDY_MATERIAL, subject)
        os.makedirs(subject_folder, exist_ok=True)
        
        # Save file
        file_path = os.path.join(subject_folder, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {"message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Teacher: Delete Study Material Folder
@app.delete('/teacher/study-material/folders/{folder_name}')
def delete_folder(folder_name: str):
    folder_path = os.path.join(STUDY_MATERIAL, folder_name)
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
        return {"message": "Folder deleted successfully"}
    raise HTTPException(status_code=404, detail="Folder not found")

# Student: View Study Materials
@app.get('/student/study-material')
def view_study_materials():
    try:
        materials = []
        for subject in os.listdir(STUDY_MATERIAL):
            subject_path = os.path.join(STUDY_MATERIAL, subject)
            if os.path.isdir(subject_path):
                for file in os.listdir(subject_path):
                    file_path = os.path.join(subject_path, file)
                    if os.path.isfile(file_path):
                        materials.append({
                            "subject": subject,
                            "filename": file,
                            "path": os.path.join(subject, file)
                        })
        return materials
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Teacher: Upload Course Material
@app.post('/teacher/course-material', status_code=status.HTTP_201_CREATED)
async def upload_course_material(
    subject_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    material_type: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Get subject information
        subject = await db.subjects.find_one({"_id": ObjectId(subject_id)})
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Create course material directory if it doesn't exist
        os.makedirs(COURSE_MATERIAL_FOLDER, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(COURSE_MATERIAL_FOLDER, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Store course material metadata in database
        material_data = {
            "subject_id": subject_id,
            "title": title,
            "description": description,
            "material_type": material_type,
            "file_path": unique_filename,
            "path": f"course_materials/{unique_filename}",
            "filename": file.filename,
            "subject_name": subject["name"],
            "subject_code": subject["code"],
            "created_at": datetime.now().isoformat()
        }
        
        result = await db.course_materials.insert_one(material_data)
        material_data['_id'] = str(result.inserted_id)
        return material_data
    except Exception as e:
        logger.error(f"Error uploading course material: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Teacher: Get Course Materials by Subject
@app.get('/teacher/course-material/{subject_id}')
async def get_course_materials_by_subject(subject_id: str):
    materials = await db.course_materials.find({"subject_id": subject_id}).to_list(length=100)
    return [serialize_doc(m) for m in materials]

# Get Material File
@app.get('/materials/{file_path:path}')
async def get_material_file(file_path: str):
    try:
        logger.info(f"Attempting to serve file: {file_path}")
        
        # Normalize the path and ensure it's within the upload directory
        full_path = os.path.join(UPLOAD_FOLDER, file_path)
        full_path = os.path.normpath(full_path)
        
        # Convert both paths to absolute paths for comparison
        upload_dir = os.path.abspath(UPLOAD_FOLDER)
        requested_path = os.path.abspath(full_path)
        
        # Security check to prevent directory traversal
        if not requested_path.startswith(upload_dir):
            logger.error(f"Access denied: {requested_path} is outside of {upload_dir}")
            raise HTTPException(status_code=403, detail="Access denied")
        
        if not os.path.exists(full_path):
            logger.error(f"File not found: {full_path}")
            raise HTTPException(status_code=404, detail="File not found")
        
        # Determine the correct media type
        content_type, _ = mimetypes.guess_type(full_path)
        if not content_type:
            content_type = 'application/octet-stream'
            
        logger.info(f"Serving file {full_path} with content type {content_type}")
        
        return FileResponse(
            path=full_path,
            filename=os.path.basename(file_path),
            media_type=content_type
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error serving file {file_path}: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

# Student: Get Course Materials by Subject
@app.get('/student/course-material/{subject_id}')
async def get_student_course_materials(subject_id: str):
    try:
        # Get subject information
        subject = await db.subjects.find_one({"_id": ObjectId(subject_id)})
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        materials = await db.course_materials.find({"subject_id": subject_id}).to_list(length=100)
        # Add subject information to each material
        for material in materials:
            material['subject_name'] = subject['name']
            material['subject_code'] = subject['code']
            if 'file_path' in material and 'path' not in material:
                material['path'] = f"course_materials/{material['file_path']}"
        return [serialize_doc(m) for m in materials]
    except Exception as e:
        logger.error(f"Error fetching course materials: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Initialize collections and test data
async def init_collections():
    try:
        # Create collections if they don't exist
        collections = await db.list_collection_names()
        required_collections = ['subjects', 'assignments', 'study_materials', 'course_materials', 'tests', 'questions', 'test_results']
        
        for collection in required_collections:
            if collection not in collections:
                await db.create_collection(collection)
                logger.info(f"Created collection: {collection}")
        
        # Initialize subjects if empty
        subjects_count = await db.subjects.count_documents({})
        if subjects_count == 0:
            await db.subjects.insert_many(DEFAULT_SUBJECTS)
            logger.info("Initialized default subjects")
    except Exception as e:
        logger.error(f"Error initializing collections: {str(e)}")
        raise

# Initialize test data
async def init_test_data():
    try:
        # Check if test data already exists
        tests_count = await db.tests.count_documents({})
        if tests_count == 0:
            # Create sample questions
            questions = [
                {
                    "text": "What is the capital of France?",
                    "options": ["London", "Paris", "Berlin", "Madrid"],
                    "correct_answer": "Paris",
                    "subject_id": "001",
                    "teacher_id": "teacher1",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "text": "What is 2 + 2?",
                    "options": ["3", "4", "5", "6"],
                    "correct_answer": "4",
                    "subject_id": "001",
                    "teacher_id": "teacher1",
                    "created_at": datetime.now().isoformat()
                }
            ]
            
            # Insert questions and get their IDs
            question_ids = []
            for question in questions:
                result = await db.questions.insert_one(question)
                question_ids.append(str(result.inserted_id))
            
            # Create sample test data
            test_data = [
                {
                    "title": "Sample Test 1",
                    "description": "This is a sample test for demonstration",
                    "subject_id": "001",
                    "teacher_id": "teacher1",
                    "questions": question_ids,
                    "duration_minutes": 60,
                    "status": "active",
                    "total_marks": 100,
                    "created_at": datetime.now().isoformat()
                }
            ]
            await db.tests.insert_many(test_data)
            logger.info("Initialized test data")
    except Exception as e:
        logger.error(f"Error initializing test data: {str(e)}")
        raise

# Startup event
@app.on_event("startup")
async def startup_event():
    try:
        await init_collections()
        await init_test_data()
        logger.info("Application startup completed successfully")
    except Exception as e:
        logger.error(f"Error during startup: {str(e)}")
        raise

# Validate question IDs
async def validate_question_ids(question_ids: List[str]) -> List[str]:
    try:
        valid_questions = []
        for question_id in question_ids:
            if ObjectId.is_valid(question_id):
                question = await db.questions.find_one({"_id": ObjectId(question_id)})
                if question:
                    valid_questions.append(question_id)
        return valid_questions
    except Exception as e:
        logger.error(f"Error validating question IDs: {str(e)}")
        raise

# Create test
@app.post("/tests")
async def create_test(test: Test):
    try:
        logger.info(f"Received test data: {test.dict()}")
        
        # First create all questions
        question_ids = []
        for i, question in enumerate(test.questions):
            try:
                # Log each question being processed
                logger.info(f"Processing question {i + 1}: {question.dict()}")
                
                # Create the question with all fields
                question_dict = {
                    "text": question.text,
                    "options": question.options,
                    "correct_answer": question.correct_answer,
                    "subject_id": test.subject_id,
                    "teacher_id": test.teacher_id,
                    "created_at": datetime.now().isoformat()
                }
                
                # Log the question dictionary
                logger.info(f"Question dictionary created: {question_dict}")
                
                result = await db.questions.insert_one(question_dict)
                question_id = str(result.inserted_id)
                question_ids.append(question_id)
                logger.info(f"Question {i + 1} created with ID: {question_id}")
                
            except Exception as e:
                logger.error(f"Error creating question {i + 1}: {str(e)}")
                logger.error(f"Question data: {question.dict() if hasattr(question, 'dict') else question}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Error creating question {i + 1}: {str(e)}"
                )
        
        if not question_ids:
            raise HTTPException(status_code=400, detail="No valid questions provided")
        
        # Create the test with question IDs
        try:
            test_dict = {
                "title": test.title,
                "description": test.description,
                "subject_id": test.subject_id,
                "teacher_id": test.teacher_id,
                "questions": question_ids,
                "duration_minutes": test.duration_minutes,
                "status": test.status,
                "total_marks": 100,  # Default total marks
                "created_at": datetime.now().isoformat()
            }
            
            logger.info(f"Creating test with data: {test_dict}")
            
            result = await db.tests.insert_one(test_dict)
            test_dict["_id"] = str(result.inserted_id)
            logger.info(f"Test created successfully with ID: {test_dict['_id']}")
            
            return test_dict
            
        except Exception as e:
            logger.error(f"Error creating test document: {str(e)}")
            # Clean up any questions we created
            for qid in question_ids:
                try:
                    await db.questions.delete_one({"_id": ObjectId(qid)})
                except:
                    pass
            raise HTTPException(
                status_code=500,
                detail=f"Error creating test: {str(e)}"
            )
            
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in create_test: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

# Create question
@app.post("/questions")
async def create_question(question: Question):
    try:
        question_dict = question.dict()
        question_dict["created_at"] = datetime.now().isoformat()
        result = await db.questions.insert_one(question_dict)
        question_dict["_id"] = str(result.inserted_id)
        return question_dict
    except Exception as e:
        logger.error(f"Error creating question: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Debug endpoint to list all tests
@app.get("/debug/tests")
async def debug_tests():
    try:
        tests = await db.tests.find().to_list(length=100)
        for test in tests:
            test["_id"] = str(test["_id"])
        return tests
    except Exception as e:
        logger.error(f"Error in debug endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Get all available tests
@app.get("/tests")
async def get_available_tests():
    try:
        logger.info("Fetching available tests")
        tests = await db.tests.find({"status": "active"}).to_list(length=100)
        logger.info(f"Raw tests from database: {tests}")
        
        for test in tests:
            test["_id"] = str(test["_id"])
            logger.info(f"Processed test ID: {test['_id']}")
        
        logger.info(f"Found {len(tests)} tests")
        return tests
    except Exception as e:
        logger.error(f"Error fetching tests: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch tests: {str(e)}")

# Get single test endpoint
@app.get("/tests/{test_identifier}")
async def get_test(test_identifier: str):
    try:
        logger.info(f"Attempting to fetch test with identifier: {test_identifier}")
        
        # Try to find test by ID first
        if ObjectId.is_valid(test_identifier):
            logger.info(f"Valid ObjectId format, searching by ID: {test_identifier}")
            test = await db.tests.find_one({"_id": ObjectId(test_identifier)})
            if test:
                logger.info(f"Found test by ID: {test.get('title', 'Unknown title')}")
            else:
                logger.error(f"No test found with ID: {test_identifier}")
        else:
            logger.info(f"Not a valid ObjectId, searching by title: {test_identifier}")
            test = await db.tests.find_one({"title": test_identifier})
            if test:
                logger.info(f"Found test by title: {test.get('title', 'Unknown title')}")
            else:
                logger.error(f"No test found with title: {test_identifier}")
        
        if not test:
            logger.error(f"Test not found with identifier: {test_identifier}")
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Get all questions for this test
        question_ids = test.get("questions", [])
        logger.info(f"Found {len(question_ids)} question IDs: {question_ids}")
        
        questions = []
        for q_id in question_ids:
            try:
                if not ObjectId.is_valid(q_id):
                    logger.error(f"Invalid question ID format: {q_id}")
                    continue
                    
                question = await db.questions.find_one({"_id": ObjectId(q_id)})
                if question:
                    # Log the full question data before modification
                    logger.info(f"Raw question data: {question}")
                    
                    question["_id"] = str(question["_id"])
                    questions.append(question)
                    logger.info(f"Processed question: {question}")
                else:
                    logger.error(f"Question not found with ID: {q_id}")
            except Exception as e:
                logger.error(f"Error processing question {q_id}: {str(e)}")
                continue
        
        # Add questions to test data
        test["_id"] = str(test["_id"])
        test["questions"] = questions
        
        logger.info(f"Final test data being returned: {test}")
        return test
    except Exception as e:
        logger.error(f"Error getting test: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=str(e))

# Get test by title endpoint
@app.get("/tests/title/{title}")
async def get_test_by_title(title: str):
    try:
        logger.info(f"Attempting to fetch test with title: {title}")
        
        # Get the test by title
        test = await db.tests.find_one({"title": title})
        if not test:
            logger.error(f"Test not found with title: {title}")
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Get all questions for this test
        question_ids = test.get("questions", [])
        logger.info(f"Found {len(question_ids)} questions for test {title}")
        
        questions = []
        for q_id in question_ids:
            question = await db.questions.find_one({"_id": ObjectId(q_id)})
            if question:
                question["_id"] = str(question["_id"])
                questions.append(question)
        
        # Add questions to test data
        test["_id"] = str(test["_id"])
        test["questions"] = questions
        
        logger.info(f"Successfully fetched test: {test['title']}")
        return test
    except Exception as e:
        logger.error(f"Error getting test: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
