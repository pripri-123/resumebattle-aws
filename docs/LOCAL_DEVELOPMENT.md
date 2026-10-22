# Resume Battle 2.0 — Local Development Guide

## Prerequisites
- **Node.js**: v18+ (tested with v22.12.0)
- **Python**: 3.10+ (tested with Python 3.14)
- **npm**: 9+

---

## 1. Quick Setup in 3 Steps

### Step 1: Backend Setup
```bash
cd resume-battle-2/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed development database with demo candidate, resumes, and missions
python seed_data.py

# Start Flask backend API (port 5000)
python run.py
```

### Step 2: Frontend Setup
In a new terminal window:
```bash
cd resume-battle-2/frontend

# Install dependencies (already installed if setting up repository)
npm install

# Start Vite development server (port 5173)
npm run dev
```

### Step 3: Access Application
Open your browser at:
```
http://localhost:5173
```
- Click **"Instant 1-Click Demo Login"** on the landing page or login screen to immediately explore pre-seeded resumes, Career DNA, mock interview simulations, and battle comparisons.
- Demo Credentials:
  - **Email**: `demo@resumebattle.io`
  - **Password**: `demo123456`

---

## 2. Running Automated Tests

### Run Backend Pytest Suite
```bash
cd resume-battle-2/backend
.\venv\Scripts\pytest
```
Expected output:
```
11 passed in ~2.2s
```

### Run Frontend Production Build Validation
```bash
cd resume-battle-2/frontend
npm run build
```
Expected output:
```
✓ built in ~2s with 0 errors
```

---

## 3. Configuration & Overrides

Configuration is managed via `backend/.env`. Key development defaults:
```ini
FLASK_ENV=development
FLASK_DEBUG=true
PORT=5000
DATABASE_URL=sqlite:///resume_battle.db
STORAGE_BACKEND=local
AI_PROVIDER=local
BACKGROUND_JOB_BACKEND=local
```
No AWS credentials are required for local development.
