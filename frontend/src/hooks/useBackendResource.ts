import { useState, useEffect, useCallback } from "react";

interface UseBackendResourceOptions<T> {
  fetcher: () => Promise<T>;
  enabled?: boolean;          // default: true — set to false to defer fetching
}

interface UseBackendResourceResult<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
  refresh: () => void;         // call to manually re-fetch
}

export function useBackendResource<T>({
  fetcher,
  enabled = true,
}: UseBackendResourceOptions<T>): UseBackendResourceResult<T> {
  const [data,    setData]    = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error,   setError]   = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (enabled) execute();
  }, [enabled, execute]);

  return { data, loading, error, refresh: execute };
}