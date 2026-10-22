import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { AnalysisDimension } from '../types';

interface DimensionRadarProps {
  dimensions: AnalysisDimension[];
}

export const DimensionRadar: React.FC<DimensionRadarProps> = ({ dimensions }) => {
  const chartData = dimensions.map((d) => ({
    dimension: d.dimension_name.length > 20 ? `${d.dimension_name.slice(0, 18)}...` : d.dimension_name,
    score: d.score,
    fullMark: 100
  }));

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#1f2b47" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            stroke="#334155"
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white-card border border-white-border px-3 py-2 rounded-lg shadow-xl text-xs">
                    <p className="font-semibold text-white">{data.dimension}</p>
                    <p className="text-brand-cyan font-mono font-bold mt-0.5">
                      Score: {data.score}/100
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Radar
            name="Rubric Alignment"
            dataKey="score"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
