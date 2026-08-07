import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container – positioned at bottom-right */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const bgColor =
            toast.type === 'success'
              ? 'bg-[#10B981]'
              : toast.type === 'error'
              ? 'bg-[#EF4444]'
              : toast.type === 'warning'
              ? 'bg-[#F59E0B]'
              : 'bg-[#2B0071]';

          return (
            <div
              key={toast.id}
              className={`${bgColor} text-white px-4 py-3 rounded-xl shadow-lg pointer-events-auto animate-slide-up flex items-center justify-between`}
            >
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-white/80 hover:text-white transition-colors"
                aria-label="Close notification"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}