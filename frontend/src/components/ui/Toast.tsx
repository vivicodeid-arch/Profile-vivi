import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

/**
 * Auto-dismissing toast notification.
 * Replaces window.alert() for success/error feedback in admin components.
 */
export function Toast({ message, type = 'success', onClose, duration = 3500 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-5 py-4 shadow-xl text-sm font-medium max-w-sm animate-in slide-in-from-bottom-4 duration-200 ${
        type === 'success'
          ? 'bg-green-600 text-white'
          : 'bg-red-600 text-white'
      }`}
    >
      {type === 'success'
        ? <CheckCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
        : <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      }
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-75 hover:opacity-100 transition-opacity"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * useToast — lightweight toast state manager.
 *
 * @example
 * const { toast, showToast, hideToast } = useToast();
 * showToast('Tersimpan!', 'success');
 * // In JSX: {toast && <Toast {...toast} onClose={hideToast} />}
 */
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const hideToast = () => setToast(null);

  return { toast, showToast, hideToast };
}
