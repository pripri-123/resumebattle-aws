import React, { useState, useEffect } from 'react';
import {
  Target,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  Filter,
  Check,
  ChevronRight,
  FileCheck2,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CareerMission } from '../types';

export const CareerQuestPage: React.FC = () => {
  const [missions, setMissions] = useState<CareerMission[]>([]);
  const [stats, setStats] = useState<any>({ total: 0, completed: 0, points_earned: 0 });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Complete Mission Modal
  const [activeMission, setActiveMission] = useState<CareerMission | null>(null);
  const [evidenceText, setEvidenceText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const loadMissions = async () => {
    try {
      const res = await api.getMissions(statusFilter);
      setMissions(res.missions);
      setStats(res.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, [statusFilter]);

  const handleStartMission = async (id: string) => {
    try {
      await api.startMission(id);
      toast('Mission started! Document your evidence as you progress.', 'info');
      loadMissions();
    } catch (err: any) {
      toast(err.message || 'Failed to start mission.', 'error');
    }
  };

  const handleCompleteMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMission) return;
    setSubmitting(true);
    try {
      await api.completeMission(activeMission.id, { evidence: evidenceText });
      toast(`Mission accomplished! +${activeMission.points} points awarded.`, 'success');
      setActiveMission(null);
      setEvidenceText('');
      loadMissions();
    } catch (err: any) {
      toast(err.message || 'Failed to complete mission.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Target className="w-6 h-6 text-brand-violet" />
            Career Quest
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Actionable learning missions generated from missing rubric qualifications
          </p>
        </div>

        {/* Total Points Display */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white-surface border border-white-border flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-gray-400">Total Points:</span>
            <span className="text-base font-extrabold font-mono text-amber-300">
              {stats?.points_earned || 0} pts
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'in_progress', 'available', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
              statusFilter === tab
                ? 'bg-brand-violet text-white shadow-md'
                : 'bg-white-surface text-gray-400 hover:text-white border border-white-border'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`p-6 rounded-2xl bg-white-surface border flex flex-col justify-between transition-all ${
              mission.status === 'completed'
                ? 'border-emerald-500/30'
                : mission.status === 'in_progress'
                ? 'border-brand-violet/50 shadow-lg shadow-violet-950/20'
                : 'border-white-border'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                  mission.difficulty === 'Hard'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    : mission.difficulty === 'Medium'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {mission.difficulty}
                </span>

                <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1">
                  +{mission.points} pts
                </span>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight leading-snug mb-2">
                {mission.title}
              </h3>

              <div className="text-xs font-medium text-brand-cyan mb-3">
                Target Competency: {mission.skill_gap}
              </div>

              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                {mission.description}
              </p>

              {/* Acceptance Criteria Box */}
              <div className="p-3 rounded-xl bg-white-card border border-white-border text-xs text-gray-300 mb-4 whitespace-pre-line leading-relaxed font-mono text-[11px]">
                <span className="block text-[10px] font-sans font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Completion Criteria
                </span>
                {mission.criteria}
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Progress</span>
                  <span className="font-mono">{mission.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white-bg overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      mission.status === 'completed' ? 'bg-emerald-400' : 'bg-brand-violet'
                    }`}
                    style={{ width: `${mission.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-3 border-t border-white-border/60">
              {mission.status === 'completed' ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Accomplished
                </div>
              ) : mission.status === 'in_progress' ? (
                <button
                  onClick={() => {
                    setActiveMission(mission);
                    setEvidenceText(mission.submitted_evidence || '');
                  }}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4" /> Submit Evidence & Complete
                </button>
              ) : (
                <button
                  onClick={() => handleStartMission(mission.id)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <span>Start Mission</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion Modal */}
      {activeMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white-surface border border-white-border rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Submit Mission Evidence</h3>
            <p className="text-xs text-gray-400 mb-4">{activeMission.title}</p>

            <form onSubmit={handleCompleteMission} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Describe Your Implementation & Provide Proof (GitHub links, commit hashes, or resume bullet)
                </label>
                <textarea
                  rows={5}
                  required
                  value={evidenceText}
                  onChange={(e) => setEvidenceText(e.target.value)}
                  placeholder="e.g. Implemented S3StorageService with private bucket encryption. Added automated unit tests in test_storage.py and updated resume bullet..."
                  className="w-full p-3.5 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white-border">
                <button
                  type="button"
                  onClick={() => setActiveMission(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Verifying...' : 'Claim Points & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
