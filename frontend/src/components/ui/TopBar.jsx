/**
 * src/components/ui/TopBar.jsx
 * ----------------------------
 * The new minimalist header for Season 2.
 */
import React from "react";
import { Menu, Search, Sun, Moon, Mic, Cpu } from "lucide-react";
import { VoiceNavigator } from "./VoiceNavigator.jsx";

export function TopBar({ onMenuClick, onSearchClick, onAiClick, isTrackMode, onTrackModeToggle }) {
  return (
    <header style={styles.topBar}>
      <div style={styles.left}>
        <button onClick={onMenuClick} style={styles.iconBtn} title="Menu">
          <Menu size={20} />
        </button>
        <div style={styles.brand}>
          F1 <span style={{ color: "#e10600" }}>INTEL</span>
        </div>
      </div>

      <div style={styles.right}>
        {/* Search Trigger */}
        <button 
          onClick={onSearchClick} 
          style={styles.toolBtn} 
          className="top-bar-btn"
          title="Search (Ctrl+K)"
        >
          <Search size={18} />
          <span style={styles.btnText} className="btn-text-responsive">Search</span>
        </button>

        {/* Track Mode */}
        <button 
          onClick={onTrackModeToggle} 
          style={styles.toolBtn} 
          className="top-bar-btn"
          title="Track Mode"
        >
          {isTrackMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Voice */}
        <div style={styles.divider} />
        <VoiceNavigator />

        {/* AI Strategist Trigger */}
        <button 
          onClick={onAiClick} 
          style={styles.aiBtn} 
          className="top-bar-ai-btn"
          title="Open AI Strategist"
        >
          <Cpu size={18} />
          <span style={styles.btnText} className="btn-text-responsive">Strategist</span>
        </button>
      </div>
    </header>
  );
}

const styles = {
  topBar: {
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    backgroundColor: "#0d0d1a",
    borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
    position: "sticky",
    top: 0,
    zIndex: 900,
  },
  left: { display: "flex", alignItems: "center", gap: "20px" },
  iconBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    ":hover": { backgroundColor: "rgba(255,255,255,0.05)" }
  },
  brand: { fontSize: "14px", fontWeight: 900, color: "#fff", letterSpacing: "2px" },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  toolBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "8px",
    padding: "6px 12px",
    color: "#aaa",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    transition: "all 0.2s",
  },
  btnText: { opacity: 0.8 },
  aiBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(225, 6, 0, 0.1)",
    border: "1px solid rgba(225, 6, 0, 0.2)",
    borderRadius: "8px",
    padding: "6px 12px",
    color: "#e10600",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 700,
    transition: "all 0.2s",
    boxShadow: "0 0 15px rgba(225, 6, 0, 0.1)",
  },
  divider: { width: "1px", height: "24px", backgroundColor: "rgba(255,255,255,0.05)", margin: "0 8px" }
};
