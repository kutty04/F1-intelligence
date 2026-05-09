/**
 * src/components/ui/DriverCard.jsx
 * --------------------------------
 * A premium, interactive card for displaying F1 driver profiles.
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { TEAM_COLORS } from "../../types/f1.js";

export function DriverCard({ driver, onDetailsClick }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = React.useState(false);
  const teamColor = TEAM_COLORS[driver.team] || "#ffffff";
  
  // Badge logic
  const isChampion = driver.wdc_titles > 0;
  const isRisingTalent = driver.races < 50 && driver.podiums > 0;
  const isLegend = driver.career_wins > 30;

  const handleClick = () => {
    if (onDetailsClick) {
      onDetailsClick(driver);
    } else {
      navigate("/lap-data", { state: { selectedDriver: driver.driver } });
    }
  };

  return (
    <div 
      style={styles.card} 
      onClick={handleClick}
    >
      {/* Team Accent Bar */}
      <div style={{ ...styles.accentBar, backgroundColor: teamColor }} />
      
      {/* Background Decor */}
      <div style={styles.numberBg}>{driver.number}</div>

      <div style={styles.content}>
        {/* Header: Driver Number & Nationality */}
        <div style={styles.header}>
          <div style={styles.numberText}>{driver.number}</div>
          <div style={styles.nationality}>{driver.nationality}</div>
        </div>

        {/* Photo Section */}
        <div style={styles.photoContainer}>
          {driver.image_url && !imgError ? (
            <img 
              src={driver.image_url} 
              alt={driver.full_name} 
              style={styles.photo} 
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={styles.photoPlaceholder}>
              {driver.driver}
            </div>
          )}
        </div>

        {/* Driver Info */}
        <div style={styles.info}>
          <div style={styles.teamName}>{driver.team}</div>
          <h2 style={styles.fullName}>{driver.full_name}</h2>
        </div>

        {/* Badges */}
        <div style={styles.badgeContainer}>
          {isChampion && (
            <span style={{ ...styles.badge, backgroundColor: "#FFD700", color: "#000" }}>
              🏆 {driver.wdc_titles}x World Champion
            </span>
          )}
          {isLegend && (
            <span style={{ ...styles.badge, backgroundColor: "#E10600", color: "#fff" }}>
              🔥 Legend
            </span>
          )}
          {isRisingTalent && (
            <span style={{ ...styles.badge, backgroundColor: "#00D2FF", color: "#000" }}>
              ⭐ Rising Talent
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Career Wins</div>
            <div style={styles.statValue}>{driver.career_wins}</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Podiums</div>
            <div style={styles.statValue}>{driver.career_podiums}</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statLabel}>Avg Finish</div>
            <div style={styles.statValue}>{driver.avg_finish.toFixed(1)}</div>
          </div>
        </div>

        {/* Bio (Glass Effect overlay on hover could be cool, but keeping it simple for now) */}
        <p style={styles.bio}>{driver.bio}</p>
      </div>

      {/* Footer / Hover Effect Trigger */}
      <div style={styles.footer}>
        <span style={styles.moreInfo} className="driver-card-more-info">View Full Analytics →</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: "relative",
    backgroundColor: "rgba(26, 26, 46, 0.7)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    // Hover effect handled via CSS in parent or :hover if supported by inline styles (not supported directly)
    // We'll rely on the parent grid's hover styles or use a state.
  },
  accentBar: {
    height: "4px",
    width: "100%",
  },
  numberBg: {
    position: "absolute",
    top: "-10px",
    right: "10px",
    fontSize: "80px",
    fontWeight: 900,
    color: "rgba(255, 255, 255, 0.03)",
    zIndex: 0,
    pointerEvents: "none",
  },
  content: {
    padding: "20px",
    position: "relative",
    zIndex: 1,
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  numberText: {
    fontSize: "18px",
    fontWeight: 800,
    color: "rgba(255,255,255,0.6)",
    fontFamily: "monospace",
  },
  nationality: {
    fontSize: "12px",
    color: "#777",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  photoContainer: {
    height: "180px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: "15px",
  },
  photo: {
    height: "100%",
    objectFit: "contain",
    filter: "drop-shadow(0 10px 15px rgba(0,0,0,0.5))",
  },
  photoPlaceholder: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "48px",
    fontWeight: 900,
    color: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: "12px",
  },
  info: {
    textAlign: "center",
    marginBottom: "15px",
  },
  teamName: {
    fontSize: "11px",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "2px",
    marginBottom: "4px",
  },
  fullName: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#fff",
    margin: 0,
  },
  badgeContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    justifyContent: "center",
    marginBottom: "20px",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    padding: "15px 0",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    marginBottom: "15px",
  },
  statItem: {
    textAlign: "center",
  },
  statLabel: {
    fontSize: "9px",
    color: "#555",
    textTransform: "uppercase",
    marginBottom: "4px",
  },
  statValue: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#ddd",
  },
  bio: {
    fontSize: "13px",
    color: "#888",
    lineHeight: "1.5",
    margin: 0,
    textAlign: "center",
    fontStyle: "italic",
  },
  footer: {
    padding: "12px",
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  moreInfo: {
    fontSize: "11px",
    color: "#fff",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    opacity: 0.8,
    transition: "opacity 0.2s ease",
  },
};
