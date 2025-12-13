import React, { useState } from "react";
import axiosInstance from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./CompanyLogin.css";

export default function ManagerRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    company_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  React.useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await axiosInstance.get("/company/list/");
      setCompanies(res.data.companies || []);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
      setError("Unable to load companies. Please refresh the page.");
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const res = await axiosInstance.post("/managers/register/", formData);
      if (res.data.success) {
        alert(`Manager registered successfully! Manager ID: ${res.data.manager_id}`);
        navigate("/manager/login");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMsg);
      console.error("Manager registration error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Register as Manager</h1>
          <p>Join your company to manage projects and teams</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter strong password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Contact Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="company_id">Select Company *</label>
            <select
              id="company_id"
              name="company_id"
              value={formData.company_id}
              onChange={handleChange}
              required
              disabled={loadingCompanies}
              className="company-select"
            >
              <option value="">Choose your company...</option>
              {companies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {loadingCompanies && <small>Loading companies...</small>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || loadingCompanies}>
            {loading ? "Registering..." : "Register as Manager"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/manager/login" className="link">
              Login here
            </Link>
          </p>
          <p style={{ marginTop: '12px' }}>
            <Link to="/login" className="link">
              ← Back to Company Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
