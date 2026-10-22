# Resume Battle 2.0: Career Intelligence Arena

> **"Don't just upload your resume. Put your career readiness to the test."**

Resume Battle 2.0 is a complete, modern, dark-first career intelligence platform designed for university students, placement candidates, and engineering professionals. It provides deterministic, explainable resume evaluation against real role requirements, head-to-head resume version battles, a persistent Career DNA profile, gap-driven learning missions, and mock interview simulations.

---

## 🌟 Key Features

1. **Resume Arena & Head-to-Head Battle**:
   - Parse PDF, DOCX, and text resumes with sanitization.
   - Explainable 9-dimension rubric scoring with exact quotes from your resume.
   - Pit two resume versions side-by-side with dimension-by-dimension bar charts, delta tables, and winner explanations.
   - Printable report export.
2. **Persistent Career DNA**:
   - Curate verified competencies with concrete project evidence anchors.
   - View category clusters and interactive visual skill network structures.
3. **Career Quest Learning Missions**:
   - Actionable missions generated directly from your missing requirements.
   - Progress tracking and points rewards upon submitting implementation evidence.
4. **Application Simulator**:
   - Grounded mock interview simulations (technical, architectural, and behavioral).
   - Instant candidate response scoring with structured feedback.
   - Preparation checklists.
5. **Project Proof**:
   - Portfolio project profiles tracking challenges, architectural decisions, and outcomes.
   - Automated generation of truthful resume bullet points and expected interview follow-ups.
6. **Version Lab**:
   - Named resume iterations (e.g., Full Stack Core vs. Cloud Specialist).
   - Snapshot preservation ensuring historical assessments remain interpretable.
7. **Battle League**:
   - Privacy-first community challenges using pseudonymized handles (e.g. `AsyncVoyager_921`).
   - Zero exposure of personal names, contact info, or raw resume files.
8. **Career Insights**:
   - Telemetry analytics showing rubric score trajectories, recurring gap frequencies, and dimension averages.
9. **Document Management**:
   - Encrypted document storage with download, rename, and deletion controls behind a clean storage abstraction.
10. **Enterprise Security & GDPR**:
    - PBKDF2 password hashing, JWT sessions, IDOR protection, full JSON data export, and complete account erasure.

---

## 🚀 Quickstart Guide (Local Development)

### 1. Start the Flask Backend
```bash
cd resume-battle-2/backend

# Virtual environment setup
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows
# source venv/bin/activate     # On Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Seed development database with demo candidate, sample resumes, and missions
python seed_data.py

# Run API server (http://localhost:5000)
python run.py
```

### 2. Start the React Frontend
In a new terminal:
```bash
cd resume-battle-2/frontend
npm install
npm run dev
```

Open browser at: **`http://localhost:5173`**

### 3. Demo Account Access
Click the **"Instant 1-Click Demo Login"** button on the landing page or login screen to immediately explore pre-seeded resumes, evaluations, missions, and project evidence!
- **Email**: `demo@resumebattle.io`
- **Password**: `demo123456`

---

## ☁️ AWS-Ready Architecture

The application is specifically engineered for AWS migration without rewriting business logic:
- **Storage**: Uses `StorageService` abstraction. Switch from local disk to Amazon S3 by setting `STORAGE_BACKEND=s3` and `S3_BUCKET_NAME`.
- **AI Provider**: Uses `AIProvider` abstraction. Operates completely locally via `LocalDeterministicAIProvider`; can be switched to Amazon Bedrock (Claude 3 / Titan) by setting `AI_PROVIDER=bedrock`.
- **Database**: Works out of the box with SQLite; production-ready for Amazon RDS / Aurora PostgreSQL via `DATABASE_URL`.
- **Background Jobs**: Prepared for AWS SQS and Lambda worker pipelines.
- **ALB Monitoring**: Health and readiness endpoints at `/api/health` and `/api/ready`.

See [`docs/AWS_ROADMAP.md`](file:///c:/Users/xoxan/Desktop/resume-battle-new/resume-battle-2/docs/AWS_ROADMAP.md) for full service mapping and cost considerations.

---

## 🧪 Testing

### Backend Unit & Integration Tests (11 passed)
```bash
cd resume-battle-2/backend
.\venv\Scripts\pytest -v
```

### Frontend Production Build
```bash
cd resume-battle-2/frontend
npm run build
```

---

## 📚 Documentation Index
- [`docs/ARCHITECTURE.md`](file:///c:/Users/xoxan/Desktop/resume-battle-new/resume-battle-2/docs/ARCHITECTURE.md): System design, service interfaces, Mermaid diagrams.
- [`docs/DATABASE.md`](file:///c:/Users/xoxan/Desktop/resume-battle-new/resume-battle-2/docs/DATABASE.md): Relational models, constraints, and IDOR protection.
- [`docs/AWS_ROADMAP.md`](file:///c:/Users/xoxan/Desktop/resume-battle-new/resume-battle-2/docs/AWS_ROADMAP.md): AWS service matrix, implementation status, and cost analysis.
- [`docs/SECURITY.md`](file:///c:/Users/xoxan/Desktop/resume-battle-new/resume-battle-2/docs/SECURITY.md): Auth, hashing, input sanitization, and GDPR data export/erasure.
- [`docs/API.md`](file:///c:/Users/xoxan/Desktop/resume-battle-new/resume-battle-2/docs/API.md): Complete REST API contract.
- [`docs/LOCAL_DEVELOPMENT.md`](file:///c:/Users/xoxan/Desktop/resume-battle-new/resume-battle-2/docs/LOCAL_DEVELOPMENT.md): Step-by-step setup and troubleshooting.
- [`docs/DEPLOYMENT.md`](file:///c:/Users/xoxan/Desktop/resume-battle-new/resume-battle-2/docs/DEPLOYMENT.md): ECS/Fargate, EC2, Nginx, and Docker deployment.
- [`docs/TESTING.md`](file:///c:/Users/xoxan/Desktop/resume-battle-new/resume-battle-2/docs/TESTING.md): Test suite details and coverage.
