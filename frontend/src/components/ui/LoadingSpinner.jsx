/**
 * src/components/ui/LoadingSpinner.jsx
 * --------------------------------------
 * A reusable loading indicator.
 *
 * Used by every page while data is being fetched.
 * Keeps "loading" UI consistent across the whole app.
 *
 * Props:
 *   message {string} - Optional text below the spinner (default: "Loading...")
 */
export function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.spinner} />
      <p style={styles.text}>{message}</p>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
    gap: "16px",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(225, 6, 0, 0.15)",     // F1 red faint ring
    borderTop: "4px solid #e10600",                 // F1 red solid arc
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  text: {
    color: "#888",
    fontSize: "14px",
    margin: 0,
  },
};

// Inject the keyframe animation into the document head once
const styleTag = document.createElement("style");
styleTag.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);
