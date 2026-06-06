
import React from 'react';
import { LayoutDashboard, PlusCircle, LogOut, User as UserIcon, Layers, Users, Sun, Moon, Compass } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  onLogout: () => void;
  userEmail?: string | null;
  isGuest: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, userEmail, isGuest, isDarkMode, onToggleTheme }) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onChangeView(view)}
        className={`
          relative group flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-500
          ${isActive 
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xl' 
            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}
        `}
      >
        <Icon size={18} className={`transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="text-xs font-bold uppercase tracking-[0.15em]">{label}</span>
        {isActive && (
          <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></div>
        )}
      </button>
    );
  };

  return (
    <>
      <div className="hidden md:flex w-64 h-screen fixed left-0 top-0 bg-white dark:bg-[#080808] border-r border-slate-100 dark:border-white/5 flex-col z-40 transition-colors duration-700 overflow-hidden">
        {/* Architectural Grid Background for Sidebar */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.02] dark:opacity-[0.04]" 
             style={{ backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
        </div>

        {/* Brand */}
        <div className="p-8 relative">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
              <Layers size={22} />
            </div>
            <div>
              <span className="text-lg font-serif italic font-medium text-slate-900 dark:text-white block leading-none">Ace Grader</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-slate-400 mt-1 block">The Atelier</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 pt-4 relative">
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Archive" />
          <NavItem view={AppView.STUDENTS} icon={Users} label="Roster" />
          <NavItem view={AppView.CREATE_RUBRIC} icon={PlusCircle} label="Initialize" />
        </nav>

        {/* User Footer */}
        <div className="p-6 mt-auto relative border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white shadow-inner">
               <UserIcon size={18} />
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{isGuest ? 'Guest' : userEmail?.split('@')[0]}</p>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{isGuest ? 'Demo' : 'Instructor'}</p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
                onClick={onToggleTheme}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            >
                {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
                <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button 
                onClick={onLogout}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-all"
            >
                <LogOut size={12} />
                <span>Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-paper-50 dark:from-[#050505] to-transparent pointer-events-none">
        <div className="pointer-events-auto bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl flex justify-around items-center p-2">
           {[
             { view: AppView.DASHBOARD, icon: LayoutDashboard },
             { view: AppView.STUDENTS, icon: Users },
             { view: AppView.CREATE_RUBRIC, icon: PlusCircle }
           ].map(item => (
             <button
               key={item.view}
               onClick={() => onChangeView(item.view)}
               className={`p-3 rounded-xl transition-all ${currentView === item.view ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 scale-110 shadow-lg' : 'text-slate-400'}`}
             >
               <item.icon size={20} />
             </button>
           ))}
           <button onClick={onToggleTheme} className="p-3 text-slate-400">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
           </button>
        </div>
      </div>
    </>
  );
};
