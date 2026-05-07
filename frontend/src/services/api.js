/**
 * src/services/api.js
 * --------------------
 * Centralized API layer — ALL backend calls live here.
 *
 * WHY AXIOS OVER fetch()?
 *   • axios automatically parses JSON (no .json() needed)
 *   • axios throws errors for non-2xx responses (fetch doesn't!)
 *   • axios has request/response interceptors for auth tokens, logging, etc.
 *   • axios cancels requests easily (for cleanup in useEffect)
 *
 * ARCHITECTURE RULE:
 *   No component should ever call axios.get() directly.
 *   Components call these functions → functions call axios → axios calls FastAPI.
 *   If the API URL or endpoint changes, you update ONE file: this one.
 */

import axios from "axios";

// ─────────────────────────────────────────────────────────────────────────────
// AXIOS INSTANCE
// ─────────────────────────────────────────────────────────────────────────────
// Create a configured axios "client" with shared settings.
// Every request made through this client automatically gets:
//   - The base URL prepended (so you only write "/sessions/..." not the full URL)
//   - The Content-Type header (required for POST requests)
//   - A 15-second timeout (prevents hanging forever on slow responses)

const apiClient = axios.create({
  // import.meta.env.VITE_API_URL reads from .env file:
  //   VITE_API_URL=http://localhost:8000/api/v1  (development)
  //   VITE_API_URL=https://api.yourdomain.com/api/v1  (production)
  // If the env var isn't set, fall back to localhost.
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",

  headers: {
    "Content-Type": "application/json",
  },

  // FastF1 session.load() can take 30–90 sec on first run (no cache).
  // After data is cached locally the same call takes ~2 sec.
  // 120s gives enough headroom for a first-time cold load.
  timeout: 120000, // 120 seconds
});

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ─────────────────────────────────────────────────────────────────────────────
// Interceptors run before your code sees the response.
// This one extracts the .data property so callers get the JSON directly,
// not the full axios response object { data, status, headers, ... }.

apiClient.interceptors.response.use(
  (response) => response.data,  // success: return only the JSON body
  (error) => {
    // No response at all = network error (backend not running, or CORS blocked)
    if (!error.response) {
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        return Promise.reject(
          new Error(
            "Cannot reach the backend. Is FastAPI running on port 8000? " +
            "Run: python -m uvicorn api.main:app --reload --port 8000"
          )
        );
      }
      if (error.code === "ECONNABORTED") {
        return Promise.reject(
          new Error(
            "Request timed out. FastF1 is likely downloading data for the first time. " +
            "Please wait 30–60 seconds and try again — subsequent loads are instant."
          )
        );
      }
    }
    // Server responded with a non-2xx status
    const message =
      error.response?.data?.detail ?? // FastAPI error detail
      error.message ??                // axios message
      "Unknown API error";
    return Promise.reject(new Error(message));
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
// Each function maps to one FastAPI endpoint.
// All return Promises — use with async/await or .then()

/**
 * Fetch the final race results for a given year and Grand Prix.
 *
 * @param {number} year  - Season year, e.g. 2024
 * @param {string} gp    - Grand Prix name, e.g. "Bahrain"
 * @returns {Promise<{results: RaceResult[]}>}
 *
 * Maps to: GET /api/v1/sessions/{year}/{gp}/results
 */
export const fetchRaceResults = (year, gp) =>
  apiClient.get(`/sessions/${year}/${gp}/results`);

/**
 * Fetch all lap data for a session.
 *
 * @param {number} year
 * @param {string} gp
 * @param {string} [session="R"]  - "R"=Race, "Q"=Qualifying, "FP1/2/3"
 * @returns {Promise<{laps: Lap[], total_laps: number}>}
 *
 * Maps to: GET /api/v1/laps/{year}/{gp}?session={session}
 */
export const fetchLaps = (year, gp, session = "R") =>
  apiClient.get(`/laps/${year}/${gp}`, { params: { session } });

/**
 * Fetch all laps for a specific driver.
 *
 * @param {number} year
 * @param {string} gp
 * @param {string} driver  - 3-letter code, e.g. "VER"
 * @returns {Promise<{laps: Lap[]}>}
 *
 * Maps to: GET /api/v1/laps/{year}/{gp}/driver/{driver}
 */
export const fetchDriverLaps = (year, gp, driver) =>
  apiClient.get(`/laps/${year}/${gp}/driver/${driver}`);

/**
 * Fetch the fastest lap of a session.
 *
 * @param {number} year
 * @param {string} gp
 * @returns {Promise<{fastest_lap: FastestLap}>}
 *
 * Maps to: GET /api/v1/laps/{year}/{gp}/fastest
 */
export const fetchFastestLap = (year, gp) =>
  apiClient.get(`/laps/${year}/${gp}/fastest`);

/**
 * Fetch pre-computed grid-position win stats (from analyze_grid.py output).
 * This endpoint serves the CSV directly as JSON.
 *
 * @returns {Promise<GridWinStat[]>}
 *
 * Maps to: GET /api/v1/analytics/grid-win-stats
 */
export const fetchGridWinStats = () =>
  apiClient.get("/analytics/grid-stats");

/**
 * Send a lap time prediction request to the ML model.
 *
 * @param {{ tyre_life: number, compound: string, air_temp: number, track_temp: number, driver: string }} payload
 * @returns {Promise<{ predicted_lap_time_sec: number, model_version: string }>}
 *
 * Maps to: POST /api/v1/predictions/lap-time
 */
export const predictLapTime = (payload) =>
  apiClient.post("/predictions/lap-time", payload);

export default apiClient;
