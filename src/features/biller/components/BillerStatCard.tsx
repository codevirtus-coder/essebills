import React from "react";

interface BillerStatCardProps {
  label: string;
  value: string;
  change: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  chartPath: string;
  strokeColor: string;
}

const BillerStatCard: React.FC<BillerStatCardProps> = ({
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-light">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-neutral-text mb-1">{label}</p>
          <h3 className="text-2xl font-extrabold text-dark-text">{value}</h3>
        </div>
        <span
          className={`p-2 ${iconBg} rounded-lg ${iconColor} material-symbols-outlined`}
        >
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs font-bold text-accent-green">{change}</span>
        <div className="h-8 w-24">
          <svg className="w-full h-full" viewBox="0 0 100 30">
            <path d={chartPath} fill="none" stroke={strokeColor} strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default BillerStatCard;
