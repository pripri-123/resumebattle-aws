export interface User {
  id: string;
  email: string;
  username: string;
  full_name: string;
  target_role: string;
  is_admin: boolean;
  is_demo: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  years_experience: number;
  preferred_location?: string;
  privacy_mode: string;
  data_retention_days: number;
  preferences?: Record<string, any>;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  version_name: string;
  target_role: string;
  notes?: string;
  is_preferred: boolean;
  content_length: number;
  created_at: string;
}

export interface Resume {
  id: string;
  title: string;
  target_role: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  processing_status: string;
  error_message?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  version_count: number;
  extracted_text?: string;
  versions?: ResumeVersion[];
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  role_category: string;
  experience_level: string;
  raw_text: string;
  required_skills: string[];
  preferred_skills: string[];
  is_sample: boolean;
  created_at: string;
}

export interface AnalysisDimension {
  id: string;
  dimension_key: string;
  dimension_name: string;
  score: number;
  max_score: number;
  weight: number;
  explanation: string;
  suggestions: string[];
}

export interface RequirementMatch {
  id: string;
  requirement_text: string;
  category: string;
  importance: 'critical' | 'high' | 'medium' | 'preferred';
  match_status: 'met' | 'partially_met' | 'missing' | 'requires_review';
  evidence_text: string;
  confidence: number;
  suggestion: string;
}

export interface ResumeAnalysis {
  id: string;
  resume_id: string;
  job_title: string;
  job_company: string;
  overall_score: number;
  rubric_version: string;
  ai_provider: string;
  summary_text: string;
  verdict: string;
  created_at: string;
  dimensions?: AnalysisDimension[];
  matches?: RequirementMatch[];
}

export interface BattleResult {
  battle_id: string;
  resume_a: {
    id: string;
    title: string;
    score: number;
    verdict: string;
    dimensions: AnalysisDimension[];
    matches: RequirementMatch[];
  };
  resume_b: {
    id: string;
    title: string;
    score: number;
    verdict: string;
    dimensions: AnalysisDimension[];
    matches: RequirementMatch[];
  };
  winner_id: string | null;
  winner_title: string;
  explanation: string;
  dimension_comparison: {
    key: string;
    name: string;
    score_a: number;
    score_b: number;
    delta: number;
    leader: 'A' | 'B' | 'Tie';
    suggestions_a: string[];
    suggestions_b: string[];
  }[];
}

export interface CareerSkill {
  id: string;
  name: string;
  category: string;
  proficiency_level: string;
  status: string;
  verified: boolean;
  source: string;
  evidence_count: number;
  evidence?: {
    id: string;
    evidence_type: string;
    title: string;
    description: string;
    verification_status: string;
  }[];
}

export interface CareerMission {
  id: string;
  title: string;
  description: string;
  skill_gap: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimated_duration: string;
  criteria: string;
  points: number;
  status: 'available' | 'in_progress' | 'completed';
  progress: number;
  related_dimension: string;
  submitted_evidence?: string;
  completed_at?: string;
}

export interface InterviewQuestion {
  id: string;
  question_text: string;
  question_type: string;
  context_note?: string;
  expected_points: string[];
  order_idx: number;
  user_answer?: string;
  score?: number;
  feedback?: string;
  rubric_breakdown?: Record<string, number>;
}

export interface InterviewSession {
  id: string;
  job_title: string;
  session_type: string;
  status: 'in_progress' | 'completed';
  overall_score?: number;
  summary?: string;
  checklist: { id: number; text: string; done: boolean }[];
  question_count: number;
  questions?: InterviewQuestion[];
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  repo_url?: string;
  demo_url?: string;
  role: string;
  challenges?: string;
  decisions?: string;
  outcomes?: string;
  completeness_score: number;
  suggested_bullets: string[];
  potential_questions: string[];
  created_at: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  role_category: string;
  description: string;
  difficulty: string;
  criteria: string[];
  participant_count: number;
  created_at: string;
}

export interface CommunitySubmission {
  id: string;
  challenge_id: string;
  anonymous_handle: string;
  rubric_score: number;
  feedback_count: number;
  badge: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: 'info' | 'success' | 'warning' | 'arena';
  is_read: boolean;
  link_url?: string;
  created_at: string;
}
