import React, { useState } from 'react';
import { loginAsGuest, registerWithEmail, loginWithEmail } from '../services/firebaseService';
import { Sparkles, ShieldCheck, User as UserIcon, Mail, Lock, UserPlus } from 'lucide-react';
import { User } from 'firebase/auth';
import { Card } from './Card';
import { Button } from './Button';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;
      if (isSignUp) {
        if (!name.trim()) throw new Error("Name is required");
        user = await registerWithEmail(name, email, password);
      } else {
        user = await loginWithEmail(email, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("That email is already registered.");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    try {
      const user = await loginAsGuest();
      onLoginSuccess(user);
    } catch (error) {
      console.error("Guest login error:", error);
      alert("Unable to sign in as guest.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 relative z-10">
      
      <div className="w-full max-w-md animate-slide-up space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
             <Sparkles size={14} className="text-brand-400" />
             <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">Secure Access</span>
           </div>
           <div>
             <h1 className="text-4xl font-serif italic text-white font-medium mb-2">
               {isSignUp ? 'Join the Studio' : 'Welcome Back'}
             </h1>
             <p className="text-slate-400 text-sm">
               {isSignUp ? 'Create your profile to start grading.' : 'Sign in to access your dashboard.'}
             </p>
           </div>
        </div>

        {/* Auth Card */}
        <Card glow className="p-8 md:p-10">
          <form onSubmit={handleAuth} className="space-y-6">
            
            {isSignUp && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#050810] border border-indigo-500/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-brand-500 transition-colors placeholder-slate-600"
                    placeholder="Jane Doe"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#050810] border border-indigo-500/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-brand-500 transition-colors placeholder-slate-600"
                  placeholder="name@school.edu"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#050810] border border-indigo-500/10 rounded-xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-brand-500 transition-colors placeholder-slate-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center flex items-center justify-center gap-2">
                <ShieldCheck size={14} />
                {error}
              </div>
            )}

            <Button 
              type="submit"
              isLoading={loading}
              className="w-full py-4 text-base"
            >
               {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 flex flex-col gap-5 text-center">
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>

            <div className="relative">
               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
               <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0A0F1C] px-3 text-slate-600 font-bold">Or</span></div>
            </div>

            <Button 
              variant="secondary"
              onClick={handleGuestLogin}
              disabled={loading}
              className="w-full"
            >
               <UserIcon size={16} />
               <span>Continue as Guest</span>
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
};