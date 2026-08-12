# HH Goa 2026 Generator — Backend

Python FastAPI backend for generating official themed photo frames and Builder ID Cards.

## Requirements
- Python 3.8+
- MongoDB instance (local or Atlas)

## Setup instructions
1. Ensure your current directory is `/backend`:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell:
   python -m venv .venv
   .\.venv\Scripts\activate

   # macOS / Linux:
   python -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and edit database details:
   ```bash
   cp .env.example .env
   ```
5. Start the API web server:
   ```bash
   uvicorn app.main:app --reload
   ```

The FastAPI swagger documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).
