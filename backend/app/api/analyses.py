from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import (
    Resume, ResumeVersion, JobDescription, ResumeAnalysis,
    AnalysisDimension, RequirementMatch, CareerMission
)
from app.security import token_required, log_audit_event
from app.services.ai import get_ai_provider

analyses_bp = Blueprint('analyses', __name__, url_prefix='/api/v1/analyses')

@analyses_bp.route('/evaluate', methods=['POST'])
@token_required
def evaluate_resume(current_user):
    data = request.get_json() or {}
    resume_id = data.get('resume_id')
    version_id = data.get('version_id')
    job_description_id = data.get('job_description_id')
    custom_job_text = data.get('job_text')
    custom_job_title = data.get('job_title', 'Target Role')

    resume = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first()
    if not resume:
        return jsonify({'error': 'Resume not found or access denied.'}), 404

    # Determine which text snapshot to evaluate
    eval_text = resume.extracted_text or ""
    if version_id:
        version = ResumeVersion.query.filter_by(id=version_id, resume_id=resume.id).first()
        if version and version.content_snapshot:
            eval_text = version.content_snapshot

    if not eval_text.strip():
        return jsonify({'error': 'The selected resume contains no extractable text.'}), 400

    # Determine job description
    job_desc = None
    if job_description_id:
        job_desc = JobDescription.query.get(job_description_id)
        if job_desc:
            job_text = job_desc.raw_text
    elif custom_job_text:
        job_text = custom_job_text
        # Save as custom job description
        job_desc = JobDescription(
            user_id=current_user.id,
            title=custom_job_title,
            company=data.get('company', 'Target Company'),
            raw_text=custom_job_text,
            is_sample=False
        )
        db.session.add(job_desc)
        db.session.flush()
    else:
        # Default fallback sample role
        job_desc = JobDescription.query.filter_by(is_sample=True).first()
        if not job_desc:
            job_text = """
            Senior Full Stack Engineer. Requirements:
            Proficiency in React, TypeScript, Python, and PostgreSQL.
            Hands-on experience with Docker, AWS cloud infrastructure, and RESTful API architecture.
            Demonstrated track record optimizing web application performance and sub-100ms API latency.
            Experience implementing secure authentication and unit testing.
            """
            job_desc = JobDescription(
                title="Full Stack Software Engineer",
                company="TechScale Cloud",
                raw_text=job_text,
                is_sample=True
            )
            db.session.add(job_desc)
            db.session.flush()
        else:
            job_text = job_desc.raw_text

    # Run AI / Deterministic Evaluation
    ai_provider = get_ai_provider()
    eval_result = ai_provider.evaluate_resume(eval_text, job_text)

    # Persist Analysis Record
    analysis = ResumeAnalysis(
        user_id=current_user.id,
        resume_id=resume.id,
        resume_version_id=version_id,
        job_description_id=job_desc.id if job_desc else None,
        overall_score=eval_result['overall_score'],
        rubric_version=eval_result.get('rubric_version', 'rubric-v2.0-deterministic'),
        ai_provider=eval_result.get('ai_provider', 'local-deterministic'),
        summary_text=eval_result.get('summary', ''),
        verdict=eval_result.get('verdict', 'Strong Alignment')
    )
    db.session.add(analysis)
    db.session.flush()

    # Save Dimensions
    for d in eval_result.get('dimensions', []):
        dim = AnalysisDimension(
            analysis_id=analysis.id,
            dimension_key=d['key'],
            dimension_name=d['name'],
            score=d['score'],
            weight=d.get('weight', 1.0),
            explanation=d.get('explanation', ''),
            suggestions_json=d.get('suggestions', [])
        )
        db.session.add(dim)

    # Save Requirement Matches
    for m in eval_result.get('matches', []):
        match = RequirementMatch(
            analysis_id=analysis.id,
            requirement_text=m['requirement_text'],
            category=m.get('category', 'technical_skill'),
            importance=m.get('importance', 'high'),
            match_status=m.get('match_status', 'met'),
            evidence_text=m.get('evidence_text', ''),
            confidence=m.get('confidence', 0.9),
            suggestion=m.get('suggestion', '')
        )
        db.session.add(match)

    # Auto-generate personalized missions for missing requirements if user has < 10 missions
    user_mission_count = CareerMission.query.filter_by(user_id=current_user.id).count()
    if user_mission_count < 10:
        for m in eval_result.get('matches', []):
            if m.get('match_status') == 'missing':
                # Create a mission for this gap
                gap_text = m['requirement_text']
                existing_mission = CareerMission.query.filter_by(user_id=current_user.id, skill_gap=gap_text).first()
                if not existing_mission:
                    mission = CareerMission(
                        user_id=current_user.id,
                        title=f"Master & Document: {gap_text}",
                        description=f"Address target role prerequisite '{gap_text}'. Implement a concrete project feature, commit evidence to a repository, and integrate the experience into your resume.",
                        skill_gap=gap_text,
                        difficulty="Medium",
                        estimated_duration="3-4 hours",
                        criteria=f"1. Build or expand a project utilizing {gap_text}.\n2. Document the implementation in your project README.\n3. Add a quantified achievement bullet to your preferred resume version.",
                        points=60,
                        status="available",
                        related_dimension="Technical Skill Alignment"
                    )
                    db.session.add(mission)

    db.session.commit()
    log_audit_event(current_user.id, "EVALUATE_RESUME", "ResumeAnalysis", analysis.id)

    return jsonify({
        'message': 'Analysis complete.',
        'analysis': analysis.to_dict(include_details=True)
    }), 201


@analyses_bp.route('/<analysis_id>', methods=['GET'])
@token_required
def get_analysis(current_user, analysis_id):
    analysis = ResumeAnalysis.query.filter_by(id=analysis_id, user_id=current_user.id).first()
    if not analysis:
        return jsonify({'error': 'Evaluation record not found or access denied.'}), 404
    return jsonify({'analysis': analysis.to_dict(include_details=True)}), 200


@analyses_bp.route('/history', methods=['GET'])
@token_required
def list_history(current_user):
    analyses = ResumeAnalysis.query.filter_by(user_id=current_user.id).order_by(ResumeAnalysis.created_at.desc()).limit(20).all()
    return jsonify({'history': [a.to_dict(include_details=False) for a in analyses]}), 200


@analyses_bp.route('/jobs', methods=['GET'])
@token_required
def list_jobs(current_user):
    # Return sample jobs + user's saved jobs
    jobs = JobDescription.query.filter(
        (JobDescription.is_sample == True) | (JobDescription.user_id == current_user.id)
    ).order_by(JobDescription.created_at.desc()).all()
    return jsonify({'jobs': [j.to_dict() for j in jobs]}), 200


@analyses_bp.route('/jobs', methods=['POST'])
@token_required
def create_job(current_user):
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    company = data.get('company', '').strip()
    raw_text = data.get('raw_text', '').strip()
    role_category = data.get('role_category', 'Software Engineering')
    experience_level = data.get('experience_level', 'Mid-Level')

    if not title or not raw_text:
        return jsonify({'error': 'Role title and job description text are required.'}), 400

    job = JobDescription(
        user_id=current_user.id,
        title=title,
        company=company or "Target Company",
        raw_text=raw_text,
        role_category=role_category,
        experience_level=experience_level,
        is_sample=False
    )
    db.session.add(job)
    db.session.commit()

    return jsonify({'message': 'Job description saved.', 'job': job.to_dict()}), 201
