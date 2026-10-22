# Resume Battle 2.0 — Testing & Verification Guide

## 1. Automated Test Suite

The test suite covers:
- Core business logic and scoring reproducibility.
- Security boundaries, JWT validity, and IDOR protection.
- Relational data persistence and cascades.
- API validation and error responses.

---

## 2. Running Backend Tests

Navigate to `backend` and run pytest:
```bash
cd resume-battle-2/backend
.\venv\Scripts\pytest -v
```

### Covered Test Modules:
1. `tests/test_auth.py`:
   - `test_register_success`: Validates user creation, profile initialization, and JWT issuance.
   - `test_register_duplicate_email`: Confirms duplicate registration rejection.
   - `test_login_success`: Validates password hash verification.
   - `test_login_invalid_password`: Confirms 401 response on wrong password.
   - `test_protected_route_without_token`: Confirms access restriction without Bearer token.
2. `tests/test_scoring.py`:
   - `test_deterministic_scoring_reproducibility`: Proves that identical resume and job inputs generate 100% identical overall scores and dimensions across runs.
   - `test_scoring_evidence_and_gap_detection`: Confirms missing requirement detection and quote extraction.
3. `tests/test_resumes.py`:
   - `test_resume_upload_and_list`: Validates resume persistence and text extraction.
   - `test_idor_protection_cross_user_isolation`: Confirms that User A cannot view, retrieve, or delete User B's private resume.
4. `tests/test_career_and_missions.py`:
   - `test_career_dna_crud`: Validates skill addition and Career DNA catalog retrieval.
   - `test_missions_workflow`: Tests mission listing and state progression.

---

## 3. Running Frontend Build Validation

Run TypeScript type check and production bundling in `frontend`:
```bash
cd resume-battle-2/frontend
npm run build
```
Confirms clean compilation with 0 TypeScript or PostCSS/Tailwind errors.
