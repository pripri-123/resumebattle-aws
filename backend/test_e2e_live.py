import urllib.request
import json

def test_live():
    print("1. Testing Frontend HTTP response...")
    with urllib.request.urlopen("http://localhost:5173/") as res:
        print(f"   Frontend Status: {res.status} OK (HTML served)")

    print("2. Testing Demo Login endpoint...")
    req = urllib.request.Request("http://localhost:5000/api/v1/auth/demo", data=b"{}", headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as res:
        login_data = json.loads(res.read())
        token = login_data["token"]
        print(f"   Logged in as: {login_data['user']['full_name']} ({login_data['user']['email']})")

    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    print("3. Testing Resumes List...")
    req = urllib.request.Request("http://localhost:5000/api/v1/resumes", headers=headers)
    with urllib.request.urlopen(req) as res:
        resumes = json.loads(res.read())["resumes"]
        print(f"   Found {len(resumes)} resumes: {[r['title'] for r in resumes]}")
        resume_a_id = resumes[0]["id"]
        resume_b_id = resumes[1]["id"] if len(resumes) > 1 else resume_a_id

    print("4. Testing Resume Arena Rubric Evaluation...")
    eval_payload = json.dumps({"resume_id": resume_a_id}).encode("utf-8")
    req = urllib.request.Request("http://localhost:5000/api/v1/analyses/evaluate", data=eval_payload, headers=headers)
    with urllib.request.urlopen(req) as res:
        eval_data = json.loads(res.read())["analysis"]
        print(f"   Rubric Score: {eval_data['overall_score']}/100 | Verdict: {eval_data['verdict']}")
        print(f"   Dimensions Evaluated: {len(eval_data['dimensions'])} | Requirements Matched: {len(eval_data['matches'])}")

    print("5. Testing Head-to-Head Resume Battle...")
    battle_payload = json.dumps({"resume_a_id": resume_a_id, "resume_b_id": resume_b_id}).encode("utf-8")
    req = urllib.request.Request("http://localhost:5000/api/v1/battles/compare", data=battle_payload, headers=headers)
    with urllib.request.urlopen(req) as res:
        battle_data = json.loads(res.read())
        print(f"   Winner: {battle_data['winner_title']} (Contender A: {battle_data['resume_a']['score']} vs Contender B: {battle_data['resume_b']['score']})")

    print("6. Testing Career DNA...")
    req = urllib.request.Request("http://localhost:5000/api/v1/career/dna", headers=headers)
    with urllib.request.urlopen(req) as res:
        dna_data = json.loads(res.read())
        print(f"   Total Competencies: {dna_data['total_skills']} | Verified: {dna_data['verified_skills']}")

    print("7. Testing Career Quest Learning Missions...")
    req = urllib.request.Request("http://localhost:5000/api/v1/missions", headers=headers)
    with urllib.request.urlopen(req) as res:
        missions_data = json.loads(res.read())
        print(f"   Total Missions: {missions_data['stats']['total']} | Points Earned: {missions_data['stats']['points_earned']} pts")

    print("8. Testing Application Simulator Mock Interview...")
    sim_payload = json.dumps({"session_type": "full_simulation"}).encode("utf-8")
    req = urllib.request.Request("http://localhost:5000/api/v1/interviews/start", data=sim_payload, headers=headers)
    with urllib.request.urlopen(req) as res:
        sim_data = json.loads(res.read())["session"]
        print(f"   Generated Questions: {sim_data['question_count']} questions")

    print("9. Testing Battle League Leaderboard...")
    req = urllib.request.Request("http://localhost:5000/api/v1/community/leaderboard", headers=headers)
    with urllib.request.urlopen(req) as res:
        lead_data = json.loads(res.read())
        print(f"   Leaderboard Entrants: {len(lead_data['leaderboard'])}")

    print("\n[ALL 9 E2E WORKFLOW CHECKS PASSED LIVE AND OPERATIONAL!]")

if __name__ == "__main__":
    test_live()
