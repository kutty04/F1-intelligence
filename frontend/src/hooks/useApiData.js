/**
 * src/hooks/useApiData.js
 * ------------------------
 * A generic reusable hook for fetching data from the API.
 *
 * WHAT IS A CUSTOM HOOK?
 *   A custom hook is a JavaScript function whose name starts with "use".
 *   It can call other React hooks (useState, useEffect) inside it.
 *   We extract repeated fetch logic here so components stay clean.
 *
 * WITHOUT this hook, every component would repeat:
 *   const [data, setData]       = useState(null);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError]     = useState(null);
 *   useEffect(() => { fetch... }, [deps]);
 *
 * WITH this hook, components just write:
 *   const { data, loading, error } = useApiData(fetchGridWinStats);
 */

import { useState, useEffect, useCallback } from "react";
// Top-level import — this is the correct way to import in a module.
// "await import()" inside a synchronous function is invalid and crashes.
import { fetchGridWinStats } from "../services/api.js";

/**
 * Generic data-fetching hook.
 *
 * @param {Function} apiFn      - An API function from services/api.js
 * @param {Array}    args       - Arguments to pass to apiFn (as an array)
 * @param {Array}    deps       - Dependency array (re-fetches when these change)
 *
 * @returns {{ data: any, loading: boolean, error: string|null, refetch: Function }}
 *
 * Usage:
 *   const { data, loading, error } = useApiData(fetchGridWinStats, [], []);
 *   const { data, loading, error } = useApiData(fetchLaps, [2024, "Bahrain"], [year, gp]);
 */
export function useApiData(apiFn, args = [], deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setData(result);
    } catch (err) {
      setError(err.message ?? "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Convenience hook for grid win stats.
 * Wraps useApiData — no args needed since fetchGridWinStats takes none.
 *
 * Usage:
 *   const { data, loading, error } = useGridWinStats();
 *   // data.stats = [{Circuit, WinPct, ...}, ...]
 */
export function useGridWinStats() {
  return useApiData(fetchGridWinStats, [], []);
}


/**
 * Convenience hook for grid win stats.
 * Pre-wired so components don't need to know the function signature.
 */
}
