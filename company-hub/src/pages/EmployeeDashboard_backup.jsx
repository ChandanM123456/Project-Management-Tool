import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import "./EmployeeDashboard.css";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  // Employee-specific state
  const [employeeData, setEmployeeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState(localStorage.getItem("company_name") || "Company");
  const [employeeName, setEmployeeName] = useState(localStorage.getItem("employee_name") || "Employee");
  const [employeeId, setEmployeeId] = useState(localStorage.getItem("employee_id") || "E-001");

  // Employee data loading
  useEffect(() => {
    const storedName = localStorage.getItem("employee_name") || "Alex Johnson";
    const storedId = localStorage.getItem("employee_id") || "E-401";
    const storedCompany = localStorage.getItem("company_name") || "TechInnovate Solutions";

    setEmployeeData({
      employee_name: storedName,
      employee_id: storedId,
      company_name: storedCompany,
      yesterday_work: "Completed feature X development and started writing unit tests for module Y.",
      yesterday_commits: [
        { id: 'c1', message: "feat: Finish feature X implementation.", timestamp: '2025-12-12T15:00:00Z' },
        { id: 'c2', message: "test: Initial unit tests for module Y.", timestamp: '2025-12-12T17:30:00Z' },
      ],
      today_tasks: [
        { id: 1, title: "Finalize unit tests for module Y", allocated_time: "2 hours", status: "Pending" },
        { id: 2, title: "Review pull requests from team Z", allocated_time: "1 hour", status: "Pending" },
        { id: 3, title: "Start working on new endpoint for user profile", allocated_time: "5 hours", status: "Pending" },
      ],
    });

    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/employee/login"); 
  };

  if (loading) {
    return <div className="loading">Loading Dashboard...</div>;
  }

  const { employee_name, yesterday_work, yesterday_commits, today_tasks } = employeeData;
  const hasCommits = yesterday_commits && yesterday_commits.length > 0;
  
  let yesterdayStatus;
  let remainingTime = "1 hour";

  if (!yesterday_work || yesterday_work === "") {
    yesterdayStatus = {
      type: "warning",
      message: "No work logged for yesterday. Please update your status.",
    };
  } else if (!hasCommits) {
    yesterdayStatus = {
      type: "danger",
      message: `Work log found, but **No Git Commits** were detected for yesterday. Your work is considered **Incomplete**. Please allocate ${remainingTime} to finish and commit.`,
    };
    if (today_tasks[0].title !== `Catch up: Finish work from yesterday (${remainingTime})`) {
        today_tasks.unshift({ id: 0, title: `Catch up: Finish work from yesterday (${remainingTime})`, allocated_time: remainingTime, status: "Urgent" });
    }
  } else {
    yesterdayStatus = {
      type: "success",
      message: `Great job! ${yesterday_commits.length} commits detected. Yesterday's work seems **Complete** and documented.`,
    };
  }

  return (
    <div className="dashboard">
      {/* Modern Navbar */}
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
                <span className="user-role">Employee</span>
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
        {/* Enhanced Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Navigation</h3>
            <div className="sidebar-subtitle">Manage your workspace</div>
          </div>
          <nav className="sidebar-nav">
            <ul className="nav-menu">
              <li className="nav-item">
                <a href="#EmployeeDashboard" className="nav-link active">
                  <span className="nav-icon">📊</span>
                  <span className="nav-text">EmployeeDashboard</span>
                  <span className="nav-badge">New</span>
                </a>
              </li>
              <li className="nav-item">
                <a href="#employees" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/tasks'); }}>
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
                <a href="#settings" className="nav-link" onClick={(e) => { e.preventDefault(); navigate('/settings'); }}>
                  <span className="nav-icon">⚙️</span>
                  <span className="nav-text">Settings</span>
                </a>
              </li>
            </ul>
          </nav>
          <div className="sidebar-footer">
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-value">12</span>
                <span className="stat-label">Team Members</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">5</span>
                <span className="stat-label">Active Projects</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Enhanced Main Content */}
        <main className="dashboard-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-content">
              <h1 className="welcome-title">Welcome back, {employee_name}! 👋</h1>
              <p className="welcome-subtitle">track your work and stay productive</p>
            </div>
            <div className="welcome-actions">
              <button className="btn-primary" onClick={() => navigate('/tasks')}>
                <span className="btn-icon">👥</span>
                Manage Employees
              </button>
              <button className="btn-secondary" onClick={() => setShowEmployeeModal(true)}>
                <span className="btn-icon">➕</span>
                View Tasks
              </button>
              <button className="btn-info" onClick={() => setShowShareModal(true)}>
                <span className="btn-icon">🔗</span>
                View Projects
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* Enhanced Manual Employee Modal */}
      {showEmployeeModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h3>📝 View Tasks Manually</h3>
                <p>Fill in the employee details below</p>
              </div>
              <button className="modal-close" onClick={() => setShowEmployeeModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <form className="employee-form" onSubmit={handleEmployeeFormSubmit}>
                <div className="form-section">
                  <h4 className="section-subtitle">Personal Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input 
                        type="text" 
                        name="first_name"
                        placeholder="Enter first name" 
                        value={employeeForm.first_name}
                        onChange={handleEmployeeFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input 
                        type="text" 
                        name="last_name"
                        placeholder="Enter last name" 
                        value={employeeForm.last_name}
                        onChange={handleEmployeeFormChange}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-section">
                  <h4 className="section-subtitle">Contact Information</h4>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Enter email address" 
                      value={employeeForm.email}
                      onChange={handleEmployeeFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="Enter phone number" 
                      value={employeeForm.phone}
                      onChange={handleEmployeeFormChange}
                    />
                  </div>
                </div>
                
                <div className="form-section">
                  <h4 className="section-subtitle">Professional Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Role</label>
                      <select 
                        name="role"
                        value={employeeForm.role}
                        onChange={handleEmployeeFormChange}
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="Employee">Project Employee</option>
                        <option value="analyst">Business Analyst</option>
                        <option value="tester">QA Tester</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Designation</label>
                      <input 
                        type="text" 
                        name="designation"
                        placeholder="e.g. Senior Developer" 
                        value={employeeForm.designation}
                        onChange={handleEmployeeFormChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select 
                      name="department"
                      value={employeeForm.department}
                      onChange={handleEmployeeFormChange}
                    >
                      <option value="">Select Department</option>
                      <option value="engineering">Engineering</option>
                      <option value="design">Design</option>
                      <option value="marketing">Marketing</option>
                      <option value="sales">Sales</option>
                      <option value="hr">Human Resources</option>
                    </select>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowEmployeeModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    <span className="btn-icon">➕</span>
                    View Tasks
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Share Form Modal */}
      {showShareModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">
                <h3>📷 Share Form with Camera</h3>
                <p>Create an invite link for employee onboarding</p>
              </div>
              <button className="modal-close" onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="share-info">
                <p>Generate a personalized link that employees can use to:</p>
                
                <div className="form-features">
                  <div className="feature-item">
                    <span className="feature-icon">📷</span>
                    <div className="feature-content">
                      <h4>Capture Photo</h4>
                      <p>Take a photo using device camera for face recognition</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">📝</span>
                    <div className="feature-content">
                      <h4>Complete Information</h4>
                      <p>Fill out personal and professional details</p>
                    </div>
                  </div>
                  <div className="feature-item">
                    <span className="feature-icon">🤖</span>
                    <div className="feature-content">
                      <h4>Auto-Setup</h4>
                      <p>Generate encoding.pkl file automatically</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="share-actions">
                <button className="btn-primary" onClick={handleCreateInvite} disabled={shareLoading}>
                  <span className="btn-icon">🔗</span>
                  {shareLoading ? 'Creating...' : 'Generate Invite Link'}
                </button>
              </div>
              
              {inviteUrl && (
                <div className="invite-result">
                  <label>Share this link with your employee:</label>
                  <div className="invite-link-container">
                    <input 
                      type="text" 
                      className="invite-input" 
                      value={inviteUrl} 
                      readOnly 
                    />
                    <button className="btn-copy" onClick={copyToClipboard}>
                      <span className="copy-icon">📋</span>
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
