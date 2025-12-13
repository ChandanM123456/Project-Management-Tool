import { useState } from "react";
import axiosInstance from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, validateRequired } from "../utils/validation";
import { handleApiError } from "../utils/apiErrorHandler";
import "./CompanyLogin.css";

export default function CompanyLogin() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    setError("");
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate email
    const emailResult = validateRequired(data.email, 'Email');
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
    } else if (!validateEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    const passwordResult = validateRequired(data.password, 'Password');
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    
    // Normalize inputs to avoid accidental whitespace/case issues
    const payload = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };

    try {
      const res = await axiosInstance.post("/company/login/", payload);
      
      // Store authentication data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("company_id", res.data.company_id);
      localStorage.setItem("company_name", res.data.company_name);
      
      // Store additional company info if available
      if (res.data.company_industry) {
        localStorage.setItem("company_industry", res.data.company_industry);
      }
      
      alert("Login successful!");
      // After company authenticates, allow role selection (employee / manager)
      navigate("/choose-role");
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      
      // Set field-specific errors if available
      if (errorInfo.details && errorInfo.details.errors) {
        setFieldErrors(errorInfo.details.errors);
      }
      
      // Handle redirect to login if authentication expired
      if (errorInfo.action === 'redirect_to_login') {
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 2000);
      }
      
      console.error("Login error:", errorInfo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Company Login</h1>
          <p>Access your project management dashboard</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={data.email}
              onChange={handleChange}
              className={fieldErrors.email ? 'error' : ''}
              required
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={data.password}
              onChange={handleChange}
              className={fieldErrors.password ? 'error' : ''}
              required
            />
            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="link">
              Register your company
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
