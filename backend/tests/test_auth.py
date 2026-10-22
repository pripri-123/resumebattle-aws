def test_register_success(client):
    res = client.post('/api/v1/auth/register', json={
        'email': 'newdev@example.com',
        'username': 'newdev',
        'password': 'password123',
        'full_name': 'New Developer',
        'target_role': 'Frontend Engineer'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert 'token' in data
    assert data['user']['email'] == 'newdev@example.com'

def test_register_duplicate_email(client, test_user):
    res = client.post('/api/v1/auth/register', json={
        'email': 'testuser@example.com',
        'username': 'differentuser',
        'password': 'password123'
    })
    assert res.status_code == 409
    assert 'already exists' in res.get_json()['error']

def test_login_success(client, test_user):
    res = client.post('/api/v1/auth/login', json={
        'email_or_username': 'testuser@example.com',
        'password': 'password123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'token' in data
    assert data['user']['username'] == 'testuser'

def test_login_invalid_password(client, test_user):
    res = client.post('/api/v1/auth/login', json={
        'email_or_username': 'testuser@example.com',
        'password': 'wrongpassword'
    })
    assert res.status_code == 401

def test_protected_route_without_token(client):
    res = client.get('/api/v1/auth/me')
    assert res.status_code == 401
