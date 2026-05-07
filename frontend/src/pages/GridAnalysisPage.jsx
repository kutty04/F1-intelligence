/**
 * src/pages/GridAnalysisPage.jsx
 * --------------------------------
 * Displays the pole-to-win conversion rate per circuit.
 * Data comes from GET /api/v1/analytics/grid-stats (analytics.py router).
 *
 * Response shape from the API:
 * {
 *   total_circuits: 24,
 *   seasons: [2022, 2023, 2024],
 *   sorted_by: "win_pct",
 *   stats: [{ Circuit, TotalRaces, P1StarterWins, WinPct, Summary }, ...]
 * }
 */
import { useState, useEffect } from "react";
import { GridWinChart }      from "../components/charts/GridWinChart.jsx";
import { LoadingSpinner }    from "../components/ui/LoadingSpinner.jsx";
import { ErrorBanner }       from "../components/ui/ErrorBanner.jsx";
import { StatCard }          from "../components/ui/StatCard.jsx";
import { fetchGridWinStats } from "../services/api.js";

export function GridAnalysisPage() {
  // ── State ──────────────────────────────────────────────────────────────
  const [stats,   setStats]   = useState(null);   // array of GridWinStat objects
  const [meta,    setMeta]    = useState(null);   // { total_circuits, seasons, sorted_by }
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Fetch data ─────────────────────────────────────────────────────────
  // fetchGridWinStats() hits GET /api/v1/analytics/grid-stats
  // The response has: { total_circuits, seasons, sorted_by, stats: [...] }
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchGridWinStats();
      // Extract the stats array and the metadata separately
      const { stats: statsList, ...metadata } = response;
      setStats(statsList ?? []);
      setMeta(metadata);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run once when the component mounts (empty dep array = run once)
  useEffect(() => { loadData(); }, []);

  // ── Derived KPI values (computed from stats once loaded) ───────────────
  // Only compute when stats is a non-empty array
  const bestCircuit  = stats?.length ? stats.reduce((a, b) => a.WinPct > b.WinPct ? a : b) : null;
  const worstCircuit = stats?.length ? stats.reduce((a, b) => a.WinPct < b.WinPct ? a : b) : null;
  const avgWinPct    = stats?.length
    ? (stats.reduce((sum, s) => sum + s.WinPct, 0) / stats.length).toFixed(1)
    : null;
  const aboveFifty   = stats?.filter(s => s.WinPct >= 50).length ?? 0;

  return (
    <div style={styles.page}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Grid Position Analysis</h1>
          <p style={styles.subtitle}>
            How often does the pole sitter win? Analysed across&nbsp;
            {meta ? meta.seasons.join(", ") : "2022–2024"} F1 seasons.
          </p>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {loading && (
        <LoadingSpinner message="Loading grid analysis data from backend..." />
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && !loading && (
        <ErrorBanner message={error} onRetry={loadData} />
      )}

      {/* ── Content (only when data is ready) ───────────────────────────── */}
      {!loading && !error && stats && (
        <>
          {/* KPI stat cards */}
          <div style={styles.kpiRow}>
            <StatCard
              label="Most P1 Dominant"
              value={bestCircuit?.Circuit ?? "—"}
              sub={bestCircuit ? `${bestCircuit.WinPct}% win rate` : undefined}
              accent="#22c55e"
            />
            <StatCard
              label="Least P1 Dominant"
              value={worstCircuit?.Circuit ?? "—"}
              sub={worstCircuit ? `${worstCircuit.WinPct}% win rate` : undefined}
              accent="#e10600"
            />
            <StatCard
              label="Average Win Rate"
              value={avgWinPct ? `${avgWinPct}%` : "—"}
              sub="across all circuits"
              accent="#ffd700"
            />
            <StatCard
              label="Circuits Above 50%"
              value={aboveFifty}
              sub={`of ${stats.length} total circuits`}
              accent="#3671c6"
            />
          </div>

          {/* Main bar chart */}
          <GridWinChart
            data={stats}
            title="Pole-to-Win Conversion Rate by Circuit (2022–2024)"
          />

          {/* Footer note about data source */}
          {meta && (
            <p style={styles.dataNote}>
              {meta.total_circuits} circuits · Seasons: {meta.seasons.join(", ")} ·
              Sorted by: {meta.sorted_by.replace("_", " ")}
            </p>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  page:     { padding: "32px", maxWidth: "1200px", margin: "0 auto" },
  header:   { marginBottom: "28px" },
  title:    { margin: 0, fontSize: "28px", fontWeight: 700, color: "#f0f0f0" },
  subtitle: { margin: "6px 0 0", color: "#777", fontSize: "14px", maxWidth: "560px" },
  kpiRow:   { display: "flex", gap: "16px", marginBottom: "28px", flexWrap: "wrap" },
  dataNote: { marginTop: "12px", fontSize: "12px", color: "#444", textAlign: "right" },
};
