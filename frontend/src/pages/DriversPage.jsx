/**
 * src/pages/DriversPage.jsx
 * -------------------------
 * Premium F1 Driver Profile Dashboard.
 * Features:
 * - High-end visual design with glassmorphism
 * - Interactive driver cards
 * - Real-time filtering
 * - Career vs Season statistics
 */
import React, { useState, useEffect } from "react";
import { fetchDriverStats } from "../services/api.js";
import { DriverCard } from "../components/ui/DriverCard.jsx";
import { LoadingSpinner } from "../components/ui/LoadingSpinner.jsx";
import { ErrorBanner } from "../components/ui/ErrorBanner.jsx";
import { StatCard } from "../components/ui/StatCard.jsx";
import { DriverDetailsDrawer } from "../components/ui/DriverDetailsDrawer.jsx";

export function DriversPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeam, setFilterTeam] = useState("All");
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetchDriverStats();
        setData(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Assembling the Grid..." />;
  if (error) return <ErrorBanner message={error} />;

  // Filter Logic
  const filteredDrivers = data.stats.filter(d => {
    const matchesSearch = d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.driver.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = filterTeam === "All" || d.team === filterTeam;
    return matchesSearch && matchesTeam;
  });

  const teams = ["All", ...new Set(data.stats.map(d => d.team))].sort();

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay}>
          <div style={styles.heroContent}>
            <h1 style={styles.title}>The Class of 2026</h1>
            <p style={styles.subtitle}>
              Exploring the legends, champions, and rising stars of the current Formula 1 grid.
            </p>
            
            {/* Search & Filter Bar */}
            <div style={styles.controls}>
              <div style={styles.searchWrapper}>
                <input 
                  id="driver-search-input"
                  name="driver-search"
                  type="text" 
                  placeholder="Search driver by name or code..." 
                  style={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                id="team-filter-select"
                name="team-filter"
                style={styles.teamSelect}
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
              >
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.container}>
        {/* KPI Row (Condensed) */}
        <div style={styles.kpiGrid}>
          <StatCard 
            label="Total Drivers" 
            value={data.total_drivers} 
            icon="🏎️" 
            color="#e10600" 
          />
          <StatCard 
            label="World Champions" 
            value={data.stats.filter(d => d.wdc_titles > 0).length} 
            icon="🏆" 
            color="#FFD700" 
          />
          <StatCard 
            label="Grid Experience" 
            value={`${Math.round(data.stats.reduce((acc, d) => acc + d.races, 0) / data.total_drivers)} avg`} 
            icon="📅" 
            color="#00D2FF" 
          />
        </div>

        {/* Drivers Grid */}
        <div style={styles.grid}>
          {filteredDrivers.map((driver) => (
            <div key={driver.driver} className="driver-card-wrapper">
              <DriverCard 
                driver={driver} 
                onDetailsClick={(d) => setSelectedDriver(d)}
              />
            </div>
          ))}
        </div>

        {filteredDrivers.length === 0 && (
          <div style={styles.noResults}>
            <h3>No drivers found matching your criteria.</h3>
            <p>Try adjusting your search or team filter.</p>
          </div>
        )}
      </div>

      <DriverDetailsDrawer 
        driver={selectedDriver} 
        isOpen={!!selectedDriver} 
        onClose={() => setSelectedDriver(null)} 
      />

      {/* Custom Global Styles for Hover (Injecting into head) */}
      <style>{`
        .driver-card-wrapper {
          transition: transform 0.3s ease, z-index 0s;
        }
        .driver-card-wrapper:hover {
          transform: translateY(-10px) scale(1.02);
          z-index: 10;
        }
        .driver-card-wrapper:hover > div {
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(225, 6, 0, 0.2);
          border-color: rgba(225, 6, 0, 0.3);
          background-color: rgba(30, 30, 50, 0.9);
        }
        .driver-card-wrapper:hover .driver-card-more-info {
          opacity: 1 !important;
          color: #e10600 !important;
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: { 
    minHeight: "100vh",
    backgroundColor: "#050505",
    color: "#fff",
  },
  hero: {
    height: "450px",
    backgroundImage: "url('https://images.unsplash.com/photo-1501436510557-61b365859946?auto=format&fit=crop&q=80&w=2000')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
  },
  heroOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(5,5,5,1) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 20px",
  },
  heroContent: {
    maxWidth: "800px",
  },
  title: {
    fontSize: "64px",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "-2px",
    margin: "0 0 10px",
    background: "linear-gradient(to right, #fff 0%, #aaa 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "18px",
    color: "#888",
    maxWidth: "600px",
    margin: "0 auto 40px",
    lineHeight: "1.6",
  },
  controls: {
    display: "flex",
    gap: "15px",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: "10px",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    maxWidth: "600px",
    margin: "0 auto",
  },
  searchWrapper: {
    flex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "12px 20px",
    backgroundColor: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
  },
  teamSelect: {
    padding: "12px 20px",
    backgroundColor: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    cursor: "pointer",
  },
  container: {
    maxWidth: "1400px",
    margin: "-60px auto 0",
    padding: "0 20px 100px",
    position: "relative",
    zIndex: 2,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
    marginBottom: "50px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "30px",
  },
  noResults: {
    textAlign: "center",
    padding: "100px 0",
    color: "#444",
  }
};
