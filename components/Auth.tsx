
import React, { useState } from 'react';
import { loginAsGuest, registerWithEmail, loginWithEmail } from '../services/firebaseService';
import { Sparkles, Mail, Lock, User as UserIcon, Quote, Info, Layers, AlertTriangle, Moon, Sun } from 'lucide-react';
import { User } from 'firebase/auth';
import { Button } from './Button';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;
      if (isSignUp) {
        if (!name.trim()) throw new Error("Academic name is required.");
        user = await registerWithEmail(name, email, password);
      } else {
        user = await loginWithEmail(email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      console.error("Auth Error:", err.code);
      let errorMsg = "Verification failed. Check your network or credentials.";
      
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/network-request-failed') {
        errorMsg = "Institutional connection refused. Your browser or network is blocking the authentication server (likely due to third-party cookie restrictions).";
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = "An account already exists with this email.";
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    const user = await loginAsGuest();
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen w-full flex bg-paper-50 dark:bg-[#050505] font-sans">
      
      {/* Sidebar Overlay Content */}
      <div className="fixed top-8 right-8 z-50">
        <button 
            onClick={toggleTheme}
            className="p-3 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="hidden lg:flex lg:w-3/5 relative flex-col justify-between p-16 overflow-hidden bg-slate-50 dark:bg-[#080808]">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]" 
             style={{ backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`, backgroundSize: '60px 60px' }}>
        </div>
        
        <div className="relative z-10 flex items-center gap-3 text-slate-900 dark:text-white">
          <Layers size={24} />
          <span className="text-xl font-serif italic font-medium tracking-tight">Ace Grader</span>
        </div>

        <div className="relative z-10 max-w-lg space-y-10">
           <Quote className="text-slate-100 dark:text-white/5 w-40 h-40 absolute -top-20 -left-20 -z-10" />
           <h2 className="text-7xl font-serif italic text-slate-900 dark:text-white leading-[1.1]">The art of <br />pedagogical <br />precision.</h2>
           <p className="text-slate-400 text-xl font-light leading-relaxed max-w-sm">A technical workspace designed for educators who refuse to compromise on assessment depth.</p>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-8">
           <div className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">EST. 2025 • ACE GRADER ATELIER</div>
           <div className="flex gap-4 items-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Atelier Online</span>
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20 bg-white dark:bg-[#050505] relative">
        <div className="w-full max-w-md space-y-12">
          <div className="space-y-4 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl font-serif italic text-slate-900 dark:text-white leading-tight">
              {isSignUp ? 'Initialize Registry' : 'Instructor Identity'}
            </h1>
            <p className="text-slate-400 text-sm font-light leading-relaxed">Access your secure grading atelier.</p>
          </div>

          {(error.includes('refused') || error.includes('blocking') || error.includes('Institutional')) && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs space-y-3 animate-fade-in shadow-lg">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider"><AlertTriangle size={14} />Browser Restriction Detected</div>
                <p className="leading-relaxed">Institutional networks or browser privacy settings are blocking the connection. Please enable <strong>third-party cookies</strong> or use the bypass below.</p>
                <button 
                  onClick={handleGuestLogin}
                  className="w-full py-2 bg-amber-600 text-white rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-amber-700 transition-colors shadow-inner"
                >
                  Bypass with Local Demo Mode
                </button>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-8">
            {isSignUp && (
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white uppercase tracking-[0.3em] ml-1 transition-colors">Academic Full Name</label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/5 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all placeholder-slate-300"
                    placeholder="e.g. Dr. Julian Vane"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white uppercase tracking-[0.3em] ml-1 transition-colors">Institutional Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/5 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all placeholder-slate-300"
                  placeholder="name@university.edu"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-bold text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white uppercase tracking-[0.3em] ml-1 transition-colors">Secure Ledger Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl py-4 pl-12 pr-6 text-slate-900 dark:text-white focus:outline-none focus:bg-white dark:focus:bg-white/5 focus:ring-1 focus:ring-slate-900 dark:focus:ring-white transition-all placeholder-slate-300"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && !error.includes('Institutional') && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-3 animate-shake">
                <Info size={16} className="mt-0.5 shrink-0" />
                <p className="leading-relaxed font-medium">{error}</p>
              </div>
            )}

            <Button 
              type="submit"
              isLoading={loading}
              className="w-full py-5 text-[10px] font-bold uppercase tracking-[0.4em] rounded-[24px]"
            >
               {isSignUp ? 'Register Account' : 'Authenticate Instructor'}
            </Button>
          </form>

          <div className="space-y-8 pt-4">
            <div className="relative">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-white/5"></div></div>
               <div className="relative flex justify-center text-[8px] uppercase font-bold tracking-[0.3em] text-slate-400"><span className="bg-white dark:bg-[#050505] px-4">Registry Alternatives</span></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border-2 border-brand-500/30 text-brand-600 dark:text-brand-400 hover:bg-brand-500/10 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-500/5"
              >
                 <Sparkles size={14} />
                 <span>Enter Demo Mode (No Auth Required)</span>
              </button>
            </div>

            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="w-full text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have a profile? Sign In' : 'Need an instructor profile? Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
