import React, { useState } from 'react';
import axios from 'axios';
import './ResumeAnalysis.css';

const ResumeAnalysis = ({ employeeId, employeeName, onAnalysisComplete, token }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('file');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        setError('');
      } else {
        setError('Please select a valid resume file (PDF, DOC, DOCX, or TXT)');
        setSelectedFile(null);
      }
    }
  };

  const handleTextChange = (e) => {
    setResumeText(e.target.value);
    setError('');
  };

  const analyzeResume = async () => {
    setError('');
    setSuccess('');
    setIsAnalyzing(true);

    try {
      let response;
      
      if (activeTab === 'file' && selectedFile) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        formData.append('employee_id', employeeId);
        
        response = await axios.post('http://localhost:8000/api/resume/upload/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        });
      } else if (activeTab === 'text' && resumeText.trim()) {
        response = await axios.post('http://localhost:8000/api/resume/analyze-text/', {
          employee_id: employeeId,
          resume_text: resumeText
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        setError('Please provide a resume file or text');
        setIsAnalyzing(false);
        return;
      }

      if (response.data.success) {
        setAnalysisResult(response.data.analysis);
        setSuccess('Resume analyzed successfully!');
        if (onAnalysisComplete) {
          onAnalysisComplete(response.data);
        }
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSkillCategories = () => {
    if (!analysisResult?.skills?.skills_breakdown) return [];
    return Object.entries(analysisResult.skills.skills_breakdown);
  };

  const getConfidenceColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="resume-analysis">
      <div className="resume-analysis-header">
        <h3>📄 Resume Analysis</h3>
        <p>AI-powered resume parsing and skill analysis</p>
      </div>

      {/* Tabs */}
      <div className="analysis-tabs">
        <button
          className={`tab-btn ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
        >
          📁 Upload File
        </button>
        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          📝 Paste Text
        </button>
      </div>

      {/* File Upload Tab */}
      {activeTab === 'file' && (
        <div className="upload-section">
          <div className="file-upload-area">
            <input
              type="file"
              id="resume-file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="resume-file" className="file-upload-label">
              <div className="upload-icon">📄</div>
              <div className="upload-text">
                <h4>Drop your resume here or click to browse</h4>
                <p>Supported formats: PDF, DOC, DOCX, TXT</p>
              </div>
            </label>
            {selectedFile && (
              <div className="selected-file">
                <span className="file-icon">📎</span>
                <span className="file-name">{selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="remove-file">×</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text Input Tab */}
      {activeTab === 'text' && (
        <div className="text-section">
          <div className="text-input-area">
            <textarea
              value={resumeText}
              onChange={handleTextChange}
              placeholder="Paste your resume text here..."
              className="resume-textarea"
              rows={10}
            />
            <div className="text-count">
              {resumeText.length} characters
            </div>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      <div className="analyze-actions">
        <button
          onClick={analyzeResume}
          disabled={isAnalyzing || (!selectedFile && !resumeText.trim())}
          className="btn-analyze"
        >
          {isAnalyzing ? (
            <>
              <span className="spinner"></span>
              Analyzing Resume...
            </>
          ) : (
            <>
              <span className="analyze-icon">🔍</span>
              Analyze Resume
            </>
          )}
        </button>
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

      {/* Analysis Results */}
      {analysisResult && (
        <div className="analysis-results">
          <div className="results-header">
            <h4>📊 Analysis Results</h4>
            <div className="candidate-info">
              <span className="candidate-name">{analysisResult.candidate_name}</span>
              <span className="experience-level">{analysisResult.experience_level}</span>
            </div>
          </div>

          {/* Skills Overview */}
          <div className="skills-overview">
            <h5>💼 Skills Analysis</h5>
            <div className="skills-stats">
              <div className="stat-item">
                <span className="stat-value">{analysisResult.skills?.total_skills || 0}</span>
                <span className="stat-label">Total Skills</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{analysisResult.skills?.skill_categories || 0}</span>
                <span className="stat-label">Categories</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" style={{ color: getConfidenceColor(analysisResult.skills?.match_percentage || 0) }}>
                  {analysisResult.skills?.match_percentage || 0}%
                </span>
                <span className="stat-label">Match Score</span>
              </div>
            </div>
          </div>

          {/* Skills Breakdown */}
          <div className="skills-breakdown">
            <h5>🎯 Skills by Category</h5>
            {getSkillCategories().map(([category, skills]) => (
              <div key={category} className="skill-category">
                <h6 className="category-name">{category.replace('_', ' ').toUpperCase()}</h6>
                <div className="skill-tags">
                  {skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          {analysisResult.contact_info && Object.keys(analysisResult.contact_info).length > 0 && (
            <div className="contact-info">
              <h5>📞 Contact Information</h5>
              <div className="contact-details">
                {analysisResult.contact_info.email && (
                  <div className="contact-item">
                    <span className="contact-label">Email:</span>
                    <span className="contact-value">{analysisResult.contact_info.email}</span>
                  </div>
                )}
                {analysisResult.contact_info.phone && (
                  <div className="contact-item">
                    <span className="contact-label">Phone:</span>
                    <span className="contact-value">{analysisResult.contact_info.phone}</span>
                  </div>
                )}
                {analysisResult.contact_info.linkedin && (
                  <div className="contact-item">
                    <span className="contact-label">LinkedIn:</span>
                    <a href={analysisResult.contact_info.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                      View Profile
                    </a>
                  </div>
                )}
                {analysisResult.contact_info.github && (
                  <div className="contact-item">
                    <span className="contact-label">GitHub:</span>
                    <a href={analysisResult.contact_info.github} target="_blank" rel="noopener noreferrer" className="contact-link">
                      View Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {analysisResult.education && analysisResult.education.length > 0 && (
            <div className="education-section">
              <h5>🎓 Education</h5>
              {analysisResult.education.map((edu, index) => (
                <div key={index} className="education-item">
                  <span className="degree">{edu.degree}</span>
                  <span className="institution">{edu.institution}</span>
                  <span className="year">{edu.year}</span>
                </div>
              ))}
            </div>
          )}

          {/* Experience */}
          {analysisResult.experience && analysisResult.experience.length > 0 && (
            <div className="experience-section">
              <h5>💼 Work Experience</h5>
              {analysisResult.experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <span className="job-title">{exp.title}</span>
                  <span className="company">{exp.company}</span>
                  <span className="duration">{exp.duration}</span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {analysisResult.summary && (
            <div className="summary-section">
              <h5>📝 AI Summary</h5>
              <p className="summary-text">{analysisResult.summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis;
