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
* [ ] User Registration - The system shall allow users to register with email and
password.



