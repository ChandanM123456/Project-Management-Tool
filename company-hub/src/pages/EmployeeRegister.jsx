import { useState } from "react";
import axiosInstance from "../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, validateRequired, validatePassword, validatePhone } from "../utils/validation";
import { handleApiError } from "../utils/apiErrorHandler";
import FaceRecognition from "../components/FaceRecognition";
import ResumeAnalysis from "../components/ResumeAnalysis";
import "./EmployeeRegister.css";

export default function EmployeeRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Form data for each step
  const [basicInfo, setBasicInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [professionalInfo, setProfessionalInfo] = useState({
    designation: "",
    department: "",
    experience: "",
    skills: "",
    education: "",
    university: ""
  });

  const [additionalInfo, setAdditionalInfo] = useState({
    date_of_birth: "",
    gender: "",
    address: "",
    emergency_contact: "",
    linkedin_profile: "",
    portfolio: ""
  });

  const [faceImages, setFaceImages] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [resumeAnalyzed, setResumeAnalyzed] = useState(false);
  const [employeeId, setEmployeeId] = useState(null);

  const handleBasicInfoChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }
    setError("");
  };

  const handleProfessionalInfoChange = (e) => {
    const { name, value } = e.target;
    setProfessionalInfo(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleAdditionalInfoChange = (e) => {
    const { name, value } = e.target;
    setAdditionalInfo(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateStep = (stepNumber) => {
    const errors = {};

    if (stepNumber === 1) {
      // Validate basic info
      const firstNameResult = validateRequired(basicInfo.first_name, 'First Name');
      if (!firstNameResult.isValid) errors.first_name = firstNameResult.error;

      const lastNameResult = validateRequired(basicInfo.last_name, 'Last Name');
      if (!lastNameResult.isValid) errors.last_name = lastNameResult.error;

      const emailResult = validateRequired(basicInfo.email, 'Email');
      if (!emailResult.isValid) {
        errors.email = emailResult.error;
      } else if (!validateEmail(basicInfo.email)) {
        errors.email = 'Please enter a valid email address';
      }

      const passwordResult = validateRequired(basicInfo.password, 'Password');
      if (!passwordResult.isValid) {
        errors.password = passwordResult.error;
      } else {
        const passwordValidation = validatePassword(basicInfo.password);
        if (!passwordValidation.isValid) {
          errors.password = passwordValidation.errors[0];
        }
      }

      if (basicInfo.password !== basicInfo.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (basicInfo.phone && !validatePhone(basicInfo.phone).isValid) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      setVideoStream(stream);
      setCameraActive(true);
      
      const video = document.getElementById('camera-video');
      if (video) {
        video.srcObject = stream;
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera access to continue.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setCameraActive(false);
  };

  const captureImage = () => {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('capture-canvas');
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      const newImage = {
        id: Date.now(),
        data: imageData,
        timestamp: new Date().toISOString()
      };
      
      setFaceImages(prev => [...prev, newImage]);
      setCurrentImage(imageData);
      
      if (faceImages.length >= 2) {
        stopCamera();
      }
    }
  };

  const retakeImage = (imageId) => {
    setFaceImages(prev => prev.filter(img => img.id !== imageId));
    if (faceImages.length <= 1) {
      startCamera();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (faceImages.length < 3) {
      setError('Please capture all 3 face images for registration');
      setLoading(false);
      return;
    }

    const employeeData = {
      ...basicInfo,
      ...professionalInfo,
      ...additionalInfo,
      face_images: faceImages
    };

    try {
      const res = await axiosInstance.post("/employees/register/", employeeData);
      
      // Store authentication data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("employee_id", res.data.employee_id);
      localStorage.setItem("employee_name", res.data.employee_name);
      localStorage.setItem("employee_email", res.data.employee_email);
      
      // Store additional employee info if available
      if (res.data.employee_designation) {
        localStorage.setItem("employee_designation", res.data.employee_designation);
      }
      
      // Store company information if available
      if (res.data.company_id) {
        localStorage.setItem("company_id", res.data.company_id);
        localStorage.setItem("company_name", res.data.company_name);
      }
      
      alert("Registration successful! Redirecting to dashboard...");
      
      // Debug: Check what's stored in localStorage
      console.log("Registration successful. localStorage data:", {
        token: localStorage.getItem("token"),
        employee_id: localStorage.getItem("employee_id"),
        employee_name: localStorage.getItem("employee_name"),
        employee_email: localStorage.getItem("employee_email"),
        company_id: localStorage.getItem("company_id"),
        company_name: localStorage.getItem("company_name")
      });
      
      // Small delay to ensure localStorage is set before navigation
      setTimeout(() => {
        console.log("Navigating to /employee/dashboard");
        navigate("/employee/dashboard");
      }, 100);
    } catch (err) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.message);
      
      if (errorInfo.details && errorInfo.details.errors) {
        setFieldErrors(errorInfo.details.errors);
      }
      
      console.error("Registration error:", errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={basicInfo.first_name}
                  onChange={handleBasicInfoChange}
                  className={fieldErrors.first_name ? 'error' : ''}
                  required
                />
                {fieldErrors.first_name && <span className="field-error">{fieldErrors.first_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={basicInfo.last_name}
                  onChange={handleBasicInfoChange}
                  className={fieldErrors.last_name ? 'error' : ''}
                  required
                />
                {fieldErrors.last_name && <span className="field-error">{fieldErrors.last_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={basicInfo.email}
                  onChange={handleBasicInfoChange}
                  className={fieldErrors.email ? 'error' : ''}
                  required
                />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={basicInfo.phone}
                  onChange={handleBasicInfoChange}
                  className={fieldErrors.phone ? 'error' : ''}
                />
                {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  value={basicInfo.password}
                  onChange={handleBasicInfoChange}
                  className={fieldErrors.password ? 'error' : ''}
                  required
                />
                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={basicInfo.confirmPassword}
                  onChange={handleBasicInfoChange}
                  className={fieldErrors.confirmPassword ? 'error' : ''}
                  required
                />
                {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h2>Professional Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="designation">Designation *</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  placeholder="e.g., Software Developer"
                  value={professionalInfo.designation}
                  onChange={handleProfessionalInfoChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  placeholder="e.g., Engineering"
                  value={professionalInfo.department}
                  onChange={handleProfessionalInfoChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="experience">Experience</label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  placeholder="e.g., 3 years"
                  value={professionalInfo.experience}
                  onChange={handleProfessionalInfoChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="skills">Skills</label>
                <textarea
                  id="skills"
                  name="skills"
                  placeholder="List your skills (comma separated)"
                  value={professionalInfo.skills}
                  onChange={handleProfessionalInfoChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="education">Education</label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  placeholder="e.g., Bachelor of Computer Science"
                  value={professionalInfo.education}
                  onChange={handleProfessionalInfoChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="university">University</label>
                <input
                  type="text"
                  id="university"
                  name="university"
                  placeholder="e.g., MIT"
                  value={professionalInfo.university}
                  onChange={handleProfessionalInfoChange}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h2>Additional Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={additionalInfo.date_of_birth}
                  onChange={handleAdditionalInfoChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={additionalInfo.gender}
                  onChange={handleAdditionalInfoChange}
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                  <option value="P">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your address"
                  value={additionalInfo.address}
                  onChange={handleAdditionalInfoChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="emergency_contact">Emergency Contact</label>
                <input
                  type="text"
                  id="emergency_contact"
                  name="emergency_contact"
                  placeholder="Emergency contact number"
                  value={additionalInfo.emergency_contact}
                  onChange={handleAdditionalInfoChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="linkedin_profile">LinkedIn Profile</label>
                <input
                  type="url"
                  id="linkedin_profile"
                  name="linkedin_profile"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={additionalInfo.linkedin_profile}
                  onChange={handleAdditionalInfoChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="portfolio">Portfolio Website</label>
                <input
                  type="url"
                  id="portfolio"
                  name="portfolio"
                  placeholder="https://yourportfolio.com"
                  value={additionalInfo.portfolio}
                  onChange={handleAdditionalInfoChange}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h2>Face Recognition Registration</h2>
            <p className="step-description">
              Register your face for secure biometric authentication and login.
            </p>
            
            <FaceRecognition
              employeeId={employeeId}
              employeeName={`${basicInfo.first_name} ${basicInfo.last_name}`}
              mode="register"
              onFaceRegistered={(result) => {
                setFaceRegistered(true);
                setError('');
                setSuccess('Face registered successfully!');
              }}
              token={localStorage.getItem('token')}
            />
          </div>
        );

      case 5:
        return (
          <div className="form-step">
            <h2>Resume Analysis</h2>
            <p className="step-description">
              Upload your resume for AI-powered skill analysis and profile enhancement.
            </p>
            
            <ResumeAnalysis
              employeeId={employeeId}
              employeeName={`${basicInfo.first_name} ${basicInfo.last_name}`}
              onAnalysisComplete={(result) => {
                setResumeAnalyzed(true);
                setError('');
                setSuccess('Resume analyzed successfully!');
              }}
              token={localStorage.getItem('token')}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card employee-register">
        <div className="auth-header">
          <h1>Employee Registration</h1>
          <p>Create your account and set up face verification</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="progress-bar">
          <div className="progress-steps">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div 
                key={stepNumber} 
                className={`progress-step ${step >= stepNumber ? 'active' : ''} ${step === stepNumber ? 'current' : ''}`}
              >
                <div className="step-number">{stepNumber}</div>
                <div className="step-title">
                  {stepNumber === 1 && 'Basic Info'}
                  {stepNumber === 2 && 'Professional'}
                  {stepNumber === 3 && 'Additional'}
                  {stepNumber === 4 && 'Face Recognition'}
                  {stepNumber === 5 && 'Resume Analysis'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {renderStep()}

          <div className="form-navigation">
            {step > 1 && (
              <button type="button" className="btn btn-secondary" onClick={prevStep}>
                Previous
              </button>
            )}

            {step < 5 ? (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn btn-success" 
                disabled={loading || !faceRegistered || !resumeAnalyzed}
              >
                {loading ? "Registering..." : "Complete Registration"}
              </button>
            )}
          </div>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/employee/login" className="link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  // Cleanup camera on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
}
