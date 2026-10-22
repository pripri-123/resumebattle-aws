import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Copy,
  Trash2,
  ShieldCheck,
  Code
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Project } from '../types';

export const ProjectProofPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [techInput, setTechInput] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [challenges, setChallenges] = useState('');
  const [decisions, setDecisions] = useState('');
  const [outcomes, setOutcomes] = useState('');

  const { toast } = useToast();

  const loadProjects = async () => {
    try {
      const res = await api.getProjects();
      setProjects(res.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const techs = techInput.split(',').map(t => t.trim()).filter(Boolean);
      await api.createProject({
        title,
        description,
        technologies: techs,
        repo_url: repoUrl,
        demo_url: demoUrl,
        challenges,
        decisions,
        outcomes
      });
      toast(`Project "${title}" added to Project Proof!`, 'success');
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setTechInput('');
      setRepoUrl('');
      setDemoUrl('');
      setChallenges('');
      setDecisions('');
      setOutcomes('');
      loadProjects();
    } catch (err: any) {
      toast(err.message || 'Failed to save project.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProject(id);
      toast('Project removed.', 'info');
      loadProjects();
    } catch (err: any) {
      toast(err.message || 'Delete failed.', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Copied suggested bullet to clipboard!', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-brand-violet" />
            Project Proof
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Technical portfolio profiles anchoring your skills with genuine architectural evidence
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Project Proof
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="p-6 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Title & Completeness Indicator */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">{proj.title}</h3>
                  <div className="text-xs text-gray-400 mt-0.5">{proj.role}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white-card border border-white-border text-xs font-mono font-bold text-brand-cyan">
                    <span>{proj.completeness_score}%</span>
                    <span className="text-[10px] text-gray-400 font-sans font-normal">Complete</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed mt-3">
                {proj.description}
              </p>

              {/* Technologies */}
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {proj.technologies.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-white-bg border border-white-border text-gray-300">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Technical Challenges & Decisions */}
              {(proj.challenges || proj.decisions) && (
                <div className="mt-4 p-3.5 rounded-xl bg-white-card border border-white-border text-xs space-y-2">
                  {proj.challenges && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">Technical Challenge</span>
                      <p className="text-gray-300 text-[11px] leading-relaxed">{proj.challenges}</p>
                    </div>
                  )}
                  {proj.decisions && (
                    <div className="pt-2 border-t border-white-border/50">
                      <span className="text-[10px] uppercase font-bold text-brand-cyan block mb-0.5">Design Decision</span>
                      <p className="text-gray-300 text-[11px] leading-relaxed">{proj.decisions}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Suggested Resume Bullets */}
              {proj.suggested_bullets && proj.suggested_bullets.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-violet-400 block tracking-wider">
                    Suggested Resume Bullets (Confirm claims before using)
                  </span>
                  {proj.suggested_bullets.map((bullet, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white-bg/80 border border-brand-violet/20 text-[11px] text-gray-200 flex items-start justify-between gap-3 group">
                      <span className="leading-relaxed">{bullet}</span>
                      <button
                        onClick={() => copyToClipboard(bullet)}
                        className="text-gray-500 hover:text-white transition-colors p-1 shrink-0"
                        title="Copy bullet"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Potential Interview Questions */}
              {proj.potential_questions && proj.potential_questions.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                    Expected Technical Interview Follow-ups
                  </span>
                  {proj.potential_questions.map((q, idx) => (
                    <div key={idx} className="text-[11px] text-gray-400 flex items-start gap-2">
                      <span className="text-brand-cyan shrink-0 font-bold">•</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Links & Delete */}
            <div className="pt-3 border-t border-white-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                {proj.repo_url && (
                  <a
                    href={proj.repo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-300 hover:text-white flex items-center gap-1.5 transition-colors"
                  >
                    <GitBranch className="w-3.5 h-3.5" /> Repository
                  </a>
                )}
                {proj.demo_url && (
                  <a
                    href={proj.demo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-cyan hover:underline flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                  </a>
                )}
              </div>

              <button
                onClick={() => handleDelete(proj.id)}
                className="text-gray-500 hover:text-rose-400 transition-colors p-1"
                title="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white-surface border border-white-border rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
            <h3 className="text-lg font-bold text-white mb-1">Create Project Proof</h3>
            <p className="text-xs text-gray-400 mb-4">Document genuine implementation decisions and outcomes.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Telemetry Pipeline"
                  className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Core Description</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-throughput real-time streaming pipeline processing sensor data..."
                  className="w-full p-2.5 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Technologies (comma separated)</label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="React, TypeScript, Python, FastAPI, Docker, AWS S3"
                  className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">GitHub / Repo URL</label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-white-bg border border-white-border text-xs text-white focus:outline-none focus:border-brand-violet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Live Demo URL</label>
                  <input
                    type="url"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="https://myproject.app"
                    className="w-full px-3 py-2 rounded-xl bg-white-bg border border-white-border text-xs text-white focus:outline-none focus:border-brand-violet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Technical Challenge Overcome</label>
                <textarea
                  rows={2}
                  value={challenges}
                  onChange={(e) => setChallenges(e.target.value)}
                  placeholder="State synchronization latency during rapid network disconnection..."
                  className="w-full p-2.5 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Design Decision / Architecture</label>
                <textarea
                  rows={2}
                  value={decisions}
                  onChange={(e) => setDecisions(e.target.value)}
                  placeholder="Implemented optimistic client state updates with idempotency keys..."
                  className="w-full p-2.5 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet"
                />
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
                  {creating ? 'Saving...' : 'Save Project Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
