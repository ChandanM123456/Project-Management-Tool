import React, { useState, useRef } from "react";
import axiosInstance from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import Webcam from "react-webcam";
import voiceGreeting from "../utils/voiceGreeting";
import { validateEmail, validateRequired } from "../utils/validation";
import { handleApiError } from "../utils/apiErrorHandler";
import "./CompanyLogin.css";

export default function EmployeeLogin() {
  const navigate = useNavigate();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showCam, setShowCam] = useState(false);
  const [greetingPlayed, setGreetingPlayed] = useState(false);
  const [loginMethod, setLoginMethod] = useState("face"); // "face" or "password"
  const webcamRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((p) => ({ ...p, [name]: value }));
    setError("");
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (loginMethod === "password") {
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
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const playVoiceGreeting = (greetingText, voiceParams, employeeData) => {
    if (!greetingPlayed && greetingText) {
      // Use emotion-based voice parameters or defaults
      const params = voiceParams || {
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0
      };
      
      voiceGreeting.speak(greetingText, {
        rate: params.rate || 0.9,
        pitch: params.pitch || 1.0,
        volume: params.volume || 1.0,
        onStart: () => {
          console.log("Voice greeting started");
        },
        onEnd: () => {
          console.log("Voice greeting completed");
          setGreetingPlayed(true);
        },
        onError: (error) => {
          console.error("Voice greeting error:", error);
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const payload = { 
        email: data.email.trim().toLowerCase(), 
        password: data.password 
      };
      
      const res = await axiosInstance.post("/company/employee/login/", payload);
      
      // Store authentication data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("employee_id", res.data.employee_id || "");
      localStorage.setItem("employee_name", res.data.name || "");
      localStorage.setItem("employee_designation", res.data.designation || "");
      localStorage.setItem("employee_company", res.data.company || "");
      localStorage.setItem("employee_email", data.email.trim().toLowerCase());
      
      alert("Employee login successful.");
      navigate("/employee/dashboard");
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
      
      console.error("Employee login error:", errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const captureFromCam = async () => {
    if (!webcamRef.current) {
      setError('Camera not available');
      return;
    }
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setError('No image captured');
      return;
    }
    
    setLoading(true);
    setError('');
    setGreetingPlayed(false);
    
    try {
      const res = await axiosInstance.post('/company/face/login/', { image: imageSrc });
      
      if (res.data && res.data.success) {
        // Store authentication data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("employee_id", res.data.employee_id || "");
        localStorage.setItem("employee_name", res.data.name || "");
        localStorage.setItem("employee_designation", res.data.designation || "");
        localStorage.setItem("employee_company", res.data.company || "");
        localStorage.setItem("employee_email", res.data.email || "");
        
        // Play emotion-based greeting if available
        if (res.data.voice_greeting) {
          playVoiceGreeting(
            res.data.voice_greeting,
            res.data.voice_params,
            res.data
          );
        } else if (res.data.greeting) {
          // Fallback if voice_greeting is not available
          playVoiceGreeting(
            res.data.greeting,
            res.data.voice_params,
            res.data
          );
        }
        
        // Show alert after a short delay to allow voice greeting to start
        setTimeout(() => {
          alert(`Welcome back, ${res.data.name || 'Employee'}!`);
          navigate("/employee/dashboard");
        }, 1500); // 1.5 second delay for voice greeting
      } else {
        setError(res.data.message || 'Face recognition failed');
      }
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      console.error("Face login error:", errorInfo);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Employee Login</h1>
          <p>Choose your preferred login method</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Login Method Selection */}
        <div className="login-method-selector">
          <div className="method-tabs">
            <button
              type="button"
              className={`tab-btn ${loginMethod === 'face' ? 'active' : ''}`}
              onClick={() => setLoginMethod('face')}
            >
              🎭 Face Login
            </button>
            <button
              type="button"
              className={`tab-btn ${loginMethod === 'password' ? 'active' : ''}`}
              onClick={() => setLoginMethod('password')}
            >
              🔐 Password Login
            </button>
          </div>
        </div>

        {/* Face Login Section */}
        {loginMethod === 'face' && (
          <div className="login-section face-login">
            {!showCam ? (
              <div className="face-login-prompt">
                <div className="face-icon">👤</div>
                <h3>Face Recognition Login</h3>
                <p>Click below to start camera and login with your face</p>
                <button
                  type="button"
                  className="btn btn-primary face-btn"
                  onClick={() => setShowCam(true)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Start Face Login"}
                </button>
              </div>
            ) : (
              <div className="camera-section">
                <div className="camera-container">
                  <Webcam
                    audio={false}
                    height={480}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={640}
                    className="webcam-feed"
                  />
                </div>
                <div className="camera-controls">
                  <button
                    type="button"
                    className="btn btn-success capture-btn"
                    onClick={captureFromCam}
                    disabled={loading}
                  >
                    {loading ? "Recognizing..." : "Capture & Login"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCam(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
                <div className="camera-tips">
                  <p>💡 Tips for best recognition:</p>
                  <ul>
                    <li>Ensure good lighting</li>
                    <li>Face the camera directly</li>
                    <li>Remove glasses if possible</li>
                    <li>Keep a neutral expression</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Password Login Section */}
        {loginMethod === 'password' && (
          <div className="login-section password-login">
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
          </div>
        )}

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/employee/register" className="link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
