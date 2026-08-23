import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel | string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, showIcon = true, size = 'md' }) => {
  const normLevel = level?.toUpperCase() || 'LOW';

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium gap-1',
    md: 'text-xs px-2.5 py-1 font-semibold gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 font-semibold gap-2',
  }[size];

  if (normLevel === 'NEEDS_ATTENTION') {
    return (
      <span className={`inline-flex items-center rounded-full bg-rose-50 text-rose-700 border border-rose-200 shadow-sm ${sizeClasses}`}>
        {showIcon && <AlertTriangle className={size === 'lg' ? 'w-4 h-4 text-rose-500' : 'w-3.5 h-3.5 text-rose-500'} />}
        Needs Attention
      </span>
    );
  }

  if (normLevel === 'MODERATE') {
    return (
      <span className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200 shadow-sm ${sizeClasses}`}>
        {showIcon && <AlertCircle className={size === 'lg' ? 'w-4 h-4 text-amber-500' : 'w-3.5 h-3.5 text-amber-500'} />}
        Moderate Check-in
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm ${sizeClasses}`}>
      {showIcon && <ShieldCheck className={size === 'lg' ? 'w-4 h-4 text-emerald-600' : 'w-3.5 h-3.5 text-emerald-600'} />}
      Thriving / Low Concern
    </span>
  );
};
