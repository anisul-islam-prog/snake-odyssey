from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.api.security import verify_token
from app.db.mock_db import users_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

async def get_current_user_id(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = verify_token(token)
    if not user_id or user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_id

async def get_current_user_name(user_id: str = Depends(get_current_user_id)):
    user_data = users_db.get(user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return user_data["username"]
