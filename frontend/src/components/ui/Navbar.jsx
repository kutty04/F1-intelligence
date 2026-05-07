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
import { NavLink } from "react-router-dom";

// Navigation links — add new pages here and they appear in the nav automatically
const NAV_LINKS = [
  { path: "/",              label: "Dashboard"     },
  { path: "/grid-analysis", label: "Grid Analysis" },
  { path: "/lap-data",      label: "Lap Data"      },
  { path: "/predictions",   label: "Predictions"   },
];

export function Navbar() {
  return (
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
            end={path === "/"}   // "end" ensures "/" only matches exactly "/"
            style={({ isActive }) =>
              isActive ? { ...styles.link, ...styles.linkActive } : styles.link
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
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
};
