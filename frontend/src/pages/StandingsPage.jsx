import React, { useState, useEffect } from 'react';
import { Trophy, Users, TrendingUp } from 'lucide-react';
import './Standings.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export function StandingsPage() {
  const [activeTab, setActiveTab] = useState('drivers');
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        // Specifically fetching the 2026 season championship
        const response = await fetch(`${API_URL}/analytics/standings?year=2026`);
        if (!response.ok) throw new Error('Failed to fetch championship data');
        const data = await response.json();
        setStandings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, []);

  if (loading) return (
    <div className="standings-loading">
      <div className="f1-spinner"></div>
      <p>Calculating Championship Points...</p>
    </div>
  );

  if (error) return (
    <div className="standings-error-page">
      <Trophy size={48} className="error-icon" />
      <h3>Championship Data Unavailable</h3>
      <p>{error}</p>
      <button className="retry-btn" onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  const getTeamColor = (team) => {
    const colors = {
      'Red Bull Racing': '#3671C6',
      'Ferrari': '#E80020',
      'Mercedes': '#27F4D2',
      'McLaren': '#FF8000',
      'Aston Martin': '#229971',
      'Alpine': '#0093CC',
      'Williams': '#64C4FF',
      'Visa Cash App RB': '#6692FF',
      'Haas': '#B6BABD',
      'Sauber': '#52E252'
    };
    return colors[team] || '#FFFFFF';
  };

  return (
    <div className="standings-container fade-in">
      <header className="standings-header">
        <div className="header-content">
          <div className="season-badge">2026 SEASON</div>
          <h1>World Championship</h1>
          <p>Real-time point standings and team performance</p>
        </div>
        <div className="tab-switcher">
          <button 
            className={activeTab === 'drivers' ? 'active' : ''} 
            onClick={() => setActiveTab('drivers')}
          >
            <Trophy size={18} /> WDC
          </button>
          <button 
            className={activeTab === 'constructors' ? 'active' : ''} 
            onClick={() => setActiveTab('constructors')}
          >
            <Users size={18} /> WCC
          </button>
        </div>
      </header>

      <div className="standings-content">
        {activeTab === 'drivers' ? (
          <div className="standings-table-wrapper animate-slide-up">
            <table className="standings-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Driver</th>
                  <th>Team</th>
                  <th className="text-center">Wins</th>
                  <th className="text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.drivers.map((d) => (
                  <tr key={d.driver} className="standing-row">
                    <td className="pos-cell">
                      <span className={`pos-badge pos-${d.position}`}>
                        {d.position}
                      </span>
                    </td>
                    <td className="driver-cell">
                      <div className="driver-info">
                        <div 
                          className="team-indicator" 
                          style={{ backgroundColor: getTeamColor(d.team) }}
                        ></div>
                        <span className="driver-name">{d.full_name}</span>
                        <span className="driver-code">{d.driver}</span>
                      </div>
                    </td>
                    <td className="team-cell">{d.team}</td>
                    <td className="text-center">
                      {d.wins > 0 && <span className="wins-badge">{d.wins}</span>}
                    </td>
                    <td className="text-right points-cell">
                      {Math.floor(d.points)} <span className="pts-label">PTS</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="standings-table-wrapper animate-slide-up">
            <table className="standings-table">
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Constructor</th>
                  <th className="text-center">Wins</th>
                  <th className="text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.constructors.map((c) => (
                  <tr key={c.team} className="standing-row">
                    <td className="pos-cell">
                      <span className={`pos-badge pos-${c.position}`}>
                        {c.position}
                      </span>
                    </td>
                    <td className="team-cell-main">
                      <div className="team-info">
                        <div 
                          className="team-indicator" 
                          style={{ backgroundColor: getTeamColor(c.team) }}
                        ></div>
                        <span className="team-name">{c.team}</span>
                      </div>
                    </td>
                    <td className="text-center">
                      {c.wins > 0 && <span className="wins-badge">{c.wins}</span>}
                    </td>
                    <td className="text-right points-cell">
                      {Math.floor(c.points)} <span className="pts-label">PTS</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <footer className="standings-footer">
        <div className="stat-card">
          <TrendingUp size={20} className="stat-icon" />
          <div className="stat-text">
            <span>Championship Leader</span>
            <strong>{standings.drivers[0]?.full_name} is currently leading by {(standings.drivers[0]?.points - standings.drivers[1]?.points) || 0} points</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}
