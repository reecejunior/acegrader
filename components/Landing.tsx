
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ArrowRight, Sparkles, BookOpen, ShieldCheck, PenTool, Layers, Sun, Moon } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('ace-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialMode = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialMode);
    if (initialMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('ace-theme', newMode ? 'dark' : 'light');
  };

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onEnter, 800);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col overflow-y-auto overflow-x-hidden bg-paper-50 dark:bg-[#050505] transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 translate-y-[-20px]' : 'opacity-100'}`}>
      
      {/* Theme Toggle Top Right */}
      <div className="fixed top-8 right-8 z-50 flex gap-4 items-center">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Structural Master Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]" 
           style={{ backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="max-w-5xl w-full text-center space-y-12 animate-fade-up">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                <Sparkles size={14} className="text-brand-600 dark:text-brand-400" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase">
                  Est. 2025 • The Future of Assessment
                </span>
            </div>

            <div className="space-y-6">
                <h1 className="text-7xl md:text-9xl font-serif italic font-medium tracking-tight text-slate-900 dark:text-white">
                  Ace Grader
                </h1>
                <p className="font-sans text-slate-500 dark:text-slate-400 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
                  A high-fidelity workspace for educators who value <span className="italic text-slate-900 dark:text-slate-200">precision, empathy, and time.</span>
                </p>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={handleEnter} 
                className="px-10 py-6 text-lg rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-950 hover:scale-105 transition-transform"
              >
                  Begin Assessment
                  <ArrowRight size={20} className="ml-1" />
              </Button>
              <a href="#philosophy" className="text-sm font-semibold text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors border-b border-transparent hover:border-slate-900 dark:hover:border-white pb-1">
                Our Philosophy
              </a>
            </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20">
          <div className="w-px h-12 bg-slate-900 dark:bg-white"></div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="relative py-32 px-6 bg-white dark:bg-[#080808] border-y border-slate-100 dark:border-white/5">
         <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
               <div className="space-y-8">
                  <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 dark:text-white leading-tight">
                    Beyond Algorithms:<br />
                    <span className="text-brand-600 dark:text-brand-400">Mentorship at Scale.</span>
                  </h2>
                  <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                    Most tools grade. We evaluate. Ace Grader is designed to understand the nuance of student effort, recognizing not just what is written, but the thinking behind it.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                     {[
                       { icon: BookOpen, title: "Pedagogical Depth", desc: "Expertly handles complex rubrics from primary to doctoral levels." },
                       { icon: ShieldCheck, title: "Bias Neutrality", desc: "Consistent marking that removes human fatigue and unconscious bias." },
                       { icon: PenTool, title: "Narrative Feedback", desc: "Generates mentor-like guidance that students actually value." },
                       { icon: Layers, title: "Context Aware", desc: "Learns from your specific teaching style and past corrections." }
                     ].map((item, i) => (
                       <div key={i} className="space-y-2">
                          <item.icon size={20} className="text-slate-900 dark:text-white" />
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="relative aspect-square bg-slate-50 dark:bg-white/5 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 p-12 flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05]">
                    <Layers size={300} />
                  </div>
                  <div className="relative space-y-6">
                     <div className="h-px w-12 bg-slate-900 dark:bg-white"></div>
                     <blockquote className="text-2xl font-serif italic text-slate-800 dark:text-slate-200">
                       "Teaching is the art of assisting discovery. Ace Grader handles the burden of assessment so I can focus on the heart of discovery."
                     </blockquote>
                     <cite className="block not-italic text-xs font-bold uppercase tracking-widest text-slate-400">
                       — Prof. Julian Vane, Digital Humanities
                     </cite>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 text-center border-t border-slate-100 dark:border-white/5 bg-paper-50 dark:bg-[#050505]">
        <div className="max-w-sm mx-auto space-y-6">
            <div className="flex justify-center gap-2">
              <Layers size={20} className="text-slate-900 dark:text-white" />
              <span className="text-sm font-bold tracking-tighter text-slate-900 dark:text-white uppercase">Ace Grader Platform</span>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-[0.2em]">Designed for Excellence • Zimbabwe 2025</p>
        </div>
      </footer>
    </div>
  );
};
