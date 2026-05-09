/**
 * src/App.jsx
 * ------------
 * Root component — sets up routing and global layout.
 *
 * REACT ROUTER CONCEPTS:
 *
 *   <BrowserRouter>   → Enables routing. Wraps the whole app.
 *                        Reads the URL and decides what to render.
 *
 *   <Routes>          → Container for all your route definitions.
 *                        Only renders the FIRST matching <Route>.
 *
 *   <Route path="/" element={<Component />} />
 *                     → "When URL is '/', render <Component />"
 *
 *   <Link to="/about"> → Navigates without reloading the page.
 *                        (Navbar uses <NavLink> which also adds active styles)
 *
 * LAYOUT PATTERN:
 *   App renders the <Navbar> ONCE at the top.
 *   Then Routes renders whichever Page matches the current URL.
 *   This means Navbar stays visible on every page — no duplication.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { TopBar }           from "./components/ui/TopBar.jsx";
import { Sidebar }          from "./components/ui/Sidebar.jsx";
import { StrategistDrawer } from "./components/ui/StrategistDrawer.jsx";
import { WelcomeTour }      from "./components/ui/WelcomeTour.jsx";
import { GlobalSearch }     from "./components/ui/GlobalSearch.jsx";
import { DashboardPage }    from "./pages/DashboardPage.jsx";
import { GridAnalysisPage } from "./pages/GridAnalysisPage.jsx";
import { DriversPage }      from "./pages/DriversPage.jsx";
import { LapDataPage }      from "./pages/LapDataPage.jsx";
import { PredictionsPage }  from "./pages/PredictionsPage.jsx";
import { ComparisonPage }   from "./pages/ComparisonPage.jsx";
import { PitWallPage }     from "./pages/PitWallPage.jsx";
import { PredictorPage }   from "./pages/PredictorPage.jsx";
import { StandingsPage }   from "./pages/StandingsPage.jsx";
import { SettingsPage }    from "./pages/SettingsPage.jsx";
import "./App.css";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrackMode, setIsTrackMode] = useState(false);

  // Force Browser Tab Title
  useEffect(() => {
    document.title = "F1 Intelligence Dashboard";
  }, []);

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
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar isOpen={true} onClose={() => {}} isPersistent={true} />
        
        <div className="main-container">
          <TopBar 
            onMenuClick={() => {}}
            onSearchClick={() => setIsSearchOpen(true)}
            onAiClick={() => setIsAiOpen(true)}
            isTrackMode={isTrackMode}
            onTrackModeToggle={() => setIsTrackMode(!isTrackMode)}
          />

          <StrategistDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
          <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          <WelcomeTour />

          <main className="main-content">
          <Routes>
            {/* Route 1 — Dashboard (home page) */}
            <Route path="/"               element={<DashboardPage />}    />

            {/* Route 2 — Grid Win Analysis */}
            <Route path="/grid-analysis"  element={<GridAnalysisPage />} />

            {/* Route 3 — Driver Analytics */}
            <Route path="/drivers"        element={<DriversPage />} />

            {/* Route 4 — Lap Data Explorer */}
            <Route path="/lap-data"       element={<LapDataPage />} />

            {/* Route 5 — ML Predictions */}
            <Route path="/predictions"    element={<PredictionsPage />} />

            {/* Route 6 — Comparison Mode */}
            <Route path="/comparison"     element={<ComparisonPage />} />

            {/* Route 7 — Grid Predictor */}
            <Route path="/predictor"      element={<PredictorPage />} />

            {/* Route 8 — Pit Wall View */}
            <Route path="/pit-wall"       element={<PitWallPage />} />

            {/* Route 9 — Season Standings */}
            <Route path="/standings"      element={<StandingsPage />} />

            {/* Route 10 — System Settings */}
            <Route path="/settings"       element={<SettingsPage />} />

            {/* Catch-all: redirect any unknown URL back to home */}
            <Route path="*"               element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  </BrowserRouter>
);
}

// ── Placeholder Page ─────────────────────────────────────────────────────────
// Temporary stand-in for pages not yet built.
// Shows a "coming soon" message with the page title.
function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: "80px 32px", textAlign: "center" }}>
      <p style={{ fontSize: "48px", margin: "0 0 16px" }}>🚧</p>
      <h1 style={{ color: "#f0f0f0", fontSize: "28px", margin: "0 0 8px" }}>{title}</h1>
      <p style={{ color: "#666" }}>
        This page is coming soon. Build it in <code>src/pages/</code>.
      </p>
    </div>
  );
}

export default App;
