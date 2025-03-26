## Features

### Teacher:

- Add, update, and delete questions.
- Upload assignments in PDF format.
- Create folders and upload study materials.

### Student:

- View all questions or questions by subject.
- Access uploaded assignments.
- View available study materials.

## Installation

1. **Clone the Repository**
    ```bash
    git clone https://github.com/madhan175/srm-lab-12.git
    cd srm-lab-12/fastapi_backend/
    ```

2. **Install Dependencies**

3. **Start MongoDB**  

4. **Run the Application**
    ```bash
    uvicorn srmLab:app --reload
    ```

- go to http://127.0.0.1:8000/docs for api testing

## API Endpoints

| Method     | Endpoint                                        | Description                    |
|------------|-------------------------------------------------|--------------------------------|
| **POST**   | `/teacher/questions`                            | Add a question                 |
| **PUT**    | `/teacher/questions/{question_id}`              | Update a question              |
| **DELETE** | `/teacher/questions/{question_id}`              | Delete a question              |
| **GET**    | `/student/questions`                            | View all questions             |
| **GET**    | `/student/questions/{subject_id}`               | View questions by subject      |
| **POST**   | `/teacher/assignments`                          | Upload assignment PDF          |
| **GET**    | `/student/assignments`                          | View assignments               |
| **POST**   | `/teacher/study-material/folders`               | Create a study material folder |
| **POST**   | `/teacher/study-material/upload`                | Upload files to a folder       |
| **DELETE** | `/teacher/study-material/folders/{folder_name}` | Delete folder                  |
| **GET**    | `/student/study-material`                       | View study materials           |

## Notes

- Ensure the `uploads` directory is accessible for storing files.
- Use tools like **Postman** for API testing.

