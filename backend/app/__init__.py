import os
import time
from flask import Flask, jsonify, request
from app.config import Config
from app.extensions import db, cors

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    )

    # Register blueprints
    from app.api.auth import auth_bp
    from app.api.resumes import resumes_bp
    from app.api.analyses import analyses_bp
    from app.api.battles import battles_bp
    from app.api.career import career_bp
    from app.api.missions import missions_bp
    from app.api.interviews import interviews_bp
    from app.api.projects import projects_bp
    from app.api.community import community_bp
    from app.api.analytics import analytics_bp
    from app.api.documents import documents_bp
    from app.api.settings import settings_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(resumes_bp)
    app.register_blueprint(analyses_bp)
    app.register_blueprint(battles_bp)
    app.register_blueprint(career_bp)
    app.register_blueprint(missions_bp)
    app.register_blueprint(interviews_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(community_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(documents_bp)
    app.register_blueprint(settings_bp)

    # Health & Readiness checks for AWS ALB / ECS
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'timestamp': time.time(),
            'version': '2.0.0',
            'service': 'resume-battle-backend',
            'environment': app.config.get('ENV', 'development'),
            'storage_backend': app.config.get('STORAGE_BACKEND'),
            'ai_provider': app.config.get('AI_PROVIDER')
        }), 200

    @app.route('/api/ready', methods=['GET'])
    def readiness_check():
        try:
            # Check database connection
            db.session.execute(db.text('SELECT 1'))
            return jsonify({'ready': True, 'database': 'connected'}), 200
        except Exception as e:
            return jsonify({'ready': False, 'database_error': str(e)}), 503

    # Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad Request', 'message': str(error)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized', 'message': 'Authentication required.'}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden', 'message': 'Access denied.'}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not Found', 'message': 'Resource not found.'}), 404

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({'error': 'Internal Server Error', 'message': 'An unexpected error occurred.'}), 500

    return app
