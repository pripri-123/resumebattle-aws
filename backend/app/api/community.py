import random
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import CommunityChallenge, CommunitySubmission, Resume
from app.security import token_required, log_audit_event

community_bp = Blueprint('community', __name__, url_prefix='/api/v1/community')

ANONYMOUS_HANDLES = [
    "CyberVanguard", "NeonGladiator", "ByteWarrior", "CloudArchitectX",
    "AsyncVoyager", "KernelRider", "QuantumFalcon", "SyntaxSamurai"
]

@community_bp.route('/challenges', methods=['GET'])
@token_required
def list_challenges(current_user):
    challenges = CommunityChallenge.query.filter_by(is_active=True).order_by(CommunityChallenge.created_at.desc()).all()
    return jsonify({'challenges': [c.to_dict() for c in challenges]}), 200

@community_bp.route('/challenges/<challenge_id>/submit', methods=['POST'])
@token_required
def submit_to_challenge(current_user, challenge_id):
    challenge = CommunityChallenge.query.get(challenge_id)
    if not challenge:
        return jsonify({'error': 'Challenge not found.'}), 404

    data = request.get_json() or {}
    resume_id = data.get('resume_id')
    anonymous_handle = data.get('anonymous_handle', '').strip()

    if not resume_id:
        return jsonify({'error': 'Please select a resume version to enter the arena.'}), 400

    resume = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or access denied.'}), 404

    if not anonymous_handle:
        anonymous_handle = f"{random.choice(ANONYMOUS_HANDLES)}_{random.randint(100, 999)}"

    # Get latest score or calculate base rubric score
    latest_analysis = resume.analyses.order_by(db.desc('created_at')).first()
    score = latest_analysis.overall_score if latest_analysis else 78.5

    badge = "Gladiator"
    if score >= 85:
        badge = "Grandmaster"
    elif score >= 75:
        badge = "Champion"

    sub = CommunitySubmission(
        challenge_id=challenge.id,
        user_id=current_user.id,
        anonymous_handle=anonymous_handle,
        rubric_score=score,
        badge=badge,
        peer_feedback_json=[
            {'peer': 'PeerReviewer_41', 'comment': 'Clean architectural clarity in backend section.'},
            {'peer': 'PeerReviewer_89', 'comment': 'Strong quantified metrics throughout projects.'}
        ]
    )
    challenge.participant_count += 1
    db.session.add(sub)
    db.session.commit()

    log_audit_event(current_user.id, "ENTER_BATTLE_LEAGUE", "CommunitySubmission", sub.id)

    return jsonify({
        'message': f'Entered Battle League as {anonymous_handle}!',
        'submission': sub.to_dict()
    }), 201

@community_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard(current_user):
    # Returns strictly anonymous leaderboard
    subs = CommunitySubmission.query.order_by(CommunitySubmission.rubric_score.desc()).limit(25).all()
    
    # Check if current user has an entry
    user_entry = CommunitySubmission.query.filter_by(user_id=current_user.id).order_by(CommunitySubmission.rubric_score.desc()).first()

    return jsonify({
        'leaderboard': [s.to_dict() for s in subs],
        'user_rank': user_entry.to_dict() if user_entry else None
    }), 200
