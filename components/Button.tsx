import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative group overflow-hidden px-8 py-3.5 rounded-xl font-medium tracking-wide transition-all duration-300 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-sm";
  
  const variants = {
    primary: "bg-brand-600 dark:bg-brand-500 text-white shadow-lg shadow-brand-500/20 dark:shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-brand-500/40 dark:hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] border border-brand-500/50 dark:border-brand-400/50",
    secondary: "bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white shadow-sm",
    ghost: "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Shine Effect */}
      {variant === 'primary' && !isLoading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>
      )}

      {isLoading ? (
        <>
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
          <span className="opacity-90">Processing...</span>
        </>
      ) : children}
    </button>
  );
};