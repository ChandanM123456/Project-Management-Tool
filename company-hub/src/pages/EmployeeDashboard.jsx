import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Ensure you create this CSS file

// --- Simulated Data for the Dashboard ---
const simulateEmployeeData = {
  employee_name: "Alex Johnson",
  employee_id: "E-401",
  company_name: "TechInnovate Solutions",
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
};
// ----------------------------------------

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState({});
  const [loading, setLoading] = useState(true);

  // Simulate fetching data on component mount
  useEffect(() => {
    // In a real application, you would fetch this from an API
    // The following lines simulate loading from local storage/API and merging with simulated data
    const storedName = localStorage.getItem("employee_name") || simulateEmployeeData.employee_name;
    const storedId = localStorage.getItem("employee_id") || simulateEmployeeData.employee_id;
    const storedCompany = localStorage.getItem("company_name") || simulateEmployeeData.company_name;

    setEmployeeData({
      ...simulateEmployeeData,
      employee_name: storedName,
      employee_id: storedId,
      company_name: storedCompany,
    });

    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    // Redirect to login page
    navigate("/employee/login"); 
  };

  if (loading) {
    return <div className="loading">Loading Dashboard...</div>;
  }

  // --- Logic for Yesterday's Status ---
  const { employee_name, company_name, employee_id, yesterday_work, yesterday_commits, today_tasks } = employeeData;
  const hasCommits = yesterday_commits && yesterday_commits.length > 0;
  
  let yesterdayStatus;
  let remainingTime = "1 hour"; // Default catch-up time

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
    // Add the catch-up task to today's list (simulated)
    if (today_tasks[0].title !== `Catch up: Finish work from yesterday (${remainingTime})`) {
        today_tasks.unshift({ id: 0, title: `Catch up: Finish work from yesterday (${remainingTime})`, allocated_time: remainingTime, status: "Urgent" });
    }
    
  } else {
    yesterdayStatus = {
      type: "success",
      message: `Great job! ${yesterday_commits.length} commits detected. Yesterday's work seems **Complete** and documented.`,
    };
  }
  // ------------------------------------

  return (
    <div className="dashboard-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-logo">
          {company_name} Portal
        </div>
        <div className="navbar-links">
          <button onClick={() => navigate("/dashboard")} className="nav-btn active">Dashboard</button>
          <button onClick={() => navigate("/tasks")} className="nav-btn">Tasks</button>
          <button onClick={() => navigate("/projects")} className="nav-btn">Projects</button>
          <button onClick={() => navigate("/schedule")} className="nav-btn">Schedule</button>
          <button onClick={() => navigate("/settings")} className="nav-btn">Settings</button>
        </div>
        <div className="navbar-profile">
          <span>{employee_name} ({employee_id})</span>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome Back, {employee_name}!</h1>
          <p>It's a fresh start. Let's make today productive.</p>
        </header>

        {/* Yesterday's Status Card */}
        <div className={`status-card ${yesterdayStatus.type}`}>
          <h2>🗓️ Yesterday's Work Status</h2>
          <p dangerouslySetInnerHTML={{ __html: yesterdayStatus.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          
          {hasCommits && (
            <>
              <h3>Last Commits:</h3>
              <ul className="commit-list">
                {yesterday_commits.slice(0, 3).map((commit) => (
                  <li key={commit.id}>
                    <span className="commit-msg">{commit.message}</span>
                    <span className="commit-time">({new Date(commit.timestamp).toLocaleTimeString()})</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Today's Focus Card */}
        <div className="card focus-card">
          <h2>🎯 Today's Focus & Tasks</h2>
          <ul className="task-list">
            {today_tasks.map((task) => (
              <li key={task.id} className={task.status.toLowerCase()}>
                <span className="task-title">
                    {task.title}
                    {task.status === "Urgent" && <span className="tag-urgent">URGENT</span>}
                </span>
                <span className="task-time-allocated">Time: {task.allocated_time}</span>
              </li>
            ))}
          </ul>
          <p className="total-time">Total Estimated Work Time: **8.5 hours** (Simulated)</p>
          <button className="btn-primary" onClick={() => navigate("/tasks")}>Go to Task Board</button>
        </div>

        {/* Employee Info & Quick Actions Grid */}
        <div className="info-grid">
          <div className="card info-card">
            <h3>👤 Your Profile</h3>
            <p><strong>Name:</strong> {employee_name}</p>
            <p><strong>Employee ID:</strong> {employee_id}</p>
            <p><strong>Company:</strong> {company_name}</p>
          </div>
          
          <div className="card info-card">
            <h3>⚡ Quick Access</h3>
            <button className="btn-secondary" onClick={() => navigate("/time-off")}>
              Request Time Off
            </button>
            <button className="btn-secondary" onClick={() => navigate("/resources")}>
              Company Resources
            </button>
          </div>
          
          <div className="card info-card">
            <h3>🔔 Notifications (3)</h3>
            <ul>
                <li>New HR Policy Update</li>
                <li>Your Pay Slip is Ready</li>
                <li>Review for PR #1234</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}