import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

export default function Tasks() {
  const navigate = useNavigate();
  const companyName = localStorage.getItem("company_name") || "Company";
  const token = localStorage.getItem("token");
  const companyId = localStorage.getItem("company_id");

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assignee_id: '',
    priority: 'medium',
    status: 'todo',
    due_date: ''
  });

  // Load data from backend
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load tasks
      const tasksResponse = await axios.get('http://localhost:8000/api/tasks/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Load projects
      const projectsResponse = await axios.get('http://localhost:8000/api/projects/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Load employees
      const employeesResponse = await axios.get('http://localhost:8000/api/employees/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setTasks(tasksResponse.data || []);
      setProjects(projectsResponse.data || []);
      setEmployees(employeesResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to empty arrays if API fails
      setTasks([]);
      setProjects([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("manager_id");
    localStorage.removeItem("company_id");
    localStorage.removeItem("company_name");
    navigate("/login");
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      project_id: '',
      assignee_id: '',
      priority: 'medium',
      status: 'todo',
      due_date: ''
    });
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      project_id: task.project,
      assignee_id: task.assignee,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date || ''
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async () => {
    try {
      const taskData = {
        ...formData,
        company: companyId
      };

      if (editingTask) {
        // Update existing task
        await axios.put(`http://localhost:8000/api/tasks/${editingTask.id}/`, taskData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Create new task
        await axios.post('http://localhost:8000/api/tasks/', taskData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      setShowTaskModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`http://localhost:8000/api/tasks/${taskId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        loadData();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/tasks/${taskId}/`, {
        status: newStatus
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      loadData();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  // Group tasks by status for Kanban board
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'done');

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'urgent';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unassigned';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(proj => proj.id === projectId);
    return project ? project.name : 'No Project';
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner">Loading tasks...</div>
        </div>
      </div>
    );
  }

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
                <a href="#tasks" className="nav-link active">
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
              <h1 className="welcome-title">✓ Tasks</h1>
              <p className="welcome-subtitle">Assign, track, and manage team tasks</p>
            </div>
            <div className="welcome-actions">
              <button className="btn-primary">
                <span className="btn-icon">➕</span>
                New Task
              </button>
            </div>
          </section>

          <section className="tasks-section">
            <div className="section-header">
              <div className="section-title">
                <h2>Task Overview</h2>
                <p className="section-description">View and manage all team tasks</p>
              </div>
            </div>
            
            <div className="task-columns">
              <div className="task-column">
                <h3 className="column-title">To Do</h3>
                {[1, 2, 3].map(i => (
                  <div key={i} className="task-card">
                    <h4 className="task-title">Task {i}</h4>
                    <p className="task-description">Complete the user interface design</p>
                    <div className="task-meta">
                      <span className="task-priority high">High</span>
                      <span className="task-assignee">👤 User {i}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="task-column">
                <h3 className="column-title">In Progress</h3>
                {[1, 2].map(i => (
                  <div key={i} className="task-card">
                    <h4 className="task-title">Task {i + 3}</h4>
                    <p className="task-description">Implement authentication system</p>
                    <div className="task-meta">
                      <span className="task-priority medium">Medium</span>
                      <span className="task-assignee">👤 User {i + 3}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="task-column">
                <h3 className="column-title">Completed</h3>
                {[1, 2].map(i => (
                  <div key={i} className="task-card completed">
                    <h4 className="task-title">Task {i + 5}</h4>
                    <p className="task-description">Setup development environment</p>
                    <div className="task-meta">
                      <span className="task-priority low">Low</span>
                      <span className="task-assignee">👤 User {i + 5}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
