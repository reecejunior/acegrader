import React, { useState } from 'react';
import { GradingResult } from '../types';
import { Button } from './Button';
import { RefreshCw, Download, Award, BrainCircuit, FileSignature } from 'lucide-react';
import { ThinkingPanel } from './ThinkingPanel';
import { MarkedDocument } from './MarkedDocument';

interface GradingViewProps {
  result: GradingResult;
  onReset: () => void;
}

export const GradingView: React.FC<GradingViewProps> = ({ result, onReset }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showMarkedDoc, setShowMarkedDoc] = useState(false);
  const scorePercentage = Math.round((result.totalScore / result.maxTotalScore) * 100);
  
  const getGradeColor = (p: number) => {
    if (p >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (p >= 70) return 'text-brand-600 dark:text-brand-400';
    if (p >= 50) return 'text-orange-600 dark:text-orange-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  if (showMarkedDoc) {
      return <MarkedDocument result={result} onClose={() => setShowMarkedDoc(false)} />;
  }

  return (
    <div className="w-full pb-32 md:pb-20 animate-fade-in relative pt-4">
      
      {/* Insight Trigger */}
      <button 
        onClick={() => setIsPanelOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-center gap-2 pl-4 pr-3 py-3 bg-white/90 dark:bg-indigo-950/80 backdrop-blur-xl border-l border-t border-b border-brand-500/30 rounded-l-xl shadow-lg hover:pr-5 transition-all group"
      >
        <BrainCircuit size={20} className="text-brand-600 dark:text-brand-400 group-hover:text-brand-500 dark:group-hover:text-brand-300" />
        <span className="text-xs font-bold text-slate-800 dark:text-white uppercase vertical-lr hidden md:block">AI Logic</span>
      </button>

      <ThinkingPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        result={result} 
      />
      
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
             <div className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <Award size={20} />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">Evaluation Report</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{result.studentName} • {result.className || 'No Class'}</p>
             </div>
        </div>
        <div className="hidden md:block">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full">
                {new Date().toLocaleDateString()}
            </span>
        </div>
      </div>

      {/* Main Card */}
      <div className="relative bg-white dark:bg-[#0C101A] rounded-2xl border border-slate-200 dark:border-indigo-500/10 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none">
            {/* Top Bar */}
            <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-brand-400 to-indigo-600"></div>
            
            <div className="p-5 md:p-8">
                
                {/* 
                   COMPACT GRID LAYOUT
                */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8 pb-8 border-b border-slate-100 dark:border-indigo-500/10">
                    
                    {/* LEFT: Score & Grade (Compact 3 cols) */}
                    <div className="lg:col-span-4 flex flex-col justify-center gap-4">
                         <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-between gap-4">
                             <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Total Score</div>
                                <div className="flex items-baseline gap-1">
                                     <span className="text-4xl font-bold text-slate-900 dark:text-white">{result.totalScore}</span>
                                     <span className="text-lg text-slate-500 dark:text-slate-600 font-light">/{result.maxTotalScore}</span>
                                </div>
                             </div>
                             
                             {/* Mini Ring */}
                             <div className="relative h-12 w-12 shrink-0">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                  <circle className="text-slate-200 dark:text-slate-700" strokeWidth="12" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                                  <circle 
                                     className={`${getGradeColor(scorePercentage)}`} 
                                     strokeWidth="12" 
                                     strokeDasharray={264} 
                                     strokeDashoffset={264 - (264 * scorePercentage) / 100}
                                     strokeLinecap="round" 
                                     stroke="currentColor" 
                                     fill="transparent" 
                                     r="42" cx="50" cy="50" 
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className={`text-[10px] font-bold ${getGradeColor(scorePercentage)}`}>{scorePercentage}%</span>
                                </div>
                             </div>
                         </div>
                         
                         {/* Pass/Fail or Grade Badge */}
                         <div className={`px-4 py-3 rounded-xl border text-center ${
                             scorePercentage >= 50 
                             ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
                             : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400'
                         }`}>
                             <span className="font-bold uppercase tracking-wider text-sm">
                                {scorePercentage >= 90 ? 'Excellent' : scorePercentage >= 75 ? 'Good' : scorePercentage >= 50 ? 'Pass' : 'Needs Improvement'}
                             </span>
                         </div>
                    </div>

                    {/* RIGHT: Executive Summary (Compact 9 cols) */}
                    <div className="lg:col-span-8 bg-brand-50/30 dark:bg-white/[0.02] p-5 rounded-xl border border-brand-100 dark:border-indigo-500/10 flex flex-col justify-center">
                      <h3 className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <FileSignature size={14} />
                        Executive Summary
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
                        {result.summary}
                      </p>
                    </div>
                </div>

                {/* Breakdown Grid */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Criterion Breakdown</h3>
                    <div className="grid gap-3">
                        {result.breakdown.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-[#050810] p-4 rounded-lg border border-slate-200 dark:border-indigo-500/10 shadow-sm dark:shadow-none hover:border-brand-300 dark:hover:border-indigo-500/30 transition-colors">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base">{item.name}</h4>
                                    <div className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-xs font-mono text-brand-700 dark:text-brand-200 border border-slate-200 dark:border-transparent whitespace-nowrap">
                                        {item.pointsEarned} / {item.maxPoints} pts
                                    </div>
                                </div>
                                <p className="text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed border-l-2 border-brand-200 dark:border-brand-500/30 pl-3">
                                    {item.justification}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Feedback for Student</h3>
                        <div className="p-5 bg-brand-50 dark:bg-brand-900/10 rounded-xl border border-brand-200 dark:border-brand-500/10 text-brand-900 dark:text-brand-100/80 leading-relaxed text-sm">
                            {result.feedback}
                        </div>
                    </div>
                    {result.teacherNotes && (
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Examiner Notes</h3>
                            <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-500/10 text-amber-900 dark:text-amber-200/70 leading-relaxed text-sm italic">
                                {result.teacherNotes}
                            </div>
                        </div>
                    )}
                </div>
            </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4 mt-8 pb-4">
        <Button variant="secondary" onClick={onReset} className="w-full md:w-auto h-10 text-sm">
          <RefreshCw size={14} />
          Grade Another
        </Button>
        <Button onClick={() => setShowMarkedDoc(true)} className="w-full md:w-auto bg-rose-600 hover:bg-rose-500 border-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] h-10 text-sm">
           <FileSignature size={14} />
           View Marked Paper
        </Button>
        <Button variant="primary" onClick={() => window.print()} className="w-full md:w-auto h-10 text-sm">
          <Download size={14} />
          Print Report
        </Button>
      </div>
    </div>
  );
};