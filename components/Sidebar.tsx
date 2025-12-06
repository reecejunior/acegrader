import React from 'react';
import { LayoutDashboard, PlusCircle, LogOut, User as UserIcon, Layers, Users, Sun, Moon } from 'lucide-react';
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
  
  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => onChangeView(view)}
      className={`
        relative group flex items-center justify-center gap-3 transition-all duration-300
        /* Desktop */
        md:w-full md:px-4 md:py-3 md:justify-start md:rounded-xl
        /* Mobile */
        flex-col md:flex-row p-2
      `}
    >
      {/* Mobile Active Glow */}
      {currentView === view && (
         <div className="md:hidden absolute -inset-3 bg-brand-500/20 blur-xl rounded-full"></div>
      )}

      <Icon 
        size={24} 
        className={`
          relative z-10 transition-colors duration-300
          ${currentView === view ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-200'}
        `} 
      />
      <span className={`
        text-[10px] md:text-sm font-medium transition-colors
        ${currentView === view ? 'text-brand-700 dark:text-white' : 'text-slate-500 group-hover:text-slate-800 dark:text-slate-500 dark:group-hover:text-slate-300'}
        hidden md:block
      `}>
        {label}
      </span>
      
      {/* Mobile Dot Indicator */}
      {currentView === view && (
        <div className="md:hidden absolute -bottom-2 w-1 h-1 bg-brand-400 rounded-full shadow-[0_0_8px_currentColor]"></div>
      )}
    </button>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex w-64 h-screen fixed left-0 top-0 bg-white/60 dark:bg-[#020408]/90 backdrop-blur-xl border-r border-slate-200 dark:border-indigo-500/10 flex-col z-40 transition-colors duration-500">
        {/* Brand */}
        <div className="p-8 border-b border-slate-200 dark:border-indigo-500/10">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center text-brand-600 dark:text-brand-500">
              <div className="absolute inset-0 bg-brand-500/20 blur-lg rounded-full"></div>
              <Layers size={28} className="relative z-10" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Ace Grader</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2 pt-8">
          <button
            onClick={() => onChangeView(AppView.DASHBOARD)}
            className={`w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-300 ${currentView === AppView.DASHBOARD ? 'bg-brand-50 dark:bg-indigo-500/10 text-brand-900 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(14,165,233,0.05)] border border-brand-200 dark:border-indigo-500/10' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            <LayoutDashboard size={20} className={currentView === AppView.DASHBOARD ? 'text-brand-600 dark:text-brand-400' : ''} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => onChangeView(AppView.STUDENTS)}
            className={`w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-300 ${currentView === AppView.STUDENTS ? 'bg-brand-50 dark:bg-indigo-500/10 text-brand-900 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(14,165,233,0.05)] border border-brand-200 dark:border-indigo-500/10' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            <Users size={20} className={currentView === AppView.STUDENTS ? 'text-indigo-600 dark:text-indigo-400' : ''} />
            <span className="font-medium">Students</span>
          </button>

          <button
            onClick={() => onChangeView(AppView.CREATE_RUBRIC)}
            className={`w-full px-4 py-3 flex items-center gap-3 rounded-xl transition-all duration-300 ${currentView === AppView.CREATE_RUBRIC ? 'bg-brand-50 dark:bg-indigo-500/10 text-brand-900 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(14,165,233,0.05)] border border-brand-200 dark:border-indigo-500/10' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            <PlusCircle size={20} className={currentView === AppView.CREATE_RUBRIC ? 'text-emerald-600 dark:text-emerald-400' : ''} />
            <span className="font-medium">New Rubric</span>
          </button>
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-indigo-500/10 bg-slate-50/50 dark:bg-[#010204]/40">
          
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
               <UserIcon size={14} />
             </div>
             <div className="flex-1 overflow-hidden">
               <p className="text-sm font-semibold text-slate-700 dark:text-white truncate">{isGuest ? 'Guest' : userEmail?.split('@')[0]}</p>
               <p className="text-[10px] text-slate-500 uppercase tracking-wider">{isGuest ? 'Trial Mode' : 'Pro Account'}</p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button 
                onClick={onToggleTheme}
                className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 dark:hover:text-white transition-colors"
                title="Toggle Theme"
            >
                {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button 
                onClick={onLogout}
                className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/5 dark:hover:text-rose-400 transition-colors"
            >
                <LogOut size={14} />
                <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE FLOATING DOCK */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50 animate-slide-up">
        <div className="absolute inset-0 bg-white/90 dark:bg-[#0A0F1C]/90 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-indigo-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]"></div>
        <div className="relative z-10 flex justify-around items-center p-4">
          <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Home" />
          <NavItem view={AppView.STUDENTS} icon={Users} label="Students" />
          
          {/* Center Action Button */}
          <button 
             onClick={() => onChangeView(AppView.CREATE_RUBRIC)}
             className="relative -top-8 bg-brand-600 dark:bg-brand-500 text-white p-4 rounded-full shadow-lg dark:shadow-[0_0_20px_rgba(14,165,233,0.5)] border-4 border-paper-50 dark:border-[#020408] transform transition-transform active:scale-90"
          >
            <PlusCircle size={28} />
          </button>

          <button 
            onClick={onToggleTheme}
            className="flex flex-col items-center justify-center gap-1 p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>
      </div>
    </>
  );
};