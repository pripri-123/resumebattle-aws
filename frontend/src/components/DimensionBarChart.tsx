import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DimensionBarChartProps {
  data: {
    name: string;
    score_a: number;
    score_b: number;
  }[];
  titleA: string;
  titleB: string;
}

export const DimensionBarChart: React.FC<DimensionBarChartProps> = ({ data, titleA, titleB }) => {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2b47" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={11}
            angle={-25}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111726',
              borderColor: '#1f2b47',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={(value) => <span className="text-xs text-gray-300 font-medium">{value}</span>}
          />
          <Bar dataKey="score_a" name={titleA} fill="#7c3aed" radius={[4, 4, 0, 0]} />
          <Bar dataKey="score_b" name={titleB} fill="#06b6d4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
