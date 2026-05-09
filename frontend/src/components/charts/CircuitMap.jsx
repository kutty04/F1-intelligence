/**
 * src/components/charts/CircuitMap.jsx
 * ------------------------------------
 * Renders an interactive SVG track layout.
 */
import React from "react";
import { motion } from "framer-motion";

const TRACKS = {
  "Bahrain Grand Prix": {
    path: "M 100,300 L 150,50 L 300,50 L 350,150 L 500,150 L 550,450 L 100,450 Z",
    drs: [
      { start: { x: 100, y: 350 }, end: { x: 100, y: 310 } },
      { start: { x: 350, y: 150 }, end: { x: 450, y: 150 } }
    ],
    corners: 15
  },
  "Australian Grand Prix": {
    path: "M 100,100 C 300,50 500,100 550,200 L 550,400 C 400,500 200,500 100,400 L 100,100",
    drs: [{ start: { x: 100, y: 200 }, end: { x: 100, y: 150 } }],
    corners: 14
  },
  "Monaco Grand Prix": {
    path: "M 100,400 L 120,200 L 250,100 L 400,150 L 500,300 L 450,450 L 300,500 L 100,400",
    drs: [{ start: { x: 400, y: 150 }, end: { x: 450, y: 250 } }],
    corners: 19
  }
};

export function CircuitMap({ gpName }) {
  const track = TRACKS[gpName] || TRACKS["Australian Grand Prix"]; // Fallback

  return (
    <div style={styles.container}>
      <svg viewBox="0 0 600 600" style={styles.svg}>
        {/* Track Outline */}
        <motion.path
          d={track.path}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Racing Line */}
        <motion.path
          d={track.path}
          fill="none"
          stroke="#444"
          strokeWidth="2"
          strokeDasharray="10,10"
        />

        {/* Animated Lead Car / Marker */}
        <motion.path
          d={track.path}
          fill="none"
          stroke="#e10600"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        {/* DRS Zones */}
        {track.drs.map((zone, i) => (
          <line
            key={i}
            x1={zone.start.x}
            y1={zone.start.y}
            x2={zone.end.x}
            y2={zone.end.y}
            stroke="#22c55e"
            strokeWidth="6"
            strokeLinecap="round"
          />
        ))}
      </svg>

      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.dot, backgroundColor: "#e10600" }} />
          <span>Race Pace</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.dot, backgroundColor: "#22c55e" }} />
          <span>DRS Zone</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ color: "#777", fontSize: "10px" }}>Corners: {track.corners}</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { position: "relative", width: "100%", height: "100%" },
  svg: { width: "100%", height: "100%", filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" },
  legend: { 
    position: "absolute", 
    bottom: 20, 
    left: 20, 
    display: "flex", 
    flexDirection: "column", 
    gap: "8px",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: "12px",
    borderRadius: "10px",
    backdropFilter: "blur(4px)"
  },
  legendItem: { display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#aaa" },
  dot: { width: "8px", height: "8px", borderRadius: "50%" }
};
