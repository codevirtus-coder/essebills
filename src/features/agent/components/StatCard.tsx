import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  chartPath: string;
  strokeColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  iconBg,
  iconColor,
  chartPath,
  strokeColor,
}) => {
  return (
    <article className="bg-white p-8 rounded-[2.4rem] border border-neutral-light shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-neutral-text uppercase tracking-widest">
          {label}
        </p>
        <span
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg} ${iconColor}`}
        >
          <span className="material-symbols-outlined text-[22px]">{icon}</span>
        </span>
      </div>
      <p className="text-4xl font-black tracking-tight text-dark-text">{value}</p>
      <div className="flex items-end justify-between gap-4">
        <span className="text-[11px] font-black text-accent-green">{change}</span>
        <svg viewBox="0 0 100 30" className="w-24 h-8" aria-hidden>
          <path
            d={chartPath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </article>
  );
};

export default StatCard;

