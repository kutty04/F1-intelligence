import React, { useState, useEffect } from "react";
import { CloudRain, Thermometer, Wind, Droplets, RefreshCw } from "lucide-react";
import { fetchTrackWeather } from "../../services/weatherService.js";

export function WeatherStation({ year, gp }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      setLoading(true);
      const data = await fetchTrackWeather(gp, year);
      setWeather(data);
      setLoading(false);
    }
    loadWeather();
  }, [gp, year]);

  if (loading) {
    return (
      <div style={styles.container}>
        <RefreshCw size={14} className="spin" style={{ marginRight: "8px" }} />
        <span style={styles.label}>Tuning Sensors...</span>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div style={styles.container} title={`Live Data: ${weather.status}`}>
      <div style={styles.item}>
        <Thermometer size={14} color="#e10600" />
        <div style={styles.stats}>
          <span style={styles.label}>Air</span>
          <span style={styles.value}>{Math.round(weather.temp)}°C</span>
        </div>
      </div>
      <div style={styles.divider} />
      <div style={styles.item}>
        <Wind size={14} color="#3671c6" />
        <div style={styles.stats}>
          <span style={styles.label}>Track</span>
          <span style={styles.value}>{Math.round(weather.track)}°C</span>
        </div>
      </div>
      <div style={styles.divider} />
      <div style={styles.item}>
        <Droplets size={14} color="#00d4ff" />
        <div style={styles.stats}>
          <span style={styles.label}>Humidity</span>
          <span style={styles.value}>{Math.round(weather.humidity)}%</span>
        </div>
      </div>
      {weather.isReal && (
        <div style={{ marginLeft: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
          <div className="live-dot" />
          <span style={{ fontSize: "8px", color: "#22c55e", fontWeight: 800 }}>LIVE</span>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: "12px 20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  item: { display: "flex", alignItems: "center", gap: "10px" },
  stats: { display: "flex", flexDirection: "column" },
  label: { fontSize: "9px", color: "#555", textTransform: "uppercase", fontWeight: 700 },
  value: { fontSize: "14px", fontWeight: 700, color: "#fff" },
  divider: { width: "1px", height: "20px", backgroundColor: "rgba(255,255,255,0.05)" }
};
