/**
 * frontend/src/services/api.ts
 * ----------------------------
 * Central API client for the React frontend.
 *
 * WHY A SEPARATE FILE?
 *   All fetch() calls live here — not scattered across components.
 *   If the API URL changes, you only update ONE constant (API_BASE_URL).
 *   This is the "Service Layer" pattern on the frontend side.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

// ── Generic fetch helper ──────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail ?? `HTTP ${response.status}`);
  }
  return response.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface RaceResult {
  FullName: string;
  Abbreviation: string;
  TeamName: string;
  Position: number;
  GridPosition: number;
  Points: number;
  Status: string;
}

export interface Lap {
  Driver: string;
  Team: string;
  LapNumber: number;
  LapTimeSec: number;
  Compound: string;
  TyreLife: number;
  Sector1Sec: number;
  Sector2Sec: number;
  Sector3Sec: number;
  SpeedST: number;
  IsPersonalBest: boolean;
  Position: number;
}

export interface FastestLap {
  driver: string;
  lap_number: number;
  lap_time_sec: number;
  compound: string;
  tyre_life: number;
}

export interface PredictionRequest {
  tyre_life: number;
  compound: "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET";
  air_temp: number;
  track_temp: number;
  driver: string;
}

export interface PredictionResponse {
  predicted_lap_time_sec: number;
  model_version: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/** Fetch race finishing results */
export const fetchRaceResults = (year: number, gp: string) =>
  apiFetch<{ results: RaceResult[] }>(`/sessions/${year}/${gp}/results`);

/** Fetch all laps for a session */
export const fetchLaps = (year: number, gp: string, session = "R") =>
  apiFetch<{ laps: Lap[]; total_laps: number }>(`/laps/${year}/${gp}?session=${session}`);

/** Fetch laps for a specific driver */
export const fetchDriverLaps = (year: number, gp: string, driver: string) =>
  apiFetch<{ laps: Lap[] }>(`/laps/${year}/${gp}/driver/${driver}`);

/** Fetch the fastest lap of the race */
export const fetchFastestLap = (year: number, gp: string) =>
  apiFetch<{ fastest_lap: FastestLap }>(`/laps/${year}/${gp}/fastest`);

/** Send prediction request to the ML model */
export const predictLapTime = (body: PredictionRequest) =>
  apiFetch<PredictionResponse>("/predictions/lap-time", {
    method: "POST",
    body: JSON.stringify(body),
  });
