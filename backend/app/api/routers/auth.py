from fastapi import APIRouter, HTTPException, status
from app.models.schemas import LoginRequest, SignupRequest, UserResponse
from app.db.mock_db import users_db
from app.api.security import create_access_token
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(req: SignupRequest):
    # Check if email exists
    if any(u["email"] == req.email for u in users_db.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    users_db[user_id] = {
        "email": req.email,
        "username": req.username,
        "password": req.password  # In a real app, hash this!
    }
    
    token = create_access_token({"sub": user_id})
    return UserResponse(
        id=user_id,
        email=req.email,
        username=req.username,
        token=token
    )

@router.post("/login", response_model=UserResponse)
def login(req: LoginRequest):
    # Find user by email and password
    user_entry = next(
        ((uid, u) for uid, u in users_db.items() if u["email"] == req.email and u["password"] == req.password),
        None
    )
    
    if not user_entry:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id, user_data = user_entry
    token = create_access_token({"sub": user_id})
    
    return UserResponse(
        id=user_id,
        email=user_data["email"],
        username=user_data["username"],
        token=token
    )

@router.post("/logout")
def logout():
    # In a real stateless JWT setup, logout might happen client-side by deleting token.
    # To really logout on server, implement a token blacklist.
    return {"message": "Successfully logged out"}
