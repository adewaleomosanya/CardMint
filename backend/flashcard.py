from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.routers.auth import get_current_user
from pydantic import BaseModel
from backend.routers.auth import get_current_user
from backend.models import Flashcard, Users
from fastapi import APIRouter, Depends, HTTPException
from typing import Optional


router = APIRouter(prefix="/flashcards", tags=["flashcards"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FlashcardCreate(BaseModel):
    title: str
    question: str
    answer: str

class FlashcardUpdate(BaseModel):
    title: Optional[str] = None
    question: Optional[str] = None
    answer: Optional[str] = None



@router.post("/create")
def create_flashcard(
    card: FlashcardCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    new_card = Flashcard(
        title=card.title,
        question=card.question,
        answer=card.answer,
        user_id=current_user.id
    )
    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    return {"message": "Flashcard created", "card": new_card}


@router.get("/my-cards")
def get_user_flashcards(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    cards = db.query(Flashcard).filter(Flashcard.user_id == current_user.id).all()
    return cards

@router.put("/update/{card_id}")
def update_flashcard(
    card_id: int,
    updated: FlashcardUpdate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    card = db.query(Flashcard).filter(
        Flashcard.id == card_id,
        Flashcard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    if updated.title is not None:
        card.title = updated.title
    if updated.question is not None:
        card.question = updated.question
    if updated.answer is not None:
        card.answer = updated.answer

    db.commit()
    db.refresh(card)

    return {"message": "Flashcard updated", "card": card}


@router.delete("/delete/{card_id}")
def delete_flashcard(
    card_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    card = db.query(Flashcard).filter(
        Flashcard.id == card_id,
        Flashcard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    db.delete(card)
    db.commit()

    return {"message": "Flashcard deleted"}