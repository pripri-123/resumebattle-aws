import os
from datetime import datetime
from app import create_app
from app.extensions import db
from app.models import (
    User, UserProfile, Resume, ResumeVersion, JobDescription,
    ResumeAnalysis, AnalysisDimension, RequirementMatch, CareerSkill,
    SkillEvidence, Project, CareerMission, CommunityChallenge,
    CommunitySubmission, Notification
)
from app.services.scoring import DeterministicScorer

app = create_app()

def seed():
    with app.app_context():
        print("Creating all database tables...")
        db.create_all()

        # Check if demo user already exists
        demo_user = User.query.filter_by(email="demo@resumebattle.io").first()
        if demo_user:
            print("Database already contains demo user. Refreshing sample records...")
            return

        print("Seeding demo candidate account...")
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

        profile = UserProfile(
            user_id=user.id,
            bio="Software engineer with 2+ years building responsive web apps and cloud APIs. Passionate about resilient system design, TypeScript, and Python.",
            github_url="https://github.com/alexrivera-demo",
            linkedin_url="https://linkedin.com/in/alexrivera-demo",
            portfolio_url="https://alexrivera-portfolio.demo.app",
            years_experience=2.5,
            preferred_location="Remote / Hybrid",
            privacy_mode="standard"
        )
        db.session.add(profile)

        # 1. Sample Job Descriptions
        print("Seeding target job descriptions...")
        job1 = JobDescription(
            title="Senior Full Stack Engineer",
            company="CloudFlow Technologies",
            role_category="Full Stack Engineering",
            experience_level="Mid to Senior",
            raw_text="""
            We are looking for a Full Stack Engineer to join our core cloud platform team.
            Requirements:
            - 2+ years hands-on experience with React, TypeScript, and modern JavaScript.
            - Deep experience building backend APIs using Python (Flask/FastAPI) or Node.js.
            - Relational database design and query optimization with PostgreSQL.
            - Practical familiarity with Docker containerization and CI/CD pipelines.
            - Experience deploying or monitoring services on AWS (S3, ECS, or Lambda).
            - Proven record improving application response times and writing automated unit tests.
            """,
            required_skills_json=["React", "TypeScript", "Python", "PostgreSQL", "Docker", "AWS"],
            preferred_skills_json=["Redis", "CI/CD", "GraphQL", "Tailwind CSS"],
            is_sample=True
        )
        job2 = JobDescription(
            title="Cloud Platform & DevOps Engineer",
            company="Nexus Infrastructure",
            role_category="Cloud / DevOps",
            experience_level="Mid-Level",
            raw_text="""
            Nexus Infrastructure is seeking an Infrastructure & Cloud Engineer.
            Requirements:
            - Hands-on experience with AWS cloud services (EC2, S3, IAM, VPC, RDS).
            - Infrastructure as Code using Terraform or CloudFormation.
            - Container orchestration with Docker and Kubernetes.
            - Building automated deployment pipelines (GitHub Actions, GitLab CI).
            - Python or Bash scripting for system automation and log telemetry.
            """,
            required_skills_json=["AWS", "Terraform", "Docker", "Kubernetes", "Python", "CI/CD"],
            is_sample=True
        )
        db.session.add_all([job1, job2])
        db.session.flush()

        # 2. Resumes & Versions
        print("Seeding resumes and version history...")
        resume1_text = """
        ALEX RIVERA
        Full Stack Engineer | alex@rivera.dev | https://github.com/alexrivera-demo | San Francisco, CA

        PROFESSIONAL SUMMARY
        Innovative Full Stack Developer with 2+ years of experience engineering high-throughput web applications, REST APIs, and distributed cloud services using React, TypeScript, Python, and PostgreSQL.

        TECHNICAL SKILLS
        Languages & Frameworks: TypeScript, JavaScript, Python, React, Node.js, Flask, Tailwind CSS
        Databases & Caching: PostgreSQL, Redis, SQLite
        Cloud & DevOps: Docker, AWS (S3, EC2), Git, GitHub Actions CI/CD, Linux

        WORK EXPERIENCE
        Software Engineer | Apex Web Solutions | 2023 - Present
        - Architected and deployed a multi-tenant client portal using React, TypeScript, and Python Flask, supporting 15,000+ monthly active users.
        - Optimized complex PostgreSQL database queries and added Redis caching, decreasing average p95 API response times by 42% (from 320ms to 185ms).
        - Spearheaded Docker containerization and automated CI/CD pipeline, reducing deployment failure rates by 35%.

        TECHNICAL PROJECTS
        CloudScale Telemetry Dashboard | https://github.com/alexrivera-demo/cloudscale-telemetry
        - Engineered an interactive metrics visualization tool in React and TypeScript with real-time WebSocket feeds.
        - Implemented RESTful ingestion API in Python handling 500+ requests/second with sub-50ms latency.
        - Deployed containerized microservices to AWS with automated unit test coverage of 88%.

        EDUCATION
        B.S. in Computer Science | University of California | 2023
        """

        resume1 = Resume(
            user_id=user.id,
            title="Alex Rivera - Full Stack Core",
            target_role="Full Stack Engineer",
            original_filename="Alex_Rivera_FullStack.pdf",
            storage_key="seed_resume_1.pdf",
            file_size=104857,
            mime_type="application/pdf",
            extracted_text=resume1_text,
            processing_status="completed"
        )
        db.session.add(resume1)
        db.session.flush()

        v1 = ResumeVersion(
            resume_id=resume1.id,
            user_id=user.id,
            version_name="v1.0 - Initial Full Stack",
            target_role="Full Stack Engineer",
            content_snapshot=resume1_text,
            notes="Baseline version emphasizing React and Python API architecture",
            is_preferred=True
        )

        resume2_text = resume1_text + """
        ADDITIONAL CLOUD SPECIALIZATION:
        - Configured AWS VPC, Security Groups, and S3 lifecycle retention policies.
        - Automated infrastructure provisioning with Terraform modules and ECS container clusters.
        """
        resume2 = Resume(
            user_id=user.id,
            title="Alex Rivera - Cloud Focus (v2)",
            target_role="Cloud & DevOps Engineer",
            original_filename="Alex_Rivera_Cloud.pdf",
            storage_key="seed_resume_2.pdf",
            file_size=112000,
            mime_type="application/pdf",
            extracted_text=resume2_text,
            processing_status="completed"
        )
        db.session.add(resume2)
        db.session.flush()

        v2 = ResumeVersion(
            resume_id=resume2.id,
            user_id=user.id,
            version_name="v2.0 - Cloud & AWS Enhanced",
            target_role="Full Stack & Cloud",
            content_snapshot=resume2_text,
            notes="Added AWS VPC and Terraform configuration bullets",
            is_preferred=True
        )
        db.session.add_all([v1, v2])

        # 3. Seed deterministic Evaluation Analysis
        print("Generating deterministic evaluation record...")
        eval_res = DeterministicScorer.evaluate(resume1_text, job1.raw_text)
        analysis = ResumeAnalysis(
            user_id=user.id,
            resume_id=resume1.id,
            resume_version_id=v1.id,
            job_description_id=job1.id,
            overall_score=eval_res['overall_score'],
            rubric_version="rubric-v2.0-deterministic",
            ai_provider="local-deterministic",
            summary_text=eval_res['summary'],
            verdict=eval_res['verdict']
        )
        db.session.add(analysis)
        db.session.flush()

        for d in eval_res['dimensions']:
            dim = AnalysisDimension(
                analysis_id=analysis.id,
                dimension_key=d['key'],
                dimension_name=d['name'],
                score=d['score'],
                weight=d['weight'],
                explanation=d['explanation'],
                suggestions_json=d['suggestions']
            )
            db.session.add(dim)

        for m in eval_res['matches']:
            match = RequirementMatch(
                analysis_id=analysis.id,
                requirement_text=m['requirement_text'],
                category=m['category'],
                importance=m['importance'],
                match_status=m['match_status'],
                evidence_text=m['evidence_text'],
                confidence=m['confidence'],
                suggestion=m['suggestion']
            )
            db.session.add(match)

        # 4. Career DNA Skills
        print("Seeding Career DNA skills and evidence...")
        skills_data = [
            ("TypeScript", "Languages", "Advanced", True),
            ("Python", "Languages", "Advanced", True),
            ("React", "Frontend", "Advanced", True),
            ("PostgreSQL", "Databases", "Intermediate", True),
            ("Docker", "DevOps & Cloud", "Intermediate", True),
            ("AWS (S3 & EC2)", "DevOps & Cloud", "Intermediate", False),
            ("Tailwind CSS", "Frontend", "Advanced", True),
            ("REST API Design", "Architecture", "Advanced", True),
            ("Redis", "Databases", "Intermediate", False),
            ("Kubernetes", "DevOps & Cloud", "Beginner", False)
        ]
        for name, cat, prof, ver in skills_data:
            sk = CareerSkill(
                user_id=user.id,
                name=name,
                category=cat,
                proficiency_level=prof,
                status="confirmed",
                verified=ver,
                source="resume"
            )
            db.session.add(sk)

        # 5. Projects
        print("Seeding projects...")
        p1 = Project(
            user_id=user.id,
            title="CloudScale Telemetry Dashboard",
            description="Full-stack real-time analytics system processing metrics streams with interactive canvas charts.",
            technologies_json=["React", "TypeScript", "Python", "FastAPI", "PostgreSQL", "Docker"],
            repo_url="https://github.com/alexrivera-demo/cloudscale-telemetry",
            demo_url="https://cloudscale.demo.app",
            role="Lead Developer",
            challenges="Managing state synchronization for 500+ events per second without dropping UI frames.",
            decisions="Used WebSocket batching and Web Workers to decouple data ingestion from the DOM render tree.",
            outcomes="Achieved sub-50ms ingestion latency and supported 10k simultaneous active sessions.",
            completeness_score=90,
            suggested_bullets_json=[
                "Architected real-time metrics telemetry dashboard using React, TypeScript, and FastAPI, sustaining 500+ events/sec.",
                "Engineered responsive UI using Tailwind CSS and Web Workers, cutting render cycle latency by 35%."
            ],
            potential_questions_json=[
                "How did you prevent WebSocket connection bottlenecks when handling rapid incoming metrics?",
                "What database indexing strategy did you choose for high-frequency time-series points?"
            ]
        )
        db.session.add(p1)

        # 6. Career Missions
        print("Seeding Career Quest missions...")
        m1 = CareerMission(
            user_id=user.id,
            title="Deploy & Document AWS S3 Cloud Storage Integration",
            description="Bridge your cloud evidence gap by deploying document upload handling with automated presigned URLs.",
            skill_gap="Hands-on AWS Cloud Architecture",
            difficulty="Medium",
            estimated_duration="2.5 hours",
            criteria="1. Create an S3 storage service adapter.\n2. Configure IAM least-privilege permissions.\n3. Document upload throughput in README.",
            points=60,
            status="completed",
            progress=100,
            submitted_evidence="Implemented S3StorageService with unit tests and local fallback in resume-battle-2.",
            completed_at=datetime.utcnow()
        )
        m2 = CareerMission(
            user_id=user.id,
            title="Quantify Project Performance with Google XYZ Formula",
            description="Elevate achievement specificity on your resume by measuring latency, memory reduction, or throughput.",
            skill_gap="Achievement Specificity",
            difficulty="Easy",
            estimated_duration="1 hour",
            criteria="Formulate 3 bullet points showing 'Accomplished [X] as measured by [Y], by doing [Z]'.",
            points=40,
            status="in_progress",
            progress=65
        )
        m3 = CareerMission(
            user_id=user.id,
            title="Implement End-to-End API Idempotency & Rate Limiting",
            description="Strengthen backend architecture readiness by adding token-bucket rate limiting and idempotency keys.",
            skill_gap="Distributed Architecture & Resilience",
            difficulty="Hard",
            estimated_duration="4 hours",
            criteria="Add middleware checking X-Idempotency-Key headers with Redis cache backing.",
            points=80,
            status="available",
            progress=0
        )
        db.session.add_all([m1, m2, m3])

        # 7. Community Challenges
        print("Seeding Battle League challenges...")
        c1 = CommunityChallenge(
            title="Full Stack Cloud Architect Challenge",
            role_category="Full Stack Engineering",
            description="Pit your full-stack resume against the Silicon Valley cloud rubric. Anonymous feedback and rankings.",
            difficulty="Intermediate",
            criteria_json=["Full-stack React & Python", "Relational database tuning", "Cloud deployment evidence"],
            participant_count=42,
            is_active=True
        )
        c2 = CommunityChallenge(
            title="Early-Career Internship Showcase",
            role_category="Software Engineering Intern",
            description="Showcase practical project evidence and code repositories for technical internship positions.",
            difficulty="Entry-Level",
            criteria_json=["Verifiable GitHub links", "Clean documentation", "Data structures & testing"],
            participant_count=87,
            is_active=True
        )
        db.session.add_all([c1, c2])
        db.session.flush()

        # Seed anonymous submissions
        sub1 = CommunitySubmission(
            challenge_id=c1.id,
            user_id=user.id,
            anonymous_handle="AsyncVoyager_921",
            rubric_score=82.5,
            badge="Champion",
            feedback_count=4
        )
        sub2 = CommunitySubmission(
            challenge_id=c1.id,
            user_id="seed-user-2",
            anonymous_handle="NeonGladiator_104",
            rubric_score=89.0,
            badge="Grandmaster",
            feedback_count=7
        )
        sub3 = CommunitySubmission(
            challenge_id=c1.id,
            user_id="seed-user-3",
            anonymous_handle="CyberVanguard_443",
            rubric_score=76.0,
            badge="Gladiator",
            feedback_count=2
        )
        db.session.add_all([sub1, sub2, sub3])

        # 8. Notifications
        print("Seeding notifications...")
        n1 = Notification(
            user_id=user.id,
            title="Welcome to Resume Battle 2.0! ⚔️",
            message="Your Career Intelligence Arena is initialized. Head to Resume Arena to upload your resume.",
            notification_type="arena",
            link_url="/app/resume-arena"
        )
        n2 = Notification(
            user_id=user.id,
            title="Mission Completed: AWS S3 Integration",
            message="You earned +60 readiness points! Your profile alignment index increased.",
            notification_type="success",
            link_url="/app/career-quest"
        )
        db.session.add_all([n1, n2])

        db.session.commit()
        print("[SUCCESS] Demo database successfully seeded!")

if __name__ == '__main__':
    seed()
