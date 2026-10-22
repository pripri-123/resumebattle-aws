import uuid
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db

def generate_uuid():
    return str(uuid.uuid4())

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    username = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(150), nullable=True)
    target_role = db.Column(db.String(100), nullable=True, default="Full Stack Engineer")
    is_admin = db.Column(db.Boolean, default=False)
    is_demo = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = db.relationship('UserProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    resumes = db.relationship('Resume', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    analyses = db.relationship('ResumeAnalysis', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    skills = db.relationship('CareerSkill', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    projects = db.relationship('Project', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    missions = db.relationship('CareerMission', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    interviews = db.relationship('InterviewSession', backref='user', lazy='dynamic', cascade="all, delete-orphan")
    notifications = db.relationship('Notification', backref='user', lazy='dynamic', cascade="all, delete-orphan")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'full_name': self.full_name,
            'target_role': self.target_role,
            'is_admin': self.is_admin,
            'is_demo': self.is_demo,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    bio = db.Column(db.Text, nullable=True)
    github_url = db.Column(db.String(255), nullable=True)
    linkedin_url = db.Column(db.String(255), nullable=True)
    portfolio_url = db.Column(db.String(255), nullable=True)
    years_experience = db.Column(db.Float, default=0.0)
    preferred_location = db.Column(db.String(100), nullable=True)
    privacy_mode = db.Column(db.String(50), default="standard")  # standard, high, anonymous
    data_retention_days = db.Column(db.Integer, default=365)
    preferences_json = db.Column(db.JSON, default=dict)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'bio': self.bio,
            'github_url': self.github_url,
            'linkedin_url': self.linkedin_url,
            'portfolio_url': self.portfolio_url,
            'years_experience': self.years_experience,
            'preferred_location': self.preferred_location,
            'privacy_mode': self.privacy_mode,
            'data_retention_days': self.data_retention_days,
            'preferences': self.preferences_json or {}
        }


class Resume(db.Model):
    __tablename__ = 'resumes'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    target_role = db.Column(db.String(100), nullable=True)
    original_filename = db.Column(db.String(255), nullable=False)
    storage_key = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, default=0)
    mime_type = db.Column(db.String(100), default="application/pdf")
    extracted_text = db.Column(db.Text, nullable=True)
    processing_status = db.Column(db.String(50), default="completed")  # queued, processing, completed, failed
    error_message = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    versions = db.relationship('ResumeVersion', backref='resume', lazy='dynamic', cascade="all, delete-orphan")
    analyses = db.relationship('ResumeAnalysis', backref='resume', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self, include_text=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'target_role': self.target_role,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'processing_status': self.processing_status,
            'error_message': self.error_message,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'version_count': self.versions.count()
        }
        if include_text:
            data['extracted_text'] = self.extracted_text
        return data


class ResumeVersion(db.Model):
    __tablename__ = 'resume_versions'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    resume_id = db.Column(db.String(36), db.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    version_name = db.Column(db.String(150), nullable=False)
    target_role = db.Column(db.String(100), nullable=True)
    content_snapshot = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text, nullable=True)
    is_preferred = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'resume_id': self.resume_id,
            'user_id': self.user_id,
            'version_name': self.version_name,
            'target_role': self.target_role,
            'notes': self.notes,
            'is_preferred': self.is_preferred,
            'content_length': len(self.content_snapshot) if self.content_snapshot else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class JobDescription(db.Model):
    __tablename__ = 'job_descriptions'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=True, index=True)
    title = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(150), nullable=True)
    role_category = db.Column(db.String(100), default="Software Engineering")
    experience_level = db.Column(db.String(50), default="Mid-Level")
    raw_text = db.Column(db.Text, nullable=False)
    required_skills_json = db.Column(db.JSON, default=list)
    preferred_skills_json = db.Column(db.JSON, default=list)
    key_responsibilities_json = db.Column(db.JSON, default=list)
    is_sample = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'company': self.company,
            'role_category': self.role_category,
            'experience_level': self.experience_level,
            'raw_text': self.raw_text,
            'required_skills': self.required_skills_json or [],
            'preferred_skills': self.preferred_skills_json or [],
            'key_responsibilities': self.key_responsibilities_json or [],
            'is_sample': self.is_sample,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ResumeAnalysis(db.Model):
    __tablename__ = 'resume_analyses'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    resume_id = db.Column(db.String(36), db.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False, index=True)
    resume_version_id = db.Column(db.String(36), db.ForeignKey('resume_versions.id', ondelete='SET NULL'), nullable=True)
    job_description_id = db.Column(db.String(36), db.ForeignKey('job_descriptions.id', ondelete='SET NULL'), nullable=True)
    overall_score = db.Column(db.Float, nullable=False)
    rubric_version = db.Column(db.String(50), default="rubric-v2.0-deterministic")
    ai_provider = db.Column(db.String(50), default="local-deterministic")
    summary_text = db.Column(db.Text, nullable=True)
    verdict = db.Column(db.String(50), default="Strong Alignment")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    dimensions = db.relationship('AnalysisDimension', backref='analysis', lazy='dynamic', cascade="all, delete-orphan")
    matches = db.relationship('RequirementMatch', backref='analysis', lazy='dynamic', cascade="all, delete-orphan")
    job = db.relationship('JobDescription', foreign_keys=[job_description_id])

    def to_dict(self, include_details=True):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'resume_id': self.resume_id,
            'resume_version_id': self.resume_version_id,
            'job_description_id': self.job_description_id,
            'job_title': self.job.title if self.job else "Target Role Alignment",
            'job_company': self.job.company if self.job else "Target Profile",
            'overall_score': round(self.overall_score, 1),
            'rubric_version': self.rubric_version,
            'ai_provider': self.ai_provider,
            'summary_text': self.summary_text,
            'verdict': self.verdict,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_details:
            data['dimensions'] = [d.to_dict() for d in self.dimensions.all()]
            data['matches'] = [m.to_dict() for m in self.matches.all()]
        return data


class AnalysisDimension(db.Model):
    __tablename__ = 'analysis_dimensions'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    analysis_id = db.Column(db.String(36), db.ForeignKey('resume_analyses.id', ondelete='CASCADE'), nullable=False, index=True)
    dimension_key = db.Column(db.String(100), nullable=False)
    dimension_name = db.Column(db.String(150), nullable=False)
    score = db.Column(db.Float, nullable=False)
    max_score = db.Column(db.Float, default=100.0)
    weight = db.Column(db.Float, default=1.0)
    explanation = db.Column(db.Text, nullable=True)
    suggestions_json = db.Column(db.JSON, default=list)

    def to_dict(self):
        return {
            'id': self.id,
            'dimension_key': self.dimension_key,
            'dimension_name': self.dimension_name,
            'score': round(self.score, 1),
            'max_score': self.max_score,
            'weight': self.weight,
            'explanation': self.explanation,
            'suggestions': self.suggestions_json or []
        }


class RequirementMatch(db.Model):
    __tablename__ = 'requirement_matches'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    analysis_id = db.Column(db.String(36), db.ForeignKey('resume_analyses.id', ondelete='CASCADE'), nullable=False, index=True)
    requirement_text = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(100), default="technical_skill")  # technical_skill, qualification, experience, tooling
    importance = db.Column(db.String(50), default="high")  # critical, high, medium, preferred
    match_status = db.Column(db.String(50), default="met")  # met, partially_met, missing, requires_review
    evidence_text = db.Column(db.Text, nullable=True)
    confidence = db.Column(db.Float, default=0.9)
    suggestion = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'requirement_text': self.requirement_text,
            'category': self.category,
            'importance': self.importance,
            'match_status': self.match_status,
            'evidence_text': self.evidence_text,
            'confidence': self.confidence,
            'suggestion': self.suggestion
        }


class ResumeBattle(db.Model):
    __tablename__ = 'resume_battles'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    job_description_id = db.Column(db.String(36), db.ForeignKey('job_descriptions.id', ondelete='SET NULL'), nullable=True)
    resume_a_id = db.Column(db.String(36), db.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    resume_b_id = db.Column(db.String(36), db.ForeignKey('resumes.id', ondelete='CASCADE'), nullable=False)
    resume_a_score = db.Column(db.Float, nullable=False)
    resume_b_score = db.Column(db.Float, nullable=False)
    winner_resume_id = db.Column(db.String(36), nullable=True)
    comparison_summary = db.Column(db.Text, nullable=True)
    dimension_deltas_json = db.Column(db.JSON, default=dict)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    resume_a = db.relationship('Resume', foreign_keys=[resume_a_id])
    resume_b = db.relationship('Resume', foreign_keys=[resume_b_id])
    job = db.relationship('JobDescription', foreign_keys=[job_description_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'job_title': self.job.title if self.job else "Target Role",
            'resume_a': {
                'id': self.resume_a.id if self.resume_a else self.resume_a_id,
                'title': self.resume_a.title if self.resume_a else 'Resume A',
                'score': round(self.resume_a_score, 1)
            },
            'resume_b': {
                'id': self.resume_b.id if self.resume_b else self.resume_b_id,
                'title': self.resume_b.title if self.resume_b else 'Resume B',
                'score': round(self.resume_b_score, 1)
            },
            'winner_id': self.winner_resume_id,
            'winner_title': (self.resume_a.title if self.winner_resume_id == self.resume_a_id else self.resume_b.title) if (self.resume_a and self.resume_b) else 'Tie',
            'comparison_summary': self.comparison_summary,
            'dimension_deltas': self.dimension_deltas_json or {},
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CareerSkill(db.Model):
    __tablename__ = 'career_skills'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), default="Frameworks & Languages")  # Languages, Frameworks, Cloud, Databases, Core
    proficiency_level = db.Column(db.String(50), default="Intermediate")  # Beginner, Intermediate, Advanced, Expert
    status = db.Column(db.String(50), default="confirmed")  # extracted, confirmed, rejected
    verified = db.Column(db.Boolean, default=False)
    source = db.Column(db.String(50), default="resume")  # resume, user_added, project, assessment
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    evidence = db.relationship('SkillEvidence', backref='skill', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'proficiency_level': self.proficiency_level,
            'status': self.status,
            'verified': self.verified,
            'source': self.source,
            'evidence_count': self.evidence.count(),
            'evidence': [e.to_dict() for e in self.evidence.all()]
        }


class SkillEvidence(db.Model):
    __tablename__ = 'skill_evidence'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    skill_id = db.Column(db.String(36), db.ForeignKey('career_skills.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    evidence_type = db.Column(db.String(50), default="project")  # project, work_experience, certification, repo
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id', ondelete='SET NULL'), nullable=True)
    verification_status = db.Column(db.String(50), default="user_claimed")  # user_claimed, code_verified, assessment_passed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'skill_id': self.skill_id,
            'evidence_type': self.evidence_type,
            'title': self.title,
            'description': self.description,
            'project_id': self.project_id,
            'verification_status': self.verification_status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    technologies_json = db.Column(db.JSON, default=list)
    repo_url = db.Column(db.String(255), nullable=True)
    demo_url = db.Column(db.String(255), nullable=True)
    role = db.Column(db.String(100), default="Sole Creator / Lead Developer")
    challenges = db.Column(db.Text, nullable=True)
    decisions = db.Column(db.Text, nullable=True)
    outcomes = db.Column(db.Text, nullable=True)
    completeness_score = db.Column(db.Integer, default=75)
    suggested_bullets_json = db.Column(db.JSON, default=list)
    potential_questions_json = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    documents = db.relationship('ProjectDocument', backref='project', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'technologies': self.technologies_json or [],
            'repo_url': self.repo_url,
            'demo_url': self.demo_url,
            'role': self.role,
            'challenges': self.challenges,
            'decisions': self.decisions,
            'outcomes': self.outcomes,
            'completeness_score': self.completeness_score,
            'suggested_bullets': self.suggested_bullets_json or [],
            'potential_questions': self.potential_questions_json or [],
            'documents': [d.to_dict() for d in self.documents.all()],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class ProjectDocument(db.Model):
    __tablename__ = 'project_documents'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    storage_key = db.Column(db.String(500), nullable=False)
    document_type = db.Column(db.String(50), default="readme")  # readme, architecture, report
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'document_type': self.document_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CareerMission(db.Model):
    __tablename__ = 'career_missions'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    skill_gap = db.Column(db.String(100), nullable=False)
    difficulty = db.Column(db.String(50), default="Medium")  # Easy, Medium, Hard
    estimated_duration = db.Column(db.String(50), default="2 hours")
    criteria = db.Column(db.Text, nullable=False)
    points = db.Column(db.Integer, default=50)
    status = db.Column(db.String(50), default="available")  # available, in_progress, completed
    progress = db.Column(db.Integer, default=0)  # 0 to 100
    related_dimension = db.Column(db.String(100), default="Technical Skill Alignment")
    submitted_evidence = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'skill_gap': self.skill_gap,
            'difficulty': self.difficulty,
            'estimated_duration': self.estimated_duration,
            'criteria': self.criteria,
            'points': self.points,
            'status': self.status,
            'progress': self.progress,
            'related_dimension': self.related_dimension,
            'submitted_evidence': self.submitted_evidence,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class InterviewSession(db.Model):
    __tablename__ = 'interview_sessions'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    job_description_id = db.Column(db.String(36), db.ForeignKey('job_descriptions.id', ondelete='SET NULL'), nullable=True)
    resume_id = db.Column(db.String(36), db.ForeignKey('resumes.id', ondelete='SET NULL'), nullable=True)
    session_type = db.Column(db.String(50), default="full_simulation")  # technical, behavioral, project_deep_dive, full_simulation
    status = db.Column(db.String(50), default="in_progress")  # in_progress, completed
    overall_score = db.Column(db.Float, nullable=True)
    summary = db.Column(db.Text, nullable=True)
    checklist_json = db.Column(db.JSON, default=list)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)

    questions = db.relationship('InterviewQuestion', backref='session', lazy='dynamic', cascade="all, delete-orphan", order_by='InterviewQuestion.order_idx')
    job = db.relationship('JobDescription')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'job_title': self.job.title if self.job else "Target Role Simulation",
            'session_type': self.session_type,
            'status': self.status,
            'overall_score': round(self.overall_score, 1) if self.overall_score else None,
            'summary': self.summary,
            'checklist': self.checklist_json or [],
            'question_count': self.questions.count(),
            'questions': [q.to_dict() for q in self.questions.all()],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class InterviewQuestion(db.Model):
    __tablename__ = 'interview_questions'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    session_id = db.Column(db.String(36), db.ForeignKey('interview_sessions.id', ondelete='CASCADE'), nullable=False, index=True)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50), default="technical")  # technical, behavioral, project_followup, architecture
    context_note = db.Column(db.String(255), nullable=True)
    expected_points_json = db.Column(db.JSON, default=list)
    order_idx = db.Column(db.Integer, default=0)
    user_answer = db.Column(db.Text, nullable=True)
    score = db.Column(db.Float, nullable=True)
    feedback = db.Column(db.Text, nullable=True)
    rubric_breakdown_json = db.Column(db.JSON, default=dict)

    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'context_note': self.context_note,
            'expected_points': self.expected_points_json or [],
            'order_idx': self.order_idx,
            'user_answer': self.user_answer,
            'score': round(self.score, 1) if self.score else None,
            'feedback': self.feedback,
            'rubric_breakdown': self.rubric_breakdown_json or {}
        }


class CommunityChallenge(db.Model):
    __tablename__ = 'community_challenges'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    title = db.Column(db.String(200), nullable=False)
    role_category = db.Column(db.String(100), default="Full Stack Engineer")
    description = db.Column(db.Text, nullable=False)
    difficulty = db.Column(db.String(50), default="Intermediate")
    criteria_json = db.Column(db.JSON, default=list)
    participant_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    submissions = db.relationship('CommunitySubmission', backref='challenge', lazy='dynamic', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'role_category': self.role_category,
            'description': self.description,
            'difficulty': self.difficulty,
            'criteria': self.criteria_json or [],
            'participant_count': self.participant_count,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class CommunitySubmission(db.Model):
    __tablename__ = 'community_submissions'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    challenge_id = db.Column(db.String(36), db.ForeignKey('community_challenges.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    anonymous_handle = db.Column(db.String(100), nullable=False)
    rubric_score = db.Column(db.Float, nullable=False)
    feedback_count = db.Column(db.Integer, default=0)
    badge = db.Column(db.String(100), default="Gladiator")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'challenge_id': self.challenge_id,
            'anonymous_handle': self.anonymous_handle,
            'rubric_score': round(self.rubric_score, 1),
            'feedback_count': self.feedback_count,
            'badge': self.badge,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default="info")  # success, warning, info, arena
    is_read = db.Column(db.Boolean, default=False)
    link_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'message': self.message,
            'notification_type': self.notification_type,
            'is_read': self.is_read,
            'link_url': self.link_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class AuditEvent(db.Model):
    __tablename__ = 'audit_events'
    
    id = db.Column(db.String(36), primary_key=True, default=generate_uuid)
    user_id = db.Column(db.String(36), nullable=True, index=True)
    action = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(100), nullable=False)
    resource_id = db.Column(db.String(100), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
