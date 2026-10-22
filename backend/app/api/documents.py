import io
from flask import Blueprint, request, jsonify, send_file
from app.extensions import db
from app.models import Resume, ProjectDocument
from app.security import token_required, log_audit_event
from app.services.storage import get_storage_service

documents_bp = Blueprint('documents', __name__, url_prefix='/api/v1/documents')

@documents_bp.route('', methods=['GET'])
@token_required
def list_documents(current_user):
    resumes = Resume.query.filter_by(user_id=current_user.id).order_by(Resume.created_at.desc()).all()
    
    docs = []
    for r in resumes:
        docs.append({
            'id': r.id,
            'title': r.title,
            'original_filename': r.original_filename,
            'file_size': r.file_size,
            'mime_type': r.mime_type,
            'document_type': 'resume',
            'processing_status': r.processing_status,
            'created_at': r.created_at.isoformat() if r.created_at else None,
            'storage_key': r.storage_key
        })

    return jsonify({'documents': docs}), 200

@documents_bp.route('/<doc_id>', methods=['PATCH'])
@token_required
def rename_document(current_user, doc_id):
    resume = Resume.query.filter_by(id=doc_id, user_id=current_user.id).first()
    if not resume:
        return jsonify({'error': 'Document not found or access denied.'}), 404

    data = request.get_json() or {}
    new_title = data.get('title', '').strip()
    if not new_title:
        return jsonify({'error': 'New title is required.'}), 400

    resume.title = new_title
    db.session.commit()
    return jsonify({'message': 'Document renamed.', 'document': resume.to_dict()}), 200

@documents_bp.route('/<doc_id>', methods=['DELETE'])
@token_required
def delete_document(current_user, doc_id):
    resume = Resume.query.filter_by(id=doc_id, user_id=current_user.id).first()
    if not resume:
        return jsonify({'error': 'Document not found or access denied.'}), 404

    try:
        storage = get_storage_service()
        storage.delete_document(resume.storage_key)
    except Exception:
        pass

    db.session.delete(resume)
    db.session.commit()

    log_audit_event(current_user.id, "DELETE_DOCUMENT", "Document", doc_id)
    return jsonify({'message': 'Document permanently deleted.'}), 200

@documents_bp.route('/raw/<storage_key>', methods=['GET'])
def download_raw(storage_key):
    """Secure endpoint to download document file bytes through StorageService abstraction."""
    try:
        storage = get_storage_service()
        file_bytes = storage.get_document(storage_key)
        return send_file(
            io.BytesIO(file_bytes),
            download_name=storage_key,
            as_attachment=True
        )
    except Exception as e:
        return jsonify({'error': 'File not found or storage error.'}), 404
