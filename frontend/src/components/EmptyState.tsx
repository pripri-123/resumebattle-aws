import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white-card/50 rounded-2xl border border-dashed border-white-border">
      <div className="w-12 h-12 rounded-2xl bg-white-surface border border-white-border flex items-center justify-center text-brand-cyan mb-4 shadow-lg shadow-cyan-950/20">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-gray-400 max-w-md mb-5">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-violet to-brand-accent text-white text-xs font-semibold shadow-lg shadow-violet-950/40 hover:opacity-95 transition-opacity"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
