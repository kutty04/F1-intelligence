/**
 * src/pages/PredictionsPage.jsx
 * ------------------------------
 * Machine Learning interface to predict lap times.
 * Sends data to POST /api/v1/predictions/lap-time.
 */
import { useState, useEffect } from "react";
import { StatCard }      from "../components/ui/StatCard.jsx";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx";
import { ErrorBanner }   from "../components/ui/ErrorBanner.jsx";
import { predictLapTime, fetchDriverStats } from "../services/api.js";
import { formatLapTime, TEAM_COLORS } from "../types/f1.js";

export function PredictionsPage() {
  const [formData, setFormData] = useState({
    tyre_life: 5,
    compound: "MEDIUM",
    air_temp: 25.0,
    track_temp: 35.0,
    driver: "VER",
  });

  const [drivers, setDrivers] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDrivers = async () => {
      try {
        const response = await fetchDriverStats();
        setDrivers(response.stats.map(s => s.driver).sort());
      } catch (err) {
        console.error("Failed to load drivers", err);
      } finally {
        setInitialLoading(false);
      }
    };
    loadDrivers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await predictLapTime(formData);
      setPrediction(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["tyre_life", "air_temp", "track_temp"].includes(name) ? Number(value) : value
    }));
  };

  if (initialLoading) return <LoadingSpinner message="Warming up the ML engines..." />;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Lap Time Predictor</h1>
        <p style={styles.subtitle}>
          Powered by a Linear Regression model trained on real F1 telemetry data.
        </p>
      </div>

      <div style={styles.container}>
        {/* Form Section */}
        <form onSubmit={handleSubmit} style={styles.formCard}>
          <h2 style={styles.sectionTitle}>Input Parameters</h2>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Driver</label>
            <select name="driver" value={formData.driver} onChange={handleChange} style={styles.select}>
              {drivers.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tyre Compound</label>
            <select name="compound" value={formData.compound} onChange={handleChange} style={styles.select}>
              <option value="SOFT">SOFT</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HARD">HARD</option>
              <option value="INTERMEDIATE">INTERMEDIATE</option>
              <option value="WET">WET</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Tyre Life (Laps): {formData.tyre_life}</label>
            <input 
              type="range" name="tyre_life" 
              min="1" max="50" step="1" 
              value={formData.tyre_life} onChange={handleChange} 
              style={styles.slider} 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Air Temperature: {formData.air_temp}°C</label>
            <input 
              type="range" name="air_temp" 
              min="10" max="45" step="0.5" 
              value={formData.air_temp} onChange={handleChange} 
              style={styles.slider} 
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Track Temperature: {formData.track_temp}°C</label>
            <input 
              type="range" name="track_temp" 
              min="15" max="60" step="0.5" 
              value={formData.track_temp} onChange={handleChange} 
              style={styles.slider} 
            />
          </div>

          <button type="submit" disabled={loading} style={styles.predictBtn}>
            {loading ? "Calculating..." : "Predict Lap Time"}
          </button>
        </form>

        {/* Result Section */}
        <div style={styles.resultContainer}>
          {error && <ErrorBanner message={error} />}
          
          {prediction && !error && (
            <div style={styles.resultCard}>
              <h2 style={styles.sectionTitle}>Prediction Result</h2>
              <div style={styles.resultValue}>
                {formatLapTime(prediction.predicted_lap_time_sec)}
              </div>
              <p style={styles.resultSub}>
                Estimated pace for <strong>{formData.driver}</strong> on <strong>{formData.compound}</strong> tyres.
              </p>
              <div style={styles.modelTag}>
                Model: {prediction.model_version}
              </div>
            </div>
          )}

          {!prediction && !error && (
            <div style={styles.emptyState}>
              <p>Configure the parameters and click predict to see the result.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: "32px", maxWidth: "1000px", margin: "0 auto" },
  header: { marginBottom: "32px" },
  title: { margin: 0, fontSize: "28px", fontWeight: 700, color: "#f0f0f0" },
  subtitle: { margin: "6px 0 0", color: "#777", fontSize: "14px" },
  container: { display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" },
  formCard: { 
    flex: "1 1 400px", 
    backgroundColor: "#1a1a2e", 
    borderRadius: "12px", 
    border: "1px solid rgba(255,255,255,0.07)", 
    padding: "24px" 
  },
  sectionTitle: { margin: "0 0 24px", fontSize: "14px", textTransform: "uppercase", color: "#555", letterSpacing: "1px" },
  formGroup: { marginBottom: "20px" },
  label: { display: "block", fontSize: "13px", color: "#aaa", marginBottom: "8px" },
  select: { 
    width: "100%", padding: "10px", 
    backgroundColor: "#0a0a14", color: "#fff", 
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", 
    outline: "none" 
  },
  slider: { width: "100%", accentColor: "#e10600", cursor: "pointer" },
  predictBtn: { 
    width: "100%", padding: "14px", 
    backgroundColor: "#e10600", color: "#fff", 
    border: "none", borderRadius: "8px", 
    fontWeight: 700, fontSize: "15px", 
    cursor: "pointer", marginTop: "12px",
    transition: "background-color 0.2s"
  },
  resultContainer: { flex: "1 1 300px" },
  resultCard: { 
    backgroundColor: "#1a1a2e", 
    borderRadius: "12px", 
    border: "1px solid rgba(255,255,255,0.1)", 
    padding: "32px", 
    textAlign: "center",
    backgroundImage: "linear-gradient(135deg, rgba(225,6,0,0.05) 0%, rgba(0,0,0,0) 100%)"
  },
  resultValue: { fontSize: "48px", fontWeight: 800, color: "#fff", margin: "16px 0", letterSpacing: "-1px" },
  resultSub: { fontSize: "14px", color: "#777", margin: 0 },
  modelTag: { 
    display: "inline-block", padding: "4px 10px", 
    backgroundColor: "rgba(255,255,255,0.05)", 
    borderRadius: "20px", fontSize: "10px", color: "#444", 
    marginTop: "24px", textTransform: "uppercase" 
  },
  emptyState: { 
    padding: "60px 40px", textAlign: "center", color: "#444", 
    border: "2px dashed rgba(255,255,255,0.03)", borderRadius: "12px" 
  },
};
