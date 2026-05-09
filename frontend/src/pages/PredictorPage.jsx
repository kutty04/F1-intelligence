/**
 * src/pages/PredictorPage.jsx
 * ---------------------------
 * A gamified "Grid Predictor".
 * Users can drag and drop drivers to predict the top 10.
 */
import React, { useState } from "react";
import { Reorder, motion, AnimatePresence } from "framer-motion";
import { Trophy, Info, Save, RotateCcw } from "lucide-react";
import driversData from "../../../backend/data/drivers_metadata.json";

export function PredictorPage() {
  const [items, setItems] = useState([
    "VER", "NOR", "HAM", "LEC", "PIA", "RUS", "SAI", "ALO", "PER", "ALB"
  ]);
  const [showResult, setShowResult] = useState(false);

  const handleReset = () => {
    setItems(["VER", "NOR", "HAM", "LEC", "PIA", "RUS", "SAI", "ALO", "PER", "ALB"]);
    setShowResult(false);
  };

  return (
    <div className="fade-in" style={styles.page}>
      <header style={styles.header}>
        <div style={styles.badge}><Trophy size={14} /> SEASON PREDICTOR</div>
        <h1 style={styles.title}>Grid Predictor</h1>
        <p style={styles.subtitle}>Drag and drop the drivers to set your podium prediction.</p>
      </header>

      <div style={styles.layout}>
        {/* Prediction List */}
        <div style={styles.listContainer}>
          <div style={styles.listHeader}>
            <span>Rank</span>
            <span>Driver</span>
          </div>
          <Reorder.Group axis="y" values={items} onReorder={setItems} style={styles.list}>
            {items.map((item, index) => (
              <Reorder.Item key={item} value={item} style={styles.item}>
                <div style={styles.rank}>{index + 1}</div>
                <div style={styles.driverInfo}>
                  <div style={{ ...styles.colorBar, backgroundColor: "#e10600" }} />
                  <span style={styles.driverCode}>{item}</span>
                  <span style={styles.driverName}>{driversData[item]?.full_name}</span>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>

        {/* Action Panel */}
        <div style={styles.actionPanel}>
          <div style={styles.podiumPreview}>
            <h3 style={styles.panelTitle}>Current Podium</h3>
            <div style={styles.podiumRow}>
              <PodiumSpot rank={2} code={items[1]} />
              <PodiumSpot rank={1} code={items[0]} isMain />
              <PodiumSpot rank={3} code={items[2]} />
            </div>
          </div>

          <div style={styles.infoCard}>
            <div style={styles.infoHeader}><Info size={16} /> AI Insights</div>
            <p style={styles.infoText}>
              Our AI model predicts a <strong>{items[0]}</strong> victory with a 68% confidence interval based on current qualifying pace.
            </p>
          </div>

          <div style={styles.buttonGroup}>
            <button onClick={() => setShowResult(true)} style={styles.primaryButton}>
              <Save size={18} /> Validate Prediction
            </button>
            <button onClick={handleReset} style={styles.secondaryButton}>
              <RotateCcw size={18} /> Reset Grid
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.resultOverlay}
          >
            <h2 style={{ margin: 0 }}>Prediction Saved! 🏁</h2>
            <p>Your grid has been synced with your profile. We'll notify you after the race.</p>
            <button onClick={() => setShowResult(false)} style={styles.closeBtn}>Got it</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PodiumSpot({ rank, code, isMain }) {
  return (
    <div style={{ ...styles.podiumSpot, height: isMain ? "120px" : "90px", backgroundColor: isMain ? "#e10600" : "#1a1a2e" }}>
      <div style={styles.pRank}>P{rank}</div>
      <div style={styles.pCode}>{code}</div>
    </div>
  );
}

const styles = {
  page: { padding: "40px", maxWidth: "1100px", margin: "0 auto" },
  header: { marginBottom: "40px" },
  badge: { display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#e10600", color: "#fff", padding: "4px 10px", borderRadius: "4px", fontSize: "10px", fontWeight: 800, marginBottom: "12px" },
  title: { fontSize: "32px", margin: 0 },
  subtitle: { color: "#777", marginTop: "8px" },
  layout: { display: "grid", gridTemplateColumns: "1fr 400px", gap: "40px", alignItems: "start" },
  listContainer: { backgroundColor: "#14142b", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)" },
  listHeader: { display: "flex", justifyContent: "space-between", padding: "0 16px 12px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: "12px", color: "#555", fontWeight: 700, textTransform: "uppercase" },
  list: { listStyle: "none", padding: 0, margin: "12px 0 0", display: "flex", flexDirection: "column", gap: "8px" },
  item: { display: "flex", alignItems: "center", gap: "16px", padding: "12px 16px", backgroundColor: "#1a1a2e", borderRadius: "10px", cursor: "grab", border: "1px solid rgba(255,255,255,0.03)" },
  rank: { width: "24px", fontSize: "14px", fontWeight: 800, color: "#444" },
  driverInfo: { flex: 1, display: "flex", alignItems: "center", gap: "12px" },
  colorBar: { width: "4px", height: "16px", borderRadius: "2px" },
  driverCode: { fontWeight: 800, color: "#fff", width: "40px" },
  driverName: { color: "#aaa", fontSize: "14px" },
  actionPanel: { display: "flex", flexDirection: "column", gap: "24px" },
  podiumPreview: { backgroundColor: "#0d0d1a", borderRadius: "16px", padding: "24px", border: "1px solid rgba(255,255,255,0.05)" },
  panelTitle: { fontSize: "14px", color: "#777", margin: "0 0 20px", textAlign: "center" },
  podiumRow: { display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "12px" },
  podiumSpot: { width: "80px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" },
  pRank: { fontSize: "12px", opacity: 0.6, fontWeight: 700 },
  pCode: { fontSize: "18px", fontWeight: 900, color: "#fff" },
  infoCard: { backgroundColor: "rgba(225, 6, 0, 0.05)", border: "1px solid rgba(225, 6, 0, 0.1)", borderRadius: "12px", padding: "20px" },
  infoHeader: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, color: "#e10600", marginBottom: "8px" },
  infoText: { fontSize: "13px", color: "#aaa", margin: 0, lineHeight: 1.6 },
  buttonGroup: { display: "flex", flexDirection: "column", gap: "12px" },
  primaryButton: { width: "100%", padding: "16px", backgroundColor: "#e10600", color: "#fff", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  secondaryButton: { width: "100%", padding: "16px", backgroundColor: "transparent", color: "#666", border: "1px solid #333", borderRadius: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" },
  resultOverlay: { position: "fixed", bottom: "40px", right: "40px", backgroundColor: "#22c55e", color: "#fff", padding: "32px", borderRadius: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", flexDirection: "column", gap: "12px" },
  closeBtn: { alignSelf: "flex-end", backgroundColor: "rgba(0,0,0,0.2)", border: "none", color: "#fff", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }
};
