import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, glow = false }) => {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl transition-all duration-500
      bg-white dark:bg-[#0A0F1C]/80 backdrop-blur-2xl border border-slate-200 dark:border-indigo-500/10
      dark:border-t-indigo-500/20 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-black/50
      ${glow ? 'dark:shadow-[0_0_40px_-10px_rgba(14,165,233,0.1)] border-brand-200 dark:border-brand-500/20' : ''}
      ${className}
    `}>
      {/* Subtle top gradient for curvature illusion */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-indigo-500/20 to-transparent opacity-50"></div>
      
      {title && (
        <div className="relative border-b border-slate-100 dark:border-indigo-500/10 bg-slate-50/50 dark:bg-white/[0.01] px-6 py-4">
          <h3 className="font-semibold text-sm uppercase tracking-widest text-slate-500 dark:text-indigo-100/80">{title}</h3>
        </div>
      )}
      
      <div className="relative p-6 sm:p-8">
        {children}
      </div>
    </div>
  );
};