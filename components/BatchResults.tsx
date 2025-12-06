import React from 'react';
import { GradingResult } from '../types';
import { Button } from './Button';
import { Card } from './Card';
import { CheckCircle2, ChevronRight, Download, RefreshCw, BarChart3, User } from 'lucide-react';

interface BatchResultsProps {
  results: GradingResult[];
  onDone: () => void;
  onViewDetail: (result: GradingResult) => void;
}

export const BatchResults: React.FC<BatchResultsProps> = ({ results, onDone, onViewDetail }) => {
  const avgScore = Math.round(results.reduce((acc, curr) => acc + (curr.totalScore / curr.maxTotalScore * 100), 0) / results.length);
  
  const getGradeColor = (p: number) => {
    if (p >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (p >= 70) return 'text-brand-400 bg-brand-500/10 border-brand-500/20';
    if (p >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="max-w-4xl mx-auto w-full animate-slide-up pb-20">
      <div className="text-center mb-10 space-y-2">
         <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
           <CheckCircle2 size={12} />
           Batch Complete
         </div>
         <h2 className="text-4xl font-bold text-white">Assessment Summary</h2>
         <p className="text-slate-400">Successfully graded {results.length} student submissions.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <Card className="bg-[#0C101A] border-indigo-500/10 flex flex-col items-center justify-center py-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Papers Processed</span>
            <span className="text-4xl font-light text-white mt-2">{results.length}</span>
         </Card>
         <Card className="bg-[#0C101A] border-indigo-500/10 flex flex-col items-center justify-center py-6">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Class Average</span>
            <span className={`text-4xl font-light mt-2 ${getGradeColor(avgScore).split(' ')[0]}`}>{avgScore}%</span>
         </Card>
      </div>

      <div className="bg-[#0C101A] rounded-2xl border border-indigo-500/10 overflow-hidden mb-8">
         <div className="grid grid-cols-12 px-6 py-4 border-b border-indigo-500/10 text-xs font-bold uppercase tracking-widest text-slate-500">
            <div className="col-span-5 md:col-span-4">Student</div>
            <div className="col-span-3 hidden md:block">Class</div>
            <div className="col-span-4 md:col-span-3 text-right md:text-left">Score</div>
            <div className="col-span-3 md:col-span-2 text-right">Action</div>
         </div>
         
         <div className="divide-y divide-indigo-500/10">
            {results.map((res, idx) => {
               const score = Math.round((res.totalScore / res.maxTotalScore) * 100);
               return (
                  <div key={idx} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group">
                     <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-xs">
                           <User size={14} />
                        </div>
                        <div>
                           <div className="font-medium text-white">{res.studentName}</div>
                           <div className="text-xs text-slate-500 truncate max-w-[120px] md:hidden">{res.className || 'No Class'}</div>
                        </div>
                     </div>
                     <div className="col-span-3 hidden md:block text-sm text-slate-400">
                        {res.className || '-'}
                     </div>
                     <div className="col-span-4 md:col-span-3 flex justify-end md:justify-start">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(score)}`}>
                           {score}% ({res.totalScore}/{res.maxTotalScore})
                        </span>
                     </div>
                     <div className="col-span-3 md:col-span-2 flex justify-end">
                        <button 
                           onClick={() => onViewDetail(res)}
                           className="p-2 rounded-lg bg-white/5 hover:bg-brand-500 hover:text-white text-slate-400 transition-all"
                           title="View Report"
                        >
                           <ChevronRight size={16} />
                        </button>
                     </div>
                  </div>
               )
            })}
         </div>
      </div>

      <div className="flex justify-center gap-4">
         <Button variant="secondary" onClick={onDone}>
            <RefreshCw size={16} />
            Grade More
         </Button>
         <Button onClick={() => window.print()}>
            <Download size={16} />
            Export Summary
         </Button>
      </div>
    </div>
  );
};