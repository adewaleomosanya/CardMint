from fastapi import APIRouter, Depends, HTTPException
from starlette import status
from typing import Annotated
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Users
from backend.routers.auth import get_current_user 

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]

@router.get("/me", status_code=status.HTTP_200_OK)
async def get_logged_in_user(
    user: user_dependency, 
    db: db_dependency
):
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication Failed")

    return {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active
    }
