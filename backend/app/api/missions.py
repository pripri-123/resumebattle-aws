from datetime import datetime
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import CareerMission
from app.security import token_required, log_audit_event
from app.services.notifications import NotificationService

missions_bp = Blueprint('missions', __name__, url_prefix='/api/v1/missions')

@missions_bp.route('', methods=['GET'])
@token_required
def list_missions(current_user):
    status_filter = request.args.get('status')
    query = CareerMission.query.filter_by(user_id=current_user.id)
    if status_filter and status_filter != 'all':
        query = query.filter_by(status=status_filter)
    
    missions = query.order_by(CareerMission.status.asc(), CareerMission.created_at.desc()).all()
    
    # Calculate stats
    total = len(missions)
    completed = sum(1 for m in missions if m.status == 'completed')
    total_pts = sum(m.points for m in missions if m.status == 'completed')

    return jsonify({
        'missions': [m.to_dict() for m in missions],
        'stats': {
            'total': total,
            'completed': completed,
            'points_earned': total_pts
        }
    }), 200


@missions_bp.route('/<mission_id>/start', methods=['POST'])
@token_required
def start_mission(current_user, mission_id):
    mission = CareerMission.query.filter_by(id=mission_id, user_id=current_user.id).first()
    if not mission:
        return jsonify({'error': 'Mission not found or access denied.'}), 404

    mission.status = 'in_progress'
    mission.progress = max(mission.progress, 15)
    db.session.commit()

    return jsonify({'message': f'Mission "{mission.title}" initiated.', 'mission': mission.to_dict()}), 200


@missions_bp.route('/<mission_id>/progress', methods=['POST'])
@token_required
def update_progress(current_user, mission_id):
    mission = CareerMission.query.filter_by(id=mission_id, user_id=current_user.id).first()
    if not mission:
        return jsonify({'error': 'Mission not found or access denied.'}), 404

    data = request.get_json() or {}
    progress = int(data.get('progress', mission.progress))
    evidence = data.get('evidence')

    mission.progress = min(100, max(0, progress))
    if evidence:
        mission.submitted_evidence = evidence
        
    db.session.commit()
    return jsonify({'message': 'Progress updated.', 'mission': mission.to_dict()}), 200


@missions_bp.route('/<mission_id>/complete', methods=['POST'])
@token_required
def complete_mission(current_user, mission_id):
    mission = CareerMission.query.filter_by(id=mission_id, user_id=current_user.id).first()
    if not mission:
        return jsonify({'error': 'Mission not found or access denied.'}), 404

    data = request.get_json() or {}
    evidence = data.get('evidence', mission.submitted_evidence)

    mission.status = 'completed'
    mission.progress = 100
    mission.submitted_evidence = evidence or "Completed with verified implementation evidence."
    mission.completed_at = datetime.utcnow()
    db.session.commit()

    # Send in-app notification
    NotificationService.send_notification(
        user_id=current_user.id,
        title="Mission Accomplished! 🎯",
        message=f"You earned +{mission.points} readiness points for completing '{mission.title}'.",
        notification_type="success",
        link_url="/app/career-quest"
    )

    log_audit_event(current_user.id, "COMPLETE_MISSION", "CareerMission", mission.id)

    return jsonify({
        'message': f'Mission completed! Earned +{mission.points} points.',
        'mission': mission.to_dict()
    }), 200
