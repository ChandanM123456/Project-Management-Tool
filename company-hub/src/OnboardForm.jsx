// OnboardForm.jsx
import React, { useRef, useState } from 'react';
import Webcam from "react-webcam";
import axiosInstance from "./api/axios";

export default function OnboardForm({ inviteToken }) {
  const webcamRef = useRef(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [experience, setExperience] = useState('');
  const [files, setFiles] = useState([]);
  const [resume, setResume] = useState(null);
  const [status, setStatus] = useState('');

  const captureAndAdd = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    // convert base64 -> blob -> File
    const arr = imageSrc.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: mime });
    setFiles(prev => [...prev, file]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    const fd = new FormData();
    fd.append('name', name);
    fd.append('email', email);
    fd.append('designation', designation);
    fd.append('experience', experience);
    if (resume) fd.append('resume', resume);
    files.forEach(f => fd.append('face_images', f));
    try {
      const res = await axiosInstance.post(`/employees/onboard/${inviteToken}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      setStatus('Submitted! You can now close this window.');
    } catch (err) {
      console.error(err);
      setStatus('Error: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div>
      <h2>Employee Onboarding</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label>Name</label><br/>
          <input value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div>
          <label>Email</label><br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Designation</label><br/>
          <input value={designation} onChange={e=>setDesignation(e.target.value)} />
        </div>
        <div>
          <label>Experience</label><br/>
          <input value={experience} onChange={e=>setExperience(e.target.value)} />
        </div>

        <div>
          <h4>Capture face images (recommended 2-4)</h4>
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
          <button type="button" onClick={captureAndAdd}>Capture photo</button>
          <div>
            {files.map((f, idx) => <div key={idx}>{f.name}</div>)}
          </div>
          <p>Or upload images</p>
          <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files).concat(files))} />
        </div>

        <div>
          <label>Resume (pdf)</label><br/>
          <input type="file" accept=".pdf,.doc,.docx" onChange={e=>setResume(e.target.files[0])} />
        </div>

        <button type="submit">Submit</button>
      </form>
      <div>{status}</div>
    </div>
  );
}
