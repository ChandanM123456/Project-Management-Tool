import React from "react";
import { useNavigate } from "react-router-dom";
import "./OnboardingForm.css";

export default function OnboardingSuccess() {
  const navigate = useNavigate();

  return (
    <div className="onboarding-success">
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h2>Welcome aboard!</h2>
        <p>Your onboarding has been completed successfully.</p>
        <p>We're excited to have you join our team!</p>
        <p>You can now close this window or wait to be redirected.</p>
        <button 
          onClick={() => window.close()} 
          className="btn-primary"
          style={{ marginTop: '2rem' }}
        >
          Close Window
        </button>
      </div>
    </div>
  );
}
