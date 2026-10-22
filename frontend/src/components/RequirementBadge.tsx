import React from 'react';
import { CheckCircle2, AlertCircle, XCircle, HelpCircle } from 'lucide-react';

interface RequirementBadgeProps {
  status: 'met' | 'partially_met' | 'missing' | 'requires_review' | string;
}

export const RequirementBadge: React.FC<RequirementBadgeProps> = ({ status }) => {
  switch (status) {
    case 'met':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" /> Met
        </span>
      );
    case 'partially_met':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertCircle className="w-3.5 h-3.5" /> Partial Evidence
        </span>
      );
    case 'missing':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <XCircle className="w-3.5 h-3.5" /> Missing
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <HelpCircle className="w-3.5 h-3.5" /> Review
        </span>
      );
  }
};
