
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { Rubric, GradingResult, SubmissionInput, AppView } from './types';
import { saveRubric, saveSubmission, getRubricCorrections } from './services/firebaseService';
import { gradeStudentWork } from './services/geminiService';

// Components
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CreateRubric } from './components/CreateRubric';
import { RubricReview } from './components/RubricReview';
import { FileUpload } from './components/FileUpload';
import { GradingView } from './components/GradingView';
import { StudentsView } from './components/StudentsView';
import { BatchResults } from './components/BatchResults'; 
import { Loader } from './components/Loader';
import { Landing } from './components/Landing';
import { Card } from './components/Card';
import { ArrowLeft, BookOpen, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showLanding, setShowLanding] = useState(true);
  const [activeRubric, setActiveRubric] = useState<Rubric | null>(null);
  const [gradingState, setGradingState] = useState<'IDLE' | 'RUBRIC_CONFIRM' | 'GRADING_INPUT' | 'PROCESSING' | 'RESULT' | 'BATCH_RESULT'>('IDLE');
  const [result, setResult] = useState<GradingResult | null>(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | undefined>(undefined);
  const [batchResults, setBatchResults] = useState<GradingResult[]>([]);
  const [batchProgress, setBatchProgress] = useState<{ current: number, total: number }>({ current: 0, total: 0 });
  const [showContextUpload, setShowContextUpload] = useState(false);
  const [contextInput, setContextInput] = useState<SubmissionInput | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('ace-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('ace-theme', newMode ? 'dark' : 'light');
  };

  const handleLogout = () => { auth.signOut(); setUser(null); };
  const handleManualLogin = (u: User) => setUser(u);
  
  const startNewGrading = (rubric: Rubric) => {
    setActiveRubric(rubric);
    setGradingState('RUBRIC_CONFIRM');
    setContextInput(null);
    setShowContextUpload(false);
    setBatchResults([]);
    setCurrentView(AppView.GRADING);
  };

  const handleRubricCreated = (newRubric: Rubric) => {
    setActiveRubric(newRubric);
    setGradingState('RUBRIC_CONFIRM');
    setCurrentView(AppView.GRADING);
  };

  const handleRetake = () => {
    if (activeRubric?.id) { setGradingState('IDLE'); setActiveRubric(null); setCurrentView(AppView.DASHBOARD); }
    else { setCurrentView(AppView.CREATE_RUBRIC); }
  };

  const handleConfirmAndSaveRubric = async (finalRubric: Rubric) => {
    if (user) {
      setActiveRubric(finalRubric);
      if (!finalRubric.id) {
        try {
            const id = await saveRubric(finalRubric, user.uid);
            setActiveRubric({ ...finalRubric, id });
        } catch(e) { alert('Failed to save rubric'); }
      }
    }
    setGradingState('GRADING_INPUT');
  };

  const handlePaperSubmit = async (inputs: SubmissionInput[]) => {
    if (!activeRubric || !user) return;
    
    if (!process.env.API_KEY) {
        alert("The grading engine is currently unavailable (Missing API Key). Please contact support.");
        return;
    }

    setGradingState('PROCESSING');
    setBatchResults([]);
    setBatchProgress({ current: 0, total: inputs.length });

    try {
      const results: GradingResult[] = [];
      const pastCorrections = activeRubric.id && !activeRubric.id.includes('mock') 
        ? await getRubricCorrections(user.uid, activeRubric.id) 
        : [];

      for (let i = 0; i < inputs.length; i++) {
        setBatchProgress({ current: i + 1, total: inputs.length });
        const input = inputs[i];
        try {
          const res = await gradeStudentWork(activeRubric, input, contextInput || undefined, pastCorrections);
          
          if (activeRubric.id && !activeRubric.id.includes('mock')) {
            const subId = await saveSubmission(user.uid, activeRubric.id, activeRubric.title, res);
            if (inputs.length === 1) setActiveSubmissionId(subId);
          }
          results.push(res);
        } catch (error: any) { 
           console.error(`Detailed error grading ${input.studentName || 'unnamed student'}:`, error);
           alert(`I couldn't mark the paper for ${input.studentName || 'the student'}. Error: ${error.message}`);
        }
      }

      if (results.length === 1) { 
        setResult(results[0]); 
        setGradingState('RESULT'); 
      }
      else if (results.length > 1) { 
        setBatchResults(results); 
        setGradingState('BATCH_RESULT'); 
      }
      else { 
        setGradingState('GRADING_INPUT');
      }
    } catch (err: any) {
      console.error("Outer grading loop error:", err);
      alert(err.message || 'An unexpected error occurred. Please try refreshing.');
      setGradingState('GRADING_INPUT');
    }
  };

  if (showLanding) return <Landing onEnter={() => setShowLanding(false)} />;
  if (authLoading) return <div className="min-h-screen bg-paper-50 dark:bg-[#050505] flex items-center justify-center text-slate-500 font-serif italic">Entering Studio...</div>;
  if (!user) return <Auth onLoginSuccess={handleManualLogin} />;

  return (
    <div className="flex min-h-screen bg-transparent transition-colors duration-500">
      <Sidebar currentView={currentView} onChangeView={(view) => { setCurrentView(view); if(view !== AppView.GRADING) { setGradingState('IDLE'); setActiveRubric(null); } }} onLogout={handleLogout} userEmail={user.email} isGuest={user.isAnonymous} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      <main className="flex-1 md:ml-64 relative overflow-x-hidden pb-32 md:pb-0">
        <div className="relative z-10 pt-6 px-4 md:px-6">
          {currentView === AppView.DASHBOARD && <Dashboard userId={user.uid} onSelectRubric={startNewGrading} onCreateNew={() => setCurrentView(AppView.CREATE_RUBRIC)} />}
          {currentView === AppView.STUDENTS && <StudentsView userId={user.uid} />}
          {currentView === AppView.CREATE_RUBRIC && <CreateRubric onRubricCreated={handleRubricCreated} onCancel={() => setCurrentView(AppView.DASHBOARD)} />}
          {currentView === AppView.GRADING && (
            <div className="max-w-5xl mx-auto md:p-6 min-h-[80vh] flex flex-col justify-center animate-slide-up">
              {gradingState === 'RUBRIC_CONFIRM' && activeRubric && <RubricReview rubric={activeRubric} onConfirm={handleConfirmAndSaveRubric} onRetake={handleRetake} />}
              {gradingState === 'GRADING_INPUT' && activeRubric && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-400 transition-colors"><ArrowLeft size={20} /></button>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Mentor Review</h2>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Evaluating: <span className="text-brand-600 dark:text-brand-400 font-medium">{activeRubric.title}</span></p>
                        </div>
                     </div>
                     <button onClick={() => setShowContextUpload(!showContextUpload)} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${showContextUpload ? 'bg-brand-500 text-white border-brand-400 shadow-lg' : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'}`}>
                        {showContextUpload ? 'Review Context' : '+ Add Question Paper'}
                     </button>
                  </div>
                  {showContextUpload && (
                    <div className="animate-fade-in">
                       {contextInput ? (
                         <div className="p-4 bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-500/20 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-brand-100 dark:bg-brand-500/10 rounded-lg text-brand-600"><BookOpen size={20} /></div>
                               <div><p className="text-sm font-medium text-slate-900 dark:text-white">Context Attached</p></div>
                            </div>
                            <button onClick={() => setContextInput(null)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                         </div>
                       ) : (
                         <Card className="bg-brand-50/50 dark:bg-brand-900/5 border-brand-200/50">
                            <FileUpload label="Assignment Context" description="Provide the question paper to help AI understand requirements." placeholder="Paste the prompt..." onContentSubmit={(i) => setContextInput(i[0])} isProcessing={false} icon="paper" requireStudentName={false} buttonText="Attach Context" />
                         </Card>
                       )}
                    </div>
                  )}
                  <Card title="Student Submission(s)">
                    <FileUpload label="Upload Evidence" description="AI will evaluate work using your criteria with a supportive mentor's lens." placeholder="Paste work here..." onContentSubmit={handlePaperSubmit} isProcessing={false} requireStudentName={true} />
                  </Card>
                </div>
              )}
              {gradingState === 'PROCESSING' && <Loader message={batchProgress.total > 1 ? `Marking Paper ${batchProgress.current} of ${batchProgress.total}` : "Synthesizing Evaluation..."} subMessage="Analyzing insights with professional mentorship standards" />}
              {gradingState === 'RESULT' && result && <GradingView result={result} onReset={() => setGradingState('GRADING_INPUT')} rubricId={activeRubric?.id} submissionId={activeSubmissionId} />}
              {gradingState === 'BATCH_RESULT' && <BatchResults results={batchResults} onDone={() => setGradingState('GRADING_INPUT')} onViewDetail={(res) => { setResult(res); setGradingState('RESULT'); }} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
