from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.endpoints import auth, tests
from .routes import subjects, questions

app = FastAPI(
    title="FastAPI Sawar Backend",
    description="Backend for test creation, submissions, and authentication.",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(tests.router, prefix="/tests", tags=["tests"])
app.include_router(subjects.router)
app.include_router(questions.router)

@app.get("/")
def read_root():
    return {"message": "SRM Lab Backend API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
