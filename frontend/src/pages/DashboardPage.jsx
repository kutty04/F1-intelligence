/**
 * src/pages/DashboardPage.jsx
 * ----------------------------
 * The home page — shows a high-level summary of a selected race.
 *
 * COMPONENT HIERARCHY for this page:
 *
 *   DashboardPage          ← fetches data, manages selectors
 *     ├── StatCard ×4      ← displays: winner, fastest lap, pole, total laps
 *     ├── LapTimeChart     ← receives laps as props, renders line chart
 *     └── [race selector]  ← year + GP dropdowns
 *
 * DATA FLOW:
 *   DashboardPage (fetches) → passes data down as props → child components render
 *   Children NEVER fetch — they only receive and display.
 */
import { useState, useEffect } from "react";
import { StatCard }      from "../components/ui/StatCard.jsx";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx";
import { ErrorBanner }   from "../components/ui/ErrorBanner.jsx";
import { LapTimeChart }  from "../components/charts/LapTimeChart.jsx";
import { CircuitMap }    from "../components/charts/CircuitMap.jsx";
import { WeatherStation } from "../components/ui/WeatherStation.jsx";
import { useLapData, useFastestLap } from "../hooks/useLapData.js";
import { formatLapTime } from "../types/f1.js";
import { triggerDataRefresh, fetchSchedule } from "../services/api.js";

// Available races for the selector dropdowns
const YEARS = [2026, 2025, 2024, 2023, 2022];

// Top 5 drivers to show by default in the lap time chart
const DEFAULT_DRIVERS = ["VER", "HAM", "LEC", "SAI", "PER"];

export function DashboardPage() {
  // ── Local state for selectors ──────────────────────────────────────────
  // useState() returns [currentValue, setterFn]
  // When setter is called, React re-renders the component.
  const [year, setYear] = useState(2026);
  const [gp,   setGp]   = useState("Australian Grand Prix");
  const [availableGps, setAvailableGps] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch schedule when year changes
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const response = await fetchSchedule(year);
        const names = response.events.map(e => e.EventName);
        setAvailableGps(names);
        // If current GP is not in new list, pick the first one
        if (!names.includes(gp)) {
          setGp(names[0] || "");
        }
      } catch (err) {
        console.error("Failed to load schedule", err);
      }
    };
    loadSchedule();
  }, [year]);

  const handleRefresh = async () => {
    if (!window.confirm("Start full data refresh? This will take 15-60 minutes in the background.")) return;
    setRefreshing(true);
    try {
      const res = await triggerDataRefresh();
      alert(res.message);
    } catch (err) {
      alert("Refresh failed: " + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // ── Fetch data using custom hooks ──────────────────────────────────────
  // These hooks internally call useEffect + useState.
  // They return { laps, loading, error } — we destructure what we need.
  const { laps, totalLaps, loading: lapsLoading, error: lapsError, refetch } =
    useLapData(year, gp);

  const { fastestLap, loading: fastLoading } = useFastestLap(year, gp);

  const isLoading = lapsLoading || fastLoading;

  return (
    <div style={styles.page}>

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <div>
            <h1 style={styles.title}>Race Dashboard</h1>
            <p style={styles.subtitle}>Lap-by-lap analysis and key statistics</p>
          </div>
          <WeatherStation year={year} gp={gp} />
        </div>

        {/* Race selector controls */}
        <div style={styles.selectors}>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={styles.select}
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <select
            value={gp}
            onChange={(e) => setGp(e.target.value)}
            style={styles.select}
          >
            {availableGps.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <button 
            onClick={handleRefresh} 
            disabled={refreshing}
            style={{ 
              ...styles.select, 
              backgroundColor: refreshing ? "#333" : "#e10600", 
              color: "#fff", 
              fontWeight: 700,
              border: "none",
              padding: "8px 16px"
            }}
          >
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </button>
        </div>
      </div>

      {/* ── Loading / Error states ────────────────────────────────────── */}
      {isLoading && <LoadingSpinner message={`Loading ${year} ${gp} GP...`} />}

      {lapsError && !isLoading && (
        <ErrorBanner message={lapsError} onRetry={refetch} />
      )}

      {/* ── Main content — only show when data is ready ───────────────── */}
      {!isLoading && !lapsError && laps && (
        <>
          {/* KPI Cards */}
          <div style={styles.kpiRow}>
            <StatCard
              label="Total Laps Recorded"
              value={totalLaps?.toLocaleString()}
              accent="#e10600"
            />
            <StatCard
              label="Fastest Lap"
              value={formatLapTime(fastestLap?.lap_time_sec)}
              sub={fastestLap ? `${fastestLap.driver} — Lap ${fastestLap.lap_number}` : undefined}
              accent="#ffd700"
            />
            <StatCard
              label="Fastest Compound"
              value={fastestLap?.compound ?? "—"}
              sub={fastestLap ? `${fastestLap.tyre_life} laps old` : undefined}
              accent="#22c55e"
            />
            <StatCard
              label="Drivers"
              value={[...new Set(laps.map((l) => l.Driver))].length}
              sub="in this session"
              accent="#3671c6"
            />
          </div>

          {/* Analysis Grid */}
          <div style={styles.analysisGrid}>
            {/* Lap Time Chart */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>
                Lap Time Evolution — Top 5 Drivers
              </h2>
              <p style={styles.chartSub}>
                Each line represents one driver's lap times over the race distance.
              </p>
              <LapTimeChart laps={laps} drivers={DEFAULT_DRIVERS} />
            </div>

            {/* Circuit Map */}
            <div style={styles.chartCard}>
              <h2 style={styles.chartTitle}>Circuit Layout</h2>
              <p style={styles.chartSub}>Animated track map with DRS zones.</p>
              <div style={{ height: "400px" }}>
                <CircuitMap gpName={gp} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page:       { padding: "32px", maxWidth: "1200px", margin: "0 auto" },
  header:     { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  title:      { margin: 0, fontSize: "28px", fontWeight: 700, color: "#f0f0f0" },
  subtitle:   { margin: "6px 0 0", color: "#777", fontSize: "14px" },
  selectors:  { display: "flex", gap: "10px" },
  select:     { padding: "8px 12px", backgroundColor: "#1a1a2e", color: "#ccc", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "14px", cursor: "pointer" },
  kpiRow:     { display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" },
  chartCard:  { backgroundColor: "#1a1a2e", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", padding: "24px" },
  chartTitle: { margin: "0 0 4px", fontSize: "18px", fontWeight: 600, color: "#f0f0f0" },
  chartSub:   { margin: "0 0 20px", color: "#777", fontSize: "13px" },
  analysisGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "24px",
    alignItems: "start"
  },
};
