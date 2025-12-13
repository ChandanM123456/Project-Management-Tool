import React, { useState } from "react";
import axiosInstance from "../api/axios";
import "./CompanyLogin.css";

export default function ShareForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const createInvite = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/employees/create-invite/');
      setUrl(res.data.url || '');
    } catch (err) {
      console.error(err);
      alert('Failed to create invite. Make sure you are logged in as the company.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Share Onboard Form</h1>
          <p>Create a shareable link for employees to fill and automatically onboard.</p>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={createInvite} disabled={loading}>{loading ? 'Creating...' : 'Create Invite'}</button>
        </div>

        {url && (
          <div style={{ marginTop: 16 }}>
            <label style={{ fontSize: 13, color: '#6b7280' }}>Invite link:</label>
            <div style={{ marginTop: 8 }}>
              <a href={url} target="_blank" rel="noreferrer">{url}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
