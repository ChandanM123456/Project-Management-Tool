import React from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

export default function Settings() {
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
                <a href="#reports" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/reports'); }}>
                  <span className="nav-icon">📈</span>
                  <span className="nav-text">Reports</span>
                </a>
              </li>
              <li className="nav-divider"></li>
              <li className="nav-item">
                <a href="#settings" className="nav-link active">
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
              <h1 className="welcome-title">⚙️ Settings</h1>
              <p className="welcome-subtitle">Configure system preferences and company settings</p>
            </div>
            <div className="welcome-actions">
              <button className="btn-primary">
                <span className="btn-icon">💾</span>
                Save Changes
              </button>
            </div>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <h2>General Settings</h2>
                <p className="section-description">Basic configuration options</p>
              </div>
            </div>
            
            <div className="settings-grid">
              <div className="settings-card">
                <h3 className="settings-title">Company Information</h3>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" defaultValue={companyName} />
                  </div>
                  <div className="form-group">
                    <label>Company Email</label>
                    <input type="email" defaultValue="info@company.com" />
                  </div>
                  <div className="form-group">
                    <label>Company Phone</label>
                    <input type="tel" defaultValue="+1 234 567 8900" />
                  </div>
                </div>
              </div>
              
              <div className="settings-card">
                <h3 className="settings-title">Notification Preferences</h3>
                <div className="settings-form">
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Email Notifications</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Task Reminders</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Weekly Reports</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <h2>Security Settings</h2>
                <p className="section-description">Manage security and access controls</p>
              </div>
            </div>
            
            <div className="settings-grid">
              <div className="settings-card">
                <h3 className="settings-title">Password Policy</h3>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Minimum Password Length</label>
                    <select defaultValue="8">
                      <option value="6">6 characters</option>
                      <option value="8">8 characters</option>
                      <option value="10">10 characters</option>
                      <option value="12">12 characters</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Require special characters</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Password expiration (90 days)</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="settings-card">
                <h3 className="settings-title">Session Management</h3>
                <div className="settings-form">
                  <div className="form-group">
                    <label>Session Timeout</label>
                    <select defaultValue="30">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" defaultChecked />
                      <span>Remember me option</span>
                    </label>
                  </div>
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input type="checkbox" />
                      <span>Two-factor authentication</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
