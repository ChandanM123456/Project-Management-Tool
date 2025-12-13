import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './FaceRecognition.css';

const FaceRecognition = ({ 
  employeeId, 
  employeeName, 
  onFaceRegistered, 
  onFaceVerified, 
  mode = 'register',
  token 
}) => {
  const webcamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confidence, setConfidence] = useState(0);

  const captureImage = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setIsStreaming(false);
    }
  }, []);

  const retakePhoto = () => {
    setCapturedImage(null);
    setError('');
    setSuccess('');
    setConfidence(0);
    setIsStreaming(true);
  };

  const processFace = async () => {
    if (!capturedImage) {
      setError('Please capture a photo first');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      
      // Convert base64 to blob
      const blob = await fetch(capturedImage).then(res => res.blob());
      formData.append('image', blob, 'face.jpg');
      formData.append('employee_id', employeeId);
      formData.append('tolerance', '0.6');

      let endpoint;
      if (mode === 'register') {
        endpoint = '/api/face/register/';
        formData.append('name', employeeName);
      } else if (mode === 'verify') {
        endpoint = '/api/face/verify/';
      } else if (mode === 'login') {
        endpoint = '/api/face/login/';
      }

      const response = await axios.post(`http://localhost:8000${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const result = response.data;

      if (response.status === 200) {
        if (mode === 'register') {
          setSuccess('Face registered successfully!');
          setConfidence(result.confidence || 95);
          if (onFaceRegistered) onFaceRegistered(result);
        } else if (mode === 'verify') {
          if (result.verified) {
            setSuccess(`Face verified successfully! Confidence: ${result.confidence?.toFixed(1) || 95}%`);
            setConfidence(result.confidence || 95);
            if (onFaceVerified) onFaceVerified(result);
          } else {
            setError('Face verification failed. Please try again.');
            setConfidence(0);
          }
        } else if (mode === 'login') {
          setSuccess(`Login successful! Welcome ${result.user?.name || 'back'}!`);
          setConfidence(result.confidence || 95);
          
          // Store tokens and user data
          if (result.tokens) {
            localStorage.setItem('token', result.tokens.access);
            localStorage.setItem('refresh_token', result.tokens.refresh);
          }
          if (result.user) {
            localStorage.setItem('user_id', result.user.id);
            localStorage.setItem('employee_id', result.user.id);
            localStorage.setItem('company_id', result.user.company_id);
            localStorage.setItem('user_name', result.user.name);
            localStorage.setItem('user_role', result.user.role);
          }
          
          if (onFaceVerified) onFaceVerified(result);
        }
      } else {
        setError(result.error || 'Processing failed. Please try again.');
        setConfidence(0);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
      setConfidence(0);
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = () => {
    setIsStreaming(true);
    setError('');
  };

  return (
    <div className="face-recognition">
      <div className="face-recognition-header">
        <h3>
          {mode === 'register' && '📸 Register Face for Biometric Login'}
          {mode === 'verify' && '🔍 Verify Face Identity'}
          {mode === 'login' && '👤 Login with Face Recognition'}
        </h3>
        <p>
          {mode === 'register' && 'Register your face for secure biometric authentication'}
          {mode === 'verify' && 'Verify your identity using advanced face recognition'}
          {mode === 'login' && 'Login instantly using your registered face'}
        </p>
      </div>

      {/* Camera/Preview Area */}
      <div className="camera-container">
        {!capturedImage ? (
          <div className="video-container">
            {isStreaming ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="video-feed active"
                  width={640}
                  height={480}
                />
                <div className="face-guide-overlay">
                  <div className="face-guide-frame">
                    <div className="corner top-left"></div>
                    <div className="corner top-right"></div>
                    <div className="corner bottom-left"></div>
                    <div className="corner bottom-right"></div>
                    <div className="center-text">Center your face here</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="camera-placeholder">
                <div className="camera-icon">📷</div>
                <p>Click "Start Camera" to begin</p>
              </div>
            )}
          </div>
        ) : (
          <div className="captured-image-container">
            <img src={capturedImage} alt="Captured face" className="captured-image" />
            <div className="capture-overlay">
              <div className="capture-success">✓ Photo captured</div>
            </div>
          </div>
        )}
      </div>

      {/* Confidence Score */}
      {confidence > 0 && (
        <div className="confidence-score">
          <div className="confidence-label">Recognition Confidence</div>
          <div className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
          <div className="confidence-value">{confidence.toFixed(1)}%</div>
        </div>
      )}

      {/* Controls */}
      <div className="face-controls">
        {!capturedImage ? (
          <div className="camera-controls">
            {!isStreaming ? (
              <button
                onClick={startCamera}
                className="btn-primary"
                disabled={isProcessing}
              >
                <span className="btn-icon">📷</span>
                Start Camera
              </button>
            ) : (
              <button
                onClick={captureImage}
                className="btn-primary"
                disabled={isProcessing}
              >
                <span className="btn-icon">📸</span>
                Capture Photo
              </button>
            )}
          </div>
        ) : (
          <div className="capture-controls">
            <button
              onClick={processFace}
              className="btn-primary"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="btn-icon">
                    {mode === 'register' && '🔐'}
                    {mode === 'verify' && '✅'}
                    {mode === 'login' && '🚀'}
                  </span>
                  {mode === 'register' && 'Register Face'}
                  {mode === 'verify' && 'Verify Face'}
                  {mode === 'login' && 'Login'}
                </>
              )}
            </button>
            <button
              onClick={retakePhoto}
              className="btn-secondary"
              disabled={isProcessing}
            >
              <span className="btn-icon">🔄</span>
              Retake Photo
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="message error">
          <span className="message-icon">⚠️</span>
          {error}
        </div>
      )}
      
      {success && (
        <div className="message success">
          <span className="message-icon">✅</span>
          {success}
        </div>
      )}

      {/* Instructions */}
      <div className="instructions">
        <h4>Instructions:</h4>
        <ul>
          <li>Ensure good lighting on your face</li>
          <li>Position your face clearly in the frame</li>
          <li>Remove glasses or accessories if possible</li>
          <li>Keep a neutral expression</li>
          <li>Ensure only one face is visible</li>
        </ul>
      </div>
    </div>
  );
};

export default FaceRecognition;
