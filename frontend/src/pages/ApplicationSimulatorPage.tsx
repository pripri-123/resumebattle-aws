import React, { useState, useEffect } from 'react';
import {
  MessageSquareCode,
  Send,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Award,
  Layers,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { InterviewSession, InterviewQuestion } from '../types';

export const ApplicationSimulatorPage: React.FC = () => {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Simulation Setup
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [sessionType, setSessionType] = useState('full_simulation');
  const [startingSession, setStartingSession] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [sessionsRes, jobsRes] = await Promise.all([
        api.getInterviewSessions(),
        api.getJobs()
      ]);
      setSessions(sessionsRes.sessions);
      setJobs(jobsRes.jobs);
      if (jobsRes.jobs.length > 0) {
        setSelectedJobId(jobsRes.jobs[0].id);
      }
      if (sessionsRes.sessions.length > 0 && sessionsRes.sessions[0].status === 'in_progress') {
        const fullSession = await api.getInterviewSession(sessionsRes.sessions[0].id);
        setActiveSession(fullSession.session);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStartSimulation = async () => {
    setStartingSession(true);
    try {
      const res = await api.startInterview({
        job_description_id: selectedJobId,
        session_type: sessionType
      });
      setActiveSession(res.session);
      setCurrentQuestionIndex(0);
      setUserAnswer('');
      toast('Interview simulation started! Answer each prompt thoroughly.', 'success');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to start interview.', 'error');
    } finally {
      setStartingSession(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeSession || !activeSession.questions || activeSession.questions.length === 0) return;
    const currentQ = activeSession.questions[currentQuestionIndex];
    if (!userAnswer.trim()) {
      toast('Please type your response before submitting.', 'warning');
      return;
    }

    setSubmittingAnswer(true);
    try {
      await api.submitAnswer(activeSession.id, {
        question_id: currentQ.id,
        answer: userAnswer
      });
      toast('Answer scored with rubric feedback!', 'success');
      // Refresh current session
      const refreshed = await api.getInterviewSession(activeSession.id);
      setActiveSession(refreshed.session);
      setUserAnswer('');
    } catch (err: any) {
      toast(err.message || 'Failed to submit answer.', 'error');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!activeSession) return;
    try {
      const res = await api.completeInterviewSession(activeSession.id);
      toast('Interview simulation finalized!', 'success');
      setActiveSession(res.session);
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to complete session.', 'error');
    }
  };

  const questions = activeSession?.questions || [];
  const activeQuestion: InterviewQuestion | undefined = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <MessageSquareCode className="w-6 h-6 text-brand-violet" />
            Application Simulator
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Grounded technical & behavioral mock interview simulations with structured rubric evaluations
          </p>
        </div>

        {activeSession && activeSession.status === 'in_progress' && (
          <button
            onClick={handleCompleteSession}
            className="px-4 py-2 rounded-xl bg-white-card hover:bg-white-hover border border-white-border text-xs font-semibold text-gray-200 transition-colors"
          >
            Finish & Summarize Session
          </button>
        )}
      </div>

      {/* Simulator Interface */}
      {activeSession ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question & Response View (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Info Bar */}
            <div className="p-4 rounded-2xl bg-white-surface border border-white-border flex items-center justify-between">
              <div className="text-xs">
                <span className="text-gray-400">Target Role: </span>
                <strong className="text-white">{activeSession.job_title}</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  activeSession.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-violet/20 text-violet-300'
                }`}>
                  {activeSession.status === 'completed' ? 'Completed' : 'Live'}
                </span>
              </div>
            </div>

            {/* Question Card */}
            {activeQuestion && (
              <div className="p-6 rounded-2xl bg-white-surface border border-white-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-violet/20 text-violet-300 border border-brand-violet/30">
                    {activeQuestion.question_type} Interview Prompt
                  </span>
                  {activeQuestion.context_note && (
                    <span className="text-[11px] text-gray-400">{activeQuestion.context_note}</span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {activeQuestion.question_text}
                </h3>

                {/* Expected rubrics */}
                {activeQuestion.expected_points && activeQuestion.expected_points.length > 0 && (
                  <div className="p-3 rounded-xl bg-white-card border border-white-border/80 text-xs">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                      Key Evaluation Criteria
                    </span>
                    <ul className="space-y-1 text-gray-300 text-[11px]">
                      {activeQuestion.expected_points.map((pt, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* User Response Area */}
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Your Response:
                  </label>
                  {activeQuestion.score != null ? (
                    <div className="p-4 rounded-xl bg-white-bg border border-white-border text-xs text-gray-200 leading-relaxed">
                      {activeQuestion.user_answer}
                    </div>
                  ) : (
                    <textarea
                      rows={5}
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type your structured answer here. Mention specific technologies, architectural trade-offs, and measurable results..."
                      className="w-full p-3.5 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet leading-relaxed"
                    />
                  )}
                </div>

                {/* Submit or Feedback */}
                {activeQuestion.score != null ? (
                  <div className="p-4 rounded-xl bg-white-card border border-white-border space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Candidate Score:
                      </span>
                      <span className="text-base font-extrabold font-mono text-brand-cyan">
                        {activeQuestion.score} / 100
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {activeQuestion.feedback}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submittingAnswer || !userAnswer.trim()}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingAnswer ? 'Evaluating Answer...' : 'Submit Response for Evaluation'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Question Selector Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setUserAnswer(q.user_answer || '');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    currentQuestionIndex === idx
                      ? 'bg-brand-violet text-white shadow-md'
                      : q.score != null
                      ? 'bg-white-card text-emerald-400 border border-emerald-500/30'
                      : 'bg-white-surface text-gray-400 hover:text-white border border-white-border'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  {q.score != null && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Preparation Checklist & Summary Sidebar (Right col) */}
          <div className="space-y-6">
            {/* Overall Score Summary */}
            {activeSession.overall_score != null && (
              <div className="p-5 rounded-2xl bg-white-surface border border-white-border text-center">
                <span className="text-xs text-gray-400 uppercase font-semibold">Simulation Composite Score</span>
                <div className="text-4xl font-extrabold font-mono text-emerald-400 mt-1">
                  {activeSession.overall_score} <span className="text-xs font-sans text-gray-500">/ 100</span>
                </div>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                  {activeSession.summary}
                </p>
              </div>
            )}

            {/* Preparation Checklist */}
            <div className="p-5 rounded-2xl bg-white-surface border border-white-border">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Preparation Checklist
              </h4>
              <div className="space-y-2.5">
                {activeSession.checklist.map((item) => (
                  <div key={item.id} className="p-2.5 rounded-xl bg-white-card border border-white-border text-xs text-gray-300 flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-brand-cyan/20 text-brand-cyan flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="leading-relaxed">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveSession(null)}
              className="w-full py-2.5 rounded-xl bg-white-surface hover:bg-white-hover border border-white-border text-xs text-gray-300 font-semibold"
            >
              Start New Simulation
            </button>
          </div>
        </div>
      ) : (
        /* Launch Setup Screen */
        <div className="max-w-xl mx-auto p-8 rounded-2xl bg-white-surface border border-white-border text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-violet-500/20">
            <MessageSquareCode className="w-6 h-6" />
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Launch Role Simulation</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-6 leading-relaxed">
            Generate role-specific mock interview questions derived directly from your target job description and resume achievements.
          </p>

          <div className="space-y-4 text-left mb-6">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Target Job Description</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Simulation Type</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet"
              >
                <option value="full_simulation">Full Simulation (Technical, Architectural, Behavioral)</option>
                <option value="technical_deep_dive">Technical Deep Dive & Code Questions</option>
                <option value="behavioral_star">Behavioral & Project Leadership (STAR)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartSimulation}
            disabled={startingSession}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-950/50 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{startingSession ? 'Generating Simulation...' : 'Launch Mock Interview'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
