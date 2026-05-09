import React, { useState } from 'react';
import { Settings as SettingsIcon, RefreshCcw, Database, HardDrive, ShieldCheck, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function SettingsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState(null);

  const handleRefresh = async () => {
    if (!window.confirm("Trigger full data refresh? This will pull the latest 2026 race data and rebuild your intelligence model. This process runs in the background.")) return;

    try {
      setIsRefreshing(true);
      setStatus({ type: 'info', message: 'Data refresh signal sent to Render...' });
      
      const response = await fetch(`${API_URL}/analytics/refresh`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to trigger refresh');
      
      const data = await response.json();
      setStatus({ type: 'success', message: data.message });
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fade-in" style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>System Settings</h1>
        <p style={styles.subtitle}>Manage your dashboard's data engine and environment.</p>
      </header>

      <div style={styles.grid}>
        {/* Data Engine Card */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <Database size={24} color="#e10600" />
            <h2 style={styles.cardTitle}>Data Engine</h2>
          </div>
          <p style={styles.cardDesc}>
            Manually trigger a sync with official F1 servers to pull the latest 2026 race results, telemetry, and championship points.
          </p>
          
          <button 
            style={{ 
              ...styles.refreshBtn, 
              opacity: isRefreshing ? 0.7 : 1,
              cursor: isRefreshing ? 'not-allowed' : 'pointer'
            }} 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw size={18} className={isRefreshing ? 'spin' : ''} />
            {isRefreshing ? 'Syncing...' : 'Refresh All Data'}
          </button>

          {status && (
            <div style={{ 
              ...styles.status, 
              backgroundColor: status.type === 'error' ? 'rgba(232, 0, 32, 0.1)' : 'rgba(39, 244, 210, 0.1)',
              borderColor: status.type === 'error' ? '#e80020' : '#27f4d2',
              color: status.type === 'error' ? '#ff4d4d' : '#27f4d2'
            }}>
              {status.type === 'error' ? <AlertCircle size={14} /> : <ShieldCheck size={14} />}
              <span>{status.message}</span>
            </div>
          )}
        </section>

        {/* System Info Card */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <HardDrive size={24} color="#a5a5a5" />
            <h2 style={styles.cardTitle}>Environment</h2>
          </div>
          <div style={styles.infoList}>
            <div style={styles.infoItem}>
              <span>Backend Status</span>
              <strong style={{ color: '#27f4d2' }}>ONLINE</strong>
            </div>
            <div style={styles.infoItem}>
              <span>Intelligence Version</span>
              <strong>v2.1.0 "Season 3 Ready"</strong>
            </div>
            <div style={styles.infoItem}>
              <span>Active Season</span>
              <strong>2026 F1 Championship</strong>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const styles = {
  container: { padding: '40px', maxWidth: '1200px', margin: '0 auto' },
  header: { marginBottom: '40px' },
  title: { fontSize: '36px', fontWeight: 800, color: '#fff', marginBottom: '8px' },
  subtitle: { color: '#666', fontSize: '16px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' },
  card: { 
    background: 'rgba(255, 255, 255, 0.03)', 
    border: '1px solid rgba(255, 255, 255, 0.05)', 
    borderRadius: '20px', 
    padding: '32px',
    backdropFilter: 'blur(10px)'
  },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  cardTitle: { fontSize: '20px', fontWeight: 700, color: '#eee', margin: 0 },
  cardDesc: { color: '#888', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' },
  refreshBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#e10600',
    color: '#fff',
    fontWeight: 700,
    fontSize: '15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.2s',
    boxShadow: '0 4px 20px rgba(225, 6, 0, 0.3)'
  },
  status: {
    marginTop: '20px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: '1px solid'
  },
  infoList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  infoItem: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.03)', paddingBottom: '12px' },
};
