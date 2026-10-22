import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Shield,
  Key,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Cloud,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [bio, setBio] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [yearsExp, setYearsExp] = useState('2.5');
  const [privacyMode, setPrivacyMode] = useState('standard');
  const [retentionDays, setRetentionDays] = useState('365');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const res = await api.getProfile();
        if (res.user) {
          setFullName(res.user.full_name || '');
          setTargetRole(res.user.target_role || '');
        }
        if (res.profile) {
          setBio(res.profile.bio || '');
          setGithubUrl(res.profile.github_url || '');
          setLinkedinUrl(res.profile.linkedin_url || '');
          setYearsExp(String(res.profile.years_experience || '0'));
          setPrivacyMode(res.profile.privacy_mode || 'standard');
          setRetentionDays(String(res.profile.data_retention_days || '365'));
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadProfileData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateProfile({
        full_name: fullName,
        target_role: targetRole,
        bio,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        years_experience: parseFloat(yearsExp) || 0,
        privacy_mode: privacyMode,
        data_retention_days: parseInt(retentionDays) || 365
      });
      toast('Profile preferences updated.', 'success');
      await refreshUser();
    } catch (err: any) {
      toast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast('New password must be at least 6 characters.', 'warning');
      return;
    }
    setChangingPass(true);
    try {
      await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast('Password updated successfully.', 'success');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast(err.message || 'Password change failed.', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.exportData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resume_battle_export_${user?.username || 'user'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast('Data export downloaded in JSON format.', 'success');
    } catch (err: any) {
      toast(err.message || 'Export failed.', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('CRITICAL ACTION: Are you absolutely sure you want to permanently delete your account and all associated resumes, scores, and missions? This action cannot be undone.')) {
      return;
    }
    try {
      await api.deleteAccount();
      toast('Account permanently deleted.', 'info');
      await logout();
      window.location.href = '/';
    } catch (err: any) {
      toast(err.message || 'Account deletion failed.', 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-white-border">
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-brand-violet" />
          Settings & Account Governance
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Manage candidate profile, privacy parameters, encryption controls, and data exports
        </p>
      </div>

      {/* Profile Form */}
      <div className="p-6 rounded-2xl bg-white-surface border border-white-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-brand-cyan" /> Candidate Profile
        </h3>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Target Career Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Years of Experience</label>
              <input
                type="number"
                step="0.5"
                value={yearsExp}
                onChange={(e) => setYearsExp(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs text-white focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">GitHub Profile URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs text-white focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">LinkedIn Profile URL</label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs text-white focus:outline-none focus:border-brand-violet"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs shadow-md disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password */}
      <div className="p-6 rounded-2xl bg-white-surface border border-white-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400" /> Account Security
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs text-white focus:outline-none focus:border-brand-violet"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs text-white focus:outline-none focus:border-brand-violet"
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="px-4 py-2 rounded-xl bg-white-card hover:bg-white-hover border border-white-border text-xs font-semibold text-gray-200 transition-colors disabled:opacity-50"
          >
            {changingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Cloud & AI Disclosures */}
      <div className="p-6 rounded-2xl bg-white-surface border border-white-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand-violet" /> Infrastructure & AI Architecture Disclosure
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
          <div className="p-4 rounded-xl bg-white-card border border-white-border">
            <span className="text-white font-bold block mb-1 flex items-center gap-1.5">
              <Cloud className="w-4 h-4 text-brand-cyan" /> Storage & AWS S3 Adapter
            </span>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Active Storage: <strong>Local Private Storage Service</strong>. Prepared with Boto3 S3 adapter for zero-code migration to Amazon S3 buckets with SSE-256 encryption.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white-card border border-white-border">
            <span className="text-white font-bold block mb-1 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" /> AI Provider & Privacy
            </span>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Active Provider: <strong>Deterministic Local Scorer v2.0</strong>. Zero external network telemetry. Prepared with BedrockAIProvider adapter for Claude 3 Sonnet / Titan models.
            </p>
          </div>
        </div>
      </div>

      {/* GDPR Data Export & Account Deletion */}
      <div className="p-6 rounded-2xl bg-white-surface border border-white-border space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" /> Data Sovereignty & GDPR Compliance
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white-card border border-white-border">
          <div>
            <div className="font-semibold text-white text-xs">Export All Account Data</div>
            <div className="text-[11px] text-gray-400">
              Download your complete profile, resumes, evaluations, and mock interview transcripts in JSON.
            </div>
          </div>
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl bg-white-bg hover:bg-white-surface border border-white-border text-xs font-semibold text-gray-200 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4 text-brand-cyan" /> Export JSON Package
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <div>
            <div className="font-semibold text-rose-300 text-xs">Permanently Erase Account</div>
            <div className="text-[11px] text-rose-300/80">
              Deletes your account and purges all uploaded documents, version history, and audit records.
            </div>
          </div>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-4 h-4" /> Erase All Data
          </button>
        </div>
      </div>
    </div>
  );
};
