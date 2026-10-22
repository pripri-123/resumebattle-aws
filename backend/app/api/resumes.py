import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from app.extensions import db
from app.models import Resume, ResumeVersion
from app.security import token_required, log_audit_event
from app.services.storage import get_storage_service
from app.services.resume_parser import ResumeParserService

resumes_bp = Blueprint('resumes', __name__, url_prefix='/api/v1/resumes')

ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resumes_bp.route('', methods=['GET'])
@token_required
def list_resumes(current_user):
    resumes = Resume.query.filter_by(user_id=current_user.id, is_active=True).order_by(Resume.created_at.desc()).all()
    return jsonify({'resumes': [r.to_dict() for r in resumes]}), 200

@resumes_bp.route('/upload', methods=['POST'])
@token_required
def upload_resume(current_user):
    title = request.form.get('title') or ""
    target_role = request.form.get('target_role') or current_user.target_role or "Software Engineer"
    
    # Check if file uploaded
    if 'file' not in request.files:
        # Check if text provided in json or form
        text_content = request.form.get('text_content')
        if not text_content:
            return jsonify({'error': 'Please provide a resume file (PDF, DOCX) or resume text content.'}), 400
        
        file_bytes = text_content.encode('utf-8')
        orig_filename = f"{title or 'Resume'}.txt"
        mime_type = "text/plain"
        extracted_text = text_content
    else:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file.'}), 400
            
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format. Allowed formats are PDF, DOCX, TXT.'}), 400
            
        orig_filename = secure_filename(file.filename)
        file_bytes = file.read()
        mime_type = file.content_type or "application/octet-stream"
        
        # Extract text
        extracted_text = ResumeParserService.extract_text(file_bytes, orig_filename)

    if not title:
        title = orig_filename.rsplit('.', 1)[0].replace('_', ' ').title()

    # Save to storage service (local or S3)
    storage = get_storage_service()
    storage_key = storage.save_document(file_bytes, orig_filename, mime_type)

    # Persist resume record
    resume = Resume(
        user_id=current_user.id,
        title=title,
        target_role=target_role,
        original_filename=orig_filename,
        storage_key=storage_key,
        file_size=len(file_bytes),
        mime_type=mime_type,
        extracted_text=extracted_text,
        processing_status="completed"
    )
    db.session.add(resume)
    db.session.flush()

    # Create initial version
    v1 = ResumeVersion(
        resume_id=resume.id,
        user_id=current_user.id,
        version_name="Initial Upload (v1)",
        target_role=target_role,
        content_snapshot=extracted_text,
        notes="Original uploaded version",
        is_preferred=True
    )
    db.session.add(v1)
    db.session.commit()

    log_audit_event(current_user.id, "UPLOAD_RESUME", "Resume", resume.id)

    return jsonify({
        'message': 'Resume uploaded and analyzed successfully.',
        'resume': resume.to_dict(include_text=True)
    }), 201

@resumes_bp.route('/<resume_id>', methods=['GET'])
@token_required
def get_resume(current_user, resume_id):
    resume = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or access denied.'}), 404

    versions = [v.to_dict() for v in resume.versions.order_by(ResumeVersion.created_at.desc()).all()]
    data = resume.to_dict(include_text=True)
    data['versions'] = versions
    return jsonify({'resume': data}), 200

@resumes_bp.route('/<resume_id>', methods=['DELETE'])
@token_required
def delete_resume(current_user, resume_id):
    resume = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or access denied.'}), 404

    # Remove storage file
    try:
        storage = get_storage_service()
        storage.delete_document(resume.storage_key)
    except Exception:
        pass

    db.session.delete(resume)
    db.session.commit()

    log_audit_event(current_user.id, "DELETE_RESUME", "Resume", resume_id)
    return jsonify({'message': 'Resume and associated records deleted permanently.'}), 200

@resumes_bp.route('/<resume_id>/versions', methods=['POST'])
@token_required
def create_version(current_user, resume_id):
    resume = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or access denied.'}), 404

    data = request.get_json() or {}
    version_name = data.get('version_name', '').strip()
    target_role = data.get('target_role', resume.target_role)
    content_snapshot = data.get('content_snapshot', resume.extracted_text)
    notes = data.get('notes', '')
    is_preferred = bool(data.get('is_preferred', False))

    if not version_name:
        return jsonify({'error': 'Version name is required (e.g. "Cloud & Backend Focused").'}), 400

    if is_preferred:
        # unset previous preferred
        ResumeVersion.query.filter_by(resume_id=resume.id).update({'is_preferred': False})

    version = ResumeVersion(
        resume_id=resume.id,
        user_id=current_user.id,
        version_name=version_name,
        target_role=target_role,
        content_snapshot=content_snapshot,
        notes=notes,
        is_preferred=is_preferred
    )
    db.session.add(version)
    db.session.commit()

    return jsonify({
        'message': f'Version "{version_name}" created.',
        'version': version.to_dict()
    }), 201

@resumes_bp.route('/<resume_id>/versions', methods=['GET'])
@token_required
def list_versions(current_user, resume_id):
    resume = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or access denied.'}), 404

    versions = [v.to_dict() for v in resume.versions.order_by(ResumeVersion.created_at.desc()).all()]
    return jsonify({'versions': versions}), 200
