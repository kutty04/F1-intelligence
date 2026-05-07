/**
 * src/components/charts/LapTimeChart.jsx
 * ----------------------------------------
 * Line chart showing lap time evolution over a race for one or more drivers.
 *
 * Props:
 *   laps     {Lap[]}    - Array of lap objects from the API
 *   drivers  {string[]} - 3-letter codes to highlight, e.g. ["VER", "HAM"]
 *                         If empty, shows all drivers (messy — prefer 2-3)
 */
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TEAM_COLORS, formatLapTime } from "../../types/f1.js";

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function LapTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyles.box}>
      <p style={tooltipStyles.title}>Lap {label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ ...tooltipStyles.row, color: entry.color }}>
          {entry.dataKey}: {formatLapTime(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ── Data transformation ────────────────────────────────────────────────────
// Recharts LineChart expects data as:
//   [ { LapNumber: 1, VER: 92.5, HAM: 93.1 }, { LapNumber: 2, ... }, ... ]
//
// But our API gives us:
//   [ { Driver: "VER", LapNumber: 1, LapTimeSec: 92.5 }, ... ]
//
// This function converts (pivots) from the API format to the Recharts format.
function pivotLapData(laps, drivers) {
  if (!laps) return [];

  // Filter to only the requested drivers (or all if none specified)
  const filtered = drivers.length > 0
    ? laps.filter((lap) => drivers.includes(lap.Driver))
    : laps;

  // Find the max lap number to build a complete lap range
  const maxLap = Math.max(...filtered.map((l) => l.LapNumber), 0);

  // Build one object per lap number
  const pivoted = [];
  for (let lapNum = 1; lapNum <= maxLap; lapNum++) {
    const row = { LapNumber: lapNum };

    // For each driver, find their lap time for this lap number
    for (const driver of [...new Set(filtered.map((l) => l.Driver))]) {
      const match = filtered.find(
        (l) => l.Driver === driver && l.LapNumber === lapNum
      );
      // Use undefined (not null) so Recharts skips the dot (shows gap instead)
      row[driver] = match?.LapTimeSec ?? undefined;
    }
    pivoted.push(row);
  }
  return pivoted;
}

// ── Main Component ─────────────────────────────────────────────────────────
export function LapTimeChart({ laps, drivers = [] }) {
  if (!laps || laps.length === 0) {
    return <p style={{ color: "#666", textAlign: "center" }}>No lap data available.</p>;
  }

  // Get the unique list of drivers to render lines for
  const activeDrivers = drivers.length > 0
    ? drivers
    : [...new Set(laps.map((l) => l.Driver))].slice(0, 5); // Max 5 drivers

  const chartData = pivotLapData(laps, activeDrivers);

  // Find the median lap time for a reference line (helps show "normal pace")
  const allTimes = laps.map((l) => l.LapTimeSec).filter(Boolean).sort((a, b) => a - b);
  const medianTime = allTimes[Math.floor(allTimes.length / 2)];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />

        <XAxis
          dataKey="LapNumber"
          tick={{ fill: "#888", fontSize: 12 }}
          axisLine={false}
          label={{ value: "Lap", position: "insideBottomRight", offset: -10, fill: "#666" }}
        />

        {/* Y axis — auto-scales to the data range, formatted as M:SS */}
        <YAxis
          tick={{ fill: "#888", fontSize: 12 }}
          axisLine={false}
          tickFormatter={formatLapTime}
          domain={["auto", "auto"]}   // Let Recharts find the min/max
          width={65}
        />

        <Tooltip content={<LapTooltip />} />
        <Legend
          wrapperStyle={{ color: "#aaa", fontSize: "13px", paddingTop: "12px" }}
        />

        {/* Median reference line */}
        {medianTime && (
          <ReferenceLine
            y={medianTime}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4 4"
          />
        )}

        {/* One Line per driver */}
        {activeDrivers.map((driver, idx) => {
          // Use team color if known, otherwise cycle through fallback colors
          const fallbacks = ["#e10600", "#ffd700", "#27f4d2", "#ff8000", "#39b54a"];
          const driverLap = laps.find((l) => l.Driver === driver);
          const color = TEAM_COLORS[driverLap?.Team] ?? fallbacks[idx % fallbacks.length];

          return (
            <Line
              key={driver}
              type="monotone"
              dataKey={driver}
              stroke={color}
              strokeWidth={2}
              dot={false}           // No dots — cleaner at race length
              activeDot={{ r: 4 }} // Dot only on hover
              connectNulls={false}  // Don't connect through pit stop gaps
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

const tooltipStyles = {
  box: {
    backgroundColor: "#1a1a2e",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "12px 16px",
    fontSize: "13px",
  },
  title: { margin: "0 0 8px", fontWeight: 700, color: "#f0f0f0" },
  row:   { margin: "3px 0", fontVariantNumeric: "tabular-nums" },
};
