import os
import shutil
from typing import List, Optional
from datetime import datetime

from bson import ObjectId
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pymongo import MongoClient
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
try:
    client = MongoClient('mongodb://localhost:27017/', serverSelectionTimeoutMS=5000)
    client.server_info()  # This will raise an exception if connection fails
    db = client.srmLab
    print("Successfully connected to MongoDB")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    raise

# Paths for File Storage
UPLOAD_FOLDER = './uploads'
ASSIGNMENT_FOLDER = UPLOAD_FOLDER + '/assignments'
STUDY_MATERIAL = UPLOAD_FOLDER + '/materials'
COURSE_MATERIAL_FOLDER = UPLOAD_FOLDER + '/course_materials'

# Create all directories if they don't exist
for folder in [UPLOAD_FOLDER, ASSIGNMENT_FOLDER, STUDY_MATERIAL, COURSE_MATERIAL_FOLDER]:
    os.makedirs(folder, exist_ok=True)

print("All folders created or already exist.")

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

class Question(BaseModel):
    teacher_id: int
    subject_id: str
    question_text: str
    options: List[str]
    correct_option: str
    type: str
    image_url: Optional[str] = None
    difficulty_level: str
    explanation: Optional[str] = None

@app.post('/teacher/questions')
def add_question(question: Question):
    if question.correct_option not in question.options:
        raise HTTPException(status_code=400, detail="Correct option must be one of the provided options.")

    question_data = question.model_dump()  # convert to json

    db.questions.insert_one(question_data)

    return {"message": "Question added successfully!"}


# ObjectId -> string in _id
def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    return doc


# Teacher: Update a Question
@app.put('/teacher/questions/{question_id}')
def update_question(question_id: str, question_text: str = None, options: list = None, correct_option: str = None):
    update_data = {}
    if question_text:
        update_data['question_text'] = question_text
    if options:
        update_data['options'] = options
    if correct_option:
        update_data['correct_option'] = correct_option

    if not update_data:
        return {"error": "No data provided for update."}

    result = db.questions.update_one({"_id": ObjectId(question_id)}, {"$set": update_data})
    if result.matched_count == 0:
        return {"error": "Question not found."}

    return {"message": "Question updated successfully!"}


# Teacher: Delete a Question
@app.delete('/teacher/questions/{question_id}')
def delete_question(question_id: str):
    result = db.questions.delete_one({"_id": ObjectId(question_id)})
    if result.deleted_count == 0:
        return {"error": "Question not found."}
    return {"message": "Question deleted successfully!"}


# Student: View All Questions
@app.get('/student/questions')
def get_questions():
    questions = db.questions.find()
    return [serialize_doc(q) for q in questions]


# Student: View Questions by Subject
@app.get('/student/questions/{subject_id}')
def get_questions_by_subject(subject_id: str):
    questions = db.questions.find({"subject_id": subject_id})
    return [serialize_doc(q) for q in questions]


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

# Teacher: Add a Subject
@app.post('/teacher/subjects')
def add_subject(subject: Subject):
    try:
        # Validate subject code format
        if not subject.code.isdigit() or len(subject.code) != 3:
            raise HTTPException(status_code=400, detail="Subject code must be a 3-digit number")
            
        subject_data = subject.model_dump()
        result = db.subjects.insert_one(subject_data)
        subject_data['_id'] = str(result.inserted_id)
        return subject_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Teacher: Get All Subjects
@app.get('/teacher/subjects')
def get_subjects():
    try:
        subjects = list(db.subjects.find())
        if not subjects:
            # If no subjects exist, add default subjects
            for subject in DEFAULT_SUBJECTS:
                db.subjects.insert_one(subject)
            subjects = list(db.subjects.find())
        return [serialize_doc(s) for s in subjects]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Teacher: Delete Subject
@app.delete('/teacher/subjects/{subject_id}')
def delete_subject(subject_id: str):
    try:
        # Convert string ID to ObjectId
        subject = db.subjects.find_one({"_id": ObjectId(subject_id)})
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Delete the subject
        result = db.subjects.delete_one({"_id": ObjectId(subject_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        return {"message": "Subject deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        # Validate subject_id format
        if not ObjectId.is_valid(subject_id):
            raise HTTPException(status_code=400, detail="Invalid subject ID format")

        # Check file type
        content_type = file.content_type
        if content_type not in ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']:
            raise HTTPException(status_code=400, detail="Only PDF and Word documents are allowed")

        # Create subject folder if it doesn't exist
        subject = db.subjects.find_one({"_id": ObjectId(subject_id)})
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Generate a unique filename
        file_extension = mimetypes.guess_extension(content_type) or '.pdf'
        safe_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Create folders if they don't exist
        subject_folder = os.path.join(ASSIGNMENT_FOLDER, subject['code'])
        os.makedirs(subject_folder, exist_ok=True)
        
        # Save the file with error handling
        file_path = os.path.join(subject_folder, safe_filename)
        try:
            contents = await file.read()
            if not contents:
                raise HTTPException(status_code=400, detail="Empty file")
            
            with open(file_path, 'wb') as f:
                f.write(contents)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
        # Save assignment metadata
        assignment_data = {
            'subject_id': subject_id,
            'title': title,
            'description': description,
            'due_date': due_date,
            'filename': file.filename,  # Store original filename
            'stored_filename': safe_filename,  # Store the UUID filename
            'path': file_path,
            'subject_name': subject['name'],
            'subject_code': subject['code']
        }
        
        try:
            result = db.assignments.insert_one(assignment_data)
            assignment_data['_id'] = str(result.inserted_id)
            return assignment_data
        except Exception as e:
            # If database insert fails, clean up the saved file
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"Failed to save assignment data: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# Teacher: Get Assignments by Subject
@app.get('/teacher/assignments/{subject_id}')
def get_assignments_by_subject(subject_id: str):
    assignments = db.assignments.find({"subject_id": subject_id})
    return [serialize_doc(a) for a in assignments]

# Teacher: Get All Assignments
@app.get('/teacher/assignments')
def get_all_assignments():
    assignments = db.assignments.find()
    return [serialize_doc(a) for a in assignments]

# Teacher: Delete Assignment
@app.delete('/teacher/assignments/{assignment_id}')
async def delete_assignment(assignment_id: str):
    assignment = db.assignments.find_one({"_id": ObjectId(assignment_id)})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    file_path = assignment.get('path')
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
    
    result = db.assignments.delete_one({"_id": ObjectId(assignment_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    return {"message": "Assignment deleted successfully"}

# Student: Get All Assignments
@app.get('/student/assignments')
def get_student_assignments():
    assignments = db.assignments.find()
    return [serialize_doc(a) for a in assignments]

# Student: Get Assignments by Subject
@app.get('/student/assignments/{subject_id}')
def get_student_assignments_by_subject(subject_id: str):
    assignments = db.assignments.find({"subject_id": subject_id})
    return [serialize_doc(a) for a in assignments]

# Student: Download Assignment
@app.get('/student/assignments/{assignment_id}/download')
async def download_assignment(assignment_id: str):
    assignment = db.assignments.find_one({"_id": ObjectId(assignment_id)})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    file_path = assignment.get('path')
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Assignment file not found")
    
    return FileResponse(
        file_path,
        filename=assignment.get('filename'),
        media_type='application/octet-stream'
    )

# Teacher: Create Study Material Folder
@app.post('/teacher/study-material/folders')
def create_folder(folder_name: str):
    folder_path = os.path.join(STUDY_MATERIAL, folder_name)
    os.makedirs(folder_path, exist_ok=True)
    return {"message": "Folder created successfully!", "path": folder_path}

# Teacher: Upload Files to Subfolder
@app.post('/teacher/study-material/upload')
async def upload_file(subject: str = Form(...), file: UploadFile = File(...)):
    try:
        # Full path to the subfolder
        upload_path = os.path.join(STUDY_MATERIAL, subject)

        # Check if folder exists
        if not os.path.exists(upload_path):
            raise HTTPException(status_code=404, detail="Folder not found")

        # Save the file
        file_path = os.path.join(upload_path, file.filename)
        with open(file_path, "wb") as f:
            f.write(await file.read())

        return {"message": "File uploaded successfully!", "file_path": file_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Teacher: Delete Folder
@app.delete('/teacher/study-material/folders/{folder_name}')
def delete_folder(folder_name: str):
    folder_path = os.path.join(STUDY_MATERIAL, folder_name)
    if os.path.exists(folder_path):
        shutil.rmtree(folder_path)
        return {"message": "Folder and its contents deleted successfully!"}
    raise HTTPException(status_code=404, detail="Folder not found")

# Student: View Study Material
@app.get('/student/study-material')
def view_study_materials():
    if not os.path.exists(STUDY_MATERIAL):
        raise HTTPException(status_code=404, detail="Study material directory not found")

    study_materials = []
    for root, dirs, files in os.walk(STUDY_MATERIAL):
        relative_path = os.path.relpath(root, STUDY_MATERIAL)
        folder_name = relative_path if relative_path != "." else "Root"
        study_materials.append({
            "folder": folder_name,
            "subfolders": dirs,
            "files": files
        })

    return {"study_materials": study_materials}

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
        # Validate subject_id format
        if not ObjectId.is_valid(subject_id):
            raise HTTPException(status_code=400, detail="Invalid subject ID format")

        # Check file type
        content_type = file.content_type
        allowed_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'video/mp4',
            'video/webm'
        ]
        
        if content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, Word, PowerPoint, and video files are allowed")

        # Get subject
        subject = db.subjects.find_one({"_id": ObjectId(subject_id)})
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
        
        # Generate a unique filename with subject code prefix
        file_extension = mimetypes.guess_extension(content_type) or '.pdf'
        safe_filename = f"{subject['code']}_{uuid.uuid4()}{file_extension}"
        
        # Create subject folder in course materials
        subject_folder = os.path.join(COURSE_MATERIAL_FOLDER, subject['code'])
        os.makedirs(subject_folder, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(subject_folder, safe_filename)
        relative_path = os.path.relpath(file_path, UPLOAD_FOLDER)
        
        try:
            contents = await file.read()
            if not contents:
                raise HTTPException(status_code=400, detail="Empty file")
            
            with open(file_path, 'wb') as f:
                f.write(contents)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
        # Save course material metadata
        material_data = {
            'subject_id': subject_id,
            'title': title,
            'description': description,
            'material_type': material_type,
            'filename': file.filename,
            'stored_filename': safe_filename,
            'path': relative_path,  # Store relative path instead of absolute
            'subject_name': subject['name'],
            'subject_code': subject['code'],
            'upload_date': datetime.now().isoformat(),
            'file_type': content_type
        }
        
        try:
            result = db.course_materials.insert_one(material_data)
            material_data['_id'] = str(result.inserted_id)
            return material_data
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"Failed to save course material data: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

# Teacher: Get Course Materials by Subject
@app.get('/teacher/course-material/{subject_id}')
def get_course_materials_by_subject(subject_id: str):
    materials = db.course_materials.find({"subject_id": subject_id})
    return [serialize_doc(m) for m in materials]

# Get Course Material File
@app.get('/materials/{file_path:path}')
async def get_material_file(file_path: str):
    try:
        # Construct the full file path from uploads folder
        full_path = os.path.join(UPLOAD_FOLDER, file_path)
        
        # Ensure the path is within the uploads directory (security check)
        if not os.path.abspath(full_path).startswith(os.path.abspath(UPLOAD_FOLDER)):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Check if file exists
        if not os.path.exists(full_path) or not os.path.isfile(full_path):
            raise HTTPException(status_code=404, detail="File not found")
            
        # Get the filename and content type
        filename = os.path.basename(file_path)
        content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'
        
        # Return the file
        return FileResponse(
            full_path,
            filename=filename,
            media_type=content_type
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get Course Materials by Subject for Students
@app.get('/student/course-material/{subject_id}')
def get_student_course_materials(subject_id: str):
    try:
        # Validate subject_id format
        if not ObjectId.is_valid(subject_id):
            raise HTTPException(status_code=400, detail="Invalid subject ID format")
            
        # Check if subject exists
        subject = db.subjects.find_one({"_id": ObjectId(subject_id)})
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
            
        # Get materials for the subject
        materials = list(db.course_materials.find({"subject_id": subject_id}))
        return [serialize_doc(m) for m in materials]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ObjectId -> string in _id
def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    return doc
