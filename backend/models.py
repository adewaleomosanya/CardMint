from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

    flashcards = relationship("Flashcard", back_populates="owner")
    decks = relationship("Deck", back_populates="owner")
    
class Deck(Base):
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("Users", back_populates="decks")
    flashcards = relationship("Flashcard", back_populates="deck", cascade="all, delete-orphan")
    progress = relationship("DeckProgress", back_populates="deck", uselist=False)


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    question = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    deck_id = Column(Integer, ForeignKey("decks.id"), nullable=True)

    owner = relationship("Users", back_populates="flashcards")
    deck = relationship("Deck", back_populates="flashcards")


class DeckProgress(Base):
    __tablename__ = "deck_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    deck_id = Column(Integer, ForeignKey("decks.id"), nullable=False)
    total_cards = Column(Integer, default=0)
    correct = Column(Integer, default=0)
    wrong = Column(Integer, default=0)
    percentage = Column(Integer, default=0)
    last_reviewed = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    deck = relationship("Deck", back_populates="progress")
