/**
 * src/pages/ComparisonPage.jsx
 * ----------------------------
 * Head-to-Head Comparison Mode.
 * Features a dual-card layout and radar charts for driver traits.
 */
import React, { useState, useMemo } from "react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from "recharts";
import { StatCard } from "../components/ui/StatCard.jsx";
import driversData from "../../../backend/data/drivers_metadata.json";

// Synthetic traits for the fun "radar" chart
// In a real app, these would come from a database or AI analysis
const GET_TRAITS = (code) => {
  const meta = driversData[code] || {};
  const seed = code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Deterministic but "random" traits for fun
  return [
    { subject: "Qualifying", A: 80 + (seed % 20), fullMark: 100 },
    { subject: "Race Pace", A: 85 + (seed % 15), fullMark: 100 },
    { subject: "Consistency", A: 75 + (seed % 25), fullMark: 100 },
    { subject: "Racecraft", A: 82 + (seed % 18), fullMark: 100 },
    { subject: "Aggression", A: 70 + (seed % 30), fullMark: 100 },
  ];
};

export function ComparisonPage() {
  const [driverA, setDriverA] = useState("VER");
  const [driverB, setDriverB] = useState("NOR");

  const driversList = Object.keys(driversData).map(code => ({
    code,
    name: driversData[code].full_name
  })).sort((a, b) => a.name.localeCompare(b.name));

  const statsA = driversData[driverA];
  const statsB = driversData[driverB];

  const radarData = useMemo(() => {
    const tA = GET_TRAITS(driverA);
    const tB = GET_TRAITS(driverB);
    return tA.map((t, i) => ({
      subject: t.subject,
      A: t.A,
      B: tB[i].A,
      fullMark: 100
    }));
  }, [driverA, driverB]);

  return (
    <div className="fade-in" style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>Head-to-Head <span style={{color: "#e10600"}}>VS</span></h1>
        <p style={styles.subtitle}>Compare driver traits, career stats, and performance metrics.</p>
      </header>

      <div style={styles.selectorRow}>
        <div style={styles.driverPicker}>
          <label style={styles.label}>Driver 1</label>
          <select value={driverA} onChange={(e) => setDriverA(e.target.value)} style={styles.select}>
            {driversList.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
          </select>
        </div>
        <div style={styles.vsCircle}>VS</div>
        <div style={styles.driverPicker}>
          <label style={styles.label}>Driver 2</label>
          <select value={driverB} onChange={(e) => setDriverB(e.target.value)} style={styles.select}>
            {driversList.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Radar Chart Section */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Trait Comparison</h3>
          <div style={{ height: "400px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#999", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name={statsA.full_name}
                  dataKey="A"
                  stroke="#e10600"
                  fill="#e10600"
                  fillOpacity={0.5}
                />
                <Radar
                  name={statsB.full_name}
                  dataKey="B"
                  stroke="#3671c6"
                  fill="#3671c6"
                  fillOpacity={0.5}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={styles.statsContainer}>
          <div style={styles.statComparison}>
            <div style={styles.statColumn}>
              <h4 style={{ color: "#e10600" }}>{statsA.full_name}</h4>
              <StatItem label="WDC Titles" value={statsA.wdc_titles} isWinner={statsA.wdc_titles > statsB.wdc_titles} />
              <StatItem label="Career Wins" value={statsA.career_wins} isWinner={statsA.career_wins > statsB.career_wins} />
              <StatItem label="Podiums" value={statsA.career_podiums} isWinner={statsA.career_podiums > statsB.career_podiums} />
            </div>
            <div style={styles.statColumn}>
              <h4 style={{ color: "#3671c6" }}>{statsB.full_name}</h4>
              <StatItem label="WDC Titles" value={statsB.wdc_titles} isWinner={statsB.wdc_titles > statsA.wdc_titles} />
              <StatItem label="Career Wins" value={statsB.career_wins} isWinner={statsB.career_wins > statsA.career_wins} />
              <StatItem label="Podiums" value={statsB.career_podiums} isWinner={statsB.career_podiums > statsA.career_podiums} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, isWinner }) {
  return (
    <div style={{ ...styles.statItem, borderLeft: isWinner ? "3px solid #ffd700" : "3px solid transparent" }}>
      <div style={styles.statLabel}>{label}</div>
      <div style={{ ...styles.statValue, color: isWinner ? "#ffd700" : "#fff" }}>{value}</div>
    </div>
  );
}

const styles = {
  page: { padding: "40px", maxWidth: "1200px", margin: "0 auto" },
  header: { marginBottom: "40px", textAlign: "center" },
  title: { fontSize: "42px", margin: 0, letterSpacing: "-1px" },
  subtitle: { color: "#777", marginTop: "10px" },
  selectorRow: { 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: "30px", 
    marginBottom: "50px",
    backgroundColor: "rgba(255,255,255,0.02)",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.05)"
  },
  vsCircle: {
    width: "50px",
    height: "50px",
    borderRadius: "25px",
    backgroundColor: "#e10600",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "14px",
    boxShadow: "0 0 20px rgba(225, 6, 0, 0.4)",
    marginTop: "20px"
  },
  driverPicker: { display: "flex", flexDirection: "column", gap: "10px", width: "250px" },
  label: { fontSize: "12px", textTransform: "uppercase", color: "#555", letterSpacing: "1px" },
  select: {
    padding: "12px",
    backgroundColor: "#1a1a2e",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    outline: "none"
  },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" },
  chartCard: { 
    backgroundColor: "#1a1a2e", 
    borderRadius: "20px", 
    padding: "30px", 
    border: "1px solid rgba(255,255,255,0.05)" 
  },
  chartTitle: { margin: "0 0 30px", fontSize: "18px", color: "#aaa" },
  statsContainer: { display: "flex", flexDirection: "column", gap: "20px" },
  statComparison: { 
    display: "grid", 
    gridTemplateColumns: "1fr 1fr", 
    gap: "20px",
    backgroundColor: "#1a1a2e",
    borderRadius: "20px",
    padding: "30px",
    border: "1px solid rgba(255,255,255,0.05)",
    height: "100%"
  },
  statColumn: { display: "flex", flexDirection: "column", gap: "20px" },
  statItem: { padding: "10px 15px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "8px" },
  statLabel: { fontSize: "12px", color: "#666", marginBottom: "4px" },
  statValue: { fontSize: "24px", fontWeight: 700 }
};
