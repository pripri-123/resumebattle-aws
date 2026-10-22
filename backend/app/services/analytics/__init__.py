from typing import Dict, Any, List
from collections import Counter
from app.models import ResumeAnalysis, RequirementMatch, CareerMission, Project, InterviewSession, CareerSkill

class CareerAnalyticsService:
    @staticmethod
    def get_dashboard_insights(user_id: str) -> Dict[str, Any]:
        analyses = ResumeAnalysis.query.filter_by(user_id=user_id).order_by(ResumeAnalysis.created_at.asc()).all()
        missions = CareerMission.query.filter_by(user_id=user_id).all()
        projects = Project.query.filter_by(user_id=user_id).all()
        interviews = InterviewSession.query.filter_by(user_id=user_id).all()
        skills = CareerSkill.query.filter_by(user_id=user_id).all()

        # Score trend over time
        score_trend = []
        for a in analyses:
            score_trend.append({
                'date': a.created_at.strftime("%b %d") if a.created_at else "Recent",
                'score': round(a.overall_score, 1),
                'role': a.job.title if a.job else "Target Role",
                'id': a.id
            })

        # Most frequently missing requirements
        missing_reqs_counter = Counter()
        for a in analyses:
            for m in a.matches:
                if m.match_status == 'missing':
                    missing_reqs_counter[m.requirement_text] += 1

        top_missing_reqs = [
            {'requirement': req, 'frequency': count}
            for req, count in missing_reqs_counter.most_common(5)
        ]

        # Dimension averages across recent analyses
        dimension_scores = {}
        for a in analyses[-5:]:  # last 5 analyses
            for d in a.dimensions:
                if d.dimension_name not in dimension_scores:
                    dimension_scores[d.dimension_name] = []
                dimension_scores[d.dimension_name].append(d.score)

        dimension_averages = [
            {'name': name, 'average': round(sum(scores) / len(scores), 1)}
            for name, scores in dimension_scores.items()
        ]

        # Mission completion
        total_missions = len(missions)
        completed_missions = sum(1 for m in missions if m.status == 'completed')
        in_progress_missions = sum(1 for m in missions if m.status == 'in_progress')
        total_points = sum(m.points for m in missions if m.status == 'completed')

        # Interview stats
        completed_interviews = [i for i in interviews if i.status == 'completed' and i.overall_score is not None]
        avg_interview_score = (
            round(sum(i.overall_score for i in completed_interviews) / len(completed_interviews), 1)
            if completed_interviews else None
        )

        # Career Readiness Index (composite of resume score, verified skills, missions, projects)
        latest_score = analyses[-1].overall_score if analyses else 0.0
        project_count = len(projects)
        verified_skills_count = sum(1 for s in skills if s.verified or s.evidence.count() > 0)
        
        readiness_index = 0.0
        if analyses:
            readiness_index = (latest_score * 0.5) + (min(100.0, project_count * 20.0) * 0.25) + (min(100.0, verified_skills_count * 15.0) * 0.25)
            readiness_index = round(min(100.0, max(15.0, readiness_index)), 1)

        return {
            'total_evaluations': len(analyses),
            'latest_score': round(latest_score, 1) if analyses else None,
            'readiness_index': readiness_index if analyses else None,
            'score_trend': score_trend,
            'top_missing_requirements': top_missing_reqs,
            'dimension_averages': dimension_averages,
            'missions_stats': {
                'total': total_missions,
                'completed': completed_missions,
                'in_progress': in_progress_missions,
                'points_earned': total_points
            },
            'interviews_stats': {
                'total_sessions': len(interviews),
                'completed_sessions': len(completed_interviews),
                'average_score': avg_interview_score
            },
            'projects_count': project_count,
            'skills_count': len(skills),
            'verified_skills_count': verified_skills_count
        }
