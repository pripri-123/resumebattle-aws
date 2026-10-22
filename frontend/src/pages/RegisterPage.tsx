import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Swords, Lock, Mail, User, Briefcase, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    targetRole: 'Full Stack Engineer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({
        full_name: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        target_role: formData.targetRole
      });
      toast('Account created successfully! Welcome to the Arena.', 'success');
      navigate('/app/overview');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white-bg text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-xl shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Swords className="w-6 h-6 text-white" />
            </div>
          </NavLink>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create Arena Account</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Start proving your career readiness with real evidence</p>
        </div>

        <div className="bg-white-surface border border-white-border rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="alexrivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Target Role</label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                >
                  <option value="Full Stack Engineer">Full Stack Engineer</option>
                  <option value="Cloud / DevOps Engineer">Cloud & DevOps</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="AI / Data Engineer">AI & Data Systems</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-sm shadow-lg shadow-violet-950/50 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Creating Account...' : 'Join Arena'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Already have an account?{' '}
            <NavLink to="/login" className="text-brand-cyan hover:underline font-semibold">
              Sign In
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
