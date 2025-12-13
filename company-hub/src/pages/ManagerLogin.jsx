import React, { useState } from "react";
import axiosInstance from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./CompanyLogin.css";

export default function ManagerLogin() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { email: data.email.trim().toLowerCase(), password: data.password };
      const res = await axiosInstance.post('/managers/login/', payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('manager_id', res.data.manager_id || '');
      localStorage.setItem('company_id', res.data.company_id || '');
      localStorage.setItem('company_name', res.data.company_name || 'Company');
      localStorage.setItem('manager_name', res.data.manager_name || '');
      alert('Manager login successful.');
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.response?.data?.detail || 'Login failed';
      setError(msg);
      console.error('Manager login error:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Manager Login</h1>
          <p>Sign in to manage invites and projects for your company.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" value={data.email} onChange={handleChange} type="email" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" value={data.password} onChange={handleChange} required />
          </div>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/manager/register" className="link">
              Register here
            </Link>
          </p>
          <p style={{ marginTop: '12px' }}>
            <Link to="/choose-role" className="link">
              ← Back to Company Actions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
