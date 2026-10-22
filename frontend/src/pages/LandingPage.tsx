import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Swords,
  Dna,
  Target,
  MessageSquareCode,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  BarChart2,
  Lock,
  ArrowRight,
  Layers,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleInstantDemo = async () => {
    try {
      await demoLogin();
      navigate('/app/overview');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white-bg text-gray-100 flex flex-col selection:bg-brand-violet selection:text-white">
      {/* Top Navbar */}
      <header className="h-20 border-b border-white-border/60 bg-white-bg/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white">Resume Battle</span>
            <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded-full bg-brand-violet/20 text-brand-violet border border-brand-violet/30">2.0</span>
          </div>
        </div>



        <div className="flex items-center gap-3">
          <button
            onClick={handleInstantDemo}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 text-cyan-300 text-xs font-semibold hover:bg-brand-cyan/20 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" /> 1-Click Demo
          </button>
          <NavLink
            to="/login"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/register"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white text-sm font-semibold shadow-lg shadow-violet-950/50 hover:opacity-95 transition-opacity"
          >
            Enter the Arena
          </NavLink>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 px-6 sm:px-12 max-w-7xl mx-auto w-full text-center">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-violet/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 w-80 h-80 bg-brand-cyan/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white-surface border border-white-border text-xs text-gray-300 mb-8 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-white">Next-Gen Career Intelligence Arena</span>
          <span className="text-gray-500">|</span>
          <span className="text-brand-cyan">Explainable Rubric AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
          Your next career move starts with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-violet via-indigo-400 to-brand-cyan">
            better evidence.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Evaluate your resume against real role requirements, discover skill gaps, improve your projects, and prepare for interviews with an AI-powered career intelligence platform.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <NavLink
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-sm shadow-xl shadow-violet-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Enter the Arena <ArrowRight className="w-4 h-4" />
          </NavLink>
          <button
            onClick={handleInstantDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white-surface hover:bg-white-card border border-white-border text-gray-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-cyan" /> Launch Demo Account
          </button>
        </div>

        {/* Product Dashboard Visual Preview */}
        <div className="relative mx-auto max-w-5xl rounded-2xl border border-white-border bg-white-surface/90 shadow-2xl overflow-hidden backdrop-blur-xl">
          <div className="h-10 px-4 bg-white-card/90 border-b border-white-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-gray-400">resume-battle.io/arena</span>
            </div>
            <div className="text-[11px] font-mono text-brand-cyan flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping" />
              Rubric v2.0 Deterministic
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {/* Card 1 */}
            <div className="p-4 rounded-xl bg-white-card border border-white-border">
              <div className="text-xs text-gray-400 font-medium mb-1">Target Role Alignment</div>
              <div className="text-3xl font-extrabold text-white font-mono flex items-baseline gap-2">
                81.4 <span className="text-xs text-gray-500 font-sans">/ 100</span>
              </div>
              <div className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1">
                ✓ Strong Technical Evidence Found
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-xl bg-white-card border border-white-border">
              <div className="text-xs text-gray-400 font-medium mb-1">Career DNA Verified</div>
              <div className="text-3xl font-extrabold text-white font-mono">14 Skills</div>
              <div className="text-xs text-brand-cyan mt-2">7 Linked to Production Proof</div>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-xl bg-white-card border border-white-border">
              <div className="text-xs text-gray-400 font-medium mb-1">Career Quest Progress</div>
              <div className="text-3xl font-extrabold text-white font-mono">3 Missions</div>
              <div className="text-xs text-amber-400 mt-2">1 Active: S3 Cloud Architecture</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-20 border-t border-white-border/60 bg-white-surface/40 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand-violet tracking-widest uppercase mb-2">Core Capabilities</h2>
          <h3 className="text-3xl font-bold text-white tracking-tight">The 10-Pillar Career Intelligence Architecture</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white-card border border-white-border hover:border-brand-violet/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-violet/20 border border-brand-violet/30 flex items-center justify-center text-brand-violet mb-4">
              <Swords className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Resume Arena & Battles</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Upload resumes in PDF or DOCX, match against granular job descriptions, and pit two versions side-by-side with dimension-by-dimension comparisons.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white-card border border-white-border hover:border-brand-cyan/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/20 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan mb-4">
              <Dna className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Persistent Career DNA</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Curate your verified skill profile with concrete project anchors, certification provenance, and interactive visual graph representations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white-card border border-white-border hover:border-indigo-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Career Quest Missions</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Actionable, gap-driven learning missions generated directly from your missing requirements. Earn readiness points for documenting real evidence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white-card border border-white-border hover:border-emerald-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Application Simulator</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Conduct targeted technical, behavioral, and architecture mock interview simulations grounded in your resume projects and target role qualifications.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white-card border border-white-border hover:border-amber-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Career Insights & Telemetry</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Track evaluation progress over time, analyze recurring skill gap frequencies, and measure genuine readiness without fabricated statistics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white-card border border-white-border hover:border-cyan-400/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Battle League & Privacy</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Opt-in anonymous arena challenges with pseudonymized handles. Zero exposure of personal contact data or original document files to the public.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Disclaimer Footer */}
      <footer className="border-t border-white-border/80 bg-white-surface/60 py-12 px-6 sm:px-12 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="font-bold text-gray-300 text-sm mb-1">Resume Battle 2.0: Career Intelligence Arena</div>
            <div>Designed for University Students, Placement Candidates, and Engineering Professionals.</div>
            <div className="mt-2 text-[11px] text-gray-500">
              Disclaimer: Rubric evaluations reflect alignment with specific role rubrics and are not predictive of actual hiring decisions.
            </div>
          </div>
          <div className="flex items-center gap-6 text-gray-400">
            <NavLink to="/login" className="hover:text-white transition-colors">Sign In</NavLink>
            <NavLink to="/register" className="hover:text-white transition-colors">Register</NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
};
