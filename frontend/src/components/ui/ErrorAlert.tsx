import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
  className?: string;
}

/**
 * Inline error banner. Used in forms and data-fetch error states.
 */
export default function ErrorAlert({ message, className = '' }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700
        dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 ${className}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
