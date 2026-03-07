import React from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';
import { TrendingUp, TrendingDown } from 'lucide-react';

type StatCardProps = {
  label?: string;
  title?: string;
  value?: string | number;
  subtitle?: string;
  change?: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  chartPath?: string;
  strokeColor?: string;
};

export default function StatCard({
  label,
  title,
  value,
  subtitle,
  change,
  icon,
  iconBg,
  iconColor,
  chartPath,
  strokeColor = '#10b981',
}: StatCardProps) {
  const displayTitle = title ?? label ?? '';
  const isPositive = change?.startsWith('+');

  return (
    <div className="glass-card p-6 border-slate-200 dark:border-slate-800 flex flex-col justify-between group hover:shadow-lg transition-all duration-300 overflow-hidden relative">
      {/* Background Chart Sparkline (Simplified) */}
      {chartPath && (
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-none">
            <path
              d={chartPath}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
            {displayTitle}
          </p>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        {icon && (
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", iconBg || "bg-slate-100 dark:bg-slate-800")}>
            <Icon name={icon} className={cn("text-2xl", iconColor || "text-slate-600 dark:text-slate-300")} />
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-2 relative z-10">
        {change && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
            isPositive 
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400" 
              : "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {change}
          </div>
        )}
        {subtitle && (
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
