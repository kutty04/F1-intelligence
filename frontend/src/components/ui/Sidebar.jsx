/**
 * src/components/ui/Sidebar.jsx
 * ----------------------------
 * A slide-out navigation menu.
 * Features:
 *   - Framer Motion slide & fade animations
 *   - Backdrop blur
 *   - Premium navigation links
 */
import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, LayoutDashboard, Users, Timer, TrendingUp, 
  Target, Radio, Trophy, Settings 
} from "lucide-react";
import { useSounds } from "../../hooks/useSounds.js";

const NAV_ITEMS = [
  { path: "/",              label: "Dashboard",     icon: <LayoutDashboard size={20} /> },
  { path: "/grid-analysis", label: "Grid Analysis", icon: <TrendingUp size={20} /> },
  { path: "/drivers",       label: "Drivers",       icon: <Users size={20} /> },
  { path: "/lap-data",      label: "Lap Data",      icon: <Timer size={20} /> },
  { path: "/predictions",   label: "Predictions",   icon: <Target size={20} /> },
  { path: "/comparison",    label: "VS Mode",       icon: <Radio size={20} /> },
  { path: "/predictor",     label: "Predictor",     icon: <Trophy size={20} /> },
  { path: "/pit-wall",      label: "Pit Wall",      icon: <Radio size={20} /> },
  { path: "/standings",     label: "Standings",     icon: <Trophy size={20} /> },
];

export function Sidebar({ isOpen, onClose, isPersistent }) {
  const { playSound } = useSounds();

  const sidebarContent = (
    <div style={{ ...styles.sidebar, position: isPersistent ? "static" : "fixed", boxShadow: isPersistent ? "none" : styles.sidebar.boxShadow }}>
      <div style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.logoIcon}>🏎️</span>
          <span style={styles.logoText}>F1 <span style={{ color: "#e10600" }}>INTEL</span></span>
        </div>
        {!isPersistent && (
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        )}
      </div>

      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            onClick={() => {
              playSound("nav");
              if (!isPersistent) onClose();
            }}
            style={({ isActive }) =>
              isActive ? { ...styles.link, ...styles.linkActive } : styles.link
            }
          >
            <span style={styles.linkIcon}>{item.icon}</span>
            <span style={styles.linkLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={styles.footer}>
        <div style={styles.version}>v2.0.0 "Season 2"</div>
      </div>
    </div>
  );

  if (isPersistent) return sidebarContent;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.backdrop}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={styles.sidebar}
          >
            {sidebarContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const styles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(4px)",
    zIndex: 1000,
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "280px",
    backgroundColor: "#0d0d1a",
    borderRight: "1px solid rgba(255, 255, 255, 0.07)",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
    boxShadow: "20px 0 50px rgba(0, 0, 0, 0.5)",
  },
  header: {
    padding: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { fontSize: "20px" },
  logoText: { fontSize: "16px", fontWeight: 800, color: "#fff", letterSpacing: "1px" },
  closeBtn: {
    backgroundColor: "transparent",
    border: "none",
    color: "#555",
    cursor: "pointer",
    padding: "4px",
  },
  nav: { padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    color: "#888",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    transition: "all 0.2s",
  },
  linkActive: {
    backgroundColor: "rgba(225, 6, 0, 0.1)",
    color: "#e10600",
    fontWeight: 700,
  },
  linkIcon: { display: "flex", alignItems: "center" },
  footer: {
    padding: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
  },
  version: { fontSize: "10px", color: "#444", textAlign: "center", textTransform: "uppercase", letterSpacing: "1px" }
};
