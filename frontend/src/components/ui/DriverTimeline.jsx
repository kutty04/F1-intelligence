/**
 * src/components/ui/DriverTimeline.jsx
 * -------------------------------------
 * A vertical timeline showing driver milestones.
 */
import { Award, Star, TrendingUp, History, Flag, MapPin } from "lucide-react";

export function DriverTimeline({ timeline }) {
  // If no timeline data is provided, show a placeholder list or nothing
  if (!timeline || timeline.length === 0) {
    return (
      <div style={styles.container}>
        <p style={{ color: "#444", fontSize: "14px" }}>No historical milestones recorded for this profile.</p>
      </div>
    );
  }

  const getEventStyle = (type) => {
    switch (type) {
      case "champion": return { icon: <Star size={14} />, color: "#ffd700" };
      case "win":      return { icon: <Flag size={14} />, color: "#e10600" };
      case "debut":    return { icon: <History size={14} />, color: "#22c55e" };
      case "move":     return { icon: <MapPin size={14} />, color: "#3671c6" };
      default:         return { icon: <Award size={14} />, color: "#888" };
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Career Legacy</h3>
      <div style={styles.list}>
        {timeline.map((item, i) => {
          const { icon, color } = getEventStyle(item.type);
          return (
            <div key={i} style={styles.row}>
              <div style={styles.yearCol}>
                <span style={styles.year}>{item.year}</span>
                <div style={styles.line} />
              </div>
              <div style={styles.contentCol}>
                <div style={{ ...styles.iconBox, backgroundColor: color }}>
                  {icon}
                </div>
                <span style={styles.event}>{item.event}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", backgroundColor: "#0d0d1a", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" },
  title: { fontSize: "16px", fontWeight: 700, marginBottom: "20px", color: "#888", textTransform: "uppercase", letterSpacing: "1px" },
  list: { display: "flex", flexDirection: "column" },
  row: { display: "flex", gap: "20px" },
  yearCol: { display: "flex", flexDirection: "column", alignItems: "center", width: "40px" },
  year: { fontSize: "12px", fontWeight: 800, color: "#fff" },
  line: { width: "1px", flex: 1, backgroundColor: "rgba(255,255,255,0.1)", margin: "8px 0" },
  contentCol: { display: "flex", alignItems: "center", gap: "12px", paddingBottom: "24px" },
  iconBox: { width: "24px", height: "24px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" },
  event: { fontSize: "14px", color: "#aaa" }
};
