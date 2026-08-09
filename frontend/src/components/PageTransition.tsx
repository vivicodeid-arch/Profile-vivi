import { useEffect, useRef } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  locationKey: string;
}

export default function PageTransition({ children, locationKey }: PageTransitionProps) {
  const ref    = useRef<HTMLDivElement>(null);
  // Track pending timer and rAF handles for cleanup on unmount
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const raf1Ref  = useRef<number | null>(null);
  const raf2Ref  = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Scroll to top on page change — setTimeout pushes outside critical render path
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 0);

    // Restart CSS animation without forcing a layout reflow.
    // Double-rAF ensures the browser has painted the "removed" state
    // before re-adding the class, replacing the old `void el.offsetWidth` trick.
    el.classList.remove('page-animate');
    raf1Ref.current = requestAnimationFrame(() => {
      raf1Ref.current = null;
      raf2Ref.current = requestAnimationFrame(() => {
        raf2Ref.current = null;
        el.classList.add('page-animate');
      });
    });

    // Cleanup: cancel any pending timer/rAF if locationKey changes again
    // before the previous effect's callbacks finish
    return () => {
      if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null; }
      if (raf1Ref.current  !== null) { cancelAnimationFrame(raf1Ref.current);  raf1Ref.current  = null; }
      if (raf2Ref.current  !== null) { cancelAnimationFrame(raf2Ref.current);  raf2Ref.current  = null; }
    };
  }, [locationKey]);

  return (
    <div ref={ref} className="page-animate">
      {children}
    </div>
  );
}
