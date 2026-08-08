import { useEffect, useState } from 'react';
import { useApi } from './useApi';

/**
 * useDeferredApi — identical API to useApi, but delays the first fetch until
 * the browser is idle (via requestIdleCallback) or after `delayMs` (fallback
 * for browsers that don't support rIC).
 *
 * Use this for below-fold or non-critical data (services, pricing, partners)
 * that would otherwise compete with the LCP element for network bandwidth and
 * main-thread time during the critical first 800 ms.
 *
 * CLS note: isLoading is initialised to FALSE (not true) so that consumers
 * can distinguish "not yet scheduled" from "fetching". Skeleton components
 * should treat `data === null && !isLoading` as the pre-fetch idle state and
 * render a fixed-height placeholder immediately, preventing layout collapse
 * before the deferred fetch even starts.
 *
 * @param url     - API endpoint, passed straight through to useApi
 * @param delayMs - maximum wait before forcing the fetch (default 300 ms)
 *
 * @example
 * const { data: plans } = useDeferredApi<PricingPlan[]>('/pricing');
 */
export function useDeferredApi<T>(url: string, delayMs = 300) {
  // Start with an empty string so useApi skips the fetch (it short-circuits on
  // falsy url). We swap in the real url once the browser is idle.
  const [activeUrl, setActiveUrl] = useState('');

  useEffect(() => {
    let rafId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof requestIdleCallback !== 'undefined') {
      // Preferred path — schedule after the browser finishes any pending paint
      // and input tasks. The timeout option caps the wait to delayMs so the
      // data still arrives quickly on fast connections.
      rafId = requestIdleCallback(() => setActiveUrl(url), { timeout: delayMs });
    } else {
      // Fallback for Safari / older browsers — plain setTimeout
      timeoutId = setTimeout(() => setActiveUrl(url), delayMs);
    }

    return () => {
      if (rafId !== undefined) cancelIdleCallback(rafId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [url, delayMs]);

  const result = useApi<T>(activeUrl);

  // When activeUrl is still '' the fetch has not been scheduled yet.
  // useApi returns isLoading:true even for an empty url (initial state), which
  // would make every consumer think a request is in flight before it ever
  // starts. Return isLoading:false until the real url is activated so skeleton
  // components can render a stable placeholder without a loading spinner.
  if (!activeUrl) {
    return { ...result, isLoading: false };
  }

  return result;
}
