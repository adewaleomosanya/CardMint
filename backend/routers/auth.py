from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from starlette import status
from backend.database import SessionLocal
from backend.models import Users
import os
from dotenv import load_dotenv

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    message: str

def authenticate_user(email: str, password: str, db: Session):
    user = db.query(Users).filter(Users.email == email).first()
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user


def create_access_token(email: str, user_id: int, expires_delta: timedelta):
    encode = {"sub": email, "id": user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({"exp": expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: Annotated[str, Depends(oauth2_bearer)],
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate user."
            )
        
        user = db.query(Users).filter(Users.email == email).first()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found."
            )
        
        return user 

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate user."
        )



@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(create_user_request: CreateUserRequest, db: db_dependency):
    existing_user = db.query(Users).filter(Users.email == create_user_request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered.")
    
    hashed_pw = pwd_context.hash(create_user_request.password)
    new_user = Users(email=create_user_request.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": f"User {new_user.email} registered successfully!"}


@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid credentials.")
    token = create_access_token(user.email, user.id, timedelta(minutes=30))
    return {
        "access_token": token,
        "token_type": "bearer",
        "message": f"Hi {user.email}, welcome back!"
    }


@router.post("/logout")
async def logout_user():
    return {"message": "You have been securely logged out."}
