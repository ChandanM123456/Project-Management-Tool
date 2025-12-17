import React, { useState, useEffect, useRef } from "react";
import "./NexusPlatform.css";

export default function NexusPlatform() {
  const [view, setView] = useState("dashboard"); // dashboard, kanban, calendar
  const [activeVoiceRoom, setActiveVoiceRoom] = useState(null);
  const [isAiListening, setIsAiListening] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "Nexus AI", text: "Welcome back! I am monitoring voice channels for task intents.", type: "system" }
  ]);
  const [tasks, setTasks] = useState([
    { id: 101, title: "Configure WebRTC STUN/TURN", status: "progress", priority: "high", user: "AJ" },
    { id: 102, title: "Socket.io Load Balancing", status: "backlog", priority: "medium", user: "SK" }
  ]);

  // --- FEATURE: AI NLP AUTO-TASK CREATION ---
  // Simulates capturing "Fix the bug" from voice and creating a task
  const triggerAiAutomation = (transcript) => {
    setIsAiListening(true);
    setTimeout(() => {
      const newTask = {
        id: Math.floor(Math.random() * 1000),
        title: `AI Generated: ${transcript}`,
        status: "backlog",
        priority: "urgent",
        user: "AI-Bot"
      };
      setTasks(prev => [newTask, ...prev]);
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        sender: "Nexus AI", 
        text: `Detected intent: "${transcript}". Task created and added to Backlog.`, 
        type: "ai" 
      }]);
      setIsAiListening(false);
    }, 1500);
  };

  return (
    <div className="nexus-container">
      {/* SIDEBAR: NAVIGATION & VOICE CHANNELS */}
      <aside className="nexus-sidebar">
        <div className="brand-header">
          <div className="brand-logo">NX</div>
          <h1>Nexus Pro</h1>
        </div>

        <nav className="main-nav">
          <p className="section-title">Workspace</p>
          <button className={`nav-link ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>🏠 Dashboard</button>
          <button className={`nav-link ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>📋 Kanban Board</button>
          <button className={`nav-link ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>📅 Roadmap</button>
        </nav>

        <div className="voice-channels">
          <p className="section-title">Voice Channels (WebRTC)</p>
          {['General Sync', 'Dev Standup', 'Emergency'].map(room => (
            <button 
              key={room} 
              className={`voice-item ${activeVoiceRoom === room ? 'active' : ''}`}
              onClick={() => setActiveVoiceRoom(activeVoiceRoom === room ? null : room)}
            >
              <span className="voice-icon">{activeVoiceRoom === room ? '🎙️' : '📁'}</span>
              <span>{room}</span>
              {activeVoiceRoom === room && <div className="live-waves"><span></span><span></span><span></span></div>}
            </button>
          ))}
        </div>

        <div className="user-profile">
          <div className="u-avatar">AJ</div>
          <div className="u-info">
            <p className="u-name">Alex Johnson</p>
            <p className="u-status">Active • Senior Dev</p>
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="nexus-main">
        <header className="nexus-header">
          <div className="ai-status">
            <div className={`status-orb ${activeVoiceRoom ? 'listening' : ''}`}></div>
            <span>{activeVoiceRoom ? `AI Monitor Active in ${activeVoiceRoom}` : 'AI Assistant Standby'}</span>
          </div>
          <div className="header-actions">
            <button className="btn-ghost" onClick={() => triggerAiAutomation("Fix login bug")}>Simulate NLP</button>
            <button className="btn-primary">+ New Project</button>
          </div>
        </header>

        <div className="nexus-body">
          {view === "dashboard" && (
            <div className="view-fade">
              <div className="metrics-grid">
                <div className="card metric">
                  <p>Efficiency</p>
                  <h2>94.2%</h2>
                  
                </div>
                <div className="card metric">
                  <p>Open Tasks</p>
                  <h2>{tasks.length}</h2>
                </div>
              </div>
              <div className="card meeting-scheduler">
                <h3>Meeting & Chat Sync</h3>
                <p>Scheduled: Architecture Review @ 4:00 PM</p>
                <button className="btn-join">Join Room</button>
              </div>
            </div>
          )}

          {view === "kanban" && (
            <div className="kanban-board view-fade">
              
              <div className="kanban-columns">
                {['backlog', 'progress', 'review'].map(status => (
                  <div className="k-col" key={status}>
                    <div className="k-header">{status.toUpperCase()}</div>
                    {tasks.filter(t => t.status === status).map(task => (
                      <div className="task-card" key={task.id}>
                        <div className={`prio-tag ${task.priority}`}>{task.priority}</div>
                        <h4>{task.title}</h4>
                        <div className="task-meta">
                          <span className="task-id">#NX-{task.id}</span>
                          <div className="mini-avatar">{task.user}</div>
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

      {/* REAL-TIME CHAT (SOCKET.IO) */}
      <section className="nexus-chat">
        <div className="chat-head">Collaborative Chat</div>
        <div className="chat-messages">
          {messages.map(m => (
            <div key={m.id} className={`message ${m.type}`}>
              <p className="m-sender">{m.sender}</p>
              <p className="m-text">{m.text}</p>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input type="text" placeholder="Type a message..." />
        </div>
      </section>
    </div>
  );
}