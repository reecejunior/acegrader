import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { Rubric, GradingResult, SubmissionInput, AppView } from './types';
import { gradeStudentWork } from './services/geminiService';
import { saveRubric, saveSubmission } from './services/firebaseService';

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
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Nav State
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showLanding, setShowLanding] = useState(true);

  // Grading State
  const [activeRubric, setActiveRubric] = useState<Rubric | null>(null);
  const [gradingState, setGradingState] = useState<'IDLE' | 'RUBRIC_CONFIRM' | 'GRADING_INPUT' | 'PROCESSING' | 'RESULT' | 'BATCH_RESULT'>('IDLE');
  const [result, setResult] = useState<GradingResult | null>(null);
  
  // Batch State
  const [batchResults, setBatchResults] = useState<GradingResult[]>([]);
  const [batchProgress, setBatchProgress] = useState<{ current: number, total: number }>({ current: 0, total: 0 });

  // Context / Question Paper State
  const [showContextUpload, setShowContextUpload] = useState(false);
  const [contextInput, setContextInput] = useState<SubmissionInput | null>(null);

  useEffect(() => {
    // Theme Init
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
      if (currentUser) {
        setUser(currentUser);
      }
      setUser(prev => {
         if (prev?.uid.startsWith('guest-mock')) return prev;
         return currentUser;
      });
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ace-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ace-theme', 'light');
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
  };

  const handleManualLogin = (u: User) => {
    setUser(u);
  };

  const startNewGrading = (rubric: Rubric) => {
    setActiveRubric(rubric);
    // Go to RUBRIC_CONFIRM instead of GRADING_INPUT so user can select/filter criteria
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
    if (activeRubric?.id) {
       // If it's a saved rubric, go back to Dashboard
       setGradingState('IDLE');
       setActiveRubric(null);
       setCurrentView(AppView.DASHBOARD);
    } else {
       // If it's a new rubric, go back to creation
       setCurrentView(AppView.CREATE_RUBRIC);
    }
  };

  const handleConfirmAndSaveRubric = async (finalRubric: Rubric) => {
    if (user) {
      // Update the active rubric to the user-confirmed one (which might have filtered criteria)
      setActiveRubric(finalRubric);

      if (!finalRubric.id) {
        const id = await saveRubric(finalRubric, user.uid);
        setActiveRubric({ ...finalRubric, id });
      }
    }
    setGradingState('GRADING_INPUT');
  };

  const handleContextSubmit = (inputs: SubmissionInput[]) => {
    // Context is always single file
    setContextInput(inputs[0]);
  };

  const handlePaperSubmit = async (inputs: SubmissionInput[]) => {
    if (!activeRubric) return;
    
    // Batch Logic
    setGradingState('PROCESSING');
    setBatchResults([]);
    setBatchProgress({ current: 0, total: inputs.length });

    try {
      const results: GradingResult[] = [];
      
      for (let i = 0; i < inputs.length; i++) {
         setBatchProgress({ current: i + 1, total: inputs.length });
         
         const input = inputs[i];
         const gradingResult = await gradeStudentWork(activeRubric, input, contextInput || undefined);
         
         // Auto-Save
         if (user && activeRubric.id) {
            await saveSubmission(
              user.uid,
              activeRubric.id,
              activeRubric.title,
              gradingResult
            );
         }
         results.push(gradingResult);
      }

      if (results.length === 1) {
         setResult(results[0]);
         setGradingState('RESULT');
      } else {
         setBatchResults(results);
         setGradingState('BATCH_RESULT');
      }

    } catch (err) {
      console.error(err);
      alert("Error grading paper(s). See console for details.");
      setGradingState('GRADING_INPUT');
    }
  };

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />;
  }

  if (authLoading) return <div className="min-h-screen bg-paper-50 dark:bg-[#050505] flex items-center justify-center text-slate-500">Loading Ace Grader...</div>;

  if (!user) {
    return <Auth onLoginSuccess={handleManualLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-transparent transition-colors duration-500">
      <Sidebar 
        currentView={currentView} 
        onChangeView={(view) => {
            setCurrentView(view);
            if(view !== AppView.GRADING) {
                setGradingState('IDLE');
                setActiveRubric(null);
            }
        }} 
        onLogout={handleLogout}
        userEmail={user.email}
        isGuest={user.isAnonymous}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 md:ml-64 relative overflow-x-hidden pb-32 md:pb-0">
        <div className="relative z-10 pt-6 px-4 md:px-6">
          
          {currentView === AppView.DASHBOARD && (
            <Dashboard 
              userId={user.uid} 
              onSelectRubric={startNewGrading} 
              onCreateNew={() => setCurrentView(AppView.CREATE_RUBRIC)} 
            />
          )}

          {currentView === AppView.STUDENTS && (
            <StudentsView userId={user.uid} />
          )}

          {currentView === AppView.CREATE_RUBRIC && (
            <CreateRubric 
              onRubricCreated={handleRubricCreated} 
              onCancel={() => setCurrentView(AppView.DASHBOARD)} 
            />
          )}

          {currentView === AppView.GRADING && (
            <div className="max-w-5xl mx-auto md:p-6 min-h-[80vh] flex flex-col justify-center animate-slide-up">
              
              {gradingState === 'RUBRIC_CONFIRM' && activeRubric && (
                <RubricReview 
                  rubric={activeRubric} 
                  onConfirm={handleConfirmAndSaveRubric}
                  onRetake={handleRetake}
                />
              )}

              {gradingState === 'GRADING_INPUT' && activeRubric && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setCurrentView(AppView.DASHBOARD)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Assessment</h2>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Rubric: <span className="text-brand-600 dark:text-brand-400 font-medium">{activeRubric.title}</span></p>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2 bg-white/50 dark:bg-black/30 p-1.5 rounded-lg border border-slate-200 dark:border-white/5 shadow-sm">
                        <button 
                          onClick={() => setShowContextUpload(!showContextUpload)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${showContextUpload ? 'bg-brand-500 text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'}`}
                        >
                          {showContextUpload ? 'Hide Context' : 'Add Context / Question Paper'}
                        </button>
                     </div>
                  </div>

                  {/* Context Upload Section */}
                  {showContextUpload && (
                    <div className="animate-fade-in">
                       {contextInput ? (
                         <div className="p-4 bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-500/20 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="p-2 bg-brand-100 dark:bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-400">
                                  <BookOpen size={20} />
                               </div>
                               <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">Context Attached</p>
                                  <p className="text-xs text-brand-700 dark:text-brand-200/60 truncate max-w-[200px]">{contextInput.type === 'file' ? contextInput.fileName : 'Text Context'}</p>
                               </div>
                            </div>
                            <button 
                              onClick={() => setContextInput(null)} 
                              className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            >
                               <Trash2 size={16} />
                            </button>
                         </div>
                       ) : (
                         <Card className="bg-brand-50/50 dark:bg-brand-900/5 border-brand-200/50 dark:border-brand-500/10">
                            <FileUpload
                              label="Upload Question Paper (Context)"
                              description="Upload the original assignment or test paper to help the AI understand the questions."
                              placeholder="Paste the question prompt here..."
                              onContentSubmit={handleContextSubmit}
                              isProcessing={false}
                              icon="paper"
                              requireStudentName={false}
                              buttonText="Attach Context Material"
                            />
                         </Card>
                       )}
                    </div>
                  )}

                  {/* Main Student Upload */}
                  <Card title="Student Submission(s)">
                    <FileUpload 
                      label="Upload Student Work"
                      description="Accepts DOCX, PDF, Images, or Text. Upload multiple files for batch marking."
                      placeholder="Paste text or drag files here..."
                      onContentSubmit={handlePaperSubmit}
                      isProcessing={false}
                      requireStudentName={true}
                    />
                  </Card>
                </div>
              )}

              {gradingState === 'PROCESSING' && (
                <Loader 
                    message={batchProgress.total > 1 ? `Marking Paper ${batchProgress.current} of ${batchProgress.total}` : "Analyzing Work..."}
                    subMessage={batchProgress.total > 1 ? "AI is reading student details and applying criteria" : "Reading handwriting & applying criteria"} 
                />
              )}

              {gradingState === 'RESULT' && result && (
                <GradingView 
                  result={result} 
                  onReset={() => setGradingState('GRADING_INPUT')} 
                />
              )}

              {gradingState === 'BATCH_RESULT' && (
                 <BatchResults 
                    results={batchResults} 
                    onDone={() => setGradingState('GRADING_INPUT')} 
                    onViewDetail={(res) => {
                        setResult(res);
                        setGradingState('RESULT');
                    }}
                 />
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;