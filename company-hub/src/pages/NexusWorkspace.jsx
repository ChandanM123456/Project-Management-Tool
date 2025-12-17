import React, { useState, useEffect, useRef } from "react";
import "./NexusWorkspace.css";

export default function NexusWorkspace() {
  const [view, setView] = useState("dashboard");
  const [isAiListening, setIsAiListening] = useState(false);
  const [activeVoiceRoom, setActiveVoiceRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([
    { id: 1, title: "SSL Handshake Debug", status: "backlog", priority: "Urgent", user: "AJ" },
    { id: 2, title: "WebRTC Signaling Server", status: "progress", priority: "High", user: "SK" },
    { id: 3, title: "NLP Intent Mapping", status: "review", priority: "Normal", user: "AI" }
  ]);

  // AI Simulation Logic: When AI "hears" a keyword, it generates a task
  useEffect(() => {
    if (activeVoiceRoom) {
      setIsAiProcessing(true);
      const timer = setTimeout(() => {
        const aiTask = { id: Date.now(), title: "Fix login bug (Auto-detected)", status: "backlog", priority: "Urgent", user: "AI" };
        setTasks(prev => [aiTask, ...prev]);
        setMessages(prev => [...prev, { sender: "Nexus AI", text: "New task created: Fix login bug." }]);
      }, 5000); // Simulate hearing a command after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [activeVoiceRoom]);

  return (
    <div className="nexus-app">
      {/* --- SIDEBAR: NAVIGATION & WEB-RTC CHANNELS --- */}
      <aside className="nexus-sidebar">
        <div className="nexus-brand">💠 Nexus OS</div>
        
        <nav className="nexus-nav">
          <p className="nav-label">Workspace</p>
          <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>📊 Dashboard</button>
          <button className={`nav-link ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>📋 Project Board</button>
          <button className={`nav-link ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>📅 Roadmap</button>
        </nav>

        <div className="nexus-nav">
          <p className="nav-label">Voice Channels (WebRTC)</p>
          {['General Sync', 'Dev Standup', 'Emergency Room'].map(room => (
            <button 
              key={room}
              className={`voice-channel ${activeVoiceRoom === room ? 'connected' : ''}`}
              onClick={() => setActiveVoiceRoom(activeVoiceRoom === room ? null : room)}
            >
              <span className="v-icon">{activeVoiceRoom === room ? '🎙️' : '📁'}</span>
              <span className="v-name">{room}</span>
              {activeVoiceRoom === room && <div className="audio-wave"><span></span><span></span><span></span></div>}
            </button>
          ))}
        </div>

        <div className="sidebar-profile">
          <div className="avatar-med">AJ</div>
          <div className="profile-info">
            <p className="p-name">Alex Johnson</p>
            <p className="p-status">● Online</p>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="nexus-viewport">
        <header className="nexus-topbar">
          <div className="ai-intelligence-chip">
            <div className={`ai-pulse ${activeVoiceRoom ? 'active' : ''}`}></div>
            <span>{activeVoiceRoom ? `AI Listening in ${activeVoiceRoom}...` : 'AI Standby'}</span>
          </div>
          <div className="header-actions">
            <button className="btn-secondary">Schedule Meeting</button>
            <button className="btn-primary">+ Create</button>
          </div>
        </header>

        <div className="nexus-content">
          {view === 'dashboard' && (
            <div className="dashboard-view animate-in">
              <div className="metrics-row">
                <div className="metric-card">
                  <p className="m-label">Project Velocity</p>
                  <p className="m-value">42.5 <small>pts/week</small></p>
                  <div className="m-chart">[Chart]</div>
                </div>
                <div className="metric-card">
                  <p className="m-label">Active Collaborators</p>
                  <div className="avatar-group">
                    <div className="avatar-s">AJ</div>
                    <div className="avatar-s">SK</div>
                    <div className="avatar-s">ML</div>
                  </div>
                </div>
              </div>
              
              <div className="recent-ai-logs card">
                <h3>AI Insights & Automation</h3>
                <ul className="ai-log-list">
                  <li>🤖 AI auto-assigned <strong>Task #402</strong> to <strong>Backend Team</strong> based on standup.</li>
                  <li>📅 Meeting <strong>"Sprint Planning"</strong> scheduled for tomorrow 10:00 AM.</li>
                </ul>
              </div>
            </div>
          )}

          {view === 'kanban' && (
            <div className="kanban-view animate-in">
              <div className="kanban-grid">
                {['backlog', 'progress', 'review'].map(col => (
                  <div className="kanban-col" key={col}>
                    <div className="col-header">{col.toUpperCase()}</div>
                    {tasks.filter(t => t.status === col).map(task => (
                      <div className="task-card" key={task.id}>
                        <div className={`priority-tag ${task.priority.toLowerCase()}`}>{task.priority}</div>
                        <h4>{task.title}</h4>
                        <div className="task-footer">
                          <span>🆔 NX-{task.id}</span>
                          <div className="avatar-xs">{task.user}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* --- REAL-TIME TEXT COLLABORATION (Socket.io) --- */}
      <section className="nexus-chat-panel">
        <div className="chat-header">Team Messaging</div>
        <div className="chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.sender === 'Nexus AI' ? 'ai' : ''}`}>
              <p className="msg-sender">{m.sender}</p>
              <p className="msg-text">{m.text}</p>
            </div>
          ))}
        </div>
        <div className="chat-input-area">
          <input type="text" placeholder="Send a message to the team..." />
        </div>
      </section>
    </div>
  );
}