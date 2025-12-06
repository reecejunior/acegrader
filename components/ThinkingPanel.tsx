import React from 'react';
import { Lightbulb, TrendingUp, X, BrainCircuit, Check } from 'lucide-react';
import { GradingResult } from '../types';

interface ThinkingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  result: GradingResult;
}

export const ThinkingPanel: React.FC<ThinkingPanelProps> = ({ isOpen, onClose, result }) => {
  
  // Handle backward compatibility if thinkingProcess was saved as a string in old records
  const thinkingPoints = Array.isArray(result.thinkingProcess) 
    ? result.thinkingProcess 
    : (typeof result.thinkingProcess === 'string' ? (result.thinkingProcess as string).split('\n').filter(s => s.trim().length > 0) : []);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-out Panel */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#0A0F1C]/95 backdrop-filter backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h3 className="text-xl font-serif italic text-white">AI Reasoning</h3>
                <p className="text-xs text-slate-400 uppercase tracking-widest">Logic & Strategy</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Thinking Process Section */}
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 text-indigo-300">
                <Lightbulb size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Evaluation Logic</span>
              </div>
              
              <div className="space-y-3">
                {thinkingPoints.map((point, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-lg bg-indigo-950/20 border border-indigo-500/10 hover:border-indigo-500/30 transition-colors">
                        <div className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                        <p className="text-sm text-indigo-100/90 leading-relaxed">{point.replace(/^[•-]\s*/, '')}</p>
                    </div>
                ))}
                {thinkingPoints.length === 0 && (
                    <p className="text-sm text-slate-500 italic">No detailed logic provided.</p>
                )}
              </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            {/* Improvement Tips Section */}
            <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 text-emerald-300">
                <TrendingUp size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Growth Path</span>
              </div>
              <p className="text-sm text-slate-500">Actionable steps to improve future performance:</p>
              
              <ul className="space-y-3">
                {result.improvementTips.map((tip, idx) => (
                  <li key={idx} className="flex gap-4 p-4 rounded-lg bg-emerald-950/10 border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-slate-300 leading-relaxed text-sm">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-black/20 text-center shrink-0">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Private Analysis for Teacher</p>
          </div>
        </div>
      </div>
    </>
  );
};