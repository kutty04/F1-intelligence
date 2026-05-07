/**
 * src/components/ui/StatCard.jsx
 * --------------------------------
 * A single KPI (Key Performance Indicator) card.
 * Used in the dashboard header to highlight key numbers.
 *
 * COMPONENT DESIGN RULE:
 *   StatCard is "dumb" — it only displays what it receives via props.
 *   It has no state, no API calls, no business logic.
 *   This makes it reusable anywhere in the app.
 *
 * Props:
 *   label    {string} - Small label above the value, e.g. "Fastest Lap"
 *   value    {string} - The main large number/text, e.g. "1:32.608"
 *   sub      {string} - Optional subtitle, e.g. "VER — Lap 39"
 *   accent   {string} - Accent color (hex), defaults to F1 red
 */
export function StatCard({ label, value, sub, accent = "#e10600" }) {
  return (
    <div style={styles.card}>
      {/* Left accent bar — colored strip on the left edge */}
      <div style={{ ...styles.accentBar, backgroundColor: accent }} />

      <div style={styles.content}>
        {/* Small label at the top */}
        <p style={styles.label}>{label}</p>

        {/* Large main value */}
        <p style={styles.value}>{value ?? "—"}</p>

        {/* Optional subtitle */}
        {sub && <p style={styles.sub}>{sub}</p>}
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    alignItems: "stretch",
    backgroundColor: "#1a1a2e",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.07)",
    overflow: "hidden",
    minWidth: "180px",
    flex: "1 1 180px",
  },
  accentBar: {
    width: "4px",
    flexShrink: 0,
  },
  content: {
    padding: "16px 20px",
  },
  label: {
    margin: 0,
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#888",
    fontWeight: 600,
  },
  value: {
    margin: "6px 0 0",
    fontSize: "26px",
    fontWeight: 700,
    color: "#f0f0f0",
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
  },
  sub: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#777",
  },
};
