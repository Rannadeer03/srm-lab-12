from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import JWTError, jwt
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, "SECRET_KEY", algorithm="HS256")
    return encoded_jwt

def format_response(data: Dict[str, Any]) -> Dict[str, Any]:
    """Format API response consistently"""
    return {
        "timestamp": datetime.now().isoformat(),
        "data": data
    }

def validate_test_data(test_data: Dict[str, Any]) -> bool:
    """Validate test data structure"""
    required_fields = ['title', 'subject', 'duration', 'questions']
    return all(field in test_data for field in required_fields)
