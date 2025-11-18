# CardMint — Smart Flashcard Web App

CardMint is a modern flashcard application built with **FastAPI** (backend) and **JavaScript + HTML/CSS** (frontend).  
Users can register, log in, create flashcards, flip them, edit, and delete them — all through a clean and smooth UI.


##  Features
### User Authentication
- Register with email + password  
- Secure login using **JWT** tokens    

### Flashcard Management
- Create flashcards with *title, question, answer*  
- Flip animated flashcards  
- Edit flashcards with a modal popup  
- Delete flashcards  
- All flashcards tied to the logged-in user  

### Frontend UI
- Fully responsive  
- Toast notifications instead of alert()  
- Elegant login & register pages    
- Modern gradient background  

## Tech Stack

### Backend
- **FastAPI**
- SQLAlchemy ORM
- Postgres for database
- Passlib (password hashing)
- JWT authentication (python-jose)

### Frontend
- HTML / CSS
- JavaScript
- Smooth animations


## Setup Instructions
Follow these steps to run CardMint locally.
1. Clone the Repository
2. Create a Virtual Environment: python3 -m venv cardmintenv to activate the environment for macOS / Linux: "source cardmintenv/bin/activate"  and for windows use: "cardmintenv\Scripts\activate"
3. Install Backend Dependencies: pip install -r requirements.txt
4. Configure the Database
- Create PostgreSQL database
- Update your backend/database.py connection string: use this format; DATABASE_URL = "postgresql://username:password@localhost/cardmint_db"
5. Start the Backend Server: uvicorn backend.main:app --reload
6. Run the Frontend
Just open: frontend/login.html




