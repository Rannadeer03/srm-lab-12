from fastapi import Depends
from .database.mongodb import get_database

async def get_db():
    db = get_database()
    try:
        yield db
    finally:
        pass  # Connection is managed by the application lifespan 