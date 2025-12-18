from typing import List, Optional, Annotated
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Deck, Flashcard, DeckProgress, Users
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/decks", tags=["decks"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Users, Depends(get_current_user)]

class DeckCreate(BaseModel):
    name: str
    description: Optional[str] = None

class DeckOut(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attribute = True

class ProgressOut(BaseModel):
    id: int
    deck_id: int
    user_id: int
    total_cards: int
    correct: int
    wrong: int
    percentage: int
    last_reviewed: Optional[datetime]

    class Config:
        from_attribute = True

class DeckProgressUpdate(BaseModel):
    correct_increment: int = 0
    wrong_increment: int = 0
    total_cards: Optional[int] = None

@router.post("/create", response_model=DeckOut, status_code=status.HTTP_201_CREATED)
def create_deck(payload: DeckCreate, db: db_dependency, current_user: user_dependency):
    deck = Deck(name=payload.name, description=payload.description, user_id=current_user.id)
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck

@router.get("/my-decks")
def get_my_decks(db: db_dependency, current_user: user_dependency):
    decks = db.query(Deck).filter(Deck.user_id == current_user.id).all()

    output = []
    for d in decks:
        card_count = db.query(Flashcard).filter(
            Flashcard.deck_id == d.id,
            Flashcard.user_id == current_user.id
        ).count()

        output.append({
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "card_count": card_count
        })

    return output


@router.get("/{deck_id}/cards")
def get_deck_cards(deck_id: int, db: db_dependency, current_user: user_dependency):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    cards = db.query(Flashcard).filter(Flashcard.deck_id == deck_id, Flashcard.user_id == current_user.id).all()
    return cards


class AssignCard(BaseModel):
    deck_id: int

@router.put("/assign/{card_id}")
def assign_card_to_deck(card_id: int, body: AssignCard, db: db_dependency, current_user: user_dependency):
    card = db.query(Flashcard).filter(Flashcard.id == card_id, Flashcard.user_id == current_user.id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    deck = db.query(Deck).filter(Deck.id == body.deck_id, Deck.user_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    card.deck_id = body.deck_id
    db.commit()
    db.refresh(card)
    return {"message": "Flashcard assigned to deck", "card_id": card.id, "deck_id": body.deck_id}

@router.delete("/delete/{deck_id}")
def delete_deck(deck_id: int, db: db_dependency, current_user: user_dependency ):
    deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == current_user.id).first()
    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")
    db.query(Flashcard).filter(Flashcard.deck_id == deck_id).update({Flashcard.deck_id: None})
    db.delete(deck)
    db.commit()
    return {"message": "Deck deleted"}

@router.get("/{deck_id}", response_model=DeckOut)
def get_deck(deck_id: int, db: db_dependency, current_user: user_dependency):
    deck = db.query(Deck).filter(
        Deck.id == deck_id,
        Deck.user_id == current_user.id
    ).first()

    if not deck:
        raise HTTPException(status_code=404, detail="Deck not found")

    return deck

@router.put("/progress/{deck_id}", response_model=ProgressOut)
def update_progress(
    deck_id: int,
    body: DeckProgressUpdate,
    db: db_dependency,
    current_user: user_dependency
):
    progress = db.query(DeckProgress).filter(
        DeckProgress.user_id == current_user.id,
        DeckProgress.deck_id == deck_id
    ).first()

    if not progress:
        progress = DeckProgress(
            user_id=current_user.id,
            deck_id=deck_id
        )
        db.add(progress)

    progress.correct = body.correct_increment
    progress.wrong = body.wrong_increment
    progress.total_cards = body.total_cards or progress.total_cards
    progress.percentage = int((progress.correct / progress.total_cards) * 100)
    progress.last_reviewed = datetime.utcnow()

    db.commit()
    db.refresh(progress)
    return progress

@router.get("/progress/{deck_id}", response_model=ProgressOut)
def get_progress(
    deck_id: int,
    db: db_dependency,
    current_user: user_dependency
):
    progress = db.query(DeckProgress).filter(
        DeckProgress.user_id == current_user.id,
        DeckProgress.deck_id == deck_id
    ).first()
    progress.percentage = min(100, max(0, progress.percentage))

    if not progress:
        raise HTTPException(status_code=404, detail="No progress yet")

    return progress
