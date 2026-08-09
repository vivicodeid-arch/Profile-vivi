import { useEffect, useRef, useState } from 'react';

/**
 * Fires once when the element enters the viewport.
 * - Elements already fully above the fold (like HeroSection) fire immediately.
 * - Elements below the fold fire when they scroll into the bottom 10% of the viewport.
 *   (reduced from -30% to -10% so animations trigger earlier on small mobile screens)
 */
export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observer: IntersectionObserver | null = null;

    const raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      // If element is already fully above mid-viewport (i.e. it's the hero), show immediately
      const aboveFold = rect.bottom < window.innerHeight * 0.5;
      if (aboveFold) {
        setInView(true);
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer?.disconnect();
            observer = null;
          }
        },
        // -10% instead of -30% so elements trigger sooner on short mobile viewports
        { threshold, rootMargin: '0px 0px -10% 0px' },
      );

      observer.observe(el);
    });

    return () => {
      cancelAnimationFrame(raf);
      // Always disconnect observer on cleanup to prevent memory leaks
      observer?.disconnect();
    };
  }, [threshold]);

  return { ref, inView };
}

/**
 * Animates a number from 0 to `target` over `duration` ms,
 * starting only when `inView` becomes true.
 * Respects prefers-reduced-motion: jumps to target immediately.
 */
export function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    // Respect reduced-motion preference — skip animation, show final value immediately
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(target);
      return;
    }

    let startTime: number | null = null;
    let rafId: number;
    let prevValue = -1;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const next = progress < 1 ? Math.floor(progress * target) : target;
      // Skip setState if value hasn't changed — avoids unnecessary re-renders
      if (next !== prevValue) {
        prevValue = next;
        setCount(next);
      }
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, target, duration]);

  return count;
}
