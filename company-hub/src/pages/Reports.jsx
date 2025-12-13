import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Reports() {
  const navigate = useNavigate();
  const companyName = localStorage.getItem("company_name") || "Company";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("manager_id");
    localStorage.removeItem("company_id");
    localStorage.removeItem("company_name");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <div className="brand-logo">
              <div className="logo-icon">📊</div>
              <span className="brand-text">PM Tool</span>
            </div>
            <div className="company-badge">
              <span className="company-icon">🏢</span>
              <span className="company-name">{companyName}</span>
            </div>
          </div>
          <div className="navbar-actions">
            <div className="user-menu">
              <div className="user-avatar">
                <span className="avatar-text">👔</span>
              </div>
              <div className="user-info">
                <span className="user-role">Manager</span>
                <span className="user-status">Active</span>
              </div>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              <span className="logout-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Navigation</h3>
            <div className="sidebar-subtitle">Manage your workspace</div>
          </div>
          <nav className="sidebar-nav">
            <ul className="nav-menu">
              <li className="nav-item">
                <a href="#dashboard" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">Dashboard</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#employees" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/employees'); }}>
                  <span className="nav-icon">👥</span>
                  <span className="nav-text">Employees</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#projects" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/projects'); }}>
                  <span className="nav-icon">📁</span>
                  <span className="nav-text">Projects</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#tasks" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/tasks'); }}>
                  <span className="nav-icon">✓</span>
                  <span className="nav-text">Tasks</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#reports" className="nav-link active">
                  <span className="nav-icon">📈</span>
                  <span className="nav-text">Reports</span>
                </a>
              </li>
              <li className="nav-divider"></li>
              <li className="nav-item">
                <a href="#settings" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">Settings</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="dashboard-content">
          <section className="welcome-section">
            <div className="welcome-content">
              <h1 className="welcome-title">📈 Reports</h1>
              <p className="welcome-subtitle">Analytics and performance insights</p>
            </div>
            <div className="welcome-actions">
              <button className="btn-primary">
                <span className="btn-icon">📊</span>
                Generate Report
              </button>
            </div>
          </section>

          <section className="reports-overview">
            <div className="section-header">
              <div className="section-title">
                <h2>Performance Metrics</h2>
                <p className="section-description">Key performance indicators and trends</p>
              </div>
            </div>
            
            <div className="reports-grid">
              <div className="report-card">
                <h3 className="report-title">Team Productivity</h3>
                <div className="report-chart">
                  <div className="chart-placeholder">
                    📊 Productivity Chart
                  </div>
                </div>
                <div className="report-stats">
                  <div className="stat">
                    <span className="stat-label">Average</span>
                    <span className="stat-value">89%</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Trend</span>
                    <span className="stat-value positive">+15%</span>
                  </div>
                </div>
              </div>
              
              <div className="report-card">
                <h3 className="report-title">Project Completion</h3>
                <div className="report-chart">
                  <div className="chart-placeholder">
                    📈 Completion Chart
                  </div>
                </div>
                <div className="report-stats">
                  <div className="stat">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value">12</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Ongoing</span>
                    <span className="stat-value">7</span>
                  </div>
                </div>
              </div>
              
              <div className="report-card">
                <h3 className="report-title">Task Distribution</h3>
                <div className="report-chart">
                  <div className="chart-placeholder">
                    🥧 Distribution Chart
                  </div>
                </div>
                <div className="report-stats">
                  <div className="stat">
                    <span className="stat-label">Total Tasks</span>
                    <span className="stat-value">156</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Completed</span>
                    <span className="stat-value">142</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="recent-reports">
            <div className="section-header">
              <div className="section-title">
                <h2>Recent Reports</h2>
                <p className="section-description">Previously generated reports</p>
              </div>
            </div>
            
            <div className="reports-list">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="report-item">
                  <div className="report-info">
                    <h4 className="report-name">Monthly Performance Report - {i}</h4>
                    <p className="report-date">Generated on 2024-01-{15 - i}</p>
                  </div>
                  <div className="report-actions">
                    <button className="btn-action">View</button>
                    <button className="btn-action">Download</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
