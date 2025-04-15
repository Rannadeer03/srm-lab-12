from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional

# MongoDB connection settings
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "srm_lab_db"

# Initialize MongoDB client
client: Optional[AsyncIOMotorClient] = None

async def connect_to_mongo():
    """Connect to MongoDB database"""
    global client
    client = AsyncIOMotorClient(MONGODB_URL)
    return client[DATABASE_NAME]

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()

def get_database():
    """Get database instance"""
    if not client:
        raise Exception("Database not initialized. Call connect_to_mongo() first.")
    return client[DATABASE_NAME] 