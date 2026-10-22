from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User, UserProfile
from app.security import token_required, log_audit_event

settings_bp = Blueprint('settings', __name__, url_prefix='/api/v1/settings')

@settings_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    profile = current_user.profile.to_dict() if current_user.profile else {}
    return jsonify({
        'user': current_user.to_dict(),
        'profile': profile
    }), 200

@settings_bp.route('/profile', methods=['PATCH'])
@token_required
def update_profile(current_user):
    data = request.get_json() or {}
    
    # Update User fields
    if 'full_name' in data:
        current_user.full_name = data['full_name'].strip()
    if 'target_role' in data:
        current_user.target_role = data['target_role'].strip()

    # Update Profile fields
    profile = current_user.profile
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.session.add(profile)

    if 'bio' in data:
        profile.bio = data['bio']
    if 'github_url' in data:
        profile.github_url = data['github_url']
    if 'linkedin_url' in data:
        profile.linkedin_url = data['linkedin_url']
    if 'portfolio_url' in data:
        profile.portfolio_url = data['portfolio_url']
    if 'years_experience' in data:
        try:
            profile.years_experience = float(data['years_experience'])
        except (ValueError, TypeError):
            pass
    if 'preferred_location' in data:
        profile.preferred_location = data['preferred_location']
    if 'privacy_mode' in data:
        profile.privacy_mode = data['privacy_mode']
    if 'data_retention_days' in data:
        profile.data_retention_days = int(data['data_retention_days'])

    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully.',
        'user': current_user.to_dict(),
        'profile': profile.to_dict()
    }), 200

@settings_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    data = request.get_json() or {}
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not current_user.check_password(old_password):
        return jsonify({'error': 'Current password is incorrect.'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'New password must be at least 6 characters.'}), 400

    current_user.set_password(new_password)
    db.session.commit()
    log_audit_event(current_user.id, "CHANGE_PASSWORD", "User", current_user.id)

    return jsonify({'message': 'Password updated successfully.'}), 200

@settings_bp.route('/export-data', methods=['GET'])
@token_required
def export_data(current_user):
    """Complete GDPR/CCPA data export in JSON format."""
    resumes = [r.to_dict(include_text=True) for r in current_user.resumes.all()]
    analyses = [a.to_dict(include_details=True) for a in current_user.analyses.all()]
    skills = [s.to_dict() for s in current_user.skills.all()]
    projects = [p.to_dict() for p in current_user.projects.all()]
    missions = [m.to_dict() for m in current_user.missions.all()]
    interviews = [i.to_dict() for i in current_user.interviews.all()]

    export_payload = {
        'account': current_user.to_dict(),
        'profile': current_user.profile.to_dict() if current_user.profile else {},
        'resumes': resumes,
        'analyses': analyses,
        'skills': skills,
        'projects': projects,
        'missions': missions,
        'interviews': interviews,
        'export_timestamp': current_user.created_at.isoformat() if current_user.created_at else None
    }
    log_audit_event(current_user.id, "EXPORT_DATA", "User", current_user.id)
    return jsonify({'data': export_payload}), 200

@settings_bp.route('/delete-account', methods=['DELETE'])
@token_required
def delete_account(current_user):
    """Permanently deletes user account, storage documents, and associated records."""
    user_id = current_user.id
    db.session.delete(current_user)
    db.session.commit()
    log_audit_event(user_id, "DELETE_ACCOUNT", "User", user_id)
    return jsonify({'message': 'Your account and all associated data have been permanently erased.'}), 200
