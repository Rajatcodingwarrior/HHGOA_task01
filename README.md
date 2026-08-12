# HH Goa 2026 — Frame & Builder Card Generator

An official themed social graphic and credential generator built for **Hacker House Goa 2026** (Goa, India · 28–31 October 2026). 

Allows builders to upload a photo and instantly generate branded PFPs or high-credential Builder ID Cards with custom metadata (Name, Stack, Team, Teammates), deterministically generated titles, dynamic barcode stubs, and sand-palm Goa beach graphics. 

---

## Technical Stack & Architecture

- **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, GSAP, Lenis (Smooth Scroll), HTML5 Canvas overlays, TypeScript.
- **Backend**: FastAPI (Python), Pillow (Server-side image composition), OpenCV (Haar Cascades for face-aware smart cropping), PyMongo + Motor (Async MongoDB drivers).
- **Database**: MongoDB & GridFS (Original, processed, and final images stored as files with TTL-based 30-day automatic expiration).

---

## Project Structure

```text
hh-goa-generator/
│
├── frontend/                  # Next.js 16 App Router UI
│   ├── src/
│   │   ├── app/               # Landing page & X Share page
│   │   └── components/        # UploadZone, PreviewFrame, FormCard, Loader
│   ├── .env.example
│   └── package.json
│
├── backend/                   # FastAPI Python API
│   ├── app/                   # config, db connection, main routes
│   │   ├── generator.py       # Pillow overlay logic & font caching
│   │   ├── utils.py           # Face detection & EXIF rotates
│   │   └── database.py        # GridFS bucket initialization
│   ├── .env.example
│   └── requirements.txt
│
├── docker-compose.yml         # Local MongoDB database utility
├── .gitignore
└── README.md
```

---

## Local Development Setup

### 1. Launch local Database
Run the following in the root folder to start a local MongoDB container:
```bash
docker-compose up -d
```
*Note: Alternatively, you can install MongoDB locally on your system, or paste an Atlas URI directly into `backend/.env`.*

### 2. Startup Backend (FastAPI)
1. Navigate to the backend folder:
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
4. Copy the env template and verify port details:
   ```bash
   cp .env.example .env
   ```
5. Start the uvicorn development server:
   ```bash
   uvicorn app.main:app --reload
   ```
*API Swagger documentation will be online at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).*

### 3. Startup Frontend (Next.js)
1. Open a new terminal tab, and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install package dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Copy the env template:
   ```bash
   cp .env.example .env
   ```
4. Start the next dev server:
   ```bash
   npm run dev
   ```
*The web app will run locally at [http://localhost:3000](http://localhost:3000).*

---

## Core Flow & Operations

1. **Ingestion & Crop**: Frontend submits files $\rightarrow$ Backend checks EXIF rotations $\rightarrow$ OpenCV scans for faces $\rightarrow$ Pillow smart-crops surrounding borders (1:1 aspect ratio) $\rightarrow$ original files are indexed in GridFS.
2. **Graphic Composition**: Pillow downloads Google Fonts (`Space Grotesk`, `JetBrains Mono`) $\rightarrow$ draws dynamic vector layouts, barcodes, boarding pass parameters, and palm-tree silhouettes.
3. **X (Twitter) Preview Integration**: Generating shares returns a unique `public_result_id` URL. Next.js server-renders header tags dynamically so the X card visual crawler queries and previews the **actual generated image file** without authentication or client JS execution.
# HHGOA_task01
