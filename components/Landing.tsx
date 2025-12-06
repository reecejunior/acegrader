import React, { useState } from 'react';
import { Button } from './Button';
import { ChevronRight, Sparkles, Layers } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(onEnter, 800);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#050505] transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
      
      {/* 1. BACKGROUND (Static Gradients instead of Video) */}
      <div className="absolute inset-0 z-0 w-full h-full">
          {/* Deep Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#020408] via-[#080c14] to-[#020408]"></div>
          
          {/* Abstract Ambient Glows */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] opacity-40 animate-pulse-slow"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] opacity-30 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          
          {/* Texture (Global app noise) */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-5xl px-6 space-y-12 text-center">
        
        <div className="space-y-8 animate-fade-up">
            {/* Badge - Matches Sidebar 'Pro Account' style but glowing */}
            <div className="inline-flex items-center justify-center gap-3 px-5 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 backdrop-blur-md mb-6 shadow-[0_0_30px_-10px_rgba(14,165,233,0.3)]">
                <Sparkles size={14} className="text-brand-400" />
                <span className="text-brand-100 font-semibold tracking-[0.2em] text-[10px] md:text-xs uppercase">
                  Intelligent Assessment Studio
                </span>
            </div>
            
            {/* Title - Matches Dashboard H1 style */}
            <div className="relative">
              <h2 className="text-7xl md:text-9xl font-serif italic font-medium tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-400 drop-shadow-2xl">
                Ace Grader
              </h2>
            </div>
            
            {/* Subtitle - Matches Slate-400 hierarchy */}
            <p className="font-sans text-slate-300 text-lg md:text-2xl leading-relaxed max-w-2xl mx-auto font-light">
               The illuminated workspace for effortless, <br className="hidden md:block" />
               precision rubric marking.
            </p>
            
            <div className="pt-12">
              {/* Button - Matches 'primary' variant in Button.tsx exactly but scaled up */}
              <Button 
                onClick={handleEnter} 
                className="px-10 py-5 text-base md:text-lg rounded-2xl shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)] border-brand-400/50 hover:scale-105 transition-transform duration-300 bg-brand-500 hover:bg-brand-400 text-white font-medium tracking-wide"
              >
                  <span className="mr-1">Enter Workspace</span>
                  <ChevronRight size={20} />
              </Button>
            </div>
        </div>
        
        {/* Footer Brand Match */}
        <div className="absolute bottom-10 opacity-40 flex items-center gap-2">
            <Layers size={16} className="text-slate-500" />
            <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Ace Grader Platform</span>
        </div>
      </div>
    </div>
  );
};