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
 * LCP fix: will-change:'transform' TIDAK lagi diset pada mount.
 * Sebelumnya useEffect men-set willChange di mount, yang mempromosikan
 * elemen ke GPU layer sejak render pertama — termasuk hero image yang
 * merupakan LCP candidate. GPU layer promotion menambah overhead composite
 * step dan dapat menunda LCP paint.
 *
 * Sekarang willChange hanya diset saat mousemove aktif (user sudah
 * berinteraksi, jauh setelah LCP sudah terhitung) dan di-reset saat
 * mouseleave. Efek tilt identik, LCP tidak terdampak.
 *
 * Timer fix: timerRef dipakai untuk track setTimeout agar bisa di-cancel
 * jika user kembali hover sebelum 500ms selesai — mencegah willChange
 * di-reset saat animasi tilt masih aktif, sekaligus mencegah timer leak.
 * useEffect cleanup memastikan timer di-cancel jika komponen unmount.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(opts: TiltOptions = {}) {
  const { maxRotate = 20, scale = 1.06, perspective = 600 } = opts;
  const ref      = useRef<T>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup saat komponen unmount — cancel timer yang pending agar tidak
  // mencoba mengakses ref.current setelah elemen sudah di-unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    // Cancel pending willChange reset jika user kembali hover sebelum timer selesai
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Set willChange hanya saat interaksi — jauh setelah LCP sudah terhitung
    el.style.willChange = 'transform';
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
    // Release GPU layer setelah animasi selesai — timerRef memastikan cancel
    // jika user hover lagi sebelum timeout, sehingga tidak ada leak
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      if (ref.current) ref.current.style.willChange = 'auto';
    }, 500);
  }, [perspective]);

  return { ref, onMouseMove, onMouseLeave };
}
