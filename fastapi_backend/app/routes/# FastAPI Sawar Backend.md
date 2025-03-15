# FastAPI Sawar Backend

This is a FastAPI backend for handling test creation, test submission, and simple authentication (without a database).

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On Unix or macOS:
     ```
     source venv/bin/activate
     ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   uvicorn app.main:app --reload
   ```
   
The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

You can test the endpoints using the interactive documentation at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).