from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import Resume, JobDescription, ResumeBattle
from app.security import token_required, log_audit_event
from app.services.ai import get_ai_provider

battles_bp = Blueprint('battles', __name__, url_prefix='/api/v1/battles')

@battles_bp.route('/compare', methods=['POST'])
@token_required
def compare_resumes(current_user):
    data = request.get_json() or {}
    resume_a_id = data.get('resume_a_id')
    resume_b_id = data.get('resume_b_id')
    job_description_id = data.get('job_description_id')
    job_text = data.get('job_text')

    if not resume_a_id or not resume_b_id:
        return jsonify({'error': 'Please select both Resume A and Resume B to battle.'}), 400

    if resume_a_id == resume_b_id:
        return jsonify({'error': 'Please select two different resumes or versions for comparison.'}), 400

    resume_a = Resume.query.filter_by(id=resume_a_id, user_id=current_user.id).first()
    resume_b = Resume.query.filter_by(id=resume_b_id, user_id=current_user.id).first()

    if not resume_a or not resume_b:
        return jsonify({'error': 'One or both resumes not found or unauthorized.'}), 404

    # Determine job description
    target_job = None
    if job_description_id:
        target_job = JobDescription.query.get(job_description_id)
        if target_job:
            job_text = target_job.raw_text

    if not job_text:
        job_text = """
        Full Stack Engineer. Requirements:
        Strong knowledge of React, TypeScript, Python or Node.js.
        Experience building scalable REST APIs, relational databases (PostgreSQL), and Docker containers.
        Cloud architecture deployment on AWS or similar provider.
        Proven impact optimizing system performance with metrics.
        """

    # Evaluate both resumes with same deterministic rubric
    ai_provider = get_ai_provider()
    eval_a = ai_provider.evaluate_resume(resume_a.extracted_text or "", job_text)
    eval_b = ai_provider.evaluate_resume(resume_b.extracted_text or "", job_text)

    score_a = eval_a['overall_score']
    score_b = eval_b['overall_score']

    if score_a > score_b:
        winner_id = resume_a.id
        margin = round(score_a - score_b, 1)
        explanation = f"'{resume_a.title}' outperforms '{resume_b.title}' by +{margin} points primarily due to stronger technical evidence and achievement specificity."
    elif score_b > score_a:
        winner_id = resume_b.id
        margin = round(score_b - score_a, 1)
        explanation = f"'{resume_b.title}' outperforms '{resume_a.title}' by +{margin} points with superior keyword coverage and quantified outcomes."
    else:
        winner_id = None
        explanation = "Both resume versions scored equally against the evaluation rubric."

    # Compare dimensions
    dimension_comparison = []
    deltas = {}
    dims_a = {d['key']: d for d in eval_a['dimensions']}
    dims_b = {d['key']: d for d in eval_b['dimensions']}

    for key, da in dims_a.items():
        db_item = dims_b.get(key, {'score': 0, 'name': da['name']})
        delta = round(da['score'] - db_item['score'], 1)
        deltas[key] = delta
        dimension_comparison.append({
            'key': key,
            'name': da['name'],
            'score_a': da['score'],
            'score_b': db_item['score'],
            'delta': delta,
            'leader': 'A' if delta > 0 else ('B' if delta < 0 else 'Tie'),
            'suggestions_a': da.get('suggestions', []),
            'suggestions_b': db_item.get('suggestions', [])
        })

    # Save Battle record
    battle = ResumeBattle(
        user_id=current_user.id,
        job_description_id=target_job.id if target_job else None,
        resume_a_id=resume_a.id,
        resume_b_id=resume_b.id,
        resume_a_score=score_a,
        resume_b_score=score_b,
        winner_resume_id=winner_id,
        comparison_summary=explanation,
        dimension_deltas_json=deltas
    )
    db.session.add(battle)
    db.session.commit()

    log_audit_event(current_user.id, "RESUME_BATTLE", "ResumeBattle", battle.id)

    return jsonify({
        'battle_id': battle.id,
        'resume_a': {
            'id': resume_a.id,
            'title': resume_a.title,
            'score': score_a,
            'verdict': eval_a['verdict'],
            'dimensions': eval_a['dimensions'],
            'matches': eval_a['matches']
        },
        'resume_b': {
            'id': resume_b.id,
            'title': resume_b.title,
            'score': score_b,
            'verdict': eval_b['verdict'],
            'dimensions': eval_b['dimensions'],
            'matches': eval_b['matches']
        },
        'winner_id': winner_id,
        'winner_title': resume_a.title if winner_id == resume_a.id else (resume_b.title if winner_id == resume_b.id else 'Tie'),
        'explanation': explanation,
        'dimension_comparison': dimension_comparison
    }), 200


@battles_bp.route('', methods=['GET'])
@token_required
def list_battles(current_user):
    battles = ResumeBattle.query.filter_by(user_id=current_user.id).order_by(ResumeBattle.created_at.desc()).limit(15).all()
    return jsonify({'battles': [b.to_dict() for b in battles]}), 200
