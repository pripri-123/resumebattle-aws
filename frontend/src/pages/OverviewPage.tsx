import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Swords,
  Dna,
  Target,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  AlertCircle,
  Award,
  ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DimensionRadar } from '../components/DimensionRadar';
import { EmptyState } from '../components/EmptyState';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [insightsRes, resumesRes, missionsRes, historyRes] = await Promise.all([
          api.getInsights(),
          api.getResumes(),
          api.getMissions(),
          api.getAnalysisHistory()
        ]);

        setInsights(insightsRes.insights);
        setResumes(resumesRes.resumes);
        setMissions(missionsRes.missions);

        if (historyRes.history && historyRes.history.length > 0) {
          // fetch full details for latest analysis
          const fullLatest = await api.getAnalysis(historyRes.history[0].id);
          setLatestAnalysis(fullLatest.analysis);
        }
      } catch (err) {
        console.error('Error loading dashboard overview:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOverviewData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-violet border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400 font-mono">Loading Arena Telemetry...</span>
        </div>
      </div>
    );
  }

  // If brand new user with 0 resumes
  const hasData = resumes.length > 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-dark-surface via-dark-card to-dark-surface border border-white-border p-6 sm:p-8">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-violet/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/10 border border-brand-violet/30 text-xs text-violet-300 font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Target Role: {user?.target_role || 'Full Stack Engineer'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || user?.username}!
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1.5 leading-relaxed">
            Your career readiness index is calculated from verifiable resume evidence, documented projects, and completed missions against current role standards.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <NavLink
            to="/app/resume-arena"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white text-xs font-bold shadow-lg shadow-violet-950/40 hover:opacity-95 transition-opacity flex items-center gap-2"
          >
            <Swords className="w-4 h-4" /> Go to Resume Arena
          </NavLink>
          <NavLink
            to="/app/career-quest"
            className="px-4 py-2.5 rounded-xl bg-white-card hover:bg-white-hover border border-white-border text-gray-200 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Target className="w-4 h-4 text-brand-cyan" /> Active Missions ({missions.filter(m => m.status === 'in_progress').length})
          </NavLink>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Readiness Index */}
        <div className="p-5 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
              <span>Readiness Index</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              {insights?.readiness_index ? `${insights.readiness_index}%` : 'N/A'}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Weighted rubric & verified skills
          </div>
        </div>

        {/* Card 2: Latest Evaluation */}
        <div className="p-5 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
              <span>Latest Rubric Score</span>
              <Award className="w-4 h-4 text-brand-cyan" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono mt-1 flex items-baseline gap-2">
              {latestAnalysis ? latestAnalysis.overall_score : '—'}
              {latestAnalysis && <span className="text-xs text-gray-500 font-sans font-normal">/ 100</span>}
            </div>
          </div>
          <div className="text-[11px] text-brand-cyan font-medium mt-3">
            {latestAnalysis?.verdict || 'Upload resume to evaluate'}
          </div>
        </div>

        {/* Card 3: Career DNA Skills */}
        <div className="p-5 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
              <span>Career DNA Skills</span>
              <Dna className="w-4 h-4 text-brand-violet" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono mt-1">
              {insights?.skills_count || 0}
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-3">
            <span className="text-emerald-400 font-semibold">{insights?.verified_skills_count || 0}</span> verified with project evidence
          </div>
        </div>

        {/* Card 4: Missions Accomplished */}
        <div className="p-5 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-1">
              <span>Mission Points</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono mt-1 text-amber-300">
              {insights?.missions_stats?.points_earned || 0} <span className="text-xs text-gray-500 font-sans">pts</span>
            </div>
          </div>
          <div className="text-[11px] text-gray-400 mt-3">
            {insights?.missions_stats?.completed || 0} of {insights?.missions_stats?.total || 0} completed
          </div>
        </div>
      </div>

      {/* Main Grid: Radar Analysis & Score History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dimension Radar */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white-surface border border-white-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Rubric Alignment Radar</h3>
              <p className="text-xs text-gray-400">9-dimensional deterministic evaluation for {latestAnalysis?.job_title || 'Target Role'}</p>
            </div>
            {latestAnalysis && (
              <NavLink
                to="/app/resume-arena"
                className="text-xs text-brand-cyan hover:underline font-medium flex items-center gap-1"
              >
                Inspect Rubric <ChevronRight className="w-3.5 h-3.5" />
              </NavLink>
            )}
          </div>

          {latestAnalysis?.dimensions && latestAnalysis.dimensions.length > 0 ? (
            <DimensionRadar dimensions={latestAnalysis.dimensions} />
          ) : (
            <EmptyState
              icon={Swords}
              title="No Evaluation Run Yet"
              description="Upload your resume in the Resume Arena to generate an explainable 9-dimension rubric assessment."
              actionText="Go to Resume Arena"
              onAction={() => window.location.href = '/app/resume-arena'}
            />
          )}
        </div>

        {/* Right: Score Trend / Progress */}
        <div className="p-6 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white tracking-tight">Readiness Trend</h3>
              <span className="text-[10px] font-mono text-gray-400 bg-white-bg px-2 py-0.5 rounded border border-white-border">Recent</span>
            </div>

            {insights?.score_trend && insights.score_trend.length > 1 ? (
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={insights.score_trend}>
                    <defs>
                      <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis domain={[40, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111726',
                        borderColor: '#1f2b47',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#scoreColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-gray-500">
                Multiple evaluation runs will display your rubric progression timeline here.
              </div>
            )}

            {/* Quick insights callout */}
            <div className="mt-4 p-3.5 rounded-xl bg-white-card border border-white-border/80 text-xs">
              <div className="font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-brand-cyan" /> Next Priority
              </div>
              <p className="text-gray-400 text-[11px] leading-relaxed">
                {insights?.top_missing_requirements?.[0]
                  ? `Address missing qualification: "${insights.top_missing_requirements[0].requirement}".`
                  : 'Complete an active learning mission or link project code to strengthen Career DNA.'}
              </p>
            </div>
          </div>

          <NavLink
            to="/app/version-lab"
            className="mt-4 w-full py-2.5 rounded-xl bg-white-card hover:bg-white-hover border border-white-border text-center text-xs font-semibold text-gray-300 transition-colors block"
          >
            Compare Resume Versions
          </NavLink>
        </div>
      </div>

      {/* Bottom Grid: Active Missions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Learning Missions */}
        <div className="p-6 rounded-2xl bg-white-surface border border-white-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Active Learning Missions</h3>
              <p className="text-xs text-gray-400">Targeted actions to improve your rubric score</p>
            </div>
            <NavLink to="/app/career-quest" className="text-xs text-brand-cyan hover:underline font-medium">
              View All
            </NavLink>
          </div>

          <div className="space-y-3">
            {missions.slice(0, 3).map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl bg-white-card border border-white-border/80 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-200 truncate">{m.title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 truncate">{m.skill_gap}</div>
                  <div className="w-36 h-1.5 rounded-full bg-white-bg mt-2 overflow-hidden">
                    <div
                      className={`h-full ${m.status === 'completed' ? 'bg-emerald-400' : 'bg-brand-violet'}`}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-amber-300 font-mono">+{m.points} pts</span>
                  <div className="mt-1">
                    <NavLink
                      to="/app/career-quest"
                      className="text-[11px] text-brand-cyan hover:underline font-medium"
                    >
                      {m.status === 'completed' ? 'Review' : 'Continue'}
                    </NavLink>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Battle Arena Shortcut */}
        <div className="p-6 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-brand-violet font-semibold text-xs uppercase tracking-wider">
              <Swords className="w-4 h-4" /> Version Battle Arena
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-2">
              Ready to pit your resume versions against each other?
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Compare your Core Full Stack resume against specialized cloud or backend versions. See exact dimension deltas and find out which version performs better against target job descriptions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-r from-brand-violet/20 to-brand-cyan/20 border border-brand-violet/40 flex items-center justify-between">
            <div className="text-xs">
              <div className="font-bold text-white">Resume A vs Resume B</div>
              <div className="text-gray-400 text-[11px]">Instant side-by-side rubric battle</div>
            </div>
            <NavLink
              to="/app/resume-arena"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
            >
              Start Battle
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
