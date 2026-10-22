# Resume Battle 2.0 — REST API Specification

Base URL: `/api/v1`
Authentication: `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/register`
Creates a new candidate account.
- **Request Body**:
  ```json
  {
    "full_name": "Alex Rivera",
    "username": "alexrivera",
    "email": "alex@rivera.dev",
    "password": "password123",
    "target_role": "Full Stack Engineer"
  }
  ```
- **Response**: `201 Created` with JWT `token` and `user` object.

### `POST /api/v1/auth/login`
Authenticates with email/username and password.
- **Request Body**:
  ```json
  {
    "email_or_username": "demoplayer",
    "password": "demo123456"
  }
  ```
- **Response**: `200 OK` with JWT `token` and `user` object.

### `POST /api/v1/auth/demo`
Provides instant 1-click authentication to the pre-seeded demonstration account.
- **Response**: `200 OK` with JWT `token` and pre-populated candidate records.

### `GET /api/v1/auth/me`
Fetches authenticated user identity and profile.

---

## 2. Resume & Document Endpoints

### `GET /api/v1/resumes`
Returns all active resumes owned by the current user.

### `POST /api/v1/resumes/upload`
Uploads a new resume via multipart/form-data or raw text.
- **Form Fields**:
  - `file`: PDF or DOCX file (optional if text_content provided)
  - `text_content`: Plain text content (optional if file provided)
  - `title`: Name for resume
  - `target_role`: Target role category
- **Response**: `201 Created` with parsed text and storage key.

### `POST /api/v1/resumes/<id>/versions`
Creates a named version snapshot of an existing resume.

### `DELETE /api/v1/resumes/<id>`
Permanently deletes resume, version snapshots, and underlying storage file.

---

## 3. Resume Arena & Evaluation Endpoints

### `POST /api/v1/analyses/evaluate`
Runs deterministic 9-dimension rubric evaluation against a job description.
- **Request Body**:
  ```json
  {
    "resume_id": "uuid-string",
    "job_description_id": "uuid-string",
    "job_text": "Optional custom job text"
  }
  ```
- **Response**: `201 Created` containing overall score (0-100), verdict, 9 dimensions, and granular requirement matches with extracted resume quotes.

### `POST /api/v1/battles/compare`
Runs side-by-side comparison of two resumes against the same role rubric.
- **Request Body**:
  ```json
  {
    "resume_a_id": "uuid-1",
    "resume_b_id": "uuid-2",
    "job_description_id": "uuid-job"
  }
  ```
- **Response**: `200 OK` with winner identification, overall score comparison, and dimension-by-dimension deltas.

---

## 4. Career DNA Endpoints

- `GET /api/v1/career/dna`: Returns skills catalog, categories, and visual graph nodes/links.
- `POST /api/v1/career/skills`: Adds a new competency.
- `PATCH /api/v1/career/skills/<id>`: Updates verification status or proficiency level.
- `POST /api/v1/career/skills/<id>/evidence`: Attaches verifiable project proof.

---

## 5. Career Quest & Simulator Endpoints

- `GET /api/v1/missions`: Lists learning missions with optional `?status=` filter.
- `POST /api/v1/missions/<id>/start`: Starts a mission.
- `POST /api/v1/missions/<id>/complete`: Submits implementation evidence and awards points.
- `POST /api/v1/interviews/start`: Initiates a mock interview session.
- `POST /api/v1/interviews/<session_id>/answer`: Evaluates candidate response with rubric scoring.
- `POST /api/v1/interviews/<session_id>/complete`: Summarizes interview simulation.

---

## 6. Health & ALB Probes

- `GET /api/health`: Returns 200 OK with service version and active storage/AI provider config.
- `GET /api/ready`: Returns 200 OK if relational database connectivity is operational; 503 if disconnected.
