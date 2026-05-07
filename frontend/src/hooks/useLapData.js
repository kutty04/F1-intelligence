/**
 * src/hooks/useLapData.js
 * ------------------------
 * Domain-specific hook for lap data.
 * Wraps useApiData with the exact arguments for lap fetching.
 *
 * WHY DOMAIN HOOKS?
 *   useApiData is generic — it works for anything.
 *   useLapData is specific — it knows about laps, drivers, and sessions.
 *   Components import the specific hook, not the generic one.
 *   This keeps components clean and makes it obvious what data they need.
 */

import { useState, useEffect, useCallback } from "react";
import { fetchLaps, fetchDriverLaps, fetchFastestLap } from "../services/api.js";

/**
 * Fetch all laps for a race session.
 *
 * @param {number} year
 * @param {string} gp
 * @param {string} [session="R"]
 *
 * @returns {{ laps: Lap[]|null, totalLaps: number, loading: boolean, error: string|null }}
 *
 * Usage in a component:
 *   const { laps, loading, error } = useLapData(2024, "Bahrain");
 */
export function useLapData(year, gp, session = "R") {
  const [laps, setLaps]           = useState(null);
  const [totalLaps, setTotalLaps] = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetch = useCallback(async () => {
    if (!year || !gp) return;  // Guard: don't fetch with empty params
    setLoading(true);
    setError(null);
    try {
      const result = await fetchLaps(year, gp, session);
      setLaps(result.laps);
      setTotalLaps(result.total_laps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  // Re-fetch when year, gp, or session changes
  }, [year, gp, session]);

  useEffect(() => { fetch(); }, [fetch]);

  return { laps, totalLaps, loading, error, refetch: fetch };
}

/**
 * Fetch laps for a specific driver.
 *
 * @param {number} year
 * @param {string} gp
 * @param {string} driver - 3-letter code e.g. "VER"
 *
 * @returns {{ laps: Lap[]|null, loading: boolean, error: string|null }}
 */
export function useDriverLaps(year, gp, driver) {
  const [laps, setLaps]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    if (!year || !gp || !driver) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDriverLaps(year, gp, driver);
      setLaps(result.laps);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, gp, driver]);

  useEffect(() => { fetch(); }, [fetch]);

  return { laps, loading, error, refetch: fetch };
}

/**
 * Fetch the single fastest lap of a race.
 *
 * @returns {{ fastestLap: FastestLap|null, loading: boolean, error: string|null }}
 */
export function useFastestLap(year, gp) {
  const [fastestLap, setFastestLap] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const fetch = useCallback(async () => {
    if (!year || !gp) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFastestLap(year, gp);
      setFastestLap(result.fastest_lap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [year, gp]);

  useEffect(() => { fetch(); }, [fetch]);

  return { fastestLap, loading, error };
}
