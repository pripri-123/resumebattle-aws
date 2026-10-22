import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Award,
  CheckCircle2,
  FolderGit2,
  Dna,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';
import { EmptyState } from '../components/EmptyState';

export const CareerInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const res = await api.getInsights();
        setInsights(res.insights);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const scoreTrend = insights?.score_trend || [];
  const topMissing = insights?.top_missing_requirements || [];
  const dimensionAverages = insights?.dimension_averages || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-white-border">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-violet" />
            Career Insights & Analytics
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Telemetry metrics, recurring requirement gaps, and career readiness trajectory
          </p>
        </div>

        <div className="text-xs font-mono text-gray-400 bg-white-surface px-3 py-1.5 rounded-xl border border-white-border">
          {insights?.total_evaluations || 0} Total Evaluations Conducted
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="p-6 rounded-2xl bg-white-surface border border-white-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Rubric Score Progression</h3>
            <p className="text-xs text-gray-400">Deterministic evaluation history across all tested resume iterations</p>
          </div>
          <span className="text-xs font-mono font-bold text-brand-cyan">
            Latest: {insights?.latest_score != null ? `${insights.latest_score}/100` : '—'}
          </span>
        </div>

        {scoreTrend.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2b47" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[30, 100]} stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111726',
                    borderColor: '#1f2b47',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#trendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-gray-500">
            No evaluation history records yet. Run evaluations in the Resume Arena to populate.
          </div>
        )}
      </div>

      {/* Grid: Missing Requirements & Dimension Averages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Frequent Missing Requirements */}
        <div className="p-6 rounded-2xl bg-white-surface border border-white-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  Most Frequent Prerequisite Gaps
                </h3>
                <p className="text-xs text-gray-400">Target role criteria most often flagged as missing</p>
              </div>
            </div>

            <div className="space-y-3">
              {topMissing.length > 0 ? (
                topMissing.map((item: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white-card border border-white-border flex items-center justify-between gap-3">
                    <span className="text-xs text-gray-200 font-medium truncate">{item.requirement}</span>
                    <span className="text-xs font-mono font-bold text-rose-400 shrink-0 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {item.frequency}x Flagged
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-gray-500">
                  No missing gaps detected across your current profile evaluations!
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-white-card border border-white-border/80 text-[11px] text-gray-400">
            💡 Address these recurring gaps by starting targeted learning missions in <strong>Career Quest</strong>.
          </div>
        </div>

        {/* Dimension Average Performance */}
        <div className="p-6 rounded-2xl bg-white-surface border border-white-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Dimension Averages</h3>
              <p className="text-xs text-gray-400">Average rubric score across your recent evaluations</p>
            </div>
          </div>

          {dimensionAverages.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionAverages} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2b47" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={130} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111726',
                      borderColor: '#1f2b47',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="average" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-gray-500">
              Run evaluations to calculate dimension averages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
