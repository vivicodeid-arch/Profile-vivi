interface SpinnerProps {
  /** Height class for the container, e.g. "min-h-[60vh]" */
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

/**
 * Centered loading spinner.
 * Wraps the spinning ring in a full-height flex container by default.
 */
export default function Spinner({ className = 'min-h-[60vh]', size = 'md' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Memuat…">
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${SIZE[size]}`} />
    </div>
  );
}
