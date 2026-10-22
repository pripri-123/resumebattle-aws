import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from app.models import User, AuditEvent
from app.extensions import db

def create_access_token(user_id: str, email: str, is_admin: bool = False) -> str:
    secret = current_app.config.get("JWT_SECRET_KEY")
    exp_hours = current_app.config.get("JWT_EXPIRATION_HOURS", 72)
    now = datetime.now(timezone.utc)
    payload = {
        'sub': user_id,
        'email': email,
        'is_admin': is_admin,
        'iat': now,
        'exp': now + timedelta(hours=exp_hours)
    }
    return jwt.encode(payload, secret, algorithm="HS256")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check Authorization header (Bearer <token>)
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                token = parts[1]
                
        # Also check cookie if present
        if not token and 'access_token' in request.cookies:
            token = request.cookies.get('access_token')

        if not token:
            return jsonify({'error': 'Authentication token is missing. Please log in.'}), 401

        try:
            secret = current_app.config.get("JWT_SECRET_KEY")
            data = jwt.decode(token, secret, algorithms=["HS256"])
            current_user = db.session.get(User, data['sub'])
            if not current_user:
                return jsonify({'error': 'User not found or account deactivated.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Authentication token has expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid authentication token.'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

def log_audit_event(user_id: str, action: str, resource_type: str, resource_id: str = None):
    try:
        event = AuditEvent(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            ip_address=request.remote_addr if request else None
        )
        db.session.add(event)
        db.session.commit()
    except Exception:
        db.session.rollback()
