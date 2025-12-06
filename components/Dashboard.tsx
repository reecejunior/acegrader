import React, { useEffect, useState } from 'react';
import { Rubric, SubmissionRecord } from '../types';
import { getUserRubrics, deleteRubric, getSubmissionsForRubric } from '../services/firebaseService';
import { Card } from './Card';
import { Button } from './Button';
import { Plus, Trash2, BookOpen, Clock, ArrowRight, History, Sparkles } from 'lucide-react';

interface DashboardProps {
  userId: string;
  onSelectRubric: (rubric: Rubric) => void;
  onCreateNew: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userId, onSelectRubric, onCreateNew }) => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  
  // History State
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
    if (confirm("Are you sure you want to delete this rubric?")) {
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

  // Helper for dynamic card colors based on Subject
  const getSubjectColor = (subject: string = '') => {
    const s = subject.toLowerCase();
    if (s.includes('math') || s.includes('phys')) return 'bg-indigo-500';
    if (s.includes('eng') || s.includes('lit')) return 'bg-rose-500';
    if (s.includes('hist') || s.includes('soc')) return 'bg-amber-500';
    if (s.includes('sci') || s.includes('bio')) return 'bg-emerald-500';
    return 'bg-brand-500';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-slate-500 text-sm tracking-widest uppercase">Syncing Workspace...</span>
    </div>
  );

  // --- HISTORY VIEW ---
  if (historyMode.active && historyMode.rubric) {
    const avgScore = submissions.length > 0 
      ? Math.round(submissions.reduce((acc, curr) => acc + (curr.totalScore / curr.maxTotalScore * 100), 0) / submissions.length) 
      : 0;

    return (
      <div className="max-w-7xl mx-auto w-full animate-fade-in pb-20">
        <button onClick={() => setHistoryMode({ active: false, rubric: null })} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white mb-8 transition-colors pl-1">
          <ArrowRight className="rotate-180" size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6 px-1">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">{historyMode.rubric.title}</h1>
            <p className="text-slate-500 dark:text-slate-400">Class Performance & History</p>
          </div>
          <Button onClick={() => onSelectRubric(historyMode.rubric!)} className="w-full md:w-auto">
            <Plus size={18} />
            Grade New Paper
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
           <Card className="bg-white dark:bg-[#0C101A] col-span-1 border-slate-200 dark:border-indigo-500/10">
             <div className="flex flex-col">
               <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Graded</span>
               <span className="text-3xl md:text-4xl font-light text-slate-800 dark:text-white mt-2">{submissions.length}</span>
             </div>
           </Card>
           <Card className="bg-white dark:bg-[#0C101A] col-span-1 border-slate-200 dark:border-indigo-500/10">
             <div className="flex flex-col">
               <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Avg. Score</span>
               <div className="flex items-baseline gap-1 mt-2">
                 <span className={`text-3xl md:text-4xl font-light ${avgScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : avgScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                   {submissions.length > 0 ? avgScore : '--'}
                 </span>
                 <span className="text-sm text-slate-600">%</span>
               </div>
             </div>
           </Card>
        </div>

        {loadingHistory ? (
          <div className="text-center py-20 text-slate-500">Loading records...</div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-300 dark:border-indigo-500/10 rounded-2xl bg-slate-50 dark:bg-white/5">
            <h3 className="text-lg text-slate-800 dark:text-white mb-1">No Graded Papers Yet</h3>
            <p className="text-slate-500">Submissions will appear here after grading.</p>
          </div>
        ) : (
          <div className="space-y-3">
             {submissions.map((sub) => (
               <div key={sub.id} className="group p-5 rounded-2xl bg-white dark:bg-[#0C101A] border border-slate-200 dark:border-indigo-500/10 hover:border-brand-300 dark:hover:border-indigo-500/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className={`w-1 h-12 rounded-full mt-1 ${
                      (sub.totalScore/sub.maxTotalScore) >= 0.85 ? 'bg-emerald-500' :
                      (sub.totalScore/sub.maxTotalScore) >= 0.70 ? 'bg-brand-500' :
                      (sub.totalScore/sub.maxTotalScore) >= 0.50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}></div>
                    <div>
                      <h4 className="text-lg font-medium text-slate-800 dark:text-white">{sub.studentName}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-1">{sub.summary}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end pl-5 md:pl-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-600">
                       <Clock size={12} />
                       {new Date(sub.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xl font-light text-slate-800 dark:text-white">{sub.totalScore}<span className="text-slate-500 dark:text-slate-600 text-sm">/{sub.maxTotalScore}</span></div>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    );
  }

  // --- MAIN DASHBOARD VIEW ---

  return (
    <div className="max-w-7xl mx-auto w-full animate-fade-in pb-32 md:pb-8">
      
      {/* Hero Section */}
      <div className="mb-12 relative px-2">
        <div className="absolute top-0 right-0 p-3 bg-white dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 animate-pulse-slow hidden md:block shadow-sm">
           <Sparkles className="text-amber-400 dark:text-amber-300" size={20} />
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-200 dark:to-slate-400 tracking-tight mb-2">
          {greeting}.
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg">
          Your marking studio is ready. Select an assignment to begin assessment.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6 px-2">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Rubrics</h2>
        <Button onClick={onCreateNew} className="hidden md:flex py-2 px-4 text-xs">
          <Plus size={16} /> New Rubric
        </Button>
      </div>

      {rubrics.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-slate-300 dark:border-indigo-500/10 rounded-3xl bg-white dark:bg-[#0C101A] mx-2">
          <div className="mb-6 inline-flex p-6 rounded-full bg-brand-50 dark:bg-gradient-to-tr dark:from-brand-500/20 dark:to-indigo-500/20 text-brand-500 dark:text-brand-400 shadow-xl shadow-brand-500/10">
            <BookOpen size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Workspace Empty</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">Create your first rubric to start grading papers with AI precision.</p>
          <Button onClick={onCreateNew}>Initialize First Rubric</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rubrics.map((rubric) => (
            <div 
              key={rubric.id}
              onClick={() => onSelectRubric(rubric)}
              className="group relative overflow-hidden rounded-3xl bg-white dark:bg-[#0C101A] border border-slate-200 dark:border-indigo-500/10 hover:border-brand-400 dark:hover:border-indigo-500/30 transition-all duration-500 cursor-pointer active:scale-[0.98] shadow-lg shadow-slate-200/50 dark:shadow-none"
            >
              {/* Colored Accent Strip */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${getSubjectColor(rubric.subject)} opacity-60 group-hover:opacity-100 transition-opacity`}></div>
              
              {/* Glass Shard Highlight Effect */}
              <div className="absolute -top-[100%] -right-[100%] w-[200%] h-[200%] bg-gradient-to-b from-white/10 to-transparent rotate-45 group-hover:top-[-50%] transition-all duration-700 pointer-events-none"></div>

              <div className="p-6 pl-8 relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                     {rubric.subject || 'General'}
                   </span>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={(e) => handleViewHistory(e, rubric)}
                        className="p-2 rounded-full bg-slate-100 dark:bg-black/40 hover:bg-white dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-sm"
                        title="History"
                      >
                        <History size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, rubric.id!)}
                        className="p-2 rounded-full bg-slate-100 dark:bg-black/40 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 backdrop-blur-md shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                   </div>
                </div>

                <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-brand-700 dark:group-hover:text-transparent dark:group-hover:bg-clip-text dark:group-hover:bg-gradient-to-r dark:group-hover:from-white dark:group-hover:to-slate-400 transition-all">
                  {rubric.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-2 h-10 leading-relaxed mb-6">
                  {rubric.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-600 pt-4 border-t border-slate-100 dark:border-white/5">
                   <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{rubric.createdAt ? new Date(rubric.createdAt).toLocaleDateString() : 'Just now'}</span>
                   </div>
                   <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                   <span>{rubric.criteria.length} Criteria</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};