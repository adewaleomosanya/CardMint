from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from backend.database import engine
from backend.models import Base
from backend.routers.auth import router as auth_router
from backend.routers.user import router as user_router
from backend.flashcard import router as flashcards_router

app = FastAPI(title="CardMint Authentication API")

origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")
app.mount("/css", StaticFiles(directory="frontend/css"), name="css")

@app.get("/")
def root():
    return FileResponse("frontend/login.html")

@app.get("/home")
def home():
    return FileResponse("frontend/flashcard.html")


Base.metadata.create_all(bind=engine)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(flashcards_router)
