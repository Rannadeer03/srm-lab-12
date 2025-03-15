from fastapi import APIRouter, HTTPException
from ..models import User
from ..schemas import UserCreate, User as UserSchema
from ..utils import verify_password, create_access_token, pwd_context

# In-memory user storage
users_db = {}
next_user_id = 1



router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserSchema)
def register(user: UserCreate):
    global next_user_id
    
    # Check if email already exists
    if any(u.email == user.email for u in users_db.values()):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        id=next_user_id,
        email=user.email,
        hashed_password=pwd_context.hash(user.password)
    )
    
    # Store user and increment ID
    users_db[next_user_id] = new_user
    next_user_id += 1
    
    return new_user


@router.post("/login")
def login(user: UserCreate):
    # Find user by email
    user_found = None
    for u in users_db.values():
        if u.email == user.email:
            user_found = u
            break
            
    if not user_found:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(user.password, user_found.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user_found.email})
    return {"access_token": access_token, "token_type": "bearer"}
