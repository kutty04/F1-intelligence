/**
 * src/pages/StandingsPage.jsx
 * ---------------------------
 * Season 2 Standings Page.
 */
import React, { useState } from "react";
import { Trophy, TrendingUp, BarChart2 } from "lucide-react";

const WDC_DATA = [
  { pos: 1, driver: "Lando Norris", team: "McLaren", points: 145, wins: 3, pod: 6 },
  { pos: 2, driver: "Max Verstappen", team: "Red Bull", points: 132, wins: 2, pod: 5 },
  { pos: 3, driver: "Charles Leclerc", team: "Ferrari", points: 118, wins: 1, pod: 4 },
  { pos: 4, driver: "Oscar Piastri", team: "McLaren", points: 105, wins: 1, pod: 3 },
  { pos: 5, driver: "Lewis Hamilton", team: "Ferrari", points: 98, wins: 0, pod: 3 },
];

const WCC_DATA = [
  { pos: 1, team: "McLaren", points: 250, wins: 4 },
  { pos: 2, team: "Ferrari", points: 216, wins: 1 },
  { pos: 3, team: "Red Bull", points: 185, wins: 2 },
  { pos: 4, team: "Mercedes", points: 142, wins: 0 },
];

export function StandingsPage() {
  const [tab, setTab] = useState("wdc");

  return (
    <div className="fade-in" style={styles.page}>
      <header style={styles.header}>
        <div style={styles.badge}><Trophy size={14} /> SEASON 2026</div>
        <h1 style={styles.title}>Championship Standings</h1>
      </header>

      <div style={styles.tabs}>
        <button 
          onClick={() => setTab("wdc")} 
          style={{ ...styles.tab, borderBottomColor: tab === "wdc" ? "#e10600" : "transparent", color: tab === "wdc" ? "#fff" : "#555" }}
        >
          Drivers' (WDC)
        </button>
        <button 
          onClick={() => setTab("wcc")} 
          style={{ ...styles.tab, borderBottomColor: tab === "wcc" ? "#e10600" : "transparent", color: tab === "wcc" ? "#fff" : "#555" }}
        >
          Constructors' (WCC)
        </button>
      </div>

      <div style={styles.tableCard}>
        {tab === "wdc" ? <WdcTable /> : <WccTable />}
      </div>
    </div>
  );
}

function WdcTable() {
  return (
    <table style={styles.table}>
      <thead>
        <tr style={styles.tr}>
          <th style={styles.th}>Pos</th>
          <th style={styles.th}>Driver</th>
          <th style={styles.th}>Team</th>
          <th style={styles.th}>Wins</th>
          <th style={styles.th}>Podiums</th>
          <th style={styles.th}>Points</th>
        </tr>
      </thead>
      <tbody>
        {WDC_DATA.map((row) => (
          <tr key={row.pos} style={styles.tr}>
            <td style={styles.td}>{row.pos}</td>
            <td style={{ ...styles.td, fontWeight: 700 }}>{row.driver}</td>
            <td style={styles.td}>{row.team}</td>
            <td style={styles.td}>{row.wins}</td>
            <td style={styles.td}>{row.pod}</td>
            <td style={{ ...styles.td, color: "#e10600", fontWeight: 800 }}>{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WccTable() {
  return (
    <table style={styles.table}>
      <thead>
        <tr style={styles.tr}>
          <th style={styles.th}>Pos</th>
          <th style={styles.th}>Constructor</th>
          <th style={styles.th}>Wins</th>
          <th style={styles.th}>Points</th>
        </tr>
      </thead>
      <tbody>
        {WCC_DATA.map((row) => (
          <tr key={row.pos} style={styles.tr}>
            <td style={styles.td}>{row.pos}</td>
            <td style={{ ...styles.td, fontWeight: 700 }}>{row.team}</td>
            <td style={styles.td}>{row.wins}</td>
            <td style={{ ...styles.td, color: "#e10600", fontWeight: 800 }}>{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const styles = {
  page: { padding: "40px", maxWidth: "1000px", margin: "0 auto" },
  header: { marginBottom: "32px" },
  badge: { display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#e10600", color: "#fff", padding: "4px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginBottom: "12px" },
  title: { fontSize: "32px", margin: 0 },
  tabs: { display: "flex", gap: "32px", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)" },
  tab: { backgroundColor: "transparent", border: "none", borderBottom: "2px solid transparent", padding: "12px 0", cursor: "pointer", fontSize: "14px", fontWeight: 700, transition: "all 0.2s" },
  tableCard: { backgroundColor: "#0d0d1a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "16px 24px", fontSize: "12px", color: "#444", textTransform: "uppercase", letterSpacing: "1px", backgroundColor: "rgba(255,255,255,0.02)" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.03)" },
  td: { padding: "16px 24px", fontSize: "14px", color: "#eee" },
};
