import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Swords, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, demoLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your email/username and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login({ email_or_username: identifier, password });
      toast('Signed in successfully.', 'success');
      navigate('/app/overview');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin();
      toast('Signed in as Demo Candidate (Alex Rivera).', 'success');
      navigate('/app/overview');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white-bg text-gray-100 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <NavLink to="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-xl shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Swords className="w-6 h-6 text-white" />
            </div>
          </NavLink>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Sign In to Resume Battle</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Access your Career Intelligence Arena</p>
        </div>

        {/* Card */}
        <div className="bg-white-surface border border-white-border rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Access Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleDemo}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white-card hover:bg-white-hover border border-brand-cyan/40 text-cyan-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm group"
            >
              <Sparkles className="w-4 h-4 text-brand-cyan group-hover:rotate-12 transition-transform" />
              <span>Instant 1-Click Demo Login</span>
              <span className="text-[10px] text-gray-400 font-normal">(Pre-seeded candidate)</span>
            </button>
            <div className="relative my-6">

              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white-surface px-3 text-gray-500 font-medium tracking-wider">or sign in with password</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Email or Username</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="alex@rivera.dev or demoplayer"
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-sm shadow-lg shadow-violet-950/50 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            Don't have an account yet?{' '}
            <NavLink to="/register" className="text-brand-cyan hover:underline font-semibold">
              Create Account
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
