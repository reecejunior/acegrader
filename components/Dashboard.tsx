
import React, { useEffect, useState } from 'react';
import { Rubric, SubmissionRecord } from '../types';
import { getUserRubrics, deleteRubric, getSubmissionsForRubric } from '../services/firebaseService';
import { Card } from './Card';
import { Button } from './Button';
import { Plus, Trash2, BookOpen, Clock, ArrowRight, History, Sparkles, Files, GraduationCap } from 'lucide-react';

interface DashboardProps {
  userId: string;
  onSelectRubric: (rubric: Rubric) => void;
  onCreateNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, onSelectRubric, onCreateNew }) => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  
  const [historyMode, setHistoryMode] = useState<{ active: boolean, rubric: Rubric | null }>({ active: false, rubric: null });
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadRubrics();
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [userId]);

  const loadRubrics = async () => {
    try {
      const data = await getUserRubrics(userId);
      setRubrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Permanently archive this criteria?")) {
      await deleteRubric(id);
      loadRubrics();
    }
  };

  const handleViewHistory = async (e: React.MouseEvent, rubric: Rubric) => {
    e.stopPropagation();
    setHistoryMode({ active: true, rubric });
    setLoadingHistory(true);
    try {
      if (rubric.id) {
        const data = await getSubmissionsForRubric(userId, rubric.id);
        setSubmissions(data);
      }
    } catch (err) {
      console.error("Error loading history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] space-y-4">
      <div className="w-12 h-12 border border-slate-200 dark:border-white/10 rounded-full animate-spin border-t-slate-900 dark:border-t-white"></div>
      <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-400">Syncing Ledger...</span>
    </div>
  );

  if (historyMode.active && historyMode.rubric) {
    const avgScore = submissions.length > 0 
      ? Math.round(submissions.reduce((acc, curr) => acc + (curr.totalScore / curr.maxTotalScore * 100), 0) / submissions.length) 
      : 0;

    return (
      <div className="max-w-6xl mx-auto w-full animate-fade-in pb-32">
        <button onClick={() => setHistoryMode({ active: false, rubric: null })} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white mb-12 transition-all group">
          <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Return to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif italic text-slate-900 dark:text-white">{historyMode.rubric.title}</h1>
            <p className="text-slate-400 font-light text-xl">Evaluation History & Performance Metrics</p>
          </div>
          <Button onClick={() => onSelectRubric(historyMode.rubric!)} variant="primary" className="shadow-2xl">
            <Plus size={18} />
            Assess New Paper
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           {[
             { label: 'Papers Marked', value: submissions.length, icon: Files },
             { label: 'Standard Deviation', value: '12%', icon: Sparkles },
             { label: 'Mean Proficiency', value: `${avgScore}%`, icon: GraduationCap }
           ].map((stat, i) => (
             <Card key={i} className="bg-white dark:bg-white/[0.02] border-slate-100 dark:border-white/5 py-8">
                <div className="flex flex-col items-center text-center space-y-2">
                   <stat.icon size={20} className="text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                   <span className="text-4xl font-serif italic text-slate-900 dark:text-white">{stat.value}</span>
                </div>
             </Card>
           ))}
        </div>

        <div className="space-y-4">
           {submissions.map((sub, i) => (
             <div key={sub.id} className="p-6 bg-white dark:bg-[#0A0A0A] border border-slate-100 dark:border-white/5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="flex items-center gap-6 flex-1">
                   <div className="text-xs font-serif italic text-slate-300 w-8">{String(i+1).padStart(2, '0')}</div>
                   <div>
                      <h4 className="text-lg font-serif italic text-slate-900 dark:text-white">{sub.studentName}</h4>
                      <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{new Date(sub.timestamp).toLocaleDateString()} • {sub.className}</p>
                   </div>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-right">
                      <div className="text-2xl font-serif text-slate-900 dark:text-white">{sub.totalScore}<span className="text-slate-300 text-sm"> / {sub.maxTotalScore}</span></div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Grade</div>
                   </div>
                   <button className="p-3 rounded-full bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      <ArrowRight size={20} />
                   </button>
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full animate-fade-in pb-32">
      
      {/* Editorial Header */}
      <div className="mb-20 pt-12 text-center md:text-left">
        <h1 className="text-6xl md:text-8xl font-serif italic text-slate-900 dark:text-white tracking-tight">
          {greeting}.
        </h1>
        <div className="h-px w-24 bg-slate-900 dark:bg-white my-8 mx-auto md:mx-0"></div>
        <p className="text-xl text-slate-400 font-light max-w-2xl leading-relaxed">
          Welcome back to your atelier. You have <span className="text-slate-900 dark:text-white font-medium italic">{rubrics.length} evaluation profiles</span> active in the current ledger.
        </p>
      </div>

      <div className="flex justify-between items-center mb-8 px-2">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Current Rubrics</h2>
        <Button onClick={onCreateNew} variant="outline" className="rounded-full px-8 py-2 border-slate-200 dark:border-white/10">
          <Plus size={14} className="mr-1" /> Initialize New
        </Button>
      </div>

      {rubrics.length === 0 ? (
        <div className="py-32 border border-slate-100 dark:border-white/5 rounded-[40px] bg-white dark:bg-white/[0.01] flex flex-col items-center text-center space-y-8 animate-fade-up">
          <BookOpen size={48} className="text-slate-200 dark:text-white/10" />
          <div className="space-y-2">
            <h3 className="text-3xl font-serif italic text-slate-900 dark:text-white">Your archive is empty.</h3>
            <p className="text-slate-400 max-w-sm mx-auto">Create a rubric to begin your journey toward pedagogical precision.</p>
          </div>
          <Button onClick={onCreateNew} className="rounded-2xl px-12 py-5 text-lg">Initialize My First Rubric</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {rubrics.map((rubric) => (
            <div 
              key={rubric.id}
              onClick={() => onSelectRubric(rubric)}
              className="group relative bg-white dark:bg-[#0A0A0A] border border-slate-100 dark:border-white/5 rounded-[32px] p-8 transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 cursor-pointer overflow-hidden"
            >
              {/* Subtle architectural lines */}
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                <Files size={120} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-12">
                   <div className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                     {rubric.subject || 'Academic'}
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button 
                        onClick={(e) => handleViewHistory(e, rubric)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 transition-colors shadow-sm"
                      >
                        <History size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, rubric.id!)}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-rose-500 hover:text-white transition-colors shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>

                <div className="space-y-4 flex-1">
                  <h3 className="text-4xl font-serif italic text-slate-900 dark:text-white leading-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {rubric.title}
                  </h3>
                  <p className="text-slate-400 font-light leading-relaxed line-clamp-2">
                    {rubric.description}
                  </p>
                </div>

                <div className="mt-12 pt-6 border-t border-slate-50 dark:border-white/[0.03] flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Criteria</span>
                        <span className="text-lg font-serif italic text-slate-900 dark:text-white">{rubric.criteria.length} Points</span>
                      </div>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-950 transition-all duration-500">
                      <ArrowRight size={20} />
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
