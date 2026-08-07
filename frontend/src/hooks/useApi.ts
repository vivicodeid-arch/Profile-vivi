import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => void;
}

/**
 * Generic hook for fetching data from the API.
 *
 * - Fires on mount and whenever `url` changes.
 * - Ignores stale responses when the component unmounts mid-flight.
 * - Exposes `refetch()` to manually trigger a fresh request.
 *
 * @example
 * const { data: posts, isLoading, error } = useApi<Post[]>('/blog?limit=10');
 */
export function useApi<T>(url: string): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Increment this to trigger a re-fetch without changing the URL.
  const [fetchCount, setFetchCount] = useState(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!url) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    api
      .get<{ status: string; data: T; meta?: unknown }>(url)
      .then(res => {
        if (!isMountedRef.current) return;
        // If response has both data and meta (paginated), return full response object.
        // Otherwise extract res.data.data, falling back to res.data itself.
        const hasData = res.data && typeof res.data === 'object' && 'data' in res.data;
        const hasMeta = res.data && typeof res.data === 'object' && 'meta' in res.data;
        const payload = (hasData && hasMeta)
          ? (res.data as unknown as T)          // paginated — return { data, meta }
          : hasData
            ? (res.data.data as unknown as T)   // wrapped — return inner data
            : (res.data as unknown as T);        // bare array/object
        setState({ data: payload, isLoading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!isMountedRef.current) return;
        const message =
          err instanceof Error ? err.message : 'Gagal memuat data.';
        setState({ data: null, isLoading: false, error: message });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, fetchCount]);

  const refetch = useCallback(() => setFetchCount(c => c + 1), []);

  return { ...state, refetch };
}
