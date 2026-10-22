import re
from typing import Dict, List, Any, Tuple
from app.services.resume_parser import ResumeParserService

class ScoringRubric:
    DIMENSION_WEIGHTS = {
        'technical_skills': 0.18,
        'qualification_coverage': 0.14,
        'project_evidence': 0.14,
        'experience_impact': 0.12,
        'achievement_specificity': 0.12,
        'readability_structure': 0.10,
        'terminology_alignment': 0.08,
        'evidence_quality': 0.07,
        'completeness': 0.05
    }

    ACTION_VERBS = {
        'architected', 'developed', 'engineered', 'built', 'deployed', 'optimized',
        'spearheaded', 'orchestrated', 'designed', 'implemented', 'scaled', 'refactored',
        'automated', 'reduced', 'increased', 'accelerated', 'delivered', 'integrated'
    }

    COMMON_TECH_DICTIONARY = {
        'python', 'javascript', 'typescript', 'react', 'next.js', 'vue', 'angular',
        'node.js', 'express', 'flask', 'django', 'fastapi', 'postgresql', 'mysql',
        'mongodb', 'redis', 'sqlite', 'aws', 'docker', 'kubernetes', 'ci/cd',
        'git', 'graphql', 'rest api', 'tailwind', 'html', 'css', 'linux', 'bash',
        'terraform', 'microservices', 'kafka', 'elasticsearch', 'jest', 'pytest'
    }


class DeterministicScorer:
    """
    Deterministic, explainable rubric evaluation engine.
    Ensures identical inputs yield reproducible, fully audited scores with exact resume evidence quotes.
    """

    @classmethod
    def evaluate(cls, resume_text: str, job_text: str, custom_skills: List[str] = None) -> Dict[str, Any]:
        sanitized_resume = ResumeParserService.sanitize_text(resume_text)
        sections = ResumeParserService.extract_sections(sanitized_resume)
        
        # 1. Extract requirements & target skills from job description
        extracted_reqs = cls._extract_job_requirements(job_text, custom_skills)
        
        # 2. Match requirements against resume text
        matches = cls._match_requirements(sanitized_resume, extracted_reqs)
        
        # 3. Calculate dimension scores
        tech_score, tech_exp, tech_sug = cls._score_tech_skills(sanitized_resume, extracted_reqs, matches)
        qual_score, qual_exp, qual_sug = cls._score_qualifications(sanitized_resume, job_text, matches)
        proj_score, proj_exp, proj_sug = cls._score_project_evidence(sanitized_resume, sections)
        impact_score, impact_exp, impact_sug = cls._score_experience_impact(sanitized_resume, sections)
        spec_score, spec_exp, spec_sug = cls._score_achievement_specificity(sanitized_resume)
        read_score, read_exp, read_sug = cls._score_readability_structure(sanitized_resume, sections)
        term_score, term_exp, term_sug = cls._score_terminology_alignment(sanitized_resume, job_text)
        evid_score, evid_exp, evid_sug = cls._score_evidence_quality(sanitized_resume)
        comp_score, comp_exp, comp_sug = cls._score_completeness(sanitized_resume, matches)
        
        dimensions = [
            {
                'key': 'technical_skills',
                'name': 'Technical Skill Alignment',
                'score': round(tech_score, 1),
                'weight': ScoringRubric.DIMENSION_WEIGHTS['technical_skills'],
                'explanation': tech_exp,
                'suggestions': tech_sug
            },
            {
                'key': 'qualification_coverage',
                'name': 'Required & Preferred Qualification Coverage',
                'score': round(qual_score, 1),
                'weight': ScoringRubric.DIMENSION_WEIGHTS['qualification_coverage'],
                'explanation': qual_exp,
                'suggestions': qual_sug
            },
            {
                'key': 'project_evidence',
                'name': 'Project Relevance & Practical Proof',
                'score': round(proj_score, 1),
                'weight': ScoringRubric.DIMENSION_WEIGHTS['project_evidence'],
                'explanation': proj_exp,
                'suggestions': proj_sug
            },
            {
                'key': 'experience_impact',
                'name': 'Experience & Demonstrated Impact',
                'score': round(impact_score, 1),
                'weight': ScoringRubric.DIMENSION_WEIGHTS['experience_impact'],
                'explanation': impact_exp,
                'suggestions': impact_sug
            },
            {
                'key': 'achievement_specificity',
                'name': 'Achievement Specificity & Metrics',
                'score': round(spec_score, 1),
                'weight': ScoringRubric.DIMENSION_WEIGHTS['achievement_specificity'],
                'explanation': spec_exp,
                'suggestions': spec_sug
            },
            {
                'key': 'readability_structure',
                'name': 'Readability, Hierarchy & Structure',
                'score': round(read_score, 1),
                'weight': ScoringRubric.DIMENSION_WEIGHTS['readability_structure'],
                'explanation': read_exp,
                'suggestions': read_sug
            },
            {
                'key': 'terminology_alignment',
                'name': 'Domain Terminology & Keywords',
                'score': round(term_score, 1),
                'weight': ScoringRubric.DIMENSION_WEIGHTS['terminology_alignment'],
                'explanation': term_exp,
                'suggestions': term_sug
            },
            {
                'key': 'evidence_quality',
                'name': 'Evidence Quality & Verifiability',
                'score': round(evid_score, 1),
                'weight': ScoringRubric.DIMENSION_WEIGHTS['evidence_quality'],
                'explanation': evid_exp,
                'suggestions': evid_sug
            },
            {
                'key': 'completeness',
                'name': 'Requirement Completeness',
                'score': round(comp_score, 1),
                'weight': ScoringRubric.DIMENSION_WEIGHTS['completeness'],
                'explanation': comp_exp,
                'suggestions': comp_sug
            }
        ]
        
        # Calculate overall weighted rubric score
        overall_score = sum(d['score'] * d['weight'] for d in dimensions)
        overall_score = max(10.0, min(100.0, overall_score))
        
        verdict = cls._determine_verdict(overall_score)
        summary = cls._generate_summary(overall_score, dimensions, matches)
        
        return {
            'overall_score': round(overall_score, 1),
            'verdict': verdict,
            'summary': summary,
            'rubric_version': 'rubric-v2.0-deterministic',
            'dimensions': dimensions,
            'matches': matches
        }

    @classmethod
    def _extract_job_requirements(cls, job_text: str, custom_skills: List[str] = None) -> List[Dict[str, Any]]:
        requirements = []
        seen = set()
        
        # Common skill tokens
        combined_tech = set(ScoringRubric.COMMON_TECH_DICTIONARY)
        if custom_skills:
            for s in custom_skills:
                combined_tech.add(s.lower().strip())
                
        lower_job = job_text.lower()
        for tech in combined_tech:
            pattern = r'\b' + re.escape(tech) + r'\b'
            if re.search(pattern, lower_job):
                if tech not in seen:
                    seen.add(tech)
                    requirements.append({
                        'text': f"Hands-on proficiency with {tech.title()}",
                        'token': tech,
                        'category': 'technical_skill',
                        'importance': 'critical' if tech in ['python', 'react', 'typescript', 'aws', 'docker', 'sql'] else 'high'
                    })
                    
        # Extract lines resembling qualifications (e.g., "3+ years of experience", "Bachelor's degree")
        lines = [line.strip() for line in job_text.split('\n') if len(line.strip()) > 15]
        for line in lines:
            if re.search(r'(?:experience with|bachelor|degree|proficiency in|understanding of|proven track record|familiarity with)', line, re.IGNORECASE):
                cleaned_line = re.sub(r'^[•\-\*\d\.\s]+', '', line).strip()
                if cleaned_line.lower() not in seen and len(cleaned_line) < 140:
                    seen.add(cleaned_line.lower())
                    category = 'qualification' if re.search(r'degree|bachelor|master|year', cleaned_line, re.I) else 'experience'
                    requirements.append({
                        'text': cleaned_line,
                        'token': cleaned_line,
                        'category': category,
                        'importance': 'high'
                    })

        # Ensure fallback if empty
        if not requirements:
            requirements = [
                {'text': 'Modern software engineering principles and clean code', 'token': 'software engineering', 'category': 'technical_skill', 'importance': 'high'},
                {'text': 'Building full-stack web applications or APIs', 'token': 'api', 'category': 'experience', 'importance': 'high'},
                {'text': 'Relational databases and data modeling', 'token': 'database', 'category': 'technical_skill', 'importance': 'medium'}
            ]
            
        return requirements[:15]  # cap at 15 for concise explainability

    @classmethod
    def _match_requirements(cls, resume_text: str, requirements: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        matches = []
        lower_resume = resume_text.lower()
        lines = [l.strip() for l in resume_text.split('\n') if l.strip()]

        for req in requirements:
            token = req.get('token', '').lower()
            token_pattern = r'\b' + re.escape(token) + r'\b'
            
            # Find evidence line
            evidence_line = ""
            for line in lines:
                if re.search(token_pattern, line, re.IGNORECASE):
                    evidence_line = line
                    break
                    
            if not evidence_line and token in lower_resume:
                # Fallback search window
                idx = lower_resume.find(token)
                start = max(0, idx - 40)
                end = min(len(resume_text), idx + 60)
                evidence_line = f"...{resume_text[start:end].strip()}..."

            if evidence_line:
                # Check depth of evidence (has metric or action verb)
                has_metric = bool(re.search(r'\d+%|\$\d+|\b\d+\s*(?:users|ms|req|stars|x|downloads|team|services)\b', evidence_line, re.I))
                status = 'met' if has_metric or len(evidence_line) > 30 else 'partially_met'
                confidence = 0.95 if status == 'met' else 0.80
                suggestion = (
                    "Solid evidence found. Consider emphasizing business impact or scale metrics."
                    if status == 'met'
                    else f"Mentioned '{token}', but lacks detail. Add a bullet point highlighting a concrete project or architecture challenge where you leveraged {token}."
                )
            else:
                # Check for semantically related synonyms
                synonyms = {
                    'react': ['next.js', 'vue', 'frontend'],
                    'postgresql': ['sql', 'postgres', 'relational database'],
                    'aws': ['cloud', 'gcp', 'azure', 'serverless'],
                    'docker': ['container', 'kubernetes', 'containers'],
                    'typescript': ['javascript', 'typed']
                }
                related_found = False
                for syn in synonyms.get(token, []):
                    if syn in lower_resume:
                        status = 'partially_met'
                        confidence = 0.70
                        evidence_line = f"Related experience with '{syn}' identified in profile."
                        suggestion = f"Your resume demonstrates related competence with '{syn}'. Highlight explicitly where {token} applies."
                        related_found = True
                        break
                        
                if not related_found:
                    status = 'missing'
                    confidence = 0.90
                    suggestion = f"No direct evidence for '{req['text']}' was discovered. Add a project, coursework, or practical achievement demonstrating this competency."

            matches.append({
                'requirement_text': req['text'],
                'category': req['category'],
                'importance': req['importance'],
                'match_status': status,
                'evidence_text': evidence_line if evidence_line else "No direct evidence found in resume text.",
                'confidence': confidence,
                'suggestion': suggestion
            })

        return matches

    @classmethod
    def _score_tech_skills(cls, resume_text: str, reqs: List[Dict], matches: List[Dict]) -> Tuple[float, str, List[str]]:
        tech_matches = [m for m in matches if m['category'] == 'technical_skill']
        if not tech_matches:
            tech_matches = matches
            
        met = sum(1 for m in tech_matches if m['match_status'] == 'met')
        partial = sum(1 for m in tech_matches if m['match_status'] == 'partially_met')
        total = max(1, len(tech_matches))
        
        ratio = (met * 1.0 + partial * 0.5) / total
        score = min(100.0, max(20.0, ratio * 100))
        
        explanation = f"Matched {met} of {total} identified technical skills with strong evidence, plus {partial} partial matches."
        suggestions = []
        for m in tech_matches:
            if m['match_status'] in ['missing', 'partially_met'] and len(suggestions) < 3:
                suggestions.append(m['suggestion'])
        return score, explanation, suggestions

    @classmethod
    def _score_qualifications(cls, resume_text: str, job_text: str, matches: List[Dict]) -> Tuple[float, str, List[str]]:
        qual_matches = [m for m in matches if m['category'] in ['qualification', 'experience']]
        if not qual_matches:
            qual_matches = matches[:4]
            
        met = sum(1 for m in qual_matches if m['match_status'] == 'met')
        partial = sum(1 for m in qual_matches if m['match_status'] == 'partially_met')
        total = max(1, len(qual_matches))
        
        ratio = (met * 1.0 + partial * 0.6) / total
        score = min(100.0, max(25.0, ratio * 100))
        
        explanation = f"Evaluated core qualifications and experience prerequisites ({met}/{total} verified)."
        suggestions = ["Review role qualification requirements and align project scopes with expected seniority."]
        return score, explanation, suggestions

    @classmethod
    def _score_project_evidence(cls, resume_text: str, sections: Dict) -> Tuple[float, str, List[str]]:
        project_text = sections.get('projects', '') or resume_text
        has_github = bool(re.search(r'github\.com|gitlab\.com|bitbucket\.org', resume_text, re.I))
        has_demo = bool(re.search(r'https?://[a-zA-Z0-9\-\.]+\.(?:app|dev|io|com|vercel|netlify)', resume_text, re.I))
        bullet_count = len(re.findall(r'[•\-\*]', project_text))
        
        base_score = 50.0
        if has_github:
            base_score += 15.0
        if has_demo:
            base_score += 15.0
        if bullet_count >= 6:
            base_score += 15.0
        elif bullet_count >= 2:
            base_score += 8.0
            
        score = min(100.0, base_score)
        explanation = f"Assessed project portfolio depth. Found {bullet_count} project bullet indicators, {'GitHub repo links,' if has_github else 'missing repo links,'} and {'live deployment URLs.' if has_demo else 'missing live links.'}"
        suggestions = []
        if not has_github:
            suggestions.append("Include clickable GitHub or repository links for your top technical projects.")
        if not has_demo:
            suggestions.append("Provide live demonstration or staging URLs to verify working deployments.")
        return score, explanation, suggestions

    @classmethod
    def _score_experience_impact(cls, resume_text: str, sections: Dict) -> Tuple[float, str, List[str]]:
        exp_text = sections.get('experience', '') or resume_text
        action_verb_count = sum(1 for verb in ScoringRubric.ACTION_VERBS if re.search(r'\b' + verb + r'\b', exp_text, re.I))
        
        score = min(100.0, max(30.0, 40.0 + (action_verb_count * 5.0)))
        explanation = f"Detected {action_verb_count} high-impact leadership and technical action verbs across experience statements."
        suggestions = [
            "Start every bullet with strong action verbs (e.g. 'Architected', 'Engineered', 'Optimized') rather than passive phrasing ('Responsible for')."
        ]
        return score, explanation, suggestions

    @classmethod
    def _score_achievement_specificity(cls, resume_text: str) -> Tuple[float, str, List[str]]:
        # Metrics: percentages, currency, latency, users, counts
        metrics = re.findall(r'(?:\d+%\s*|\$\d+(?:,\d+)*(?:\.\d+)?|\b\d+\+?\s*(?:users|ms|req|requests|queries|seconds|x|million|k|stars)\b)', resume_text, re.I)
        metric_count = len(metrics)
        
        score = min(100.0, max(30.0, 35.0 + (metric_count * 10.0)))
        explanation = f"Identified {metric_count} quantitative proof points (percentages, latency, throughput, or scale indicators)."
        suggestions = [
            "Quantify technical outcomes using the Google XYZ formula: 'Accomplished [X] as measured by [Y], by doing [Z]'."
        ]
        return score, explanation, suggestions

    @classmethod
    def _score_readability_structure(cls, resume_text: str, sections: Dict) -> Tuple[float, str, List[str]]:
        word_count = len(resume_text.split())
        detected_sections = sum(1 for k, v in sections.items() if v and k != 'body')
        
        score = 60.0
        if 300 <= word_count <= 800:
            score += 25.0
        elif word_count > 1200:
            score -= 15.0
            
        if detected_sections >= 3:
            score += 15.0
            
        score = min(100.0, max(30.0, score))
        explanation = f"Document contains {word_count} words across {detected_sections} structured sections with clear visual scanability."
        suggestions = ["Ensure concise 1-2 page layout with crisp bullet points under 3 lines each."]
        return score, explanation, suggestions

    @classmethod
    def _score_terminology_alignment(cls, resume_text: str, job_text: str) -> Tuple[float, str, List[str]]:
        job_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', job_text.lower()))
        resume_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', resume_text.lower()))
        overlap = job_words.intersection(resume_words)
        
        ratio = len(overlap) / max(1, len(job_words))
        score = min(100.0, max(35.0, ratio * 200.0))
        
        explanation = f"Shared domain terminology overlap is {round(ratio * 100, 1)}% across core technical vocabulary."
        suggestions = ["Review target job description keywords and naturally weave relevant domain terms into project summaries."]
        return score, explanation, suggestions

    @classmethod
    def _score_evidence_quality(cls, resume_text: str) -> Tuple[float, str, List[str]]:
        has_links = bool(re.search(r'https?://|www\.', resume_text))
        has_metrics = bool(re.search(r'\d+%', resume_text))
        
        score = 50.0 + (25.0 if has_links else 0.0) + (25.0 if has_metrics else 0.0)
        explanation = f"Evidence quality based on external verification anchors (links, public artifacts, verified metrics)."
        suggestions = ["Add links to published documentation, npm packages, technical blog writeups, or production sites."]
        return score, explanation, suggestions

    @classmethod
    def _score_completeness(cls, resume_text: str, matches: List[Dict]) -> Tuple[float, str, List[str]]:
        missing_count = sum(1 for m in matches if m['match_status'] == 'missing')
        total = max(1, len(matches))
        score = max(20.0, 100.0 - ((missing_count / total) * 75.0))
        
        explanation = f"{total - missing_count} of {total} target role expectations addressed in the profile."
        suggestions = ["Address missing high-importance requirements in your next version iteration."]
        return score, explanation, suggestions

    @classmethod
    def _determine_verdict(cls, overall_score: float) -> str:
        if overall_score >= 85.0:
            return "Elite Alignment"
        elif overall_score >= 75.0:
            return "Strong Alignment"
        elif overall_score >= 60.0:
            return "Moderate Fit"
        else:
            return "Readiness Gap"

    @classmethod
    def _generate_summary(cls, overall_score: float, dimensions: List[Dict], matches: List[Dict]) -> str:
        missing = [m['requirement_text'] for m in matches if m['match_status'] == 'missing']
        strongest = max(dimensions, key=lambda d: d['score'])
        weakest = min(dimensions, key=lambda d: d['score'])
        
        summary = (
            f"Overall rubric score of {round(overall_score, 1)}/100 based on standard deterministic evaluation. "
            f"Strongest area is {strongest['name']} ({strongest['score']}/100), while primary opportunity for growth "
            f"is {weakest['name']} ({weakest['score']}/100). "
        )
        if missing:
            summary += f"Missing {len(missing)} requirements from target role profile: {', '.join(missing[:3])}."
        else:
            summary += "All primary technical requirements have at least partial supporting evidence."
            
        return summary
