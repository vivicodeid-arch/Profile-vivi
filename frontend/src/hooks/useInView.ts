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

    let current = 0;
    const step   = target / (duration / 16);

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return count;
}
