import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import axiosInstance from "./api/axios";

export default function OnboardForm({ inviteToken }) {
  const webcamRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("");
  const [experience, setExperience] = useState("");
  const [files, setFiles] = useState([]);
  const [resume, setResume] = useState(null);
  const [status, setStatus] = useState("");

  // 📸 Capture from webcam
  const captureAndAdd = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Camera not ready. Please allow camera access.");
      return;
    }

    const arr = imageSrc.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);

    const u8arr = new Uint8Array(bstr.length);
    for (let i = 0; i < bstr.length; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }

    const blob = new Blob([u8arr], { type: mime });
    const file = new File([blob], `face_${Date.now()}.jpg`, { type: mime });

    setFiles(prev => [...prev, file]);
  };

  // 📤 Submit form
  const onSubmit = async (e) => {
    e.preventDefault();

    if (files.length < 2) {
      alert("Please capture or upload at least 2 face images.");
      return;
    }

    setStatus("Submitting...");

    const fd = new FormData();
    fd.append("name", name);
    fd.append("email", email);
    fd.append("designation", designation);
    fd.append("experience", experience);

    if (resume) fd.append("resume", resume);
    files.forEach(f => fd.append("face_images", f));

    try {
      await axiosInstance.post(
        `/employees/onboard/${inviteToken}/`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setStatus("✅ Submitted successfully! You may close this window.");
    } catch (err) {
      console.error(err);
      setStatus(
        "❌ Error: " + (err.response?.data?.detail || err.message)
      );
    }
  };

  return (
    <div>
      <h2>Employee Onboarding</h2>

      <form onSubmit={onSubmit}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input placeholder="Designation" value={designation} onChange={e => setDesignation(e.target.value)} />
        <input placeholder="Experience" value={experience} onChange={e => setExperience(e.target.value)} />

        <h4>Capture Face Images (2–4 recommended)</h4>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          style={{ width: 240 }}
        />

        <button type="button" onClick={captureAndAdd}>📸 Capture</button>

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          {files.map((f, i) => (
            <img
              key={i}
              src={URL.createObjectURL(f)}
              alt="face"
              width={80}
              onLoad={e => URL.revokeObjectURL(e.target.src)}
            />
          ))}
        </div>

        <p>Or upload images</p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])}
        />

        <div>
          <label>Resume (PDF / DOC)</label>
          <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files[0])} />
        </div>

        <button type="submit">Submit</button>
      </form>

      <p>{status}</p>
    </div>
  );
}
