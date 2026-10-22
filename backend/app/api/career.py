from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import CareerSkill, SkillEvidence, Project
from app.security import token_required, log_audit_event

career_bp = Blueprint('career', __name__, url_prefix='/api/v1/career')

@career_bp.route('/dna', methods=['GET'])
@token_required
def get_career_dna(current_user):
    skills = CareerSkill.query.filter_by(user_id=current_user.id).order_by(CareerSkill.category.asc(), CareerSkill.name.asc()).all()
    
    # Group by category for graph/tree representation
    categories = {}
    for s in skills:
        cat = s.category or "General"
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(s.to_dict())

    # Build graph nodes & links for visual skill network
    nodes = [{'id': 'user_core', 'name': current_user.full_name or 'Career Profile', 'type': 'root', 'val': 25}]
    links = []
    
    for cat, cat_skills in categories.items():
        cat_id = f"cat_{cat.replace(' ', '_')}"
        nodes.append({'id': cat_id, 'name': cat, 'type': 'category', 'val': 15})
        links.append({'source': 'user_core', 'target': cat_id})
        
        for sk in cat_skills:
            sk_id = f"sk_{sk['id']}"
            nodes.append({
                'id': sk_id,
                'name': sk['name'],
                'type': 'skill',
                'proficiency': sk['proficiency_level'],
                'verified': sk['verified'],
                'val': 10 if sk['verified'] else 7
            })
            links.append({'source': cat_id, 'target': sk_id})

    return jsonify({
        'skills': [s.to_dict() for s in skills],
        'categories': categories,
        'graph': {
            'nodes': nodes,
            'links': links
        },
        'total_skills': len(skills),
        'verified_skills': sum(1 for s in skills if s.verified or s.evidence.count() > 0)
    }), 200


@career_bp.route('/skills', methods=['POST'])
@token_required
def add_skill(current_user):
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category = data.get('category', 'Frameworks & Languages').strip()
    proficiency = data.get('proficiency_level', 'Intermediate')
    
    if not name:
        return jsonify({'error': 'Skill name is required.'}), 400

    existing = CareerSkill.query.filter_by(user_id=current_user.id, name=name).first()
    if existing:
        return jsonify({'error': f'Skill "{name}" already exists in your Career DNA.'}), 409

    skill = CareerSkill(
        user_id=current_user.id,
        name=name,
        category=category,
        proficiency_level=proficiency,
        status="confirmed",
        source="user_added"
    )
    db.session.add(skill)
    db.session.commit()

    return jsonify({'message': f'Skill "{name}" added.', 'skill': skill.to_dict()}), 201


@career_bp.route('/skills/<skill_id>', methods=['PATCH'])
@token_required
def update_skill(current_user, skill_id):
    skill = CareerSkill.query.filter_by(id=skill_id, user_id=current_user.id).first()
    if not skill:
        return jsonify({'error': 'Skill not found or access denied.'}), 404

    data = request.get_json() or {}
    if 'status' in data:
        skill.status = data['status']
    if 'proficiency_level' in data:
        skill.proficiency_level = data['proficiency_level']
    if 'category' in data:
        skill.category = data['category']
    if 'verified' in data:
        skill.verified = bool(data['verified'])

    db.session.commit()
    return jsonify({'message': 'Skill updated.', 'skill': skill.to_dict()}), 200


@career_bp.route('/skills/<skill_id>', methods=['DELETE'])
@token_required
def delete_skill(current_user, skill_id):
    skill = CareerSkill.query.filter_by(id=skill_id, user_id=current_user.id).first()
    if not skill:
        return jsonify({'error': 'Skill not found or access denied.'}), 404

    db.session.delete(skill)
    db.session.commit()
    return jsonify({'message': 'Skill removed from profile.'}), 200


@career_bp.route('/skills/<skill_id>/evidence', methods=['POST'])
@token_required
def add_evidence(current_user, skill_id):
    skill = CareerSkill.query.filter_by(id=skill_id, user_id=current_user.id).first()
    if not skill:
        return jsonify({'error': 'Skill not found or access denied.'}), 404

    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    evidence_type = data.get('evidence_type', 'project')
    project_id = data.get('project_id')

    if not title:
        return jsonify({'error': 'Evidence title is required.'}), 400

    evidence = SkillEvidence(
        skill_id=skill.id,
        user_id=current_user.id,
        title=title,
        description=description,
        evidence_type=evidence_type,
        project_id=project_id,
        verification_status="code_verified" if project_id else "user_claimed"
    )
    db.session.add(evidence)
    # Automatically verify skill if concrete project evidence is attached
    skill.verified = True
    db.session.commit()

    return jsonify({'message': 'Evidence attached successfully.', 'evidence': evidence.to_dict()}), 201
