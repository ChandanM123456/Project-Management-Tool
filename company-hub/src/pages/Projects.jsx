import React from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export default function Projects() {
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
                <a href="#projects" className="nav-link active">
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
                <a href="#reports" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/reports'); }}>
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
              <h1 className="welcome-title">📁 Projects</h1>
              <p className="welcome-subtitle">Manage and track your project portfolio</p>
            </div>
            <div className="welcome-actions">
              <button className="btn-primary">
                <span className="btn-icon">➕</span>
                New Project
              </button>
            </div>
          </section>

          <section className="projects-section">
            <div className="section-header">
              <div className="section-title">
                <h2>Active Projects</h2>
                <p className="section-description">Monitor progress and manage deliverables</p>
              </div>
            </div>
            
            <div className="projects-grid">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="project-card">
                  <div className="project-header">
                    <h3 className="project-name">Project {i}</h3>
                    <span className="project-status active">Active</span>
                  </div>
                  <p className="project-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                  <div className="project-progress">
                    <div className="progress-info">
                      <span>Progress</span>
                      <span>{25 * i}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width: `${25 * i}%`}}></div>
                    </div>
                  </div>
                  <div className="project-meta">
                    <span className="project-date">Started: 2024-01-{i}</span>
                    <span className="project-team">Team: {i + 2} members</span>
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
