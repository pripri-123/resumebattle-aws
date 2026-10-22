# Resume Battle 2.0 — Security & Privacy Architecture

## 1. Authentication & Session Management
- **Password Protection**: Passwords hashed using PBKDF2 with SHA-256 and salted dynamically (`werkzeug.security.generate_password_hash`).
- **Token Mechanism**: Ephemeral JSON Web Tokens (JWT) signed with HS-256 and an expiration window configured via `JWT_EXPIRATION_HOURS` (default 72 hours).
- **Transport Security**: In production, tokens are delivered via `Authorization: Bearer <token>` or secure, HTTP-only, `SameSite=Strict` cookies over HTTPS.
- **Demo Mode Isolation**: The 1-click demonstration candidate account (`demo@resumebattle.io`) is isolated and clearly flagged with `is_demo=True`.

---

## 2. Authorization & Tenant Isolation
- **Resource Ownership Verification**: Every route handling resumes, evaluations, missions, projects, or settings verifies that `record.user_id == current_user.id`.
- **IDOR / BOLA Prevention**: Automated integration tests (`test_resumes.py::test_idor_protection_cross_user_isolation`) confirm that an authenticated user cannot view, modify, or delete another user's documents by guessing UUIDs.
- **Private Key Isolation**: Storage keys are generated as random UUID hex hashes (`uuid.uuid4().hex`) preventing clients from discovering internal filenames or server paths.

---

## 3. Input Validation & Document Handling
- **File Type Whitelisting**: Strict extension and MIME-type validation accepting only `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, and `text/plain`.
- **Malicious Content Sanitization**: Control characters, null bytes (`\x00`), and binary exploits are stripped from extracted text before database persistence or rubric scoring.
- **Upload Size Limits**: Requests exceeding `MAX_CONTENT_LENGTH` (16MB) are rejected with HTTP 413.

---

## 4. Privacy & Compliance (GDPR / CCPA)
- **Zero Public Exposure**: The Battle League uses pseudonymized handles (e.g. `AsyncVoyager_921`). No candidate names, email addresses, phone numbers, or raw resume files are ever published.
- **Complete Data Export**: Users can download a complete, structured JSON package of all their account records via `GET /api/v1/settings/export-data`.
- **Permanent Account Erasure**: The `DELETE /api/v1/settings/delete-account` endpoint purges the user profile, all resume records, version snapshots, project profiles, interview transcripts, and associated storage files permanently.
