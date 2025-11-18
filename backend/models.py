from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from backend.database import Base


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("Users", back_populates="flashcards")

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    flashcards = relationship("Flashcard", back_populates="owner")
