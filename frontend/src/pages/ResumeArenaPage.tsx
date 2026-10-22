import React, { useState, useEffect } from 'react';
import {
  Swords,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
  Printer,
  Sparkles,
  Zap,
  Layers,
  ArrowRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DimensionRadar } from '../components/DimensionRadar';
import { DimensionBarChart } from '../components/DimensionBarChart';
import { RequirementBadge } from '../components/RequirementBadge';
import { EmptyState } from '../components/EmptyState';
import { Resume, JobDescription, ResumeAnalysis, BattleResult } from '../types';

export const ResumeArenaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'evaluate' | 'battle'>('evaluate');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  
  // Single Evaluation State
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [customJobText, setCustomJobText] = useState<string>('');
  const [useCustomJob, setUseCustomJob] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);

  // Resume Battle State
  const [battleResumeA, setBattleResumeA] = useState<string>('');
  const [battleResumeB, setBattleResumeB] = useState<string>('');
  const [battling, setBattling] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadRole, setUploadRole] = useState<string>('Full Stack Engineer');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadText, setUploadText] = useState<string>('');
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [uploading, setUploading] = useState<boolean>(false);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [resumesRes, jobsRes, historyRes] = await Promise.all([
        api.getResumes(),
        api.getJobs(),
        api.getAnalysisHistory()
      ]);
      setResumes(resumesRes.resumes);
      setJobs(jobsRes.jobs);

      if (resumesRes.resumes.length > 0) {
        setSelectedResumeId(resumesRes.resumes[0].id);
        if (resumesRes.resumes.length > 1) {
          setBattleResumeA(resumesRes.resumes[0].id);
          setBattleResumeB(resumesRes.resumes[1].id);
        }
      }
      if (jobsRes.jobs.length > 0) {
        setSelectedJobId(jobsRes.jobs[0].id);
      }

      if (historyRes.history && historyRes.history.length > 0) {
        const latest = await api.getAnalysis(historyRes.history[0].id);
        setAnalysisResult(latest.analysis);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunEvaluation = async () => {
    if (!selectedResumeId) {
      toast('Please select or upload a resume first.', 'warning');
      return;
    }

    setEvaluating(true);
    try {
      const payload: any = { resume_id: selectedResumeId };
      if (useCustomJob && customJobText.trim()) {
        payload.job_text = customJobText;
        payload.job_title = 'Custom Target Role';
      } else {
        payload.job_description_id = selectedJobId;
      }

      const res = await api.evaluateResume(payload);
      setAnalysisResult(res.analysis);
      toast(`Evaluation complete! Score: ${res.analysis.overall_score}/100`, 'success');
    } catch (err: any) {
      toast(err.message || 'Evaluation failed.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const handleRunBattle = async () => {
    if (!battleResumeA || !battleResumeB) {
      toast('Please select two resumes to compare.', 'warning');
      return;
    }
    if (battleResumeA === battleResumeB) {
      toast('Please select two distinct resumes.', 'warning');
      return;
    }

    setBattling(true);
    try {
      const payload = {
        resume_a_id: battleResumeA,
        resume_b_id: battleResumeB,
        job_description_id: selectedJobId
      };
      const res = await api.compareResumes(payload);
      setBattleResult(res);
      toast('Battle complete!', 'success');
    } catch (err: any) {
      toast(err.message || 'Battle execution failed.', 'error');
    } finally {
      setBattling(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('target_role', uploadRole);
      
      if (uploadMode === 'file' && uploadFile) {
        formData.append('file', uploadFile);
      } else if (uploadMode === 'text' && uploadText) {
        formData.append('text_content', uploadText);
      } else {
        throw new Error('Please select a file or provide resume text.');
      }

      const res = await api.uploadResume(formData);
      toast(`Resume "${res.resume.title}" uploaded!`, 'success');
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFile(null);
      setUploadText('');
      await loadData();
      setSelectedResumeId(res.resume.id);
    } catch (err: any) {
      toast(err.message || 'Upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header controls & tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Swords className="w-6 h-6 text-brand-violet" />
            Resume Arena
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Deterministic, explainable rubric evaluation & head-to-head resume comparison
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Tab Selector */}
          <div className="flex bg-white-surface p-1 rounded-xl border border-white-border w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('evaluate')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'evaluate'
                  ? 'bg-brand-violet text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Rubric Evaluation
            </button>
            <button
              onClick={() => setActiveTab('battle')}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'battle'
                  ? 'bg-brand-violet text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-brand-cyan" />
              Side-by-Side Battle
            </button>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5 shrink-0"
          >
            <Upload className="w-4 h-4" /> Upload Resume
          </button>
        </div>
      </div>

      {/* TAB 1: SINGLE RESUME EVALUATION */}
      {activeTab === 'evaluate' && (
        <div className="space-y-6">
          {/* Controls Bar: Resume & Job Selectors */}
          <div className="p-5 rounded-2xl bg-white-surface border border-white-border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Selected Resume</label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.target_role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-gray-300">Target Role / Job</label>
                <button
                  type="button"
                  onClick={() => setUseCustomJob(!useCustomJob)}
                  className="text-[11px] text-brand-cyan hover:underline font-medium"
                >
                  {useCustomJob ? 'Use Pre-set Job' : '+ Custom Job'}
                </button>
              </div>

              {!useCustomJob ? (
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-xs sm:text-sm text-white focus:outline-none focus:border-brand-violet transition-colors"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company}
                    </option>
                  ))}
                </select>
              ) : (
                <textarea
                  rows={1}
                  value={customJobText}
                  onChange={(e) => setCustomJobText(e.target.value)}
                  placeholder="Paste job description text here..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet resize-none"
                />
              )}
            </div>

            <div>
              <button
                onClick={handleRunEvaluation}
                disabled={evaluating || resumes.length === 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-950/40 hover:opacity-95 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {evaluating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating Against Rubric...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-brand-cyan" />
                    <span>Run Rubric Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results View */}
          {analysisResult ? (
            <div id="printable-report" className="space-y-6">
              {/* Score Header Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white-surface border border-white-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-violet/20 text-violet-300 border border-brand-violet/30">
                      {analysisResult.rubric_version}
                    </span>
                    <span className="text-xs text-gray-400">
                      Evaluated for <strong className="text-white">{analysisResult.job_title}</strong> at {analysisResult.job_company}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Assessment Verdict: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{analysisResult.verdict}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl leading-relaxed">
                    {analysisResult.summary_text}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-center p-4 rounded-xl bg-white-card border border-white-border min-w-[120px]">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Rubric Score</div>
                    <div className="text-4xl font-black font-mono text-white mt-1">
                      {analysisResult.overall_score}
                      <span className="text-xs text-gray-500 font-sans font-normal"> / 100</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePrintReport}
                    className="p-3 rounded-xl bg-white-card hover:bg-white-hover border border-white-border text-gray-300 hover:text-white transition-colors"
                    title="Export / Print Assessment Report"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Grid: 9 Dimensions & Radar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-white-surface border border-white-border">
                  <h4 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                    <span>9 Explainable Rubric Dimensions</span>
                    <span className="text-xs text-gray-400 font-normal">Weighted deterministic breakdown</span>
                  </h4>

                  <div className="space-y-4">
                    {analysisResult.dimensions?.map((dim) => (
                      <div key={dim.id} className="p-4 rounded-xl bg-white-card border border-white-border">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs sm:text-sm font-bold text-gray-200">{dim.dimension_name}</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-brand-cyan">
                            {dim.score} / {dim.max_score}
                          </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-white-bg mb-2.5 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-violet to-brand-cyan transition-all duration-500"
                            style={{ width: `${(dim.score / dim.max_score) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed mb-2">
                          {dim.explanation}
                        </p>
                        {dim.suggestions && dim.suggestions.length > 0 && (
                          <div className="p-2.5 rounded-lg bg-white-bg/60 border border-white-border/60 text-[11px] text-amber-300/90 flex items-start gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Actionable Fix:</strong> {dim.suggestions[0]}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Radar Chart Visual */}
                <div className="p-6 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">Dimension Radar</h4>
                    <p className="text-xs text-gray-400 mb-4">Geometric visualization of qualification coverage</p>
                    {analysisResult.dimensions && (
                      <DimensionRadar dimensions={analysisResult.dimensions} />
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-white-card border border-white-border/80 text-xs text-gray-400 leading-relaxed mt-4">
                    <strong className="text-gray-200">Scoring Integrity Note:</strong> Scores strictly reflect alignment with defined job qualifications and do not represent hiring guarantees or discrimination factors.
                  </div>
                </div>
              </div>

              {/* Requirement Match Evidence Table */}
              <div className="p-6 rounded-2xl bg-white-surface border border-white-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">Granular Requirement & Evidence Alignment</h4>
                    <p className="text-xs text-gray-400">Verifiable quotes extracted directly from candidate resume content</p>
                  </div>
                  <span className="text-xs font-mono text-gray-400 bg-white-bg px-2.5 py-1 rounded border border-white-border">
                    {analysisResult.matches?.length || 0} Requirements Audited
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white-border text-gray-400 font-semibold uppercase tracking-wider">
                        <th className="py-3 px-3">Requirement</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3">Extracted Resume Evidence</th>
                        <th className="py-3 px-3">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/50">
                      {analysisResult.matches?.map((m, idx) => (
                        <tr key={idx} className="hover:bg-white-card/40 transition-colors">
                          <td className="py-3.5 px-3 font-medium text-gray-200 max-w-[200px]">
                            {m.requirement_text}
                            <span className="block text-[10px] text-gray-500 font-mono mt-0.5 uppercase">{m.category}</span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <RequirementBadge status={m.match_status} />
                          </td>
                          <td className="py-3.5 px-3 max-w-[280px] font-mono text-[11px] text-gray-300 leading-relaxed bg-white-bg/40 rounded">
                            {m.evidence_text}
                          </td>
                          <td className="py-3.5 px-3 max-w-[240px] text-gray-400 leading-relaxed">
                            {m.suggestion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={Swords}
              title="Ready for Evaluation"
              description="Select your target resume and role description above, then click 'Run Rubric Evaluation'."
            />
          )}
        </div>
      )}

      {/* TAB 2: SIDE-BY-SIDE RESUME BATTLE */}
      {activeTab === 'battle' && (
        <div className="space-y-6">
          {/* Battle Selector Controls */}
          <div className="p-6 rounded-2xl bg-white-surface border border-white-border">
            <div className="text-center max-w-xl mx-auto mb-6">
              <span className="text-xs font-mono text-brand-cyan font-bold tracking-widest uppercase">Head-to-Head Comparison</span>
              <h3 className="text-xl font-bold text-white mt-1">Select Two Resumes for Side-by-Side Battle</h3>
              <p className="text-xs text-gray-400 mt-1">
                Both versions are evaluated against identical rubric weights and requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Resume A */}
              <div className="p-4 rounded-xl bg-white-card border border-brand-violet/50">
                <span className="text-xs font-bold text-brand-violet uppercase">Contender A</span>
                <select
                  value={battleResumeA}
                  onChange={(e) => setBattleResumeA(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg bg-white-bg border border-white-border text-xs text-white focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>

              {/* VS Divider & Action */}
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan flex items-center justify-center font-black text-sm text-white shadow-lg shadow-violet-500/30 mb-3">
                  VS
                </div>
                <button
                  onClick={handleRunBattle}
                  disabled={battling}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs shadow-lg shadow-violet-950/50 hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {battling ? 'Comparing...' : 'Launch Battle'}
                </button>
              </div>

              {/* Resume B */}
              <div className="p-4 rounded-xl bg-white-card border border-brand-cyan/50">
                <span className="text-xs font-bold text-brand-cyan uppercase">Contender B</span>
                <select
                  value={battleResumeB}
                  onChange={(e) => setBattleResumeB(e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg bg-white-bg border border-white-border text-xs text-white focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Battle Results */}
          {battleResult && (
            <div className="space-y-6">
              {/* Winner Announcement Banner */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-dark-surface via-dark-card to-dark-surface border border-brand-violet/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">Battle Assessment Winner</span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {battleResult.winner_title} 🏆
                  </h3>
                  <p className="text-xs text-gray-300 mt-2 max-w-2xl leading-relaxed">
                    {battleResult.explanation}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center p-3 rounded-xl bg-white-bg border border-brand-violet/40 min-w-[90px]">
                    <div className="text-[10px] text-gray-400">{battleResult.resume_a.title}</div>
                    <div className="text-2xl font-black font-mono text-violet-400">{battleResult.resume_a.score}</div>
                  </div>
                  <span className="text-gray-500 font-bold">vs</span>
                  <div className="text-center p-3 rounded-xl bg-white-bg border border-brand-cyan/40 min-w-[90px]">
                    <div className="text-[10px] text-gray-400">{battleResult.resume_b.title}</div>
                    <div className="text-2xl font-black font-mono text-cyan-400">{battleResult.resume_b.score}</div>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Dimension Bar Chart */}
              <div className="p-6 rounded-2xl bg-white-surface border border-white-border">
                <h4 className="text-base font-bold text-white mb-2">Dimension-by-Dimension Head-to-Head Comparison</h4>
                <p className="text-xs text-gray-400 mb-6">Contender A (Violet) vs Contender B (Cyan)</p>
                <DimensionBarChart
                  data={battleResult.dimension_comparison}
                  titleA={battleResult.resume_a.title}
                  titleB={battleResult.resume_b.title}
                />
              </div>

              {/* Detailed Deltas Table */}
              <div className="p-6 rounded-2xl bg-white-surface border border-white-border">
                <h4 className="text-base font-bold text-white mb-4">Score Delta Analysis</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white-border text-gray-400 uppercase font-semibold">
                        <th className="py-2.5 px-3">Dimension</th>
                        <th className="py-2.5 px-3">{battleResult.resume_a.title}</th>
                        <th className="py-2.5 px-3">{battleResult.resume_b.title}</th>
                        <th className="py-2.5 px-3">Delta</th>
                        <th className="py-2.5 px-3">Leading Version</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/50">
                      {battleResult.dimension_comparison.map((dim, i) => (
                        <tr key={i} className="hover:bg-white-card/40">
                          <td className="py-3 px-3 font-medium text-white">{dim.name}</td>
                          <td className="py-3 px-3 font-mono text-violet-400">{dim.score_a}</td>
                          <td className="py-3 px-3 font-mono text-cyan-400">{dim.score_b}</td>
                          <td className="py-3 px-3 font-mono font-bold">
                            {dim.delta > 0 ? (
                              <span className="text-violet-400">+{dim.delta}</span>
                            ) : dim.delta < 0 ? (
                              <span className="text-cyan-400">{dim.delta}</span>
                            ) : (
                              <span className="text-gray-500">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              dim.leader === 'A'
                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                : dim.leader === 'B'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {dim.leader === 'A' ? battleResult.resume_a.title : (dim.leader === 'B' ? battleResult.resume_b.title : 'Tie')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white-surface border border-white-border rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Upload Resume Document</h3>
            <p className="text-xs text-gray-400 mb-4">Supported formats: PDF, DOCX, or plain text.</p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Resume Name</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Alex Rivera - Full Stack v2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Target Role Category</label>
                <input
                  type="text"
                  value={uploadRole}
                  onChange={(e) => setUploadRole(e.target.value)}
                  placeholder="e.g. Cloud & Backend Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white-bg border border-white-border text-sm text-white focus:outline-none focus:border-brand-violet"
                />
              </div>

              {/* Mode switch */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    uploadMode === 'file'
                      ? 'bg-brand-violet text-white border-brand-violet'
                      : 'bg-white-card text-gray-400 border-white-border'
                  }`}
                >
                  Upload PDF / DOCX
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('text')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                    uploadMode === 'text'
                      ? 'bg-brand-violet text-white border-brand-violet'
                      : 'bg-white-card text-gray-400 border-white-border'
                  }`}
                >
                  Paste Text Content
                </button>
              </div>

              {uploadMode === 'file' ? (
                <div className="border-2 border-dashed border-white-border rounded-xl p-6 text-center hover:border-brand-violet/50 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white-card file:text-white file:text-xs hover:file:bg-white-hover cursor-pointer"
                  />
                  <div className="text-[10px] text-gray-500 mt-2">Max file size: 16MB</div>
                </div>
              ) : (
                <textarea
                  rows={6}
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="Paste complete resume text here..."
                  className="w-full p-3 rounded-xl bg-white-bg border border-white-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-violet font-mono"
                />
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white-border">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {uploading ? 'Processing...' : 'Save & Ingest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
