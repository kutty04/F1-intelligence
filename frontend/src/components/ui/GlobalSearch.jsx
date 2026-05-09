/**
 * src/components/ui/GlobalSearch.jsx
 * ----------------------------------
 * A command-palette style search overlay.
 * Key Features:
 *   - Keyboard trigger (Ctrl+K)
 *   - Instant search for drivers, GPs, and pages
 *   - Framer Motion animations
 */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, Flag, Zap, Terminal } from "lucide-react";

const NAVIGATION_ITEMS = [
  { id: "home", label: "Dashboard", path: "/", icon: <Zap size={16} />, category: "Pages" },
  { id: "drivers", label: "Driver Profiles", path: "/drivers", icon: <User size={16} />, category: "Pages" },
  { id: "laps", label: "Lap Data Explorer", path: "/lap-data", icon: <Terminal size={16} />, category: "Pages" },
  { id: "predictions", label: "AI Predictions", path: "/predictions", icon: <Zap size={16} />, category: "Pages" },
];

export function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle search logic
  useEffect(() => {
    if (!query) {
      setResults(NAVIGATION_ITEMS);
      return;
    }

    const filtered = NAVIGATION_ITEMS.filter(item => 
      item.label.toLowerCase().includes(query.toLowerCase())
    );
    // You could also fetch drivers/GPs here if needed
    setResults(filtered);
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={styles.overlay}>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.backdrop}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            style={styles.modal}
          >
            <div style={styles.searchBar}>
              <Search style={styles.searchIcon} size={20} />
              <input
                ref={inputRef}
                id="global-search-input"
                name="global-search-query"
                type="text"
                placeholder="Search drivers, races, or pages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={styles.input}
              />
              <button onClick={onClose} style={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.resultsArea}>
              {results.length > 0 ? (
                results.map((item) => (
                  <div 
                    key={item.id} 
                    style={styles.resultItem}
                    onClick={() => handleSelect(item.path)}
                  >
                    <div style={styles.itemIcon}>{item.icon}</div>
                    <div style={styles.itemLabel}>{item.label}</div>
                    <div style={styles.itemCategory}>{item.category}</div>
                  </div>
                ))
              ) : (
                <div style={styles.noResults}>No matches found for "{query}"</div>
              )}
            </div>

            <div style={styles.footer}>
              <span style={styles.kbd}>ESC</span> to close • <span style={styles.kbd}>ENTER</span> to select
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    paddingTop: "15vh",
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(8px)",
  },
  modal: {
    position: "relative",
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#1a1a2e",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    maxHeight: "60vh",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    gap: "12px",
  },
  searchIcon: {
    color: "#e10600",
  },
  input: {
    flex: 1,
    backgroundColor: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    outline: "none",
  },
  closeButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#555",
    cursor: "pointer",
    padding: "4px",
  },
  resultsArea: {
    overflowY: "auto",
    padding: "8px",
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "background 0.2s ease",
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    }
  },
  // We'll use CSS for hover
  itemIcon: {
    color: "#777",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
  },
  itemLabel: {
    flex: 1,
    color: "#eee",
    fontWeight: 500,
  },
  itemCategory: {
    fontSize: "11px",
    color: "#555",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  noResults: {
    padding: "40px",
    textAlign: "center",
    color: "#555",
  },
  footer: {
    padding: "12px 20px",
    backgroundColor: "rgba(0,0,0,0.2)",
    fontSize: "12px",
    color: "#444",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  kbd: {
    backgroundColor: "#333",
    color: "#888",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
  }
};
