import pytest
from app import create_app
from app.config import Config
from app.extensions import db
from app.models import User, UserProfile
from app.security import create_access_token

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    JWT_SECRET_KEY = "test-super-secret-key-that-is-at-least-32-bytes-long"

@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def test_user(app):
    with app.app_context():
        user = User(
            email="testuser@example.com",
            username="testuser",
            full_name="Test User",
            target_role="Full Stack Engineer"
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.flush()
        db.session.add(UserProfile(user_id=user.id))
        db.session.commit()
        user_id = user.id
        user_email = user.email
        
    class UserProxy:
        id = user_id
        email = user_email
        username = "testuser"
        
    return UserProxy()

@pytest.fixture
def test_token(test_user):
    return create_access_token(test_user.id, test_user.email)

@pytest.fixture
def auth_headers(test_token):
    return {'Authorization': f'Bearer {test_token}'}
