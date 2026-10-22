import re
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User, UserProfile
from app.security import create_access_token, token_required, log_audit_event

auth_bp = Blueprint('auth', __name__, url_prefix='/api/v1/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    full_name = data.get('full_name', '').strip()
    target_role = data.get('target_role', 'Full Stack Engineer')

    if not email or not username or not password:
        return jsonify({'error': 'Email, username, and password are required.'}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'error': 'Invalid email address format.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'An account with this email already exists.'}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username is already taken.'}), 409

    user = User(
        email=email,
        username=username,
        full_name=full_name or username,
        target_role=target_role
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    # Create empty profile
    profile = UserProfile(user_id=user.id)
    db.session.add(profile)
    db.session.commit()

    log_audit_event(user.id, "REGISTER", "User", user.id)
    token = create_access_token(user.id, user.email, user.is_admin)

    return jsonify({
        'message': 'Account created successfully.',
        'token': token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = data.get('email_or_username', '').strip().lower()
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Email/username and password are required.'}), 400

    user = User.query.filter(
        (User.email == identifier) | (User.username == identifier)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials.'}), 401

    token = create_access_token(user.id, user.email, user.is_admin)
    log_audit_event(user.id, "LOGIN", "User", user.id)

    return jsonify({
        'message': 'Login successful.',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/demo', methods=['POST'])
def demo_login():
    """Provides instant 1-click access to the seeded demonstration account."""
    user = User.query.filter_by(email="demo@resumebattle.io").first()
    if not user:
        # Create demo account on the fly if not seeded
        user = User(
            email="demo@resumebattle.io",
            username="demoplayer",
            full_name="Alex Rivera",
            target_role="Full Stack Engineer",
            is_demo=True
        )
        user.set_password("demo123456")
        db.session.add(user)
        db.session.flush()
        db.session.add(UserProfile(user_id=user.id, bio="Early-career engineer exploring modern cloud architectures."))
        db.session.commit()

    token = create_access_token(user.id, user.email, user.is_admin)
    return jsonify({
        'message': 'Logged in as Demo Candidate.',
        'token': token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    profile = current_user.profile.to_dict() if current_user.profile else {}
    return jsonify({
        'user': current_user.to_dict(),
        'profile': profile
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    log_audit_event(current_user.id, "LOGOUT", "User", current_user.id)
    return jsonify({'message': 'Logged out successfully.'}), 200
