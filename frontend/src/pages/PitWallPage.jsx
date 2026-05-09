/**
 * src/pages/PitWallPage.jsx
 * -------------------------
 * A cinematic "Engineering Station" view.
 * Mimics an F1 pit wall with scrolling data and technical logs.
 */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Activity, Zap, Shield, Cpu } from "lucide-react";

export function PitWallPage() {
  const [logs, setLogs] = useState([]);
  const [activeDriver, setActiveDriver] = useState("VER");

  // Simulated live telemetry feed
  useEffect(() => {
    const messages = [
      "DRS ENABLED", "BOX BOX BOX", "TYRE TEMP NOMINAL", "ENGINE MODE 11",
      "CHECK BRAKE BALANCE", "STRATEGY B", "INTERVAL TO HAM +0.4s", "FUEL MIX 2",
      "ENERGY RECOVERY ACTIVE", "SECTOR 1 PURPLE", "WIND GUST T3", "PIT WINDOW OPEN"
    ];

    const interval = setInterval(() => {
      const msg = messages[Math.floor(Math.random() * messages.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setLogs(prev => [{ time: timestamp, msg, id: Date.now() }, ...prev].slice(0, 20));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fade-in" style={styles.page}>
      {/* Header Row */}
      <div style={styles.topRow}>
        <div style={styles.titleArea}>
          <div style={styles.liveIndicator}><div style={styles.redDot} /> LIVE DATA FEED</div>
          <h1 style={styles.title}>Pit Wall <span style={{ color: "#777" }}>/ Mission Control</span></h1>
        </div>
        <div style={styles.driverTabs}>
          {["VER", "HAM", "NOR", "LEC"].map(d => (
            <button 
              key={d} 
              onClick={() => setActiveDriver(d)}
              style={{ ...styles.driverTab, color: activeDriver === d ? "#e10600" : "#555", borderColor: activeDriver === d ? "#e10600" : "transparent" }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.mainGrid}>
        {/* Left: Telemetry Monitoring */}
        <div style={styles.leftCol}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}><Activity size={14} /> Telemetry Monitoring</div>
            <div style={styles.telemetryGrid}>
              <Gauge label="Tyre Temp" value="98°C" status="optimal" />
              <Gauge label="Brake Temp" value="450°C" status="warning" />
              <Gauge label="Battery (ERS)" value="82%" status="optimal" />
              <Gauge label="Fuel Remaining" value="12.4kg" status="critical" />
            </div>
          </div>

          <div style={styles.panel}>
            <div style={styles.panelHeader}><Shield size={14} /> Systems Health</div>
            <div style={styles.systemStatus}>
              <SystemRow label="Hydraulics" status="online" />
              <SystemRow label="Gearbox" status="online" />
              <SystemRow label="ICE (Engine)" status="online" />
              <SystemRow label="Turbo" status="online" />
            </div>
          </div>
        </div>

        {/* Right: Engineering Logs */}
        <div style={styles.rightCol}>
          <div style={styles.panel}>
            <div style={styles.panelHeader}><Terminal size={14} /> Engineering Event Log</div>
            <div style={styles.logContainer}>
              {logs.map(log => (
                <div key={log.id} style={styles.logRow}>
                  <span style={styles.logTime}>[{log.time}]</span>
                  <span style={styles.logMsg}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Gauge({ label, value, status }) {
  const color = status === "optimal" ? "#22c55e" : status === "warning" ? "#ffd700" : "#e10600";
  return (
    <div style={styles.gauge}>
      <div style={styles.gaugeLabel}>{label}</div>
      <div style={{ ...styles.gaugeValue, color }}>{value}</div>
      <div style={styles.gaugeBar}><div style={{ ...styles.gaugeFill, width: "70%", backgroundColor: color }} /></div>
    </div>
  );
}

function SystemRow({ label, status }) {
  return (
    <div style={styles.systemRow}>
      <span>{label}</span>
      <span style={{ color: "#22c55e", fontSize: "10px", fontWeight: 800 }}>{status.toUpperCase()}</span>
    </div>
  );
}

const styles = {
  page: { padding: "32px", height: "calc(100vh - 60px)", display: "flex", flexDirection: "column", gap: "24px", backgroundColor: "#05050a" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-end" },
  titleArea: { display: "flex", flexDirection: "column", gap: "4px" },
  liveIndicator: { display: "flex", alignItems: "center", gap: "8px", color: "#666", fontSize: "10px", fontWeight: 700, letterSpacing: "1px" },
  redDot: { width: "6px", height: "6px", borderRadius: "3px", backgroundColor: "#e10600", boxShadow: "0 0 8px #e10600" },
  title: { margin: 0, fontSize: "24px", fontWeight: 700 },
  driverTabs: { display: "flex", gap: "8px" },
  driverTab: { backgroundColor: "transparent", border: "none", borderBottom: "2px solid transparent", padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: "12px", transition: "all 0.2s" },
  mainGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", flex: 1, minHeight: 0 },
  leftCol: { display: "flex", flexDirection: "column", gap: "24px" },
  rightCol: { display: "flex", flexDirection: "column" },
  panel: { backgroundColor: "#0d0d1a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" },
  panelHeader: { fontSize: "12px", fontWeight: 700, color: "#444", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px" },
  telemetryGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  gauge: { display: "flex", flexDirection: "column", gap: "6px" },
  gaugeLabel: { fontSize: "11px", color: "#666" },
  gaugeValue: { fontSize: "20px", fontWeight: 800 },
  gaugeBar: { height: "4px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" },
  gaugeFill: { height: "100%" },
  systemStatus: { display: "flex", flexDirection: "column", gap: "12px" },
  systemRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#aaa" },
  logContainer: { flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", fontFamily: "JetBrains Mono, monospace" },
  logRow: { display: "flex", gap: "12px", fontSize: "12px" },
  logTime: { color: "#444" },
  logMsg: { color: "#22c55e" }
};
