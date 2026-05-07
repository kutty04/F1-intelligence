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
import { Navbar }           from "./components/ui/Navbar.jsx";
import { DashboardPage }    from "./pages/DashboardPage.jsx";
import { GridAnalysisPage } from "./pages/GridAnalysisPage.jsx";
import "./App.css";

function App() {
  return (
    // BrowserRouter must wrap everything that uses routing
    <BrowserRouter>
      {/* Global layout wrapper */}
      <div className="app-shell">

        {/* Navbar renders on EVERY page — defined once here */}
        <Navbar />

        {/* Main content area — changes based on the URL */}
        <main className="main-content">
          <Routes>
            {/* Route 1 — Dashboard (home page) */}
            <Route path="/"               element={<DashboardPage />}    />

            {/* Route 2 — Grid Win Analysis */}
            <Route path="/grid-analysis"  element={<GridAnalysisPage />} />

            {/* Route 3 — Lap Data Explorer (placeholder for next step) */}
            <Route path="/lap-data"       element={<PlaceholderPage title="Lap Data Explorer" />} />

            {/* Route 4 — ML Predictions (placeholder for next step) */}
            <Route path="/predictions"    element={<PlaceholderPage title="Lap Time Predictor" />} />

            {/* Catch-all: redirect any unknown URL back to home */}
            <Route path="*"               element={<Navigate to="/" replace />} />
          </Routes>
        </main>
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
