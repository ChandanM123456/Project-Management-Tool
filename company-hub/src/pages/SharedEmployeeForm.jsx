import React, { useState, useRef } from "react";
import axiosInstance from "../api/axios";
import { useSearchParams } from "react-router-dom";
import "./CompanyLogin.css";
import Webcam from "react-webcam";

export default function SharedEmployeeForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [form, setForm] = useState({ name: '', email: '', phone: '', designation: '', experience: '' });
  const [resume, setResume] = useState(null);
  const [face, setFace] = useState(null);
  const [showCam, setShowCam] = useState(false);
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      let submitToken = token;
      if (!submitToken) {
        alert('This form must be accessed via an invite link (token).');
        setLoading(false);
        return;
      }
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      if (resume) fd.append('resume', resume);
      if (face) fd.append('face_images', face);

      const res = await axiosInstance.post(`/employees/onboard/${submitToken}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Onboarded successfully. Welcome!');
    } catch (err) {
      console.error(err?.response?.data || err);
      setMessage('Submission failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  }

  const captureFace = () => {
    if (!webcamRef.current) return;
    const shot = webcamRef.current.getScreenshot();
    if (!shot) return;
    // convert base64 data URL to blob
    const b64 = shot.split(',')[1];
    const byteChars = atob(b64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
    setFace(file);
    setShowCam(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Employee Onboarding</h1>
          <p>Fill the form shared by your company manager to join.</p>
        </div>

        {message && <div className="error-message" style={{ background:'#eef7ed', color:'#165a1f', borderColor:'#c6f6d5' }}>{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" value={form.email} onChange={handleChange} type="email" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input name="designation" value={form.designation} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Experience</label>
            <input name="experience" value={form.experience} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Resume (PDF or DOC)</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e)=>setResume(e.target.files[0])} />
          </div>

          <div className="form-group">
            <label>Face Photo (optional)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="file" accept="image/*" onChange={(e)=>setFace(e.target.files[0])} />
              <button type="button" className="btn" style={{ background: '#f3f4f6', border: '1px solid #e5e7eb' }} onClick={() => setShowCam(s => !s)}>{showCam ? 'Close Camera' : 'Use Camera'}</button>
            </div>
            {showCam && (
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={320} height={240} />
                <div style={{ marginTop: 8 }}>
                  <button type="button" className="btn btn-primary" onClick={captureFace}>Capture Photo</button>
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit & Join'}</button>
        </form>
      </div>
    </div>
  );
}
