/**
 * src/components/ui/ErrorBanner.jsx
 * -----------------------------------
 * Displays API error messages in a consistent, styled banner.
 *
 * Props:
 *   message  {string}   - Error text to display
 *   onRetry  {Function} - Optional callback for a "Try Again" button
 */
export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={styles.banner}>
      <span style={styles.icon}>⚠️</span>
      <div style={styles.content}>
        <strong style={styles.title}>Something went wrong</strong>
        <p style={styles.message}>{message}</p>
      </div>
      {onRetry && (
        <button style={styles.button} onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}

const styles = {
  banner: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    backgroundColor: "rgba(225, 6, 0, 0.08)",
    border: "1px solid rgba(225, 6, 0, 0.3)",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "16px 0",
  },
  icon: { fontSize: "24px" },
  content: { flex: 1 },
  title: { color: "#e10600", fontSize: "14px" },
  message: { color: "#ccc", fontSize: "13px", margin: "4px 0 0" },
  button: {
    padding: "8px 16px",
    backgroundColor: "#e10600",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
};
