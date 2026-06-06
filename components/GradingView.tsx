
import React, { useState } from 'react';
import { GradingResult, TeacherCorrection } from '../types';
import { Button } from './Button';
import { RefreshCw, Download, Award, BrainCircuit, FileSignature, Edit3, Check, X, ArrowRight, Quote } from 'lucide-react';
import { ThinkingPanel } from './ThinkingPanel';
import { MarkedDocument } from './MarkedDocument';
import { saveCorrection } from '../services/firebaseService';
import { auth } from '../firebase';

interface GradingViewProps {
  result: GradingResult;
  onReset: () => void;
  rubricId?: string;
  submissionId?: string;
}

export const GradingView: React.FC<GradingViewProps> = ({ result, onReset, rubricId, submissionId }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showMarkedDoc, setShowMarkedDoc] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResult, setEditedResult] = useState<GradingResult>(JSON.parse(JSON.stringify(result)));
  const [isSaving, setIsSaving] = useState(false);

  const scorePercentage = Math.round((editedResult.totalScore / editedResult.maxTotalScore) * 100);
  
  const handleScoreChange = (idx: number, newVal: string) => {
    const val = parseInt(newVal) || 0;
    const newBreakdown = [...editedResult.breakdown];
    newBreakdown[idx].pointsEarned = Math.min(val, newBreakdown[idx].maxPoints);
    const newTotal = newBreakdown.reduce((acc, curr) => acc + curr.pointsEarned, 0);
    setEditedResult({ ...editedResult, breakdown: newBreakdown, totalScore: newTotal });
  };

  const handleSaveCorrection = async () => {
    if (!rubricId || !submissionId || !auth.currentUser) return;
    setIsSaving(true);
    try {
      const correction: TeacherCorrection = {
        originalScore: result.totalScore,
        correctedScore: editedResult.totalScore,
        originalFeedback: result.feedback,
        correctedFeedback: editedResult.feedback,
        reasonForCorrection: "Instructor manual refinement",
        timestamp: Date.now()
      };
      await saveCorrection(auth.currentUser.uid, rubricId, submissionId, correction, { ...editedResult, isEditedByTeacher: true });
      setIsEditing(false);
    } catch (e) {
      alert("Archive error.");
    } finally {
      setIsSaving(false);
    }
  };

  if (showMarkedDoc) return <MarkedDocument result={editedResult} onClose={() => setShowMarkedDoc(false)} />;

  return (
    <div className="max-w-5xl mx-auto w-full pb-32 animate-fade-in relative pt-12">
      
      {/* Logic Drawer Toggle */}
      <button 
        onClick={() => setIsPanelOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-4 rounded-l-2xl shadow-2xl hover:translate-x-[-4px] transition-transform flex flex-col items-center gap-2 group"
      >
        <BrainCircuit size={18} />
        <span className="text-[8px] font-bold uppercase tracking-[0.2em] [writing-mode:vertical-lr]">Logic</span>
      </button>

      <ThinkingPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} result={editedResult} />
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 px-4">
        <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
                  <Award size={24} className="text-slate-900 dark:text-white" />
                </div>
                <h1 className="text-5xl font-serif italic text-slate-900 dark:text-white">Assessment Report</h1>
             </div>
             <p className="text-slate-400 font-light text-xl uppercase tracking-widest flex items-center gap-3">
                {editedResult.studentName} <span className="w-1 h-1 bg-slate-200 rounded-full"></span> {editedResult.className || 'Academic Period'}
             </p>
        </div>
        
        <div className="flex gap-4">
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="rounded-full px-8 border-slate-200 dark:border-white/10">
                 <Edit3 size={14} className="mr-2" /> Refine Assessment
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => { setIsEditing(false); setEditedResult(JSON.parse(JSON.stringify(result))); }}>
                   Cancel
                </Button>
                <Button onClick={handleSaveCorrection} isLoading={isSaving} className="bg-emerald-600 hover:bg-emerald-700 border-none shadow-xl">
                   <Check size={14} className="mr-2" /> Commit Changes
                </Button>
              </div>
            )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#080808] border border-slate-100 dark:border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
            <div className="h-2 w-full bg-slate-900 dark:bg-white"></div>
            
            <div className="p-10 md:p-16">
                
                {/* Score Summary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
                    <div className="lg:col-span-5 space-y-8 flex flex-col justify-center border-r border-slate-50 dark:border-white/[0.03] pr-12">
                         <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Evaluation Outcome</span>
                            <div className="flex items-baseline gap-4">
                               <span className="text-8xl md:text-9xl font-serif italic text-slate-900 dark:text-white leading-none">{editedResult.totalScore}</span>
                               <span className="text-3xl font-light text-slate-300">/ {editedResult.maxTotalScore}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">{scorePercentage}% Proficiency</span>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-white/5"></div>
                         </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Quote size={24} className="opacity-20" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Synthesized Summary</span>
                      </div>
                      {isEditing ? (
                        <textarea 
                          value={editedResult.summary}
                          onChange={(e) => setEditedResult({...editedResult, summary: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-slate-900 dark:text-white font-serif text-lg leading-relaxed focus:outline-none focus:border-slate-900 dark:focus:border-white transition-colors"
                        />
                      ) : (
                        <p className="text-slate-700 dark:text-slate-300 font-serif italic text-2xl leading-relaxed">
                          {editedResult.summary}
                        </p>
                      )}
                    </div>
                </div>

                {/* Criteria Detail */}
                <div className="space-y-12">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] text-center mb-8">Technical Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {editedResult.breakdown.map((item, idx) => (
                            <div key={idx} className="p-8 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-3xl space-y-4 hover:bg-white dark:hover:bg-white/[0.04] transition-all group">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-serif italic text-xl text-slate-900 dark:text-white">{item.name}</h4>
                                    {isEditing ? (
                                      <div className="flex items-center gap-2">
                                        <input 
                                          type="number" 
                                          value={item.pointsEarned} 
                                          onChange={(e) => handleScoreChange(idx, e.target.value)}
                                          className="w-12 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded text-center text-sm font-bold"
                                        />
                                        <span className="text-[10px] text-slate-400 font-bold">/ {item.maxPoints}</span>
                                      </div>
                                    ) : (
                                      <div className="text-2xl font-serif text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                        {item.pointsEarned}<span className="text-xs">/{item.maxPoints}</span>
                                      </div>
                                    )}
                                </div>
                                <div className="h-px w-8 bg-slate-200 dark:bg-white/10"></div>
                                {isEditing ? (
                                  <textarea 
                                    value={item.justification}
                                    onChange={(e) => {
                                      const newB = [...editedResult.breakdown];
                                      newB[idx].justification = e.target.value;
                                      setEditedResult({...editedResult, breakdown: newB});
                                    }}
                                    className="w-full bg-white dark:bg-black/20 border border-slate-100 dark:border-white/5 rounded-xl p-3 text-xs text-slate-600 focus:outline-none"
                                  />
                                ) : (
                                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-light">
                                      {item.justification}
                                  </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final Feedback */}
                <div className="mt-20 pt-20 border-t border-slate-100 dark:border-white/5">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-8">Pedagogical Guidance</h3>
                    {isEditing ? (
                      <textarea 
                        value={editedResult.feedback}
                        onChange={(e) => setEditedResult({...editedResult, feedback: e.target.value})}
                        className="w-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 p-10 rounded-[32px] text-xl font-serif leading-relaxed italic"
                      />
                    ) : (
                      <div className="p-12 md:p-16 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-[40px] text-2xl md:text-3xl font-serif italic leading-relaxed shadow-2xl relative">
                          <Quote className="absolute top-8 left-8 opacity-20" size={40} />
                          {editedResult.feedback}
                      </div>
                    )}
                </div>
            </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-6 mt-16 px-4">
        <button onClick={onReset} className="px-10 py-5 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white hover:shadow-xl transition-all flex items-center justify-center gap-3">
          <RefreshCw size={16} /> Mark Next Paper
        </button>
        <button onClick={() => setShowMarkedDoc(true)} className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-3">
           <FileSignature size={18} /> View Marked Document
        </button>
        <button onClick={() => window.print()} className="px-10 py-5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center gap-3">
          <Download size={16} /> Export Dossier
        </button>
      </div>
    </div>
  );
};
