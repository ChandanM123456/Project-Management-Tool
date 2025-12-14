import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axios";
import "./CompanyLogin.css";

export default function SelectRole() {
  const navigate = useNavigate();
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const companyName = localStorage.getItem("company_name") || "Company";

  const handleCreateInvite = async () => {
    setLoading(true);
    setInviteUrl("");
    try {
      const res = await axiosInstance.post("/employees/create-invite/");
      setInviteUrl(res.data.url || `${window.location.origin}/onboard/${res.data.invite_token}/`);
    } catch (err) {
      console.error("Invite creation failed", err.response?.data || err.message);
      alert("Invite creation failed. Ensure you're logged in as the company.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Company Actions</h1>
          <p>Welcome <strong>{companyName}</strong>. Choose an action for this company session.</p>
        </div>

        <div className="action-buttons-grid">
          <button className="btn btn-primary action-btn manager-btn" onClick={() => navigate('/manager/login')}>
            <span className="btn-icon">👨‍💼</span>
            <span className="btn-text">Manager Login</span>
          </button>
          <button className="btn btn-primary action-btn employee-btn" onClick={() => navigate('/employee/login')}>
            <span className="btn-icon">👤</span>
            <span className="btn-text">Employee Login</span>
          </button>
        </div>

        <div className="share-section">
          <button className="btn btn-primary share-btn" onClick={handleCreateInvite} disabled={loading}>
            <span className="btn-icon">🔗</span>
            <span className="btn-text">{loading ? 'Creating...' : 'Create Employee Invite Link'}</span>
          </button>
          <p className="share-description">Generate a link to share with new employees for onboarding</p>
        </div>

        {inviteUrl && (
          <div className="invite-url-container">
            <label className="invite-label">Invite link:</label>
            <div className="invite-link-wrapper">
              <input 
                type="text" 
                value={inviteUrl} 
                readOnly 
                className="invite-input"
                onClick={(e) => e.target.select()}
              />
              <button 
                className="copy-btn" 
                onClick={() => navigator.clipboard.writeText(inviteUrl)}
                title="Copy link"
              >
                📋
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
