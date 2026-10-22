from app.models import User, Resume
from app.extensions import db
from app.security import create_access_token

def test_resume_upload_and_list(client, auth_headers):
    res = client.post('/api/v1/resumes/upload', data={
        'title': 'My Developer Resume',
        'target_role': 'Full Stack Developer',
        'text_content': 'Experienced developer with React and Python.'
    }, headers=auth_headers)
    assert res.status_code == 201
    data = res.get_json()
    assert 'resume' in data
    resume_id = data['resume']['id']

    # List resumes
    list_res = client.get('/api/v1/resumes', headers=auth_headers)
    assert list_res.status_code == 200
    resumes = list_res.get_json()['resumes']
    assert any(r['id'] == resume_id for r in resumes)

def test_idor_protection_cross_user_isolation(client, app, auth_headers):
    """Confirm a user cannot access or delete another user's private resume."""
    with app.app_context():
        # Create second user and resume
        user2 = User(email="victim@example.com", username="victim", password_hash="hash")
        db.session.add(user2)
        db.session.flush()
        
        resume2 = Resume(
            user_id=user2.id,
            title="Private Victim Resume",
            original_filename="private.pdf",
            storage_key="victim_key.pdf",
            extracted_text="Secret private candidate data"
        )
        db.session.add(resume2)
        db.session.commit()
        victim_resume_id = resume2.id

    # TestUser tries to access User2's private resume
    res = client.get(f'/api/v1/resumes/{victim_resume_id}', headers=auth_headers)
    assert res.status_code == 404  # Not found / access denied

    # TestUser tries to delete User2's private resume
    del_res = client.delete(f'/api/v1/resumes/{victim_resume_id}', headers=auth_headers)
    assert del_res.status_code == 404
