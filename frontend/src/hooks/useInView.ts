import { useEffect, useRef, useState } from 'react';

/**
 * Fires once when the element enters the viewport.
 * - Elements already fully above the fold (like HeroSection) fire immediately.
 * - Elements below the fold fire when they reach the middle 30% of the viewport.
 */
export function useInView(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const raf = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      // If element is already fully above mid-viewport (i.e. it's the hero), show immediately
      const aboveFold = rect.bottom < window.innerHeight * 0.5;
      if (aboveFold) {
        setInView(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        },
        // trigger when element reaches the middle 30% of the viewport
        { threshold, rootMargin: '0px 0px -30% 0px' },
      );

      observer.observe(el);
    });

    return () => cancelAnimationFrame(raf);
  }, [threshold]);

  return { ref, inView };
}

/**
 * Animates a number from 0 to `target` over `duration` ms,
 * starting only when `inView` becomes true.
 */
export function useCountUp(target: number, inView: boolean, duration = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    // Use rAF instead of setInterval to avoid long main-thread tasks (TBT).
    // rAF is throttled by the browser to the display refresh rate and never
    // runs when the tab is in the background, which setInterval ignores.
    let startTime: number | null = null;
    let rafId: number;

    const tick = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed  = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setCount(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, target, duration]);

  return count;
}
