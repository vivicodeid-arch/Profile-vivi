import { useEffect, useRef } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  locationKey: string;
}

export default function PageTransition({ children, locationKey }: PageTransitionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Scroll to top on page change
    // Use setTimeout to move this outside the critical render path and avoid LCP delay
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);

    // Restart CSS animation without forcing a layout reflow.
    // Double-rAF ensures the browser has painted the "removed" state
    // before re-adding the class, replacing the old `void el.offsetWidth` trick.
    el.classList.remove('page-animate');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add('page-animate');
      });
    });
  }, [locationKey]);

  return (
    <div ref={ref} className="page-animate">
      {children}
    </div>
  );
}
