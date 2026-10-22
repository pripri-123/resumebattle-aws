def test_career_dna_crud(client, auth_headers):
    # Add skill
    res = client.post('/api/v1/career/skills', json={
        'name': 'Golang',
        'category': 'Languages',
        'proficiency_level': 'Advanced'
    }, headers=auth_headers)
    assert res.status_code == 201
    skill_id = res.get_json()['skill']['id']

    # Get Career DNA
    dna_res = client.get('/api/v1/career/dna', headers=auth_headers)
    assert dna_res.status_code == 200
    data = dna_res.get_json()
    assert any(s['id'] == skill_id for s in data['skills'])

def test_missions_workflow(client, auth_headers):
    # Create test mission directly or test listing
    list_res = client.get('/api/v1/missions', headers=auth_headers)
    assert list_res.status_code == 200
    assert 'missions' in list_res.get_json()
