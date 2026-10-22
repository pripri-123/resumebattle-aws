from datetime import datetime
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import InterviewSession, InterviewQuestion, JobDescription, Resume
from app.security import token_required, log_audit_event
from app.services.ai import get_ai_provider

interviews_bp = Blueprint('interviews', __name__, url_prefix='/api/v1/interviews')

@interviews_bp.route('', methods=['GET'])
@token_required
def list_sessions(current_user):
    sessions = InterviewSession.query.filter_by(user_id=current_user.id).order_by(InterviewSession.created_at.desc()).all()
    return jsonify({'sessions': [s.to_dict() for s in sessions]}), 200

@interviews_bp.route('/start', methods=['POST'])
@token_required
def start_simulation(current_user):
    data = request.get_json() or {}
    job_id = data.get('job_description_id')
    resume_id = data.get('resume_id')
    session_type = data.get('session_type', 'full_simulation')

    job = JobDescription.query.get(job_id) if job_id else None
    resume = Resume.query.filter_by(id=resume_id, user_id=current_user.id).first() if resume_id else None

    role_title = job.title if job else (current_user.target_role or "Full Stack Engineer")
    job_text = job.raw_text if job else "Technical engineering role requirements."
    resume_text = resume.extracted_text if resume else ""

    checklist = [
        {'id': 1, 'text': f'Research {job.company if job else "Target Company"} tech stack & public repos', 'done': False},
        {'id': 2, 'text': 'Prepare 2-minute elevator pitch highlighting architecture wins', 'done': False},
        {'id': 3, 'text': 'Review system design concepts: caching, rate limiting, db indexing', 'done': False},
        {'id': 4, 'text': 'Prepare 2 STAR stories for behavioral conflict & failure resolution', 'done': False}
    ]

    session = InterviewSession(
        user_id=current_user.id,
        job_description_id=job.id if job else None,
        resume_id=resume.id if resume else None,
        session_type=session_type,
        status="in_progress",
        checklist_json=checklist
    )
    db.session.add(session)
    db.session.flush()

    # Generate questions via AI Provider
    ai_provider = get_ai_provider()
    questions_data = ai_provider.generate_interview_questions(role_title, job_text, resume_text)

    for idx, q in enumerate(questions_data):
        question = InterviewQuestion(
            session_id=session.id,
            question_text=q['question_text'],
            question_type=q.get('question_type', 'technical'),
            context_note=q.get('context_note', ''),
            expected_points_json=q.get('expected_points', []),
            order_idx=idx
        )
        db.session.add(question)

    db.session.commit()
    log_audit_event(current_user.id, "START_INTERVIEW", "InterviewSession", session.id)

    return jsonify({
        'message': 'Interview simulation launched.',
        'session': session.to_dict()
    }), 201

@interviews_bp.route('/<session_id>', methods=['GET'])
@token_required
def get_session(current_user, session_id):
    session = InterviewSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        return jsonify({'error': 'Interview session not found or access denied.'}), 404
    return jsonify({'session': session.to_dict()}), 200

@interviews_bp.route('/<session_id>/answer', methods=['POST'])
@token_required
def submit_answer(current_user, session_id):
    session = InterviewSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        return jsonify({'error': 'Interview session not found or access denied.'}), 404

    data = request.get_json() or {}
    question_id = data.get('question_id')
    user_answer = data.get('answer', '').strip()

    if not question_id or not user_answer:
        return jsonify({'error': 'Question ID and answer are required.'}), 400

    question = InterviewQuestion.query.filter_by(id=question_id, session_id=session.id).first()
    if not question:
        return jsonify({'error': 'Question not found in this session.'}), 404

    # Evaluate answer with AI Provider
    ai_provider = get_ai_provider()
    eval_result = ai_provider.evaluate_interview_answer(
        question.question_text,
        question.expected_points_json or [],
        user_answer
    )

    question.user_answer = user_answer
    question.score = eval_result['score']
    question.feedback = eval_result['feedback']
    question.rubric_breakdown_json = eval_result.get('rubric_breakdown', {})
    db.session.commit()

    return jsonify({
        'message': 'Answer evaluated successfully.',
        'question': question.to_dict()
    }), 200

@interviews_bp.route('/<session_id>/complete', methods=['POST'])
@token_required
def complete_session(current_user, session_id):
    session = InterviewSession.query.filter_by(id=session_id, user_id=current_user.id).first()
    if not session:
        return jsonify({'error': 'Interview session not found or access denied.'}), 404

    questions = session.questions.all()
    answered = [q for q in questions if q.score is not None]
    
    if answered:
        avg_score = sum(q.score for q in answered) / len(answered)
    else:
        avg_score = 60.0

    session.overall_score = avg_score
    session.status = 'completed'
    session.completed_at = datetime.utcnow()
    session.summary = f"Completed simulation with {len(answered)} answered questions. Average candidate response score: {round(avg_score, 1)}/100."
    db.session.commit()

    log_audit_event(current_user.id, "COMPLETE_INTERVIEW", "InterviewSession", session.id)

    return jsonify({
        'message': 'Interview session completed.',
        'session': session.to_dict()
    }), 200
