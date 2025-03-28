import os
import shutil
from typing import List

from bson import ObjectId
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pymongo import MongoClient

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Connection
client = MongoClient('mongodb://localhost:27017/')
db = client.srmLab

# Paths for File Storage
UPLOAD_FOLDER = './uploads'
ASSIGNMENT_FOLDER = UPLOAD_FOLDER + '/assignments'
STUDY_MATERIAL = UPLOAD_FOLDER + '/study_material'

# Create all directories if they don't exist
for folder in [UPLOAD_FOLDER, ASSIGNMENT_FOLDER, STUDY_MATERIAL]:
    os.makedirs(folder, exist_ok=True)

print("All folders created or already exist.")

# Subject model
class Subject(BaseModel):
    name: str = Field(..., description="Name of the subject")
    code: str = Field(..., description="Subject code")

# Assignment model
class Assignment(BaseModel):
    subject_id: str = Field(..., description="Subject ID")
    title: str = Field(..., description="Title of the assignment")
    description: str = Field(..., description="Description of the assignment")
    due_date: str = Field(..., description="Due date of the assignment")

# Teacher: Add a Subject
@app.post('/teacher/subjects')
def add_subject(subject: Subject):
    subject_data = subject.model_dump()
    result = db.subjects.insert_one(subject_data)
    subject_data['_id'] = str(result.inserted_id)
    return subject_data

# Teacher: Get All Subjects
@app.get('/teacher/subjects')
def get_subjects():
    subjects = db.subjects.find()
    return [serialize_doc(s) for s in subjects]

# Teacher: Upload Assignment
@app.post('/teacher/assignments')
async def upload_assignment(
    subject_id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    due_date: str = Form(...),
    file: UploadFile = File(...)
):
    # Create subject folder if it doesn't exist
    subject = db.subjects.find_one({"_id": ObjectId(subject_id)})
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    subject_folder = os.path.join(ASSIGNMENT_FOLDER, subject['code'])
    os.makedirs(subject_folder, exist_ok=True)
    
    # Save the file
    file_path = os.path.join(subject_folder, file.filename)
    with open(file_path, 'wb') as f:
        f.write(await file.read())
    
    # Save assignment metadata
    assignment_data = {
        'subject_id': subject_id,
        'title': title,
        'description': description,
        'due_date': due_date,
        'filename': file.filename,
        'path': file_path,
        'subject_name': subject['name'],
        'subject_code': subject['code']
    }
    
    result = db.assignments.insert_one(assignment_data)
    assignment_data['_id'] = str(result.inserted_id)
    return assignment_data

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

# ObjectId -> string in _id
def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    return doc
