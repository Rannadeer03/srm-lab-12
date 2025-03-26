import os
import shutil
from typing import List

from bson import ObjectId
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from pymongo import MongoClient

app = FastAPI()

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


class Question(BaseModel):
    teacher_id: int = Field(..., description="ID of the teacher")
    subject_id: str = Field(..., description="Subject identifier")
    question_text: str = Field(..., description="The text of the question")
    options: List[str] = Field(..., description="List of available options")
    correct_option: str = Field(..., description="Correct answer from the options")


# Teacher: Add a Question
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


# Teacher: Upload Assignment PDF
@app.post('/teacher/assignments')
def upload_assignment(file: UploadFile = File(...)):
    file_path = os.path.join(ASSIGNMENT_FOLDER, file.filename)
    with open(file_path, 'wb') as f:
        f.write(file.file.read())
    assignment = {'filename': file.filename, 'path': file_path}
    db.assignments.insert_one(assignment)
    return {"message": "Assignment uploaded!"}


# Student: View Assignments
@app.get('/student/assignments')
def get_assignments():
    assignments = db.assignments.find()
    return [serialize_doc(a) for a in assignments]


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
