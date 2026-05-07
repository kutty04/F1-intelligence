/**
 * src/types/f1.js
 * ----------------
 * Shared data shape definitions for the entire frontend.
 *
 * WHY A TYPES FILE?
 *   When the same object structure (e.g. a "Lap") is used in
 *   multiple components, hooks, and services, you define it ONCE here.
 *   If the API changes a field name, you update it in one place.
 *
 * NOTE: These are JSDoc type definitions — they give you autocomplete
 *       and inline documentation in VS Code without needing TypeScript.
 *
 * @typedef {Object} RaceResult
 * @property {string} FullName       - Driver's full name, e.g. "Max Verstappen"
 * @property {string} Abbreviation   - 3-letter code, e.g. "VER"
 * @property {string} TeamName       - Constructor name
 * @property {number} Position       - Final race position (1 = winner)
 * @property {number} GridPosition   - Starting grid position
 * @property {number} Points         - Championship points scored
 * @property {string} Status         - "Finished", "+1 Lap", "Retired", etc.
 */

/**
 * @typedef {Object} Lap
 * @property {string}  Driver        - 3-letter code
 * @property {string}  Team          - Constructor name
 * @property {number}  LapNumber     - Which lap (1, 2, 3 ...)
 * @property {number}  LapTimeSec    - Lap time in seconds (float)
 * @property {string}  Compound      - SOFT / MEDIUM / HARD / INTER / WET
 * @property {number}  TyreLife      - Laps on this tyre set
 * @property {number}  Sector1Sec    - Sector 1 time in seconds
 * @property {number}  Sector2Sec    - Sector 2 time in seconds
 * @property {number}  Sector3Sec    - Sector 3 time in seconds
 * @property {number}  SpeedST       - Speed trap (km/h)
 * @property {boolean} IsPersonalBest - True if this was driver's fastest lap
 * @property {number}  Position      - Race position at end of this lap
 */

/**
 * @typedef {Object} GridWinStat
 * @property {string} Circuit        - Circuit name
 * @property {number} TotalRaces     - Races held at this circuit
 * @property {number} P1StarterWins  - How many times P1 starter won
 * @property {number} WinPct         - Win percentage (0–100)
 * @property {string} Summary        - Human-readable "X of Y races"
 */

/**
 * @typedef {Object} FastestLap
 * @property {string} driver         - 3-letter code
 * @property {number} lap_number     - Lap number
 * @property {number} lap_time_sec   - Time in seconds
 * @property {string} compound       - Tyre compound
 * @property {number} tyre_life      - Tyre age in laps
 */

// Tyre compound → hex color mapping (used by all chart components)
export const COMPOUND_COLORS = {
  SOFT:         "#e10600",  // F1 red
  MEDIUM:       "#ffd700",  // Gold/Yellow
  HARD:         "#f0f0f0",  // White/Light grey
  INTERMEDIATE: "#39b54a",  // Green
  WET:          "#0067ff",  // Blue
  UNKNOWN:      "#888888",  // Fallback grey
};

// Team → brand color mapping (top 5 constructors)
export const TEAM_COLORS = {
  "Red Bull Racing":   "#3671c6",
  "Ferrari":           "#e8002d",
  "Mercedes":          "#27f4d2",
  "McLaren":           "#ff8000",
  "Aston Martin":      "#229971",
  "Alpine":            "#0093cc",
  "Williams":          "#64c4ff",
  "AlphaTauri":        "#5e8faa",
  "RB":                "#6692ff",
  "Alfa Romeo":        "#c92d4b",
  "Haas F1 Team":      "#b6babd",
  "Sauber":            "#00e701",
};

// Format a float seconds value → human-readable "M:SS.mmm"
// e.g. 92.608 → "1:32.608"
export function formatLapTime(seconds) {
  if (!seconds || isNaN(seconds)) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, "0");
  return `${mins}:${secs}`;
}
