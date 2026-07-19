import React, { useState, useEffect } from 'react';
import type { JobApplication, UserProfile, WorkType } from '../types';

interface AIAnalyzerProps {
  profile: UserProfile;
  onSaveApplication: (app: Omit<JobApplication, 'id'>) => void;
  onNavigate: (tab: 'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights') => void;
}

interface ExtractedJob {
  title: string;
  company: string;
  location: string;
  workType: WorkType;
  employmentType: string;
  salary: string;
  deadline: string;
  duration: string;
  requirements: string[];
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  benefits: string[];
  explanation: string;
  cvSuggestions: string;
  notes: string;
}

const AIAnalyzer: React.FC<AIAnalyzerProps> = ({ profile, onSaveApplication, onNavigate }) => {
  // Analyzer UI States
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<ExtractedJob | null>(null);

  // Populate editable results with mock data
  const triggerMockAnalysis = () => {
    setAnalysisResult({
      title: 'Junior React Developer',
      company: 'Alder & Spruce Dev',
      location: 'Bend, OR',
      workType: 'Hybrid',
      employmentType: 'Full-time',
      salary: '$75,000 - $85,000 / year',
      deadline: '2026-08-15',
      duration: 'N/A',
      requirements: [
        '1+ years of experience with React codebase layouts.',
        'Familiarity with responsive styling grids and CSS variables.',
        'Comfortable working in a collaborative small agency setup.'
      ],
      responsibilities: [
        'Translate Figma workspace designs into structured web applications.',
        'Refactor static templates into dynamic React components.',
        'Collaborate with developers to debug cross-browser compatibility.'
      ],
      requiredSkills: ['React', 'TypeScript', 'CSS', 'GraphQL', 'Docker'],
      preferredSkills: ['Sass', 'Figma', 'Node.js'],
      benefits: [
        'Hybrid working hours.',
        'Cozy forest-facing office in Bend, OR.',
        'Health, vision, and weekly coffee budget.'
      ],
      explanation: 'You have solid foundations in React, TypeScript, and CSS which are core requirements. However, this role uses GraphQL and Docker which are missing from your resume checklist.',
      cvSuggestions: 'Describe any project where you integrated external APIs (e.g. REST APIs) to show preparedness for GraphQL, and note familiarity with containers or deployment workflows if you have any.',
      notes: 'AI Extracted from screenshot. Alder & Spruce works with eco-conscious brands.'
    });
  };

  // Loading progress bar effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    if (loading) {
      interval = setInterval(() => {
        setLoadProgress((prev) => {
          if (prev >= 100) {
            if (interval) clearInterval(interval);
            setLoading(false);
            triggerMockAnalysis();
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading]);

  // Screenshot loaders
  const handleScreenshotFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleScreenshotFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleScreenshotFile(file);
      } else {
        alert('Please drop an image file of your job screenshot.');
      }
    }
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setAnalysisResult(null);
  };

  // Run the AI Analyzer (simulated)
  const handleAnalyzeJob = () => {
    setLoadProgress(0);
    setLoading(true);
  };

  // ==========================================
  // Dynamic Comparison Match Calculation Engine
  // ==========================================
  const calculateMatchMetrics = () => {
    if (!analysisResult) return null;

    const userSkills = profile.skills.map(s => s.toLowerCase());
    const requiredSkills = analysisResult.requiredSkills || [];
    const preferredSkills = analysisResult.preferredSkills || [];

    const strongMatches: string[] = [];
    const partialMatches: string[] = [];
    const skillGaps: string[] = [];

    requiredSkills.forEach((skill: string) => {
      const sLower = skill.toLowerCase();
      if (userSkills.includes(sLower)) {
        strongMatches.push(skill);
      } else {
        const isPartial = userSkills.some(us => us.includes(sLower) || sLower.includes(us));
        if (isPartial) {
          partialMatches.push(skill);
        } else {
          skillGaps.push(skill);
        }
      }
    });

    const totalRequired = requiredSkills.length;
    const score = totalRequired > 0
      ? Math.round(((strongMatches.length + partialMatches.length * 0.5) / totalRequired) * 100)
      : 80;

    let priority: 'High' | 'Medium' | 'Low' = 'Medium';
    if (score >= 80) priority = 'High';
    else if (score < 50) priority = 'Low';

    const recommendedSkills: string[] = [];
    skillGaps.slice(0, 3).forEach(s => recommendedSkills.push(s));
    
    if (recommendedSkills.length === 0 && preferredSkills.length > 0) {
      preferredSkills.forEach((s: string) => {
        if (!userSkills.includes(s.toLowerCase())) {
          recommendedSkills.push(s);
        }
      });
    }

    return {
      score,
      priority,
      strongMatches,
      partialMatches,
      skillGaps,
      recommendedSkills
    };
  };

  const metrics = calculateMatchMetrics();

  // ==========================================
  // Form list array controllers
  // ==========================================
  const handleResultChange = (name: keyof ExtractedJob, value: string | string[] | WorkType) => {
    if (!analysisResult) return;
    setAnalysisResult({
      ...analysisResult,
      [name]: value
    });
  };

  const handleListElementChange = (field: 'requirements' | 'responsibilities' | 'benefits', index: number, val: string) => {
    if (!analysisResult) return;
    const list = [...analysisResult[field]];
    list[index] = val;
    handleResultChange(field, list);
  };

  const handleAddListElement = (field: 'requirements' | 'responsibilities' | 'benefits') => {
    if (!analysisResult) return;
    const list = [...analysisResult[field], ''];
    handleResultChange(field, list);
  };

  const handleRemoveListElement = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
    if (!analysisResult) return;
    const list = analysisResult[field].filter((_, idx: number) => idx !== index);
    handleResultChange(field, list);
  };

  const handleSkillStringChange = (field: 'requiredSkills' | 'preferredSkills', val: string) => {
    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
    handleResultChange(field, arr);
  };

  // ==========================================
  // Save application to state
  // ==========================================
  const handleSave = () => {
    if (!analysisResult || !metrics) return;

    const newApp: Omit<JobApplication, 'id'> = {
      company: analysisResult.company,
      position: analysisResult.title,
      jobLink: '',
      location: analysisResult.location,
      workType: analysisResult.workType,
      dateFound: new Date().toISOString().split('T')[0],
      deadline: analysisResult.deadline || undefined,
      status: 'Wishlist',
      matchScore: metrics.score,
      notes: analysisResult.notes,
      screenshot: screenshot || undefined,
      requirements: analysisResult.requirements,
      responsibilities: analysisResult.responsibilities,
      benefits: analysisResult.benefits,
      requiredSkills: analysisResult.requiredSkills,
      preferredSkills: analysisResult.preferredSkills,
      aiMatchScore: metrics.score,
      priority: metrics.priority,
      skillGaps: metrics.skillGaps
    };

    onSaveApplication(newApp);
    alert('Extracted Job successfully saved to your applications!');
    onNavigate('applications');
  };

  return (
    <div className="fade-in">
      <div className="header-bar">
        <div className="header-title-container">
          <h1>AI Job Analyzer</h1>
          <p className="header-subtitle">Upload a job screenshot to automatically extract requirements and compare with your resume.</p>
        </div>
      </div>

      <div className="analyzer-layout-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Step 1: Upload Job Posting</h3>
            </div>

            {!screenshot ? (
              <div 
                className={`upload-dropzone ${isDragging ? 'dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('screenshot-file-input')?.click()}
              >
                <svg className="upload-icon-svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Drag & Drop Screenshot</strong>
                  <span style={{ fontSize: '0.8rem' }}>PNG, JPG, or WEBP images</span>
                </div>
                <input 
                  id="screenshot-file-input" 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="screenshot-preview-container">
                <button className="preview-overlay-btn" onClick={clearScreenshot}>
                  Clear Image
                </button>
                <img 
                  src={screenshot} 
                  alt="Job description screenshot" 
                  className="screenshot-preview-img"
                />
              </div>
            )}

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1.25rem' }}
              disabled={loading}
              onClick={handleAnalyzeJob}
            >
              {loading ? 'Processing...' : 'Analyze Job Screenshot'}
            </button>

            {loading && (
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <div className="loader-spinner"></div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Extracting visual nodes... {loadProgress}%
                </span>
              </div>
            )}
          </div>
          
          {analysisResult && metrics && (
            <div className="card" style={{ borderColor: 'var(--sage-green-border)' }}>
              <div className="profile-section-header">
                <h3 style={{ margin: 0 }}>Step 3: Your Live Match Profile</h3>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
                <div 
                  style={{ 
                    width: '72px', 
                    height: '72px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--sage-green-light)', 
                    border: '2px solid var(--sage-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: 'var(--sage-green-dark)'
                  }}
                >
                  {metrics.score}%
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Match Score</span>
                    <span className={`badge badge-priority-${metrics.priority.toLowerCase()}`}>
                      {metrics.priority} Priority
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                    Recalculated dynamically against your core profile.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
                {metrics.strongMatches.length > 0 && (
                  <div>
                    <strong style={{ color: 'var(--sage-green-dark)', display: 'block', marginBottom: '0.2rem' }}>✓ Strong Matches</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {metrics.strongMatches.map(s => (
                        <span key={s} className="badge badge-interviewing" style={{ fontSize: '0.75rem' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {metrics.skillGaps.length > 0 && (
                  <div>
                    <strong style={{ color: 'var(--soft-red-dark)', display: 'block', marginBottom: '0.2rem' }}>⚠ Skill Gaps Detected</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {metrics.skillGaps.map(s => (
                        <span key={s} className="badge badge-rejected" style={{ fontSize: '0.75rem' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {metrics.recommendedSkills.length > 0 && (
                  <div>
                    <strong style={{ color: 'var(--ochre-dark)', display: 'block', marginBottom: '0.2rem' }}>💡 Skills to Learn Next</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {metrics.recommendedSkills.map(s => (
                        <span key={s} className="badge badge-applied" style={{ fontSize: '0.75rem' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.2rem' }}>Match Explanation</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {analysisResult.explanation}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.2rem' }}>CV Improvement Tips</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    {analysisResult.cvSuggestions}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          {analysisResult ? (
            <div className="card">
              <div className="profile-section-header" style={{ justifyContent: 'space-between' }}>
                <h3 style={{ margin: 0 }}>Step 2: Review & Edit Extracted Info</h3>
                <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={handleSave}>
                  Save to Applications
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h4 style={{ margin: '0.5rem 0 0', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>
                  JOB OVERVIEW
                </h4>
                
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Job Title</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={analysisResult.title}
                      onChange={(e) => handleResultChange('title', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Company Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={analysisResult.company}
                      onChange={(e) => handleResultChange('company', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Location</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={analysisResult.location}
                      onChange={(e) => handleResultChange('location', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Work Arrangement</label>
                    <select
                      className="form-control"
                      value={analysisResult.workType}
                      onChange={(e) => handleResultChange('workType', e.target.value as WorkType)}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Onsite">Onsite</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Employment Type</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={analysisResult.employmentType}
                      onChange={(e) => handleResultChange('employmentType', e.target.value)}
                      placeholder="e.g. Full-time, Internship"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Salary Range</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={analysisResult.salary}
                      onChange={(e) => handleResultChange('salary', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Application Deadline</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={analysisResult.deadline}
                      onChange={(e) => handleResultChange('deadline', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Internship Duration (if any)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={analysisResult.duration}
                      onChange={(e) => handleResultChange('duration', e.target.value)}
                      placeholder="e.g. 3 months"
                    />
                  </div>
                </div>

                <h4 style={{ margin: '1rem 0 0', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>
                  JOB DETAILS
                </h4>

                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Required Skills (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={analysisResult.requiredSkills.join(', ')}
                      onChange={(e) => handleSkillStringChange('requiredSkills', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Preferred Skills (comma separated)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={analysisResult.preferredSkills.join(', ')}
                      onChange={(e) => handleSkillStringChange('preferredSkills', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Job Requirements</label>
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', color: 'var(--sage-green)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => handleAddListElement('requirements')}
                    >
                      + Add Rule
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                    {analysisResult.requirements.map((req, idx) => (
                      <div key={idx} className="bullet-input-row">
                        <input
                          type="text"
                          className="form-control"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                          value={req}
                          onChange={(e) => handleListElementChange('requirements', idx, e.target.value)}
                        />
                        <button 
                          type="button" 
                          className="btn-icon-only delete"
                          style={{ width: '24px', height: '24px', flexShrink: 0 }}
                          onClick={() => handleRemoveListElement('requirements', idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Responsibilities</label>
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', color: 'var(--sage-green)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => handleAddListElement('responsibilities')}
                    >
                      + Add Task
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                    {analysisResult.responsibilities.map((resp, idx) => (
                      <div key={idx} className="bullet-input-row">
                        <input
                          type="text"
                          className="form-control"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                          value={resp}
                          onChange={(e) => handleListElementChange('responsibilities', idx, e.target.value)}
                        />
                        <button 
                          type="button" 
                          className="btn-icon-only delete"
                          style={{ width: '24px', height: '24px', flexShrink: 0 }}
                          onClick={() => handleRemoveListElement('responsibilities', idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label className="form-label">Benefits</label>
                    <button 
                      type="button" 
                      style={{ background: 'none', border: 'none', color: 'var(--sage-green)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                      onClick={() => handleAddListElement('benefits')}
                    >
                      + Add Perk
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                    {analysisResult.benefits.map((ben, idx) => (
                      <div key={idx} className="bullet-input-row">
                        <input
                          type="text"
                          className="form-control"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                          value={ben}
                          onChange={(e) => handleListElementChange('benefits', idx, e.target.value)}
                        />
                        <button 
                          type="button" 
                          className="btn-icon-only delete"
                          style={{ width: '24px', height: '24px', flexShrink: 0 }}
                          onClick={() => handleRemoveListElement('benefits', idx)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Extractor Notes</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={analysisResult.notes}
                    onChange={(e) => handleResultChange('notes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
              <span className="empty-state-icon" style={{ fontSize: '3rem' }}>🔬</span>
              <h3>No analysis active</h3>
              <p>Upload a screenshot on the left and click "Analyze Job Screenshot" to view and correct extraction parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalyzer;
