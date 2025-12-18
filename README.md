# CardMint — Smart Flashcard Web App

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


## Requirements
* [x] User Registration - The system shall allow users to register with email and
password.
* [x] User Login - The system shall allow users to log in with their credentials.
* [x] Password Security - Passwords shall be hashed before being stored in the database.
* [x] Flashcard Creation Users shall be able to create flashcards (question & answer).
* [x] Flashcard Management - Users shall be able to edit and delete flashcards.
* [x] Flashcard Display - Flashcards shall flip to reveal answers when clicked.
* [x] Data Storage The system shall store flashcards and user data persistently.
* [x] Logout - Users shall be able to securely log out of their accounts.
* [x] Deck creation - The system shall allow users to create decks for grouping related flashcards.
* [x] Deck Review - The system shall allow users to open a deck and review flashcards one at a time.
* [x] Learning Progress Tracking - The system shall calculate and store the user’s learning performance for each deck based on right/wrong responses.
* [] PDF Upload Users shall be able to upload PDF files.
* [x] Text Extraction The system shall extract readable text from uploaded PDFs.