import { useRef, useCallback, useEffect } from 'react';

interface TiltOptions {
  maxRotate?: number; // max degrees (default 20)
  scale?: number;     // scale on hover (default 1.06)
  perspective?: number;
}

/**
 * Returns ref + event handlers that apply a CSS perspective 3D tilt effect
 * relative to the element's own bounding box — not the whole window.
 *
 * Uses will-change: transform so the browser promotes the element to its own
 * compositor layer, keeping tilt animations off the main thread (avoids the
 * "non-composited animations" Lighthouse audit warning).
 *
 * Usage:
 *   const { ref, onMouseMove, onMouseLeave } = useTilt();
 *   <div ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} />
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(opts: TiltOptions = {}) {
  const { maxRotate = 20, scale = 1.06, perspective = 600 } = opts;
  const ref = useRef<T>(null);

  // Promote to compositor layer on mount, release on unmount
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.willChange = 'transform';
    return () => { el.style.willChange = 'auto'; };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // normalized -1..1 relative to element center
    const x = ((e.clientX - rect.left)  / rect.width  - 0.5) * 2;
    const y = ((e.clientY - rect.top)   / rect.height - 0.5) * 2;
    const rotY =  x * maxRotate;
    const rotX = -y * maxRotate * 0.75;
    el.style.transition = 'transform 0.08s ease-out';
    el.style.transform  = `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${scale},${scale},${scale})`;
  }, [maxRotate, scale, perspective]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.45s ease-out';
    el.style.transform  = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
  }, [perspective]);

  return { ref, onMouseMove, onMouseLeave };
}
