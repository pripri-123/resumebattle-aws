import React, { useState, useEffect } from 'react';
import {
  Dna,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  Link as LinkIcon,
  FolderGit2,
  Trash2,
  AlertCircle,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { CareerSkill } from '../types';

export const CareerDnaPage: React.FC = () => {
  const [dnaData, setDnaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Add Skill Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCat, setSkillCat] = useState('Frameworks & Languages');
  const [skillProf, setSkillProf] = useState('Intermediate');

  // Add Evidence Modal
  const [evidenceSkillId, setEvidenceSkillId] = useState<string | null>(null);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceType, setEvidenceType] = useState('project');

  const { toast } = useToast();

  const loadDna = async () => {
    try {
      const res = await api.getCareerDna();
      setDnaData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDna();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addSkill({
        name: skillName,
        category: skillCat,
        proficiency_level: skillProf
      });
      toast(`Skill "${skillName}" added to Career DNA.`, 'success');
      setShowAddModal(false);
      setSkillName('');
      loadDna();
    } catch (err: any) {
      toast(err.message || 'Failed to add skill.', 'error');
    }
  };

  const handleToggleVerify = async (skill: CareerSkill) => {
    try {
      await api.updateSkill(skill.id, { verified: !skill.verified });
      toast(`Skill status updated.`, 'info');
      loadDna();
    } catch (err: any) {
      toast(err.message || 'Update failed.', 'error');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await api.deleteSkill(id);
      toast('Skill removed from profile.', 'info');
      loadDna();
    } catch (err: any) {
      toast(err.message || 'Delete failed.', 'error');
    }
  };

  const handleAddEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceSkillId) return;
    try {
      await api.addEvidence(evidenceSkillId, {
        title: evidenceTitle,
        description: evidenceDesc,
        evidence_type: evidenceType
      });
      toast('Evidence attached! Skill marked as verified.', 'success');
      setEvidenceSkillId(null);
      setEvidenceTitle('');
      setEvidenceDesc('');
      loadDna();
    } catch (err: any) {
      toast(err.message || 'Failed to attach evidence.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const skills: CareerSkill[] = dnaData?.skills || [];
  const categories = Object.keys(dnaData?.categories || {});
  
  const filteredSkills = selectedCategory === 'all'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Dna className="w-6 h-6 text-brand-violet" />
            Career DNA Profile
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Persistent, evidence-anchored skill competencies with verifiable project provenance
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white-surface border border-white-border">
          <div className="text-xs text-gray-400 font-medium">Total Competencies</div>
          <div className="text-3xl font-extrabold text-white font-mono mt-1">{dnaData?.total_skills || 0}</div>
          <div className="text-[11px] text-gray-500 mt-2">Parsed from resumes and validated</div>
        </div>

        <div className="p-5 rounded-2xl bg-white-surface border border-white-border">
          <div className="text-xs text-gray-400 font-medium">Verified Evidence Anchors</div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-1">
            {dnaData?.verified_skills || 0}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Backed by repository code or project demos
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white-surface border border-white-border">
          <div className="text-xs text-gray-400 font-medium">Domain Categories</div>
          <div className="text-3xl font-extrabold text-brand-cyan font-mono mt-1">{categories.length}</div>
          <div className="text-[11px] text-gray-500 mt-2">Languages, cloud, databases, architecture</div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-brand-violet text-white'
              : 'bg-white-surface text-gray-400 hover:text-white border border-white-border'
          }`}
        >
          All Competencies ({skills.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-brand-violet text-white'
                : 'bg-white-surface text-gray-400 hover:text-white border border-white-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="p-5 rounded-2xl bg-white-surface border border-white-border hover:border-white-hover transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    {skill.name}
                    {skill.verified ? (
                      <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400" title="Verified with evidence">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-500 font-normal">Claimed</span>
                    )}
                  </h4>
                  <span className="text-[11px] text-gray-400">{skill.category}</span>
                </div>

                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="text-gray-500 hover:text-rose-400 transition-colors p-1"
                  title="Remove skill"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white-card border border-white-border text-gray-300">
                  {skill.proficiency_level}
                </span>
                <span className="text-[11px] text-gray-500">Source: {skill.source}</span>
              </div>

              {/* Evidence details */}
              {skill.evidence && skill.evidence.length > 0 ? (
                <div className="mt-3.5 p-2.5 rounded-xl bg-white-bg/60 border border-white-border text-[11px] space-y-1">
                  <div className="text-gray-300 font-semibold flex items-center gap-1.5">
                    <FolderGit2 className="w-3 h-3 text-brand-cyan" />
                    <span>{skill.evidence[0].title}</span>
                  </div>
                  {skill.evidence[0].description && (
                    <div className="text-gray-400 truncate">{skill.evidence[0].description}</div>
                  )}
                </div>
              ) : (
                <div className="mt-3.5 text-[11px] text-gray-500 italic">
                  No verified project evidence linked yet.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-white-border/60 flex items-center justify-between text-xs">
              <button
                onClick={() => setEvidenceSkillId(skill.id)}
                className="text-brand-cyan hover:underline font-medium flex items-center gap-1 text-[11px]"
              >
                <LinkIcon className="w-3 h-3" /> Attach Evidence
              </button>

              <button
                onClick={() => handleToggleVerify(skill)}
                className={`text-[11px] font-medium transition-colors ${
                  skill.verified ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                {skill.verified ? 'Unverify' : 'Mark Verified'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white-surface border border-white-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-3">Add Career Competency</h3>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  placeholder="e.g. GraphQL, AWS DynamoDB, Terraform"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Category</label>
                <select
                  value={skillCat}
                  onChange={(e) => setSkillCat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet"
                >
                  <option value="Languages">Languages</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend & APIs">Backend & APIs</option>
                  <option value="Databases & Caching">Databases & Caching</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                  <option value="Architecture & Systems">Architecture & Systems</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Proficiency Level</label>
                <select
                  value={skillProf}
                  onChange={(e) => setSkillProf(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs shadow-md"
                >
                  Save Competency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attach Evidence Modal */}
      {evidenceSkillId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white-surface border border-white-border rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Attach Verifiable Evidence</h3>
            <p className="text-xs text-gray-400 mb-4">Link this skill to concrete project code or repository work.</p>

            <form onSubmit={handleAddEvidenceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Evidence Title / Project</label>
                <input
                  type="text"
                  required
                  value={evidenceTitle}
                  onChange={(e) => setEvidenceTitle(e.target.value)}
                  placeholder="e.g. CloudScale Telemetry Dashboard"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description & Context</label>
                <textarea
                  rows={3}
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Describe how you utilized this competency in production or project..."
                  className="w-full p-3 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white-border">
                <button
                  type="button"
                  onClick={() => setEvidenceSkillId(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs shadow-md"
                >
                  Confirm Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
