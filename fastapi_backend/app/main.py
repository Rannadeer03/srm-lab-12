from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import test
from .database.mongodb import connect_to_mongo, close_mongo_connection

app = FastAPI(
    title="FastAPI Sawar Backend",
    description="Backend for test creation, submissions, and authentication.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(test.router)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

@app.get("/")
def read_root():
    return {"message": "SRM Lab Backend API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
