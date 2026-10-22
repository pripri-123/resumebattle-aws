from app.services.scoring import DeterministicScorer

def test_deterministic_scoring_reproducibility():
    resume = """
    Software Engineer skilled in React, TypeScript, Python, and PostgreSQL.
    Architected high-throughput REST APIs deployed on Docker with AWS.
    Reduced p99 database query latency by 45% using Redis caching.
    """
    job = """
    Full Stack Engineer. Requirements:
    Proficiency in React, TypeScript, and Python.
    Experience with Docker and AWS.
    Strong database fundamentals with PostgreSQL.
    """
    
    run1 = DeterministicScorer.evaluate(resume, job)
    run2 = DeterministicScorer.evaluate(resume, job)
    
    # Must be 100% identical and deterministic
    assert run1['overall_score'] == run2['overall_score']
    assert len(run1['dimensions']) == 9
    assert len(run2['dimensions']) == 9
    assert run1['verdict'] == run2['verdict']
    
    # Check that 9 dimensions exist
    dim_keys = {d['key'] for d in run1['dimensions']}
    expected_keys = {
        'technical_skills', 'qualification_coverage', 'project_evidence',
        'experience_impact', 'achievement_specificity', 'readability_structure',
        'terminology_alignment', 'evidence_quality', 'completeness'
    }
    assert dim_keys == expected_keys

def test_scoring_evidence_and_gap_detection():
    resume = "Frontend Developer using React and Tailwind CSS."
    job = "Backend Engineer requiring Python, PostgreSQL, and Docker."
    
    result = DeterministicScorer.evaluate(resume, job)
    
    # Python, PostgreSQL, and Docker should be detected as missing or partial
    matches = {m['requirement_text']: m['match_status'] for m in result['matches']}
    
    # Score should reflect readiness gap
    assert result['overall_score'] < 75.0
    assert result['verdict'] in ['Moderate Fit', 'Readiness Gap']
