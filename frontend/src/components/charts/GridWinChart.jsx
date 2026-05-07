/**
 * GridWinChart.jsx
 * =================
 * Responsive horizontal bar chart showing:
 *   "How often does the driver starting P1 win the race at each circuit?"
 *
 * COMPONENT CONTRACT (what this component needs to work):
 * ────────────────────────────────────────────────────────
 * Props:
 *   data {Array} — Required. Array of objects shaped like:
 *     {
 *       Circuit:       "Monaco"   (string)  — circuit name
 *       WinPct:        85.7       (number)  — win % (0–100)
 *       P1StarterWins: 6          (number)  — count of wins from P1
 *       TotalRaces:    7          (number)  — total races at this circuit
 *       Summary:       "6 of 7 races" (string)
 *     }
 *
 * Usage:
 *   import { GridWinChart } from "./GridWinChart";
 *   <GridWinChart data={statsArray} />
 */

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────────────────────
// React core — we need useState for the hovered bar state
import { useState } from "react";

// Recharts components we'll use:
//   BarChart         — the chart container (manages coordinate system)
//   Bar              — the bars themselves
//   XAxis / YAxis    — the two axes
//   CartesianGrid    — the subtle background grid lines
//   Tooltip          — popup when hovering a bar
//   Cell             — lets us color each bar individually
//   ResponsiveContainer — makes the chart fill its parent div's width
//   LabelList        — text labels rendered on/inside/outside each bar
//   ReferenceLine    — a vertical line at a specific X value (e.g., 50%)
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS — Design tokens for this chart
// ─────────────────────────────────────────────────────────────────────────────

// Color thresholds: how "dominant" is pole position at this circuit?
const COLOR = {
  HIGH:   "#22c55e",   // ≥ 70%  — pole is very powerful (street circuits)
  MID:    "#f59e0b",   // ≥ 45%  — competitive, strategy matters
  LOW:    "#e10600",   // < 45%  — overtaking circuit, pole less decisive
  HOVER:  "#a78bfa",   // Purple highlight on hover
  GRID:   "rgba(255, 255, 255, 0.05)",   // Subtle grid lines
  AXIS:   "#555",      // Axis tick text color
  REF:    "rgba(255, 255, 255, 0.18)",   // 50% reference line color
};

// Bar height (px) + spacing. Total chart height is auto-calculated from this.
const BAR_SIZE    = 22;   // Height of each individual bar in px
const BAR_GAP     = 14;   // Gap between bars in px
const CHART_PAD   = 60;   // Extra padding (top + bottom axes area)

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the fill color for a bar based on its win percentage.
 * Uses the COLOR constants defined above.
 *
 * @param {number} pct       — Win percentage (0–100)
 * @param {string} hoveredId — Circuit name of the currently hovered bar
 * @param {string} circuit   — This bar's circuit name
 * @returns {string} Hex color string
 */
function getBarColor(pct, hoveredId, circuit) {
  // If this bar is being hovered, always return the hover color
  if (hoveredId === circuit) return COLOR.HOVER;

  // Otherwise, color by win percentage band
  if (pct >= 70) return COLOR.HIGH;
  if (pct >= 45) return COLOR.MID;
  return COLOR.LOW;
}

/**
 * Auto-calculates the chart height based on number of data rows.
 * Without this, bars get squished on small datasets or overflow on large ones.
 *
 * @param {number} rowCount — Number of circuit rows
 * @returns {number} Height in pixels
 */
function calcChartHeight(rowCount) {
  return rowCount * (BAR_SIZE + BAR_GAP) + CHART_PAD;
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
/**
 * CustomTooltip renders the popup that appears when hovering a bar.
 *
 * Recharts injects these props automatically when it renders the tooltip:
 *   active  {boolean}  — Is the user hovering right now?
 *   payload {Array}    — Array of bar data objects for the hovered point
 *                        payload[0].payload = the full data row object
 *
 * We return null when active is false — this hides the tooltip completely.
 */
function CustomTooltip({ active, payload }) {
  // Guard: only render when the user is actively hovering
  if (!active || !payload || payload.length === 0) return null;

  // payload[0].payload gives us the full data object for this bar
  // e.g. { Circuit: "Monaco", WinPct: 85.7, P1StarterWins: 6, TotalRaces: 7 }
  const row = payload[0].payload;

  // Determine badge color from win percentage
  const badgeColor =
    row.WinPct >= 70 ? COLOR.HIGH :
    row.WinPct >= 45 ? COLOR.MID :
    COLOR.LOW;

  return (
    <div style={tooltipStyle.box}>
      {/* Circuit name header */}
      <p style={tooltipStyle.circuit}>{row.Circuit}</p>

      {/* Win percentage badge */}
      <div style={tooltipStyle.badgeRow}>
        <span style={{ ...tooltipStyle.badge, backgroundColor: badgeColor }}>
          {row.WinPct}%
        </span>
        <span style={tooltipStyle.badgeLabel}>pole-to-win rate</span>
      </div>

      {/* Raw numbers */}
      <div style={tooltipStyle.statsGrid}>
        <div style={tooltipStyle.statBox}>
          <span style={tooltipStyle.statValue}>{row.P1StarterWins}</span>
          <span style={tooltipStyle.statLabel}>Wins from P1</span>
        </div>
        <div style={tooltipStyle.statBox}>
          <span style={tooltipStyle.statValue}>{row.TotalRaces}</span>
          <span style={tooltipStyle.statLabel}>Total Races</span>
        </div>
      </div>

      {/* Interpretation text */}
      <p style={tooltipStyle.interpretation}>
        {row.WinPct >= 70
          ? "🟢 Pole is very powerful here."
          : row.WinPct >= 45
          ? "🟡 Pole helps, but strategy matters."
          : "🔴 Overtaking circuit — pace wins races."}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM LABEL — rendered inside/outside each bar
// ─────────────────────────────────────────────────────────────────────────────
/**
 * CustomLabel renders the win percentage text at the end of each bar.
 * Recharts passes position info (x, y, width, value) automatically.
 *
 * We use an <svg> <text> element because LabelList renders inside SVG.
 * Regular <div> or <p> elements can't be children of <svg>.
 *
 * @param {number} x      — X coordinate of bar start
 * @param {number} y      — Y coordinate of bar top
 * @param {number} width  — Width of the bar in pixels
 * @param {number} height — Height of the bar in pixels
 * @param {number} value  — The dataKey value (WinPct)
 */
function CustomLabel({ x, y, width, height, value }) {
  // Position the text just to the right of the bar end
  const labelX = x + width + 8;
  const labelY = y + height / 2;   // Vertically center in the bar

  return (
    <text
      x={labelX}
      y={labelY}
      fill="#ccc"
      fontSize={12}
      fontWeight={600}
      dominantBaseline="middle"   // SVG vertical alignment (like CSS align-items)
      fontFamily="Inter, sans-serif"
    >
      {value}%
    </text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LEGEND COMPONENT — shows what the colors mean
// ─────────────────────────────────────────────────────────────────────────────
function ChartLegend() {
  const items = [
    { color: COLOR.HIGH, label: "≥ 70%  Pole dominant"   },
    { color: COLOR.MID,  label: "45–70%  Competitive"    },
    { color: COLOR.LOW,  label: "< 45%  Overtaking track" },
  ];

  return (
    <div style={legendStyle.row}>
      {items.map(({ color, label }) => (
        <div key={label} style={legendStyle.item}>
          {/* Color dot */}
          <span style={{ ...legendStyle.dot, backgroundColor: color }} />
          <span style={legendStyle.text}>{label}</span>
        </div>
      ))}
      {/* Reference line explanation */}
      <div style={legendStyle.item}>
        <span style={legendStyle.refLine} />
        <span style={legendStyle.text}>50% baseline</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE — shown when data is missing or empty
// ─────────────────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={emptyStyle.box}>
      <span style={emptyStyle.icon}>📊</span>
      <p style={emptyStyle.title}>No data available</p>
      <p style={emptyStyle.sub}>
        Run <code style={emptyStyle.code}>analyze_grid.py</code> first to generate circuit stats.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT — GridWinChart
// ─────────────────────────────────────────────────────────────────────────────
/**
 * GridWinChart
 * ------------
 * Props:
 *   data      {Array}  — Required. Array of GridWinStat objects.
 *   title     {string} — Optional chart title override.
 *   showTitle {boolean}— Whether to show the title. Default: true.
 */
export function GridWinChart({
  data,
  title = "Pole-to-Win Conversion Rate by Circuit",
  showTitle = true,
}) {
  // ── Local state ─────────────────────────────────────────────────────────
  // Track which circuit bar is currently being hovered.
  // null = no bar hovered. "Monaco" = Monaco bar is hovered.
  // This drives the bar color change on hover.
  const [hoveredCircuit, setHoveredCircuit] = useState(null);

  // ── Guard: no data ───────────────────────────────────────────────────────
  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  // ── Prepare data ─────────────────────────────────────────────────────────
  // Sort by WinPct descending so the most dominant circuit is at the top.
  // [...data] creates a shallow copy before sorting (never mutate props).
  const sorted = [...data].sort((a, b) => b.WinPct - a.WinPct);

  // Auto-calculate chart height from number of rows
  const chartHeight = calcChartHeight(sorted.length);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={containerStyle.wrapper}>

      {/* ── Chart Title ──────────────────────────────────────────────── */}
      {showTitle && (
        <div style={containerStyle.titleRow}>
          <h2 style={containerStyle.title}>{title}</h2>
          <span style={containerStyle.badge}>{sorted.length} circuits</span>
        </div>
      )}

      {/* ── Color Legend ─────────────────────────────────────────────── */}
      <ChartLegend />

      {/* ── ResponsiveContainer ─────────────────────────────────────────
          This is the key to making charts work at any screen width.
          width="100%"  → fills parent div entirely
          height={n}    → fixed height (we calculate this from row count)
          Without ResponsiveContainer, charts need a hardcoded width in px.
      ─────────────────────────────────────────────────────────────────── */}
      <ResponsiveContainer width="100%" height={chartHeight}>

        {/* ── BarChart ─────────────────────────────────────────────────
            layout="vertical" → bars go left-to-right (horizontal bars)
                                 In default layout, bars go bottom-to-top.
            layout="horizontal" → default, bars go up
            margin → inner padding around the chart content area
        ─────────────────────────────────────────────────────────────── */}
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 8, right: 70, left: 12, bottom: 8 }}
          // Callback: fires when the mouse enters any bar
          onMouseLeave={() => setHoveredCircuit(null)}
        >

          {/* ── CartesianGrid ─────────────────────────────────────────
              Draws the background grid lines.
              horizontal={false} → only vertical lines (fits horizontal bars)
              strokeDasharray="3 3" → dashed lines (more subtle than solid)
          ──────────────────────────────────────────────────────────── */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={COLOR.GRID}
            horizontal={false}
          />

          {/* ── XAxis (the numbers: 0% to 100%) ──────────────────────
              type="number" → this axis shows numeric values
              domain        → [min, max] for the axis scale
              unit="%"      → appended to every tick label: "50%"
              axisLine      → the axis baseline line (we hide it)
              tickLine      → small tick mark lines (we hide them)
          ──────────────────────────────────────────────────────────── */}
          <XAxis
            type="number"
            domain={[0, 100]}
            unit="%"
            tick={{ fill: COLOR.AXIS, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickCount={6}   // Show 6 ticks: 0%, 20%, 40%, 60%, 80%, 100%
          />

          {/* ── YAxis (the circuit names) ─────────────────────────────
              type="category" → this axis shows text labels
              dataKey="Circuit" → which field to use as labels
              width → how wide the label area is (needs to fit long names)
          ──────────────────────────────────────────────────────────── */}
          <YAxis
            type="category"
            dataKey="Circuit"
            width={185}
            tick={{ fill: "#ccc", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* ── ReferenceLine ────────────────────────────────────────
              Draws a vertical dashed line at x=50 (the "coin flip" baseline).
              Any circuit above 50% means pole helps more than chance.
              label prop adds text next to the line.
          ──────────────────────────────────────────────────────────── */}
          <ReferenceLine
            x={50}
            stroke={COLOR.REF}
            strokeDasharray="5 4"
            strokeWidth={1.5}
            label={{
              value: "50%",
              position: "top",
              fill: "#555",
              fontSize: 10,
            }}
          />

          {/* ── Tooltip ──────────────────────────────────────────────
              content prop replaces the default tooltip with our component.
              cursor sets the style of the hover highlight behind the bar.
          ──────────────────────────────────────────────────────────── */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
          />

          {/* ── Bar ──────────────────────────────────────────────────
              dataKey="WinPct" → which field to use as the bar length
              radius            → rounded corners: [topLeft, topRight, bottomRight, bottomLeft]
                                  For horizontal bars pointing right, "right" corners are rounded.
              maxBarSize        → max bar thickness in px (prevents giant bars on small datasets)
              onMouseEnter      → fires when mouse enters a bar — we track which circuit
          ──────────────────────────────────────────────────────────── */}
          <Bar
            dataKey="WinPct"
            radius={[0, 5, 5, 0]}
            maxBarSize={BAR_SIZE}
            onMouseEnter={(row) => setHoveredCircuit(row.Circuit)}
          >

            {/* ── LabelList ─────────────────────────────────────────
                Renders a label for every bar.
                content prop = our CustomLabel component.
                dataKey="WinPct" → the value passed to CustomLabel.
                position="right" → where to position the label relative to bar.
                                   We override this in CustomLabel anyway.
            ──────────────────────────────────────────────────────── */}
            <LabelList
              dataKey="WinPct"
              content={<CustomLabel />}
              position="right"
            />

            {/* ── Cell ──────────────────────────────────────────────
                Without Cell, all bars would be the same color.
                Cell lets us set fill per bar based on any logic we choose.
                We map over sorted data and create one Cell per row.
                key must be unique — we use Circuit name.
            ──────────────────────────────────────────────────────── */}
            {sorted.map((entry) => (
              <Cell
                key={entry.Circuit}
                fill={getBarColor(entry.WinPct, hoveredCircuit, entry.Circuit)}
                // Smooth color transition on hover
                style={{ transition: "fill 0.15s ease" }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* ── Footer note ──────────────────────────────────────────────────── */}
      <p style={containerStyle.footer}>
        Data: 2022–2024 F1 seasons · GridPosition approximated from Lap 1 race position
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES — inline style objects
// ─────────────────────────────────────────────────────────────────────────────
// We use inline styles to keep this component fully self-contained —
// no external CSS file needed. In a larger project, use CSS Modules or
// a design system (Tailwind, Chakra, etc.) instead.

const containerStyle = {
  wrapper: {
    backgroundColor: "#111827",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "24px 24px 16px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#f0f0f0",
    letterSpacing: "-0.01em",
  },
  badge: {
    padding: "3px 10px",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: "99px",
    fontSize: "12px",
    color: "#888",
    fontWeight: 500,
  },
  footer: {
    marginTop: "12px",
    fontSize: "11px",
    color: "#444",
    textAlign: "right",
  },
};

const legendStyle = {
  row: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "20px",
    paddingLeft: "4px",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  refLine: {
    display: "inline-block",
    width: "18px",
    height: "2px",
    borderTop: "2px dashed rgba(255,255,255,0.3)",
  },
  text: {
    fontSize: "12px",
    color: "#888",
  },
};

const tooltipStyle = {
  box: {
    backgroundColor: "#1e1e2e",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "14px 18px",
    minWidth: "220px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  },
  circuit: {
    margin: "0 0 10px",
    fontSize: "15px",
    fontWeight: 700,
    color: "#f0f0f0",
  },
  badgeRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  badge: {
    padding: "4px 12px",
    borderRadius: "99px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#000",
  },
  badgeLabel: {
    fontSize: "12px",
    color: "#777",
  },
  statsGrid: {
    display: "flex",
    gap: "16px",
    marginBottom: "10px",
  },
  statBox: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  statValue: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#f0f0f0",
    fontVariantNumeric: "tabular-nums",
  },
  statLabel: {
    fontSize: "11px",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  interpretation: {
    margin: "10px 0 0",
    fontSize: "12px",
    color: "#999",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    paddingTop: "10px",
  },
};

const emptyStyle = {
  box: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "10px",
    backgroundColor: "#111827",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  icon:  { fontSize: "40px" },
  title: { fontSize: "16px", fontWeight: 600, color: "#ccc", margin: 0 },
  sub:   { fontSize: "13px", color: "#555", margin: 0, textAlign: "center" },
  code:  { backgroundColor: "rgba(255,255,255,0.08)", padding: "1px 6px", borderRadius: "4px", color: "#e10600", fontFamily: "monospace" },
};
