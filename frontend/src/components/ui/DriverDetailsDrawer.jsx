/**
 * src/components/ui/DriverDetailsDrawer.jsx
 * -----------------------------------------
 * A slide-in drawer for full driver details and history.
 */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Award, MapPin, Hash } from "lucide-react";
import { DriverTimeline } from "./DriverTimeline.jsx";

export function DriverDetailsDrawer({ driver, isOpen, onClose }) {
  if (!driver) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={styles.backdrop}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={styles.drawer}
          >
            <div style={styles.header}>
              <div style={styles.badge}><Award size={12} /> DRIVER PROFILE</div>
              <button onClick={onClose} style={styles.closeBtn}><X size={24} /></button>
            </div>

            <div style={styles.content}>
              {/* Driver Identity */}
              <div style={styles.hero}>
                <div style={styles.number}>{driver.number}</div>
                <h2 style={styles.name}>{driver.full_name}</h2>
                <div style={styles.metaRow}>
                  <div style={styles.metaItem}><MapPin size={14} /> {driver.nationality}</div>
                  <div style={styles.metaItem}><Hash size={14} /> {driver.driver}</div>
                </div>
              </div>

              {/* Bio */}
              <div style={styles.section}>
                <p style={styles.bio}>{driver.bio}</p>
              </div>

              {/* Timeline */}
              <div style={styles.section}>
                <DriverTimeline timeline={driver.timeline} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const styles = {
  backdrop: { position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)", zIndex: 1300 },
  drawer: { position: "fixed", top: 0, right: 0, bottom: 0, width: "450px", backgroundColor: "#0a0a14", borderLeft: "1px solid rgba(255, 255, 255, 0.1)", zIndex: 1301, display: "flex", flexDirection: "column", boxShadow: "-20px 0 50px rgba(0, 0, 0, 0.5)", overflowY: "auto" },
  header: { padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  badge: { display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: 800, color: "#e10600", letterSpacing: "1px" },
  closeBtn: { backgroundColor: "transparent", border: "none", color: "#555", cursor: "pointer" },
  content: { padding: "0 30px 40px" },
  hero: { marginBottom: "40px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "30px" },
  number: { fontSize: "80px", fontWeight: 900, color: "rgba(255,255,255,0.03)", marginBottom: "-50px" },
  name: { fontSize: "32px", fontWeight: 900, margin: 0, position: "relative" },
  metaRow: { display: "flex", gap: "20px", marginTop: "12px" },
  metaItem: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#666" },
  section: { marginBottom: "32px" },
  bio: { fontSize: "15px", color: "#aaa", lineHeight: 1.6, margin: 0 }
};
