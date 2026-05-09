/**
 * src/pages/LapDataPage.jsx
 * --------------------------
 * Deep-dive into lap timing data.
 * Features a scatter/line chart and a filterable data table.
 */
import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { StatCard }      from "../components/ui/StatCard.jsx";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx";
import { ErrorBanner }   from "../components/ui/ErrorBanner.jsx";
import { LapTimeChart }  from "../components/charts/LapTimeChart.jsx";
import { useLapData, useFastestLap } from "../hooks/useLapData.js";
import { fetchSchedule } from "../services/api.js";
import { formatLapTime, COMPOUND_COLORS } from "../types/f1.js";

const YEARS = [2026, 2025, 2024, 2023, 2022];

export function LapDataPage() {
  const location = useLocation();
  const initialDriver = location.state?.selectedDriver;

  const [year, setYear] = useState(2026);
  const [gp,   setGp]   = useState("Australian Grand Prix");
  const [availableGps, setAvailableGps] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState(
    initialDriver ? [initialDriver] : ["VER", "HAM", "LEC"]
  );

  const { laps, totalLaps, loading: lapsLoading, error: lapsError, refetch } =
    useLapData(year, gp);

  const { fastestLap, loading: fastLoading } = useFastestLap(year, gp);

  const isLoading = lapsLoading || fastLoading;

  // Get all unique drivers in this race
  const driversInRace = useMemo(() => {
    if (!laps) return [];
    return [...new Set(laps.map(l => l.Driver))].sort();
  }, [laps]);

  // Fetch schedule when year changes
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const response = await fetchSchedule(year);
        const names = response.events.map(e => e.EventName);
        setAvailableGps(names);
        if (!names.includes(gp)) {
          setGp(names[0] || "");
        }
      } catch (err) {
        console.error("Failed to load schedule", err);
      }
    };
    loadSchedule();
  }, [year]);

  // Filter laps for the table based on selected drivers
  const filteredLaps = useMemo(() => {
    if (!laps) return [];
    if (selectedDrivers.length === 0) return laps;
    return laps.filter(l => selectedDrivers.includes(l.Driver));
  }, [laps, selectedDrivers]);

  const toggleDriver = (code) => {
    setSelectedDrivers(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Lap Data Explorer</h1>
          <p style={styles.subtitle}>Detailed timing analysis and raw data view.</p>
        </div>

        <div style={styles.selectors}>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={styles.select}
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>

          <select value={gp} onChange={(e) => setGp(e.target.value)} style={styles.select}>
            {availableGps.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>

      {isLoading && <LoadingSpinner message={`Fetching ${year} ${gp} Grand Prix data...`} />}
      
      {lapsError && !isLoading && (
        <ErrorBanner message={lapsError} onRetry={refetch} />
      )}

      {!isLoading && !lapsError && laps && (
        <>
          <div style={styles.kpiRow}>
            <StatCard label="Total Laps" value={totalLaps} accent="#3671c6" />
            <StatCard 
              label="Fastest Lap" 
              value={formatLapTime(fastestLap?.lap_time_sec)} 
              sub={`${fastestLap?.driver} (Lap ${fastestLap?.lap_number})`} 
              accent="#ffd700" 
            />
            <StatCard label="Avg Lap Time" value={formatLapTime(laps.reduce((sum, l) => sum + l.LapTimeSec, 0) / laps.length)} accent="#22c55e" />
            <StatCard label="Selected Drivers" value={selectedDrivers.length} sub={`out of ${driversInRace.length}`} accent="#e10600" />
          </div>

          <div style={styles.contentLayout}>
            {/* Sidebar: Driver Filters */}
            <div style={styles.sidebar}>
              <h3 style={styles.sectionTitle}>Drivers</h3>
              <div style={styles.driverList}>
                {driversInRace.map(code => (
                  <label key={code} style={styles.driverLabel}>
                    <input
                      type="checkbox"
                      checked={selectedDrivers.includes(code)}
                      onChange={() => toggleDriver(code)}
                      style={styles.checkbox}
                    />
                    <span style={{ color: selectedDrivers.includes(code) ? "#fff" : "#777" }}>{code}</span>
                  </label>
                ))}
              </div>
              <button 
                onClick={() => setSelectedDrivers(driversInRace)}
                style={styles.actionButton}
              >
                Select All
              </button>
              <button 
                onClick={() => setSelectedDrivers([])}
                style={{ ...styles.actionButton, backgroundColor: "transparent", color: "#666" }}
              >
                Clear All
              </button>
            </div>

            {/* Main Area: Chart & Table */}
            <div style={styles.main}>
              <div style={styles.chartCard}>
                <h3 style={styles.chartTitle}>Lap Time Evolution</h3>
                <LapTimeChart laps={laps} drivers={selectedDrivers} />
              </div>

              <div style={styles.tableCard}>
                <h3 style={styles.chartTitle}>Raw Timing Data</h3>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th>Lap</th>
                        <th>Driver</th>
                        <th>Position</th>
                        <th>Lap Time</th>
                        <th>Tyre</th>
                        <th>Life</th>
                        <th>S1</th>
                        <th>S2</th>
                        <th>S3</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLaps.slice(0, 200).map((l, i) => (
                        <tr key={`${l.Driver}-${l.LapNumber}`}>
                          <td>{l.LapNumber}</td>
                          <td style={{ fontWeight: 700, color: "#fff" }}>{l.Driver}</td>
                          <td>{l.Position}</td>
                          <td style={{ fontVariantNumeric: "tabular-nums" }}>{formatLapTime(l.LapTimeSec)}</td>
                          <td>
                            <span style={{ 
                              padding: "2px 6px", 
                              borderRadius: "4px", 
                              fontSize: "10px", 
                              fontWeight: 700,
                              backgroundColor: COMPOUND_COLORS[l.Compound] + "22",
                              color: COMPOUND_COLORS[l.Compound],
                              border: `1px solid ${COMPOUND_COLORS[l.Compound]}44`
                            }}>
                              {l.Compound}
                            </span>
                          </td>
                          <td>{l.TyreLife}</td>
                          <td>{l.Sector1Sec?.toFixed(3)}</td>
                          <td>{l.Sector2Sec?.toFixed(3)}</td>
                          <td>{l.Sector3Sec?.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLaps.length > 200 && (
                    <p style={styles.tableNote}>Showing first 200 of {filteredLaps.length} laps...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { padding: "32px", maxWidth: "1400px", margin: "0 auto" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" },
  title: { margin: 0, fontSize: "28px", fontWeight: 700, color: "#f0f0f0" },
  subtitle: { margin: "6px 0 0", color: "#777", fontSize: "14px" },
  selectors: { display: "flex", gap: "10px" },
  select: { padding: "8px 12px", backgroundColor: "#1a1a2e", color: "#ccc", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "14px", cursor: "pointer" },
  kpiRow: { display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap" },
  contentLayout: { display: "flex", gap: "24px", alignItems: "flex-start" },
  sidebar: { width: "160px", flexShrink: 0, backgroundColor: "#1a1a2e", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", padding: "20px" },
  sectionTitle: { fontSize: "12px", textTransform: "uppercase", color: "#555", letterSpacing: "1px", marginBottom: "16px" },
  driverList: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px", maxHeight: "400px", overflowY: "auto" },
  driverLabel: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", fontWeight: 500 },
  checkbox: { cursor: "pointer" },
  actionButton: { width: "100%", padding: "8px", border: "none", borderRadius: "6px", backgroundColor: "#333", color: "#eee", fontSize: "11px", fontWeight: 600, cursor: "pointer", marginBottom: "8px" },
  main: { flex: 1, display: "flex", flexDirection: "column", gap: "24px" },
  chartCard: { backgroundColor: "#1a1a2e", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", padding: "24px" },
  chartTitle: { margin: "0 0 20px", fontSize: "16px", fontWeight: 600, color: "#f0f0f0" },
  tableCard: { backgroundColor: "#1a1a2e", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.07)", padding: "24px", overflow: "hidden" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "13px", color: "#aaa" },
  tableNote: { textAlign: "center", padding: "16px", color: "#555", fontSize: "12px" },
};
