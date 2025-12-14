import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./OnboardingForm.css";

export default function OnboardingForm() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
    designation: "",
    department: "",
    address: "",
    emergency_contact: "",
    blood_group: "",
    date_of_birth: "",
    gender: "",
    marital_status: "",
    nationality: "",
    languages: "",
    education: "",
    experience: "",
    skills: "",
    linkedin_profile: "",
    portfolio: "",
    previous_company: "",
    notice_period: "",
    expected_salary: "",
    work_mode: "",
    start_date: "",
    reference: "",
    terms_accepted: false
  });

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Resume states
  const [resume, setResume] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  
  // Camera states
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [cameraError, setCameraError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [encodingGenerated, setEncodingGenerated] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const resumeInputRef = useRef(null);

  const totalSteps = 4;

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Revoke all object URLs to prevent memory leaks
      capturedImages.forEach(image => {
        if (image.url) {
          URL.revokeObjectURL(image.url);
        }
      });
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [capturedImages, photoPreview]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF or Word document");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Resume file size should be less than 5MB");
        return;
      }

      setResume(file);
      setResumePreview(file.name);
      
      // Analyze resume automatically
      await analyzeResume(file);
    }
  };

  const analyzeResume = async (resumeFile) => {
    setAnalyzingResume(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('token', token);

      const response = await axios.post('http://127.0.0.1:8000/api/employees/analyze-resume/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        const analysis = response.data.analysis;
        setResumeAnalysis(analysis);
        setResumeUploaded(true);

        // Auto-fill form with extracted data
        if (analysis.personal_info) {
          setFormData(prev => ({
            ...prev,
            first_name: analysis.personal_info.first_name || prev.first_name,
            last_name: analysis.personal_info.last_name || prev.last_name,
            email: analysis.personal_info.email || prev.email,
            phone: analysis.personal_info.phone || prev.phone,
          }));
        }

        if (analysis.professional_info) {
          setFormData(prev => ({
            ...prev,
            role: analysis.professional_info.role || prev.role,
            designation: analysis.professional_info.designation || prev.designation,
            department: analysis.professional_info.department || prev.department,
            experience: analysis.professional_info.experience || prev.experience,
            skills: analysis.professional_info.skills ? analysis.professional_info.skills.join(', ') : prev.skills,
            previous_company: analysis.professional_info.previous_company || prev.previous_company,
          }));
        }

        if (analysis.education) {
          setFormData(prev => ({
            ...prev,
            education: analysis.education.degree || prev.education,
          }));
        }

        if (analysis.contact_info) {
          setFormData(prev => ({
            ...prev,
            linkedin_profile: analysis.contact_info.linkedin || prev.linkedin_profile,
            portfolio: analysis.contact_info.portfolio || prev.portfolio,
          }));
        }

        if (analysis.additional_info) {
          setFormData(prev => ({
            ...prev,
            languages: analysis.additional_info.languages ? analysis.additional_info.languages.join(', ') : prev.languages,
          }));
        }
      } else {
        setError("Failed to analyze resume. Please try again.");
      }
    } catch (err) {
      console.error('Resume analysis error:', err);
      setError("Failed to analyze resume. You can continue with manual entry.");
    } finally {
      setAnalyzingResume(false);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError('');
      setCameraMode(true);
      console.log('Starting camera...');
      
      // Request camera with specific constraints
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Video will start playing automatically
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err);
          });
        };
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraMode(false);
      if (err.name === 'NotAllowedError') {
        setCameraError("Camera permission denied. Please allow camera access and try again.");
      } else if (err.name === 'NotFoundError') {
        setCameraError("No camera found. Please ensure you have a camera connected.");
      } else if (err.name === 'NotReadableError') {
        setCameraError("Camera is already in use by another application.");
      } else {
        setCameraError("Unable to access camera. Please check permissions and try again.");
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Give video a moment to be ready
      setTimeout(() => {
        // Ensure video has dimensions
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          console.log('Video dimensions not ready, using default');
          canvas.width = 640;
          canvas.height = 480;
        } else {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        
        // Clear canvas and draw video frame
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
        
        // Try blob method first with better error handling
        canvas.toBlob((blob) => {
          console.log('Blob created:', blob ? 'success' : 'null', 'Size:', blob?.size);
          
          if (!blob || blob.size === 0) {
            console.error('Failed to capture photo - blob is null or empty, trying base64 fallback');
            // Fallback to base64
            try {
              const base64Data = canvas.toDataURL('image/jpeg', 0.95);
              console.log('Base64 fallback created, length:', base64Data.length);
              
              const newImage = {
                url: base64Data,
                blob: null,
                base64: base64Data,
                timestamp: Date.now()
              };
              
              setCapturedImages(prev => [...prev, newImage]);
              
              // Auto-stop camera after 3 captures for face recognition
              if (capturedImages.length >= 2) {
                console.log('Stopping camera and generating encodings...');
                stopCamera();
                generateEncodings([...capturedImages, newImage]);
              }
            } catch (fallbackError) {
              console.error('Base64 fallback also failed:', fallbackError);
              setCameraError("Failed to capture photo. Please try again.");
            }
            return;
          }
          
          try {
            const imageUrl = URL.createObjectURL(blob);
            console.log('Object URL created successfully');
            
            const newImage = {
              url: imageUrl,
              blob: blob,
              timestamp: Date.now()
            };
            
            setCapturedImages(prev => [...prev, newImage]);
            
            // Auto-stop camera after 3 captures for face recognition
            if (capturedImages.length >= 2) {
              console.log('Stopping camera and generating encodings...');
              stopCamera();
              generateEncodings([...capturedImages, newImage]);
            }
          } catch (error) {
            console.error('Error creating object URL:', error);
            setCameraError("Failed to process captured photo. Please try again.");
          }
        }, 'image/jpeg', 0.95);
      }, 100); // Small delay to ensure video is ready
    } else {
      console.error('Video or canvas reference not available');
      console.log('videoRef.current:', videoRef.current);
      console.log('canvasRef.current:', canvasRef.current);
      setCameraError("Camera not ready. Please try again.");
    }
  };

  const generateEncodings = async (images) => {
    setIsCapturing(true);
    try {
      const formData = new FormData();
      
      images.forEach((image, index) => {
        if (image.blob) {
          // Use blob if available
          formData.append(`image_${index}`, image.blob, `capture_${index}.jpg`);
        } else if (image.base64) {
          // Convert base64 to blob
          const base64Data = image.base64.split(',')[1];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/jpeg' });
          formData.append(`image_${index}`, blob, `capture_${index}.jpg`);
        }
      });
      
      formData.append('action', 'generate_encodings');
      formData.append('token', token);

      const response = await axios.post('http://127.0.0.1:8000/api/employees/generate-encodings/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        setEncodingGenerated(true);
        // Use the best captured image as the profile photo
        const bestImage = images[images.length - 1];
        if (bestImage.blob) {
          setPhoto(bestImage.blob);
          setPhotoPreview(bestImage.url);
        } else if (bestImage.base64) {
          setPhoto(null); // Can't set photo from base64 directly
          setPhotoPreview(bestImage.base64);
        }
      } else {
        setCameraError("Failed to generate face encodings. Please try again.");
      }
    } catch (err) {
      console.error('Encoding generation error:', err);
      setCameraError("Failed to generate face encodings. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  };

  const retakePhotos = () => {
    setCapturedImages([]);
    setPhoto(null);
    setPhotoPreview(null);
    setEncodingGenerated(false);
    setCameraError("");
    startCamera();
  };

  const validateStep = (step) => {
    console.log('=== VALIDATING STEP', step, '===');
    console.log('formData:', formData);
    console.log('resumeUploaded:', resumeUploaded);
    console.log('encodingGenerated:', encodingGenerated);
    console.log('photo:', photo);
    console.log('resumeAnalysis:', resumeAnalysis);
    
    switch(step) {
      case 1:
        // Resume step: always allow proceeding if resume was uploaded
        if (resumeUploaded) {
          console.log('✅ Step 1: Resume uploaded, allowing proceeding');
          return true;
        }
        // Manual entry validation
        const hasName = formData.first_name || (resumeAnalysis && resumeAnalysis.personal_info && resumeAnalysis.personal_info.first_name);
        const hasEmail = formData.email || (resumeAnalysis && resumeAnalysis.personal_info && resumeAnalysis.personal_info.email);
        const hasPhone = formData.phone || (resumeAnalysis && resumeAnalysis.personal_info && resumeAnalysis.personal_info.phone);
        
        console.log('Step 1 manual validation:', { hasName, hasEmail, hasPhone });
        const result = hasName && hasEmail && hasPhone;
        console.log('✅ Step 1 result:', result);
        return result;
      case 2:
        // Professional info - make designation the main requirement
        const hasDesignation = formData.designation || (resumeAnalysis && resumeAnalysis.professional_info && resumeAnalysis.professional_info.designation);
        const hasDepartment = formData.department;
        
        console.log('Step 2 validation:', { hasDesignation, hasDepartment });
        const result2 = hasDesignation && hasDepartment;
        console.log('✅ Step 2 result:', result2);
        return result2;
      case 3:
        // Additional info - make optional for now
        console.log('✅ Step 3: Additional info step - always allowed');
        return true;
      case 4:
        // Face capture step
        const hasPhoto = photo || photoPreview;
        const hasEncoding = encodingGenerated;
        const hasTerms = formData.terms_accepted;
        
        console.log('Step 4 validation:', { hasPhoto, hasEncoding, hasTerms });
        const result4 = hasPhoto && hasEncoding && hasTerms;
        console.log('✅ Step 4 result:', result4);
        return result4;
      default:
        console.log('✅ Default case: returning true');
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      setError("Please fill in all required fields");
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'terms_accepted') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Add photo
      if (photo) {
        formDataToSend.append('photo', photo);
      }
      
      // Add captured images for verification
      capturedImages.forEach((image, index) => {
        formDataToSend.append(`capture_${index}`, image.blob);
      });
      
      // Add resume and analysis
      if (resume) {
        formDataToSend.append('resume', resume);
      }
      if (resumeAnalysis) {
        formDataToSend.append('resume_analysis', JSON.stringify(resumeAnalysis));
      }
      
      // Add token and encoding status
      formDataToSend.append('token', token);
      formDataToSend.append('encodings_generated', encodingGenerated);
      formDataToSend.append('resume_uploaded', resumeUploaded);

      const response = await axios.post('http://127.0.0.1:8000/api/employees/onboard/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/onboarding-success');
        }, 3000);
      } else {
        setError(response.data.message || "Failed to submit form");
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || "Failed to submit form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="form-step">
            <h3>Resume Upload & Analysis</h3>
            
            {!resumeUploaded && (
              <div className="resume-section">
                <div className="resume-upload-area">
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    style={{ display: 'none' }}
                  />
                  
                  <div className="upload-card" onClick={() => resumeInputRef.current?.click()}>
                    <div className="upload-icon">📄</div>
                    <h4>Upload Your Resume</h4>
                    <p>Upload your resume and we'll automatically extract your information</p>
                    <div className="upload-info">
                      <span className="file-types">PDF, DOC, DOCX (Max 5MB)</span>
                    </div>
                    <span className="upload-badge">AI Powered</span>
                  </div>
                </div>
                
                <div className="manual-option">
                  <p>or</p>
                  <button
                    type="button"
                    onClick={() => setResumeUploaded(true)}
                    className="btn-secondary"
                  >
                    Fill Information Manually
                  </button>
                </div>
              </div>
            )}

            {analyzingResume && (
              <div className="analysis-loading">
                <div className="loading-spinner"></div>
                <h4>Analyzing Your Resume</h4>
                <p>Extracting skills, experience, and other information...</p>
              </div>
            )}

            {resumeAnalysis && (
              <div className="resume-analysis">
                <div className="analysis-header">
                  <div className="success-icon">✅</div>
                  <h4>Resume Analysis Complete!</h4>
                  <p>We've extracted the following information from your resume</p>
                </div>
                
                <div className="analysis-grid">
                  {resumeAnalysis.personal_info && (
                    <div className="analysis-section">
                      <h5>Personal Information</h5>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Name:</span>
                          <span className="value">{resumeAnalysis.personal_info.first_name} {resumeAnalysis.personal_info.last_name}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Email:</span>
                          <span className="value">{resumeAnalysis.personal_info.email}</span>
                        </div>
                        {resumeAnalysis.personal_info.phone && (
                          <div className="info-item">
                            <span className="label">Phone:</span>
                            <span className="value">{resumeAnalysis.personal_info.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {resumeAnalysis.professional_info && (
                    <div className="analysis-section">
                      <h5>Professional Information</h5>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Role:</span>
                          <span className="value">{resumeAnalysis.professional_info.role || 'Not detected'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Experience:</span>
                          <span className="value">{resumeAnalysis.professional_info.experience || 'Not detected'}</span>
                        </div>
                        {resumeAnalysis.professional_info.previous_company && (
                          <div className="info-item">
                            <span className="label">Previous Company:</span>
                            <span className="value">{resumeAnalysis.professional_info.previous_company}</span>
                          </div>
                        )}
                        {resumeAnalysis.professional_info.skills && (
                          <div className="info-item skills">
                            <span className="label">Skills:</span>
                            <div className="skills-list">
                              {resumeAnalysis.professional_info.skills.map((skill, index) => (
                                <span key={index} className="skill-tag">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {resumeAnalysis.education && (
                    <div className="analysis-section">
                      <h5>Education</h5>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Degree:</span>
                          <span className="value">{resumeAnalysis.education.degree || 'Not detected'}</span>
                        </div>
                        {resumeAnalysis.education.university && (
                          <div className="info-item">
                            <span className="label">University:</span>
                            <span className="value">{resumeAnalysis.education.university}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {resumeAnalysis.contact_info && (
                    <div className="analysis-section">
                      <h5>Contact Information</h5>
                      <div className="info-grid">
                        {resumeAnalysis.contact_info.linkedin && (
                          <div className="info-item">
                            <span className="label">LinkedIn:</span>
                            <span className="value">{resumeAnalysis.contact_info.linkedin}</span>
                          </div>
                        )}
                        {resumeAnalysis.contact_info.portfolio && (
                          <div className="info-item">
                            <span className="label">Portfolio:</span>
                            <span className="value">{resumeAnalysis.contact_info.portfolio}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="analysis-actions">
                  <button
                    type="button"
                    onClick={() => setResumeUploaded(false)}
                    className="btn-secondary"
                  >
                    Re-upload Resume
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="btn-primary"
                  >
                    Continue to Next Step
                  </button>
                </div>
              </div>
            )}

            {resumeUploaded && !resumeAnalysis && (
              <div className="manual-form">
                <h4>Manual Information Entry</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="form-step">
            <h3>Professional Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Project Manager</option>
                  <option value="analyst">Business Analyst</option>
                  <option value="tester">QA Tester</option>
                  <option value="hr">HR</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                </select>
              </div>
              <div className="form-group">
                <label>Designation *</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Developer"
                  required
                />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="hr">Human Resources</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                </select>
              </div>
              <div className="form-group">
                <label>Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="e.g. 3 years"
                />
              </div>
              <div className="form-group">
                <label>Skills</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="List your key skills"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Previous Company</label>
                <input
                  type="text"
                  name="previous_company"
                  value={formData.previous_company}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="form-step">
            <h3>Additional Information</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Full residential address"
                  required
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="form-group">
                <label>Marital Status</label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleInputChange}
                >
                  <option value="">Select Status</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                </select>
              </div>
              <div className="form-group">
                <label>Nationality</label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Languages</label>
                <input
                  type="text"
                  name="languages"
                  value={formData.languages}
                  onChange={handleInputChange}
                  placeholder="e.g. English, Hindi, Spanish"
                />
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="form-step">
            <h3>Photo Capture & Face Recognition</h3>
            
            <div className="camera-section">
              {!cameraMode && !encodingGenerated && (
                <div className="camera-options">
                  <div 
                    className="option-card" 
                    onClick={startCamera}
                    style={{
                      cursor: 'pointer',
                      padding: '2rem',
                      border: '2px solid #007bff',
                      borderRadius: '12px',
                      textAlign: 'center',
                      backgroundColor: '#f8f9fa',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e3f2fd';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                    }}
                  >
                    <div className="option-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                    <h4 style={{ color: '#007bff', marginBottom: '0.5rem' }}>Use Camera</h4>
                    <p style={{ color: '#6c757d', marginBottom: '1rem' }}>Capture photo with face recognition</p>
                    <span className="option-badge" style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold'
                    }}>Recommended</span>
                  </div>
                </div>
              )}

              {cameraMode && (
                <div className="camera-interface">
                  <div className="camera-header">
                    <h4>Face Recognition Capture</h4>
                    <p>Position your face in the frame and capture 3 photos</p>
                    <div className="capture-counter" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        {[0, 1, 2].map(index => (
                          <div
                            key={index}
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: index < capturedImages.length ? '#28a745' : '#e9ecef',
                              transition: 'all 0.3s ease'
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 'bold',
                        color: capturedImages.length === 3 ? '#28a745' : '#6c757d'
                      }}>
                        {capturedImages.length}/3 photos captured
                      </span>
                    </div>
                  </div>
                  
                  <div className="camera-view" style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '640px',
                    margin: '0 auto',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#000',
                    minHeight: '480px'
                  }}>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        borderRadius: '8px'
                      }}
                      onLoadedMetadata={() => {
                        console.log('Video loaded successfully');
                      }}
                      onError={(e) => {
                        console.error('Video error:', e);
                        setCameraError('Failed to load video stream. Please try again.');
                      }}
                    />
                    
                    <canvas 
                      ref={canvasRef} 
                      style={{ display: 'none' }} 
                    />
                  </div>
                  
                  {cameraError && (
                    <div className="camera-error">
                      {cameraError}
                    </div>
                  )}
                  
                  <div className="camera-controls">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={capturedImages.length >= 3 || isCapturing}
                      className="btn-primary capture-btn"
                      style={{
                        fontSize: '1.1rem',
                        padding: '12px 24px',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        backgroundColor: isCapturing ? '#6c757d' : '#007bff',
                        borderColor: isCapturing ? '#6c757d' : '#007bff',
                        cursor: isCapturing ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isCapturing ? (
                        <>
                          <span style={{ marginRight: '8px' }}>⏳</span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span style={{ marginRight: '8px' }}>📸</span>
                          Capture Photo ({3 - capturedImages.length} remaining)
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="btn-secondary"
                      style={{
                        fontSize: '1rem',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        marginLeft: '1rem'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  
                  {capturedImages.length > 0 && (
                    <div className="captured-preview">
                      <h5>Captured Photos:</h5>
                      <div className="preview-grid">
                        {capturedImages.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`Capture ${index + 1}`}
                            className="preview-image"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {encodingGenerated && photoPreview && (
                <div className="encoding-success">
                  <div className="success-icon">✅</div>
                  <h4>Face Recognition Complete!</h4>
                  <p>Your facial encodings have been generated and stored successfully.</p>
                  
                  <div className="final-photo">
                    <h5>Your Profile Photo:</h5>
                    <img src={photoPreview} alt="Profile" className="profile-photo" />
                  </div>
                  
                  <button
                    type="button"
                    onClick={retakePhotos}
                    className="btn-secondary"
                  >
                    Retake Photos
                  </button>
                </div>
              )}
            </div>
            
            <div className="form-grid" style={{ marginTop: '2rem' }}>
              <div className="form-group">
                <label>LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin_profile"
                  value={formData.linkedin_profile}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="form-group">
                <label>Portfolio Website</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  placeholder="https://yourportfolio.com"
                />
              </div>
              <div className="form-group">
                <label>Expected Salary</label>
                <input
                  type="text"
                  name="expected_salary"
                  value={formData.expected_salary}
                  onChange={handleInputChange}
                  placeholder="e.g. $60,000 - $80,000"
                />
              </div>
              <div className="form-group">
                <label>Work Mode</label>
                <select
                  name="work_mode"
                  value={formData.work_mode}
                  onChange={handleInputChange}
                >
                  <option value="">Select Work Mode</option>
                  <option value="office">Office</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="form-group">
                <label>Available Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Reference</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="How did you hear about us?"
                />
              </div>
            </div>
            
            <div className="terms-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="terms_accepted"
                  checked={formData.terms_accepted}
                  onChange={handleInputChange}
                  required
                />
                <span>I confirm that all the information provided is accurate and I agree to the company's terms and conditions *</span>
              </label>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (success) {
    return (
      <div className="onboarding-success">
        <div className="success-container">
          <div className="success-icon">✅</div>
          <h2>Onboarding Complete!</h2>
          <p>Your information has been successfully submitted. Welcome to the team!</p>
          <p>You will be redirected shortly...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-header">
        <h1>Employee Onboarding Form</h1>
        <p>Please complete all sections to submit your information</p>
      </div>

      <div className="progress-bar">
        <div className="progress-steps">
          {[...Array(totalSteps)].map((_, index) => (
            <div
              key={index}
              className={`step ${index + 1 <= currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <div className="step-label">
                {index === 0 && 'Resume'}
                {index === 1 && 'Professional'}
                {index === 2 && 'Additional'}
                {index === 3 && 'Photo'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="onboarding-form">
        {error && <div className="error-message">{error}</div>}
        
        {renderStepContent()}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="btn-secondary">
              Previous
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button type="button" onClick={nextStep} className="btn-primary">
              Next
            </button>
          ) : (
            <button type="submit" disabled={loading || !encodingGenerated} className="btn-primary">
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
