from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Annotated, List

from backend.database import SessionLocal
from backend.models import Flashcard, Users
from backend.routers.auth import get_current_user


router = APIRouter(prefix="/flashcards", tags=["flashcards"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]


class FlashcardCreate(BaseModel):
    title: Optional[str] = None
    question: str
    answer: str
    deck_id: Optional[int] = None


class FlashcardOut(BaseModel):
    id: int
    title: Optional[str]
    question: str
    answer: str
    deck_id: Optional[int]

    class Config:
        from_attributes = True   


@router.post("/create", response_model=FlashcardOut)
def create_flashcard(
    card: FlashcardCreate,
    db: db_dependency,
    current_user: user_dependency
):
    new_card = Flashcard(
        title=card.title,
        question=card.question,
        answer=card.answer,
        user_id=current_user.id,
        deck_id=card.deck_id
    )

    db.add(new_card)
    db.commit()
    db.refresh(new_card)
    return new_card

@router.get("/my-cards", response_model=List[FlashcardOut])
def get_user_flashcards(
    db: db_dependency,
    current_user: user_dependency
):
    cards = db.query(Flashcard).filter(
        Flashcard.user_id == current_user.id
    ).all()
    return cards

@router.get("/by-deck/{deck_id}", response_model=List[FlashcardOut])
def get_cards_by_deck(
    deck_id: int,
    db: db_dependency,
    current_user: user_dependency
):
    cards = db.query(Flashcard).filter(
        Flashcard.user_id == current_user.id,
        Flashcard.deck_id == deck_id
    ).all()
    return cards

@router.put("/update/{card_id}", response_model=FlashcardOut)
def update_flashcard(
    card_id: int,
    payload: FlashcardCreate,
    db: db_dependency,
    current_user: user_dependency
):
    card = db.query(Flashcard).filter(
        Flashcard.id == card_id,
        Flashcard.user_id == current_user.id
    ).first()

    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    card.title = payload.title
    card.question = payload.question
    card.answer = payload.answer
    card.deck_id = payload.deck_id

    db.commit()
    db.refresh(card)
    return card



@router.delete("/delete/{card_id}", status_code=204)
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
