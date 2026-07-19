import { useUiStore } from '../../store/uiStore';
import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Toast() {
  const { toasts, removeToast } = useUiStore();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [onRemove, toast.duration]);

  const variants = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300'
  };

  return (
    <div className={`flex items-center justify-between p-4 mb-2 rounded-lg border shadow-sm w-72 md:w-80 transition-all transform animate-in slide-in-from-right ${variants[toast.type || 'info']}`}>
      <p className="text-sm font-medium">{toast.message}</p>
      <button onClick={onRemove} className="ml-4 hover:opacity-75">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
