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
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const tasksResponse = await axios.get('http://localhost:8000/api/tasks/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const projectsResponse = await axios.get('http://localhost:8000/api/projects/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch employees from company-specific endpoint
      const employeesResponse = await axios.get(
        `http://localhost:8000/api/employees/company/${companyId}/employees/`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setTasks(tasksResponse.data || []);
      setProjects(projectsResponse.data || []);
      setEmployees(employeesResponse.data?.employees || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback to mock data for testing
      setTasks([
        {
          id: 1,
          title: 'Setup Development Environment',
          description: 'Configure development tools and environments',
          priority: 'high',
          status: 'todo',
          assignee: null,
          project: null,
          due_date: '2025-12-09'
        },
        {
          id: 2,
          title: 'Create Project Documentation',
          description: 'Write technical documentation and user guides',
          priority: 'medium',
          status: 'todo',
          assignee: null,
          project: null,
          due_date: '2025-12-16'
        }
      ]);
      setProjects([
        { id: 1, name: 'Campus Hub Setup' },
        { id: 2, name: 'Documentation' }
      ]);
      setEmployees([
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' }
      ]);
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

  const handleSaveTask = async () => {
    try {
      const taskData = { ...formData, company: companyId };
      // Backend expects `assigned_to` field; map `assignee_id` to `assigned_to` when calling API
      const apiTaskData = { ...taskData };
      if (apiTaskData.assignee_id) {
        apiTaskData.assigned_to = apiTaskData.assignee_id;
        delete apiTaskData.assignee_id;
      }

      if (editingTask) {
        // Try backend first
        try {
          await axios.put(`http://localhost:8000/api/tasks/${editingTask.id}/`, apiTaskData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          // Mock update for testing
          setTasks(prev => prev.map(task => 
            task.id === editingTask.id 
              ? { ...task, ...taskData }
              : task
          ));
        }
      } else {
        // Try backend first
        try {
          await axios.post('http://localhost:8000/api/tasks/', apiTaskData, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          // Mock creation for testing
          const newTask = {
            ...taskData,
            id: Date.now(),
            created_at: new Date().toISOString()
          };
          setTasks(prev => [...prev, newTask]);
        }
      }

      setShowTaskModal(false);
      loadData();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Try backend first
      try {
        await axios.patch(`http://localhost:8000/api/tasks/${taskId}/`, {
          status: newStatus
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        // Mock status change for testing
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus }
            : task
        ));
      }
      loadData();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        // Try backend first
        try {
          await axios.delete(`http://localhost:8000/api/tasks/${taskId}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } catch (error) {
          // Mock deletion for testing
          setTasks(prev => prev.filter(task => task.id !== taskId));
        }
        loadData();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const todoTasks = tasks.filter(task => (task.status || '').toLowerCase() === 'todo');
  const inProgressTasks = tasks.filter(task => {
    const s = (task.status || '').toLowerCase();
    return s === 'in-progress' || s === 'in_progress' || s === 'in progress' || s.includes('in');
  });
  const completedTasks = tasks.filter(task => {
    const s = (task.status || '').toLowerCase();
    return s === 'completed' || s === 'done' || s === 'complete';
  });

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
    if (!employeeId) return 'Unassigned';
    const idStr = String(employeeId);
    const employee = employees.find(emp => String(emp.id) === idStr || emp.id === employeeId);
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
              <button onClick={handleCreateTask} className="btn-primary">
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
                {todoTasks.length === 0 ? (
                  <div className="empty-column">No tasks to do</div>
                ) : (
                  todoTasks.map(task => (
                    <div key={task.id} className="task-card">
                      <h4 className="task-title">{task.title}</h4>
                      <p className="task-description">{task.description}</p>
                      <div className="task-meta">
                        <span className={`task-priority ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                        <span className="task-assignee">👤 {getEmployeeName(task.assigned_to)}</span>
                      </div>
                      <div className="task-actions">
                        <button onClick={() => handleStatusChange(task.id, 'in-progress')} className="btn-small">Start</button>
                        <button onClick={() => handleEditTask(task)} className="btn-small">Edit</button>
                        <button onClick={() => handleDeleteTask(task.id)} className="btn-small btn-danger">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="task-column">
                <h3 className="column-title">In Progress</h3>
                {inProgressTasks.length === 0 ? (
                  <div className="empty-column">No tasks in progress</div>
                ) : (
                  inProgressTasks.map(task => (
                    <div key={task.id} className="task-card">
                      <h4 className="task-title">{task.title}</h4>
                      <p className="task-description">{task.description}</p>
                      <div className="task-meta">
                        <span className={`task-priority ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                        <span className="task-assignee">👤 {getEmployeeName(task.assigned_to)}</span>
                      </div>
                      <div className="task-actions">
                        <button onClick={() => handleStatusChange(task.id, 'completed')} className="btn-small">Complete</button>
                        <button onClick={() => handleEditTask(task)} className="btn-small">Edit</button>
                        <button onClick={() => handleDeleteTask(task.id)} className="btn-small btn-danger">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="task-column">
                <h3 className="column-title">Completed</h3>
                {completedTasks.length === 0 ? (
                  <div className="empty-column">No completed tasks</div>
                ) : (
                  completedTasks.map(task => (
                    <div key={task.id} className="task-card completed">
                      <h4 className="task-title">{task.title}</h4>
                      <p className="task-description">{task.description}</p>
                      <div className="task-meta">
                        <span className={`task-priority ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                        <span className="task-assignee">👤 {getEmployeeName(task.assigned_to)}</span>
                      </div>
                      <div className="task-actions">
                        <button onClick={() => handleStatusChange(task.id, 'todo')} className="btn-small">Reopen</button>
                        <button onClick={() => handleDeleteTask(task.id)} className="btn-small btn-danger">Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="employees-section">
            <div className="section-header">
              <div className="section-title">
                <h2>👥 Team Members</h2>
                <p className="section-description">View all employees and their details</p>
              </div>
            </div>
            
            <div className="employees-grid">
              {employees.length === 0 ? (
                <div className="empty-section">No employees in this company</div>
              ) : (
                employees.map(emp => (
                  <div key={emp.id} className="employee-card">
                    <div className="employee-header">
                      <div className="employee-avatar">
                        <span>{emp.first_name?.charAt(0)}{emp.last_name?.charAt(0)}</span>
                      </div>
                      <div className="employee-info">
                        <h3 className="employee-name">{emp.first_name} {emp.last_name}</h3>
                        <p className="employee-designation">{emp.designation}</p>
                      </div>
                    </div>
                    
                    <div className="employee-details">
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{emp.email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{emp.phone || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Tasks:</span>
                        <span className="detail-value badge">{emp.tasks_count || 0}</span>
                      </div>
                      {emp.skills && emp.skills.length > 0 && (
                        <div className="detail-item">
                          <span className="detail-label">Skills:</span>
                          <div className="skills-list">
                            {emp.skills.map((skill, idx) => (
                              <span key={idx} className="skill-tag">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setShowEmployeeModal(true);
                      }}
                      className="btn-small btn-primary"
                    >
                      View Details
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'New Task'}</h3>
              <button onClick={() => setShowTaskModal(false)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Task title"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Task description"
                />
              </div>
              <div className="form-group">
                <label>Project</label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <select
                  value={formData.assignee_id}
                  onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowTaskModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveTask} className="btn-primary">
                {editingTask ? 'Update' : 'Create'} Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Details Modal */}
      {showEmployeeModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h3>Employee Details</h3>
              <button onClick={() => setShowEmployeeModal(false)} className="btn-close">×</button>
            </div>
            <div className="modal-body">
              <div className="employee-modal-content">
                <div className="employee-modal-header">
                  <div className="employee-modal-avatar">
                    <span>{selectedEmployee.first_name?.charAt(0)}{selectedEmployee.last_name?.charAt(0)}</span>
                  </div>
                  <div className="employee-modal-info">
                    <h2>{selectedEmployee.first_name} {selectedEmployee.last_name}</h2>
                    <p className="designation">{selectedEmployee.designation}</p>
                    <p className="email">{selectedEmployee.email}</p>
                  </div>
                </div>

                <div className="employee-modal-details">
                  <div className="detail-section">
                    <h4>Personal Information</h4>
                    <div className="detail-grid">
                      <div className="detail-row">
                        <span className="label">Phone:</span>
                        <span className="value">{selectedEmployee.phone || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Department:</span>
                        <span className="value">{selectedEmployee.department || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Role:</span>
                        <span className="value">{selectedEmployee.role || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Experience:</span>
                        <span className="value">{selectedEmployee.experience || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Work Mode:</span>
                        <span className="value">{selectedEmployee.work_mode || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Start Date:</span>
                        <span className="value">{selectedEmployee.start_date ? new Date(selectedEmployee.start_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                    <div className="detail-section">
                      <h4>Skills</h4>
                      <div className="skills-display">
                        {selectedEmployee.skills.map((skill, idx) => (
                          <span key={idx} className="skill-badge">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEmployee.tasks && selectedEmployee.tasks.length > 0 && (
                    <div className="detail-section">
                      <h4>Assigned Tasks ({selectedEmployee.tasks.length})</h4>
                      <div className="tasks-list">
                        {selectedEmployee.tasks.map(task => (
                          <div key={task.id} className="task-item">
                            <div className="task-item-header">
                              <h5>{task.title}</h5>
                              <span className={`status-badge ${String(task.status || '').replace(/-/g, '_')}`}>{task.status}</span>
                            </div>
                            <div className="task-item-meta">
                              <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                              {task.due_date && (
                                <span className="due-date">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!selectedEmployee.tasks || selectedEmployee.tasks.length === 0) && (
                    <div className="detail-section">
                      <p className="empty-message">No tasks assigned</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowEmployeeModal(false)} className="btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
