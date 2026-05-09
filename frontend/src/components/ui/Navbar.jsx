/**
 * src/components/ui/Navbar.jsx
 * -----------------------------
 * Top navigation bar — links to all pages.
 *
 * Uses React Router's <NavLink> instead of <a href>.
 * WHY NavLink?
 *   - Regular <a href> reloads the whole page (full HTTP request)
 *   - NavLink navigates WITHOUT reloading — instant, SPA behavior
 *   - NavLink automatically applies an "active" class to the current link
 */
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Search, Sun, Moon } from "lucide-react";
import { GlobalSearch } from "./GlobalSearch.jsx";
import { VoiceNavigator } from "./VoiceNavigator.jsx";
import { useSounds } from "../../hooks/useSounds.js";

// Navigation links — add new pages here and they appear in the nav automatically
const NAV_LINKS = [
  { path: "/",              label: "Dashboard"     },
  { path: "/grid-analysis", label: "Grid Analysis" },
  { path: "/drivers",       label: "Drivers"       },
  { path: "/lap-data",      label: "Lap Data"      },
  { path: "/predictions",   label: "Predictions"   },
  { path: "/comparison",    label: "VS Mode"       },
  { path: "/predictor",     label: "Predictor"     },
  { path: "/pit-wall",      label: "Pit Wall"      },
];

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrackMode, setIsTrackMode] = useState(false);
  const { playSound } = useSounds();

  // Toggle Track Mode (High Contrast)
  useEffect(() => {
    if (isTrackMode) {
      document.body.classList.add("track-mode");
    } else {
      document.body.classList.remove("track-mode");
    }
  }, [isTrackMode]);

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => {
          if (!prev) playSound("nav");
          return !prev;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playSound]);

  return (
    <>
      <nav style={styles.nav}>
        {/* Brand / logo area */}
        <div style={styles.brand}>
          <span style={styles.logoIcon}>🏎️</span>
          <span style={styles.logoText}>
            F1 <span style={styles.logoAccent}>Intelligence</span>
          </span>
        </div>

        {/* Navigation links */}
        <div style={styles.links}>
          {NAV_LINKS.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={() => playSound("nav")}
              style={({ isActive }) =>
                isActive ? { ...styles.link, ...styles.linkActive } : styles.link
              }
            >
              {label}
            </NavLink>
          ))}
          
          <button 
            onClick={() => {
              setIsSearchOpen(true);
              playSound("nav");
            }} 
            style={styles.searchTrigger}
            title="Search (Ctrl+K)"
          >
            <Search size={18} />
          </button>

          <div style={{ marginLeft: "12px", display: "flex", gap: "12px", alignItems: "center" }}>
            <button 
              onClick={() => {
                setIsTrackMode(!isTrackMode);
                playSound("click");
              }}
              style={styles.searchTrigger}
              title="Track Mode (High Contrast)"
            >
              {isTrackMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <VoiceNavigator />
          </div>
        </div>
      </nav>

      <GlobalSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 32px",
    height: "60px",
    backgroundColor: "#0d0d1a",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: { fontSize: "22px" },
  logoText: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#f0f0f0",
    letterSpacing: "-0.02em",
  },
  logoAccent: { color: "#e10600" },
  links: {
    display: "flex",
    gap: "4px",
  },
  link: {
    padding: "7px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#aaa",
    textDecoration: "none",
    transition: "background 0.15s, color 0.15s",
  },
  linkActive: {
    backgroundColor: "rgba(225, 6, 0, 0.12)",
    color: "#e10600",
  },
  searchTrigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "7px 12px",
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "6px",
    color: "#777",
    cursor: "pointer",
    marginLeft: "12px",
    transition: "all 0.2s",
    ":hover": {
      borderColor: "rgba(255,255,255,0.2)",
      color: "#fff"
    }
  }
};
