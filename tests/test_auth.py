"""
Basic tests for UEI application.
"""
import pytest
from app import create_app
from models import db
from models.user import User


@pytest.fixture
def app():
    """Create application for testing."""
    app = create_app('testing')
    
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Create test client."""
    return app.test_client()


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'


def test_home_page(client):
    """Test home page loads."""
    response = client.get('/')
    assert response.status_code == 200


def test_register_user(client):
    """Test user registration."""
    response = client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'password123',
        'full_name': 'Test User',
        'role': 'student'
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data['message'] == 'User registered successfully'


def test_login_user(client):
    """Test user login."""
    # First register
    client.post('/api/auth/register', json={
        'email': 'test@example.com',
        'username': 'testuser',
        'password': 'password123',
        'full_name': 'Test User',
        'role': 'student'
    })
    
    # Then login
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data
    assert 'refresh_token' in data


def test_invalid_login(client):
    """Test login with invalid credentials."""
    response = client.post('/api/auth/login', json={
        'username': 'nonexistent',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401


def test_missing_fields_registration(client):
    """Test registration with missing fields."""
    response = client.post('/api/auth/register', json={
        'email': 'test@example.com'
    })
    assert response.status_code == 400
    data = response.get_json()
    assert 'missing_fields' in data
