// FaceLogin.jsx
import React, {useRef, useState} from 'react';
import Webcam from "react-webcam";
import axios from "axios";

export default function FaceLogin(){
  const webcamRef = useRef(null);
  const [msg, setMsg] = useState('');

  const login = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    try {
      const res = await axios.post('/api/employees/face-login/', { image: imageSrc });
      if (res.data.ok) {
        const greeting = res.data.greeting;
        setMsg(greeting);
        // SpeechSynthesis for AI voice greeting in browser
        const utter = new SpeechSynthesisUtterance(greeting);
        // choose voice / pitch / rate optionally
        utter.rate = 0.95;
        utter.pitch = 1;
        window.speechSynthesis.speak(utter);
      } else {
        setMsg('Login failed');
      }
    } catch (err) {
      setMsg(err.response?.data?.detail || 'Login error');
    }
  };

  return (
    <div>
      <h3>Login with Face</h3>
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={login}>Login</button>
      <div>{msg}</div>
    </div>
  );
}
