import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
  FileText,
  TrendingUp,
  History,
  Layers
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Resume, ResumeVersion } from '../types';

export const VersionLabPage: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  // Create Version Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [contentSnapshot, setContentSnapshot] = useState('');
  const [notes, setNotes] = useState('');
  const [isPreferred, setIsPreferred] = useState(false);
  const [creating, setCreating] = useState(false);

  const { toast } = useToast();

  const loadResumes = async () => {
    try {
      const res = await api.getResumes();
      setResumes(res.resumes);
      if (res.resumes.length > 0) {
        const firstId = selectedResumeId || res.resumes[0].id;
        setSelectedResumeId(firstId);
        const detailed = await api.getResume(firstId);
        setActiveResume(detailed.resume);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleSelectResume = async (id: string) => {
    setSelectedResumeId(id);
    try {
      const detailed = await api.getResume(id);
      setActiveResume(detailed.resume);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVersionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId) return;
    setCreating(true);
    try {
      await api.createResumeVersion(selectedResumeId, {
        version_name: versionName,
        target_role: targetRole || activeResume?.target_role,
        content_snapshot: contentSnapshot || activeResume?.extracted_text,
        notes,
        is_preferred: isPreferred
      });
      toast(`Version "${versionName}" saved!`, 'success');
      setShowCreateModal(false);
      setVersionName('');
      setNotes('');
      // Reload
      handleSelectResume(selectedResumeId);
    } catch (err: any) {
      toast(err.message || 'Failed to create version.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const versions: ResumeVersion[] = activeResume?.versions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <GitCompare className="w-6 h-6 text-brand-violet" />
            Version Lab
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Maintain role-tailored resume iterations with snapshot history and change tracking
          </p>
        </div>

        <button
          onClick={() => {
            setContentSnapshot(activeResume?.extracted_text || '');
            setTargetRole(activeResume?.target_role || '');
            setShowCreateModal(true);
          }}
          disabled={!activeResume}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Create Named Version
        </button>
      </div>

      {/* Selector */}
      <div className="p-4 rounded-2xl bg-white-surface border border-white-border flex items-center gap-4">
        <label className="text-xs font-semibold text-gray-300 shrink-0">Active Resume:</label>
        <select
          value={selectedResumeId}
          onChange={(e) => handleSelectResume(e.target.value)}
          className="max-w-md px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet"
        >
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>{r.title} ({r.target_role})</option>
          ))}
        </select>
      </div>

      {/* Versions List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wider">
          Snapshot Iterations ({versions.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {versions.map((ver, idx) => (
            <div
              key={ver.id}
              className={`p-5 rounded-2xl bg-white-surface border flex flex-col justify-between ${
                ver.is_preferred
                  ? 'border-brand-violet/60 shadow-lg shadow-violet-950/20'
                  : 'border-white-border'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                      {ver.version_name}
                      {ver.is_preferred && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-violet/20 text-violet-300 border border-brand-violet/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> Preferred
                        </span>
                      )}
                    </h4>
                    <span className="text-xs text-brand-cyan">{ver.target_role}</span>
                  </div>

                  <span className="text-[10px] font-mono text-gray-500">
                    {new Date(ver.created_at).toLocaleDateString()}
                  </span>
                </div>

                {ver.notes && (
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed bg-white-card p-2.5 rounded-xl border border-white-border">
                    {ver.notes}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-4 text-[11px] text-gray-400 font-mono">
                  <span>Character count: {ver.content_length}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white-border/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-500">
                  Evaluated in {activeResume?.title}
                </span>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeResume?.extracted_text || '');
                    toast('Version text copied to clipboard.', 'info');
                  }}
                  className="text-brand-cyan hover:underline font-medium text-[11px]"
                >
                  Copy Text
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Version Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white-surface border border-white-border rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-white mb-1">Create Named Version Snapshot</h3>
            <p className="text-xs text-gray-400 mb-4">
              Preserve a specific iteration tailored for an interview or role category.
            </p>

            <form onSubmit={handleCreateVersionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Version Label</label>
                <input
                  type="text"
                  required
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  placeholder="e.g. v2.1 — Cloud Engineering Focus"
                  className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Cloud Infrastructure Engineer"
                  className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Iteration Notes / What changed?</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Emphasized AWS VPC architecture and Kubernetes clusters..."
                  className="w-full p-2.5 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Resume Text Snapshot</label>
                <textarea
                  rows={6}
                  value={contentSnapshot}
                  onChange={(e) => setContentSnapshot(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preferred_check"
                  checked={isPreferred}
                  onChange={(e) => setIsPreferred(e.target.checked)}
                  className="rounded border-white-border text-brand-violet focus:ring-0"
                />
                <label htmlFor="preferred_check" className="text-xs text-gray-300">
                  Set as preferred version for new evaluations
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Save Version'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
