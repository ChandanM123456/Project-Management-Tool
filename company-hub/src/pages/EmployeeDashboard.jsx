import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import "./EmployeeDashboard.css";

// --- CORE SYSTEM DATA ---
const INITIAL_TASKS = [
  { id: "NX-701", title: "Scale WebRTC Signaling Cluster", status: "inprogress", priority: "Highest", type: "bug", assignee: "AJ", reporter: "SM", desc: "Signaling server hitting 80% CPU at 100 concurrent peer connections." },
  { id: "NX-702", title: "Integrate Deepgram STT for AI", status: "todo", priority: "High", type: "task", assignee: "SK", reporter: "AJ", desc: "Replace legacy Speech-to-Text with low-latency streaming API." },
  { id: "NX-703", title: "Socket.io Binary Framing", status: "review", priority: "Medium", type: "story", assignee: "MD", reporter: "AJ", desc: "Optimize packet size for real-time board updates." },
  { id: "NX-704", title: "Employee KPI Analytics V3", status: "done", priority: "Low", type: "story", assignee: "AJ", reporter: "MD", desc: "Add predictive velocity charts based on historical sprint data." }
];

export default function EmployeeDashboard() {
  // --- STATE SYSTEM ---
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState("board");
  const [activeVoiceRoom, setActiveVoiceRoom] = useState(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [searchFilter, setSearchFilter] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { id: 1, user: "System", text: "Connected to Nexus-Cluster-01", type: "system" }
  ]);

  // --- FEATURE: AI NLP PIPELINE ---
  const triggerAiAutomation = useCallback(() => {
    if (!activeVoiceRoom) return;
    setIsAiProcessing(true);
    
    // Simulate Neural Network Processing
    setTimeout(() => {
      const detectedIssue = {
        id: `NX-${Math.floor(Math.random() * 900) + 100}`,
        title: "AI DETECTED: Fix Latency in Socket.io Handshake",
        status: "todo",
        priority: "High",
        type: "bug",
        assignee: "AI-System",
        reporter: "Voice-Capture",
        desc: `Automatically extracted from ${activeVoiceRoom} discussion.`
      };
      
      setTasks(prev => [detectedIssue, ...prev]);
      logActivity("AI-Assistant", `Generated new issue: ${detectedIssue.id}`);
      setChatHistory(prev => [...prev, { id: Date.now(), user: "Nexus AI", text: `I've added ${detectedIssue.id} to the backlog based on your talk.`, type: "ai" }]);
      setIsAiProcessing(false);
    }, 2000);
  }, [activeVoiceRoom]);

  // --- CORE SYSTEM LOGIC ---
  const logActivity = (user, action) => {
    const entry = { id: Date.now(), user, action, time: new Date().toLocaleTimeString() };
    setActivityFeed(prev => [entry, ...prev].slice(0, 10));
  };

  const handleTaskStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    logActivity("You", `moved ${taskId} to ${newStatus}`);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(searchFilter.toLowerCase()) || t.id.toLowerCase().includes(searchFilter.toLowerCase()));
  }, [tasks, searchFilter]);

  return (
    <div className="nexus-shell">
      {/* 1. GLOBAL JIRA SIDEBAR */}
      <nav className="nexus-global-nav">
        <div className="brand-orb">NX</div>
        <div className="nav-stack">
          <div className={`nav-icon ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>📋</div>
          <div className={`nav-icon ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📈</div>
          <div className="nav-icon">👥</div>
        </div>
        <div className="nav-foot">
          <div className="settings-icon">⚙️</div>
          <div className="user-orb">AJ</div>
        </div>
      </nav>

      {/* 2. PROJECT CONTEXT SIDEBAR */}
      <aside className="nexus-project-sidebar">
        <div className="sidebar-brand">
          <div className="proj-sq">🚀</div>
          <div className="proj-meta">
            <h4>Nexus Core</h4>
            <p>Software Project</p>
          </div>
        </div>

        <div className="sidebar-scroll">
          <section className="nav-group">
            <p className="group-label">PLANNING</p>
            <button className="nav-item">🧭 Roadmap</button>
            <button className="nav-item">📜 Backlog</button>
            <button className={`nav-item ${activeTab === 'board' ? 'active' : ''}`} onClick={() => setActiveTab('board')}>📋 Kanban Board</button>
          </section>

          <section className="nav-group">
            <p className="group-label">COMMUNICATIONS</p>
            <div className="voice-cluster">
              {['Engineering Sync', 'Design Standup', 'Emergency'].map(room => (
                <div key={room} className={`voice-item ${activeVoiceRoom === room ? 'active' : ''}`} onClick={() => setActiveVoiceRoom(activeVoiceRoom === room ? null : room)}>
                  <span className="v-icon">{activeVoiceRoom === room ? '🎙️' : '🔊'}</span>
                  <span>{room}</span>
                  {activeVoiceRoom === room && <div className="waves"><span></span><span></span><span></span></div>}
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE */}
      <main className="nexus-workspace">
        <header className="workspace-header">
          <div className="breadcrumb">Projects / Nexus Core / {activeTab}</div>
          <div className="header-btns">
            {activeVoiceRoom && (
              <button className={`ai-trigger-btn ${isAiProcessing ? 'pulse' : ''}`} onClick={triggerAiAutomation}>
                {isAiProcessing ? 'AI Processing...' : '✨ Capture AI Intent'}
              </button>
            )}
            <button className="btn-jira-blue">Create Issue</button>
          </div>
        </header>

        <div className="workspace-scroll">
          {activeTab === 'board' ? (
            <div className="board-view animate-fade">
              <div className="board-header">
                <h2>Sprint 14 - Nexus Engine</h2>
                <div className="board-utilities">
                  <input type="text" placeholder="Search issues..." value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} />
                  <div className="avatar-pile">
                    <div className="av-c">AJ</div><div className="av-c" style={{background:'#6554C0'}}>SM</div><div className="av-plus">+4</div>
                  </div>
                </div>
              </div>

              

              <div className="kanban-grid">
                {['todo', 'inprogress', 'review', 'done'].map(status => (
                  <div className="kanban-col" key={status}>
                    <div className="col-label">{status.toUpperCase()} <span>{filteredTasks.filter(t => t.status === status).length}</span></div>
                    <div className="task-container">
                      {filteredTasks.filter(t => t.status === status).map(task => (
                        <div className="jira-card" key={task.id} onClick={() => setSelectedTask(task)}>
                          <p className="card-title">{task.title}</p>
                          <div className="card-footer">
                            <div className="foot-left">
                              <span className={`type-dot ${task.type}`}></span>
                              <span className="issue-id">{task.id}</span>
                            </div>
                            <div className="foot-right">
                              <span className={`prio-ico ${task.priority.toLowerCase()}`}>▲</span>
                              <div className="mini-user">{task.assignee}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="analytics-view animate-fade">
              <h2>Efficiency Analytics</h2>
              
              <div className="metrics-row">
                <div className="metric-card"><h3>92%</h3><p>Success Rate</p></div>
                <div className="metric-card"><h3>14h</h3><p>Avg. Resolve Time</p></div>
                <div className="metric-card"><h3>24</h3><p>Sprint Capacity</p></div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 4. UTILITY PANEL */}
      <aside className="nexus-right-panel">
        <div className="panel-tabs">
          <button className="p-tab active">Activity Feed</button>
          <button className="p-tab">Team Chat</button>
        </div>

        <div className="panel-body">
          <div className="activity-feed">
            {activityFeed.map(act => (
              <div className="activity-note" key={act.id}>
                <div className="act-orb">{act.user[0]}</div>
                <div className="act-txt">
                  <p><strong>{act.user}</strong> {act.action}</p>
                  <span>{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedTask && (
          <div className="detail-drawer">
            <div className="drawer-header">
              <span>{selectedTask.id}</span>
              <button onClick={() => setSelectedTask(null)}>✕</button>
            </div>
            <div className="drawer-content">
              <h3>{selectedTask.title}</h3>
              <div className="field">
                <label>Description</label>
                <div className="editable">{selectedTask.desc}</div>
              </div>
              <div className="field">
                <label>Status</label>
                <select value={selectedTask.status} onChange={(e) => handleTaskStatusChange(selectedTask.id, e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}