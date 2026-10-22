import React, { useState, useEffect } from 'react';
import {
  Trophy,
  ShieldCheck,
  Award,
  Users,
  Swords,
  Sparkles,
  Lock,
  ChevronRight,
  Flame,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CommunityChallenge, CommunitySubmission } from '../types';

export const BattleLeaguePage: React.FC = () => {
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<CommunitySubmission[]>([]);
  const [userRank, setUserRank] = useState<CommunitySubmission | null>(null);
  const [loading, setLoading] = useState(true);

  // Enter Challenge Modal
  const [selectedChallenge, setSelectedChallenge] = useState<CommunityChallenge | null>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [anonymousHandle, setAnonymousHandle] = useState('');
  const [entering, setEntering] = useState(false);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [chalRes, leadRes, resRes] = await Promise.all([
        api.getChallenges(),
        api.getLeaderboard(),
        api.getResumes()
      ]);
      setChallenges(chalRes.challenges);
      setLeaderboard(leadRes.leaderboard);
      setUserRank(leadRes.user_rank);
      setResumes(resRes.resumes);
      if (resRes.resumes.length > 0) {
        setSelectedResumeId(resRes.resumes[0].id);
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

  const handleEnterChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge || !selectedResumeId) return;
    setEntering(true);
    try {
      const res = await api.submitToChallenge(selectedChallenge.id, {
        resume_id: selectedResumeId,
        anonymous_handle: anonymousHandle
      });
      toast(`Entered Arena as ${res.submission.anonymous_handle}!`, 'success');
      setSelectedChallenge(null);
      setAnonymousHandle('');
      loadData();
    } catch (err: any) {
      toast(err.message || 'Failed to enter league.', 'error');
    } finally {
      setEntering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-brand-violet" />
            Battle League
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Privacy-first anonymous arena challenges, rubric leaderboards, and peer feedback
          </p>
        </div>

        {/* Privacy badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white-surface border border-emerald-500/30 text-xs text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Pseudonymized & Zero Contact Leakage</span>
        </div>
      </div>

      {/* User Standing Banner (if entered) */}
      {userRank && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-violet/20 via-dark-surface to-brand-cyan/20 border border-brand-violet/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-violet/30 border border-brand-violet/40 flex items-center justify-center text-violet-300 font-bold">
              🏆
            </div>
            <div>
              <div className="text-xs text-gray-400">Your Anonymous Arena Standing</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{userRank.anonymous_handle}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-violet/30 text-violet-300">
                  {userRank.badge}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black font-mono text-emerald-400">{userRank.rubric_score}</div>
            <div className="text-[10px] text-gray-400">Rubric Alignment</div>
          </div>
        </div>
      )}

      {/* Main Grid: Challenges & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Challenges (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Active Role Arena Challenges
          </h3>

          <div className="space-y-4">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-2xl bg-white-surface border border-white-border hover:border-brand-violet/40 transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-violet/20 text-violet-300 border border-brand-violet/30">
                      {c.role_category}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5">{c.title}</h4>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono text-brand-cyan flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {c.participant_count} Entrants
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {c.description}
                </p>

                {c.criteria && c.criteria.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.criteria.map((crit, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-white-card border border-white-border text-gray-300">
                        {crit}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-3 border-t border-white-border/60 flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[11px]">Difficulty: {c.difficulty}</span>
                  <button
                    onClick={() => setSelectedChallenge(c)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5"
                  >
                    <Swords className="w-3.5 h-3.5" /> Enter Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Anonymous Leaderboard (Right col) */}
        <div className="p-6 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Arena Leaderboard
              </h3>
              <span className="text-[10px] font-mono text-gray-500">Top Alignments</span>
            </div>

            <div className="divide-y divide-dark-border/60 space-y-2">
              {leaderboard.map((sub, idx) => (
                <div key={sub.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                      idx === 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      idx === 1 ? 'bg-slate-400/20 text-slate-600 border border-slate-400/40' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40' :
                      'text-gray-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-200">{sub.anonymous_handle}</div>
                      <div className="text-[10px] text-brand-violet">{sub.badge}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-white text-sm">{sub.rubric_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-white-card border border-white-border/80 text-[11px] text-gray-400">
            <span className="font-semibold text-gray-300 block mb-0.5">Privacy Principle</span>
            No personal names, contact emails, phone numbers, or uploaded raw PDFs are ever exposed in Battle League rankings.
          </div>
        </div>
      </div>

      {/* Enter Challenge Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white-surface border border-white-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Enter Arena Challenge</h3>
            <p className="text-xs text-gray-400 mb-4">{selectedChallenge.title}</p>

            <form onSubmit={handleEnterChallenge} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Select Resume to Enter</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title} ({r.target_role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Anonymous Gladiator Handle (Optional)
                </label>
                <input
                  type="text"
                  value={anonymousHandle}
                  onChange={(e) => setAnonymousHandle(e.target.value)}
                  placeholder="e.g. AsyncGladiator_42 (Auto-generated if empty)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white-border">
                <button
                  type="button"
                  onClick={() => setSelectedChallenge(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={entering}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {entering ? 'Entering...' : 'Confirm & Enter Arena'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
