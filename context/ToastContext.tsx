import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-sm p-4 rounded-xl shadow-2xl animate-fade-in backdrop-blur-md border transition-all"
            style={{
                backgroundColor: toast.type === 'error' ? 'rgba(225, 29, 72, 0.9)' : 
                               toast.type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 
                               'rgba(30, 41, 59, 0.9)',
                borderColor: 'rgba(255,255,255,0.1)'
            }}
          >
            <div className="mt-0.5">
                {toast.type === 'error' && <AlertCircle className="text-white" size={18} />}
                {toast.type === 'success' && <CheckCircle className="text-white" size={18} />}
                {toast.type === 'info' && <Info className="text-white" size={18} />}
            </div>
            
            <p className="text-sm font-medium text-white flex-1 leading-snug">{toast.message}</p>
            
            <button onClick={() => removeToast(toast.id)} className="text-white/60 hover:text-white shrink-0">
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};