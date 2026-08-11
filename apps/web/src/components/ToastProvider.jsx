import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, CircleAlert, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'success') => {
      const id = crypto.randomUUID();
      setToasts((items) => [...items, { id, message, type }]);
      window.setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = toast.type === 'error' ? CircleAlert : toast.type === 'info' ? Info : CheckCircle2;
          return (
            <div className={`toast toast-${toast.type}`} key={toast.id}>
              <Icon size={18} />
              <span>{toast.message}</span>
              <button type="button" onClick={() => remove(toast.id)} aria-label="Close notification">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider.');
  return context;
}
