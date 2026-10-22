from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Project, ProjectDocument
from app.security import token_required, log_audit_event
from app.services.ai import get_ai_provider

projects_bp = Blueprint('projects', __name__, url_prefix='/api/v1/projects')

@projects_bp.route('', methods=['GET'])
@token_required
def list_projects(current_user):
    projects = Project.query.filter_by(user_id=current_user.id).order_by(Project.created_at.desc()).all()
    return jsonify({'projects': [p.to_dict() for p in projects]}), 200

@projects_bp.route('', methods=['POST'])
@token_required
def create_project(current_user):
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    technologies = data.get('technologies', [])
    repo_url = data.get('repo_url', '').strip()
    demo_url = data.get('demo_url', '').strip()
    role = data.get('role', 'Sole Creator / Lead Developer')
    challenges = data.get('challenges', '')
    decisions = data.get('decisions', '')
    outcomes = data.get('outcomes', '')

    if not title or not description:
        return jsonify({'error': 'Project title and description are required.'}), 400

    # Calculate completeness score
    completeness = 40
    if technologies:
        completeness += 15
    if repo_url:
        completeness += 15
    if demo_url:
        completeness += 10
    if challenges and decisions:
        completeness += 20
    completeness = min(100, completeness)

    ai_provider = get_ai_provider()
    suggested_bullets = ai_provider.suggest_resume_bullets({
        'title': title,
        'technologies': technologies,
        'description': description
    })

    potential_questions = [
        f"What was the most challenging technical roadblock encountered while developing {title}?",
        f"How did you design the data persistence model for {title}?",
        f"If you had to re-architect {title} for 100,000 active daily users, what components would you modify?"
    ]

    project = Project(
        user_id=current_user.id,
        title=title,
        description=description,
        technologies_json=technologies,
        repo_url=repo_url,
        demo_url=demo_url,
        role=role,
        challenges=challenges,
        decisions=decisions,
        outcomes=outcomes,
        completeness_score=completeness,
        suggested_bullets_json=suggested_bullets,
        potential_questions_json=potential_questions
    )
    db.session.add(project)
    db.session.commit()

    log_audit_event(current_user.id, "CREATE_PROJECT", "Project", project.id)

    return jsonify({
        'message': 'Project proof created successfully.',
        'project': project.to_dict()
    }), 201

@projects_bp.route('/<project_id>', methods=['GET'])
@token_required
def get_project(current_user, project_id):
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first()
    if not project:
        return jsonify({'error': 'Project not found or access denied.'}), 404
    return jsonify({'project': project.to_dict()}), 200

@projects_bp.route('/<project_id>', methods=['PATCH'])
@token_required
def update_project(current_user, project_id):
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first()
    if not project:
        return jsonify({'error': 'Project not found or access denied.'}), 404

    data = request.get_json() or {}
    if 'title' in data:
        project.title = data['title']
    if 'description' in data:
        project.description = data['description']
    if 'technologies' in data:
        project.technologies_json = data['technologies']
    if 'repo_url' in data:
        project.repo_url = data['repo_url']
    if 'demo_url' in data:
        project.demo_url = data['demo_url']
    if 'challenges' in data:
        project.challenges = data['challenges']
    if 'decisions' in data:
        project.decisions = data['decisions']
    if 'outcomes' in data:
        project.outcomes = data['outcomes']

    # Recalculate completeness
    completeness = 40
    if project.technologies_json:
        completeness += 15
    if project.repo_url:
        completeness += 15
    if project.demo_url:
        completeness += 10
    if project.challenges and project.decisions:
        completeness += 20
    project.completeness_score = min(100, completeness)

    db.session.commit()
    return jsonify({'message': 'Project updated.', 'project': project.to_dict()}), 200

@projects_bp.route('/<project_id>', methods=['DELETE'])
@token_required
def delete_project(current_user, project_id):
    project = Project.query.filter_by(id=project_id, user_id=current_user.id).first()
    if not project:
        return jsonify({'error': 'Project not found or access denied.'}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully.'}), 200
