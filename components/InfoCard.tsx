
import React from 'react';

interface InfoCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-blue-500/30 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
          {icon}
        </div>
        <h3 className="font-semibold text-slate-200">{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
};

export const InfoItem: React.FC<{ label: string; value?: string; isMono?: boolean }> = ({ label, value, isMono }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">{label}</span>
      <span className={`text-slate-100 ${isMono ? 'mono text-sm' : ''}`}>{value}</span>
    </div>
  );
};

export default InfoCard;
