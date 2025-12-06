import React from 'react';

interface LoaderProps {
  message: string;
  subMessage?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message, subMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-8 w-full animate-fade-up">
      <div className="relative">
        {/* Outer gentle glow */}
        <div className="absolute inset-0 -m-8 bg-amber-500/20 blur-[60px] rounded-full animate-pulse-slow"></div>
        
        {/* Spinning Rings */}
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border border-amber-500/20"></div>
          <div className="absolute inset-0 rounded-full border-t border-amber-400 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border border-indigo-500/20"></div>
          <div className="absolute inset-2 rounded-full border-b border-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Center Core */}
          <div className="absolute inset-[35%] bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse"></div>
        </div>
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-xl font-serif italic text-white/90 tracking-wide">{message}</h3>
        {subMessage && <p className="text-sm text-slate-500 uppercase tracking-widest">{subMessage}</p>}
      </div>
    </div>
  );
};