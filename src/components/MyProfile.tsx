import React, { useState } from 'react';
import type { UserProfile } from '../types';

interface MyProfileProps {
  profile: UserProfile;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
}

const MyProfile: React.FC<MyProfileProps> = ({ profile, onUpdateProfile }) => {
  // Local state for adding a skill tag
  const [newSkill, setNewSkill] = useState('');
  
  // Drag and drop visual indicator state
  const [isDragging, setIsDragging] = useState(false);

  // General profile field updater
  const updateField = <K extends keyof UserProfile>(name: K, value: UserProfile[K]) => {
    onUpdateProfile({
      ...profile,
      [name]: value
    });
  };

  // Mock resume PDF parser trigger
  const handleResumeUpload = (fileName: string) => {
    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Add default parsed skills as objects with initial confidence ratings
    const defaultParsed = [
      { name: 'Git', confidence: 80 },
      { name: 'CSS Grid', confidence: 75 },
      { name: 'Tailwind CSS', confidence: 70 }
    ];
    
    const currentSkillNames = profile.skills.map(s => s.name.toLowerCase());
    const newSkills = [
      ...profile.skills,
      ...defaultParsed.filter(ds => !currentSkillNames.includes(ds.name.toLowerCase()))
    ];
    
    onUpdateProfile({
      ...profile,
      resumeName: fileName,
      resumeStatus: `Uploaded and parsed successfully on ${today}`,
      skills: newSkills
    });
  };

  // Handle file picker event
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleResumeUpload(e.target.files[0].name);
    }
  };

  // Drag over dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Drop file
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.pdf') || file.name.toLowerCase().endsWith('.docx')) {
        handleResumeUpload(file.name);
      } else {
        alert('Please upload a PDF or DOCX resume document.');
      }
    }
  };

  // Add skill tag (defaulting to 80% confidence)
  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSkill.trim();
    if (clean && !profile.skills.some(s => s.name.toLowerCase() === clean.toLowerCase())) {
      const updatedSkills = [...profile.skills, { name: clean, confidence: 80 }];
      updateField('skills', updatedSkills);
      setNewSkill('');
    }
  };

  // Delete skill tag
  const handleRemoveSkill = (skillToDelete: string) => {
    const updatedSkills = profile.skills.filter(s => s.name !== skillToDelete);
    updateField('skills', updatedSkills);
  };

  // Update skill confidence
  const handleUpdateSkillConfidence = (skillName: string, confidence: number) => {
    const updatedSkills = profile.skills.map(s => {
      if (s.name === skillName) {
        return { ...s, confidence: Math.max(0, Math.min(100, confidence)) };
      }
      return s;
    });
    updateField('skills', updatedSkills);
  };

  // ==========================================
  // Array management (Education)
  // ==========================================
  const handleAddEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: 'Degree / Certificate',
      school: 'University / Institution',
      year: 'Start Year - Graduation Year'
    };
    updateField('education', [...profile.education, newEdu]);
  };

  const handleEditEducation = (id: string, field: string, value: string) => {
    const updated = profile.education.map(edu => {
      if (edu.id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    updateField('education', updated);
  };

  const handleDeleteEducation = (id: string) => {
    const updated = profile.education.filter(edu => edu.id !== id);
    updateField('education', updated);
  };

  // ==========================================
  // Array management (Experience)
  // ==========================================
  const handleAddExperience = () => {
    const newExp = {
      id: `exp-${Date.now()}`,
      company: 'Company Name',
      role: 'Job Role',
      duration: 'Duration (e.g. 2025 - Present)',
      bullets: ['Added key achievements and responsibilities.']
    };
    updateField('experience', [...profile.experience, newExp]);
  };

  const handleEditExperience = (id: string, field: keyof UserProfile['experience'][0], value: string | string[]) => {
    const updated = profile.experience.map(exp => {
      if (exp.id === id) {
        return { ...exp, [field]: value } as typeof exp;
      }
      return exp;
    });
    updateField('experience', updated);
  };

  const handleDeleteExperience = (id: string) => {
    const updated = profile.experience.filter(exp => exp.id !== id);
    updateField('experience', updated);
  };

  // Bullet points handlers
  const handleAddBullet = (expId: string) => {
    const exp = profile.experience.find(e => e.id === expId);
    if (exp) {
      const updatedBullets = [...exp.bullets, 'New bullet point. Click to edit.'];
      handleEditExperience(expId, 'bullets', updatedBullets);
    }
  };

  const handleEditBullet = (expId: string, bulletIndex: number, text: string) => {
    const exp = profile.experience.find(e => e.id === expId);
    if (exp) {
      const updatedBullets = exp.bullets.map((b, idx) => (idx === bulletIndex ? text : b));
      handleEditExperience(expId, 'bullets', updatedBullets);
    }
  };

  const handleDeleteBullet = (expId: string, bulletIndex: number) => {
    const exp = profile.experience.find(e => e.id === expId);
    if (exp) {
      const updatedBullets = exp.bullets.filter((_, idx) => idx !== bulletIndex);
      handleEditExperience(expId, 'bullets', updatedBullets);
    }
  };

  // ==========================================
  // Array management (Projects)
  // ==========================================
  const handleAddProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: 'Project Title',
      role: 'Role (e.g. Lead Developer)',
      tech: ['React', 'CSS'],
      description: 'Describe what you built and the impact it made.'
    };
    updateField('projects', [...profile.projects, newProj]);
  };

  const handleEditProject = (id: string, field: keyof UserProfile['projects'][0], value: string | string[]) => {
    const updated = profile.projects.map(proj => {
      if (proj.id === id) {
        return { ...proj, [field]: value } as typeof proj;
      }
      return proj;
    });
    updateField('projects', updated);
  };

  const handleDeleteProject = (id: string) => {
    const updated = profile.projects.filter(proj => proj.id !== id);
    updateField('projects', updated);
  };

  const handleProjectTechChange = (projId: string, techString: string) => {
    const techArray = techString.split(',').map(t => t.trim()).filter(Boolean);
    handleEditProject(projId, 'tech', techArray);
  };

  return (
    <div className="fade-in">
      <div className="header-bar">
        <div className="header-title-container">
          <h1>My Career Profile</h1>
          <p className="header-subtitle">Manage your resume details and skill list for AI comparisons.</p>
        </div>
      </div>

      <div className="profile-layout-grid">
        {/* Left Column: Resume Upload & Personal Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Resume Upload Dropzone */}
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Resume Document</h3>
            </div>
            
            <div 
              className={`upload-dropzone ${isDragging ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('resume-file-input')?.click()}
            >
              <svg className="upload-icon-svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
              </svg>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>Drag & Drop Resume</strong>
                <span style={{ fontSize: '0.8rem' }}>PDF or DOCX files (Max 5MB)</span>
              </div>
              <input 
                id="resume-file-input" 
                type="file" 
                accept=".pdf,.docx" 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
            </div>

            {profile.resumeName ? (
              <div 
                style={{ 
                  marginTop: '1.25rem', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  backgroundColor: 'var(--sage-green-light)',
                  border: '1px solid var(--sage-green-border)',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: 'var(--sage-green-dark)' }}>
                  <span>📄 {profile.resumeName}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  {profile.resumeStatus}
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                No active resume parsed. Upload a PDF to import personal experience nodes.
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Personal Details</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profile.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={profile.email}
                  onChange={(e) => updateField('email', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profile.phone || ''}
                  onChange={(e) => updateField('phone', e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Personal Website / LinkedIn</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profile.website || ''}
                  onChange={(e) => updateField('website', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Skills Checklist Manager */}
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Core Skills Checklist</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {profile.skills.map((skill) => (
                <div 
                  key={skill.name} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.3rem', 
                    padding: '0.6rem 0.75rem', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--bg-primary)' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--color-text)' }}>{skill.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge badge-applied" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', fontWeight: 'bold' }}>
                        {skill.confidence}% confidence
                      </span>
                      <button 
                        type="button" 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--terracotta)', 
                          fontSize: '1.1rem', 
                          cursor: 'pointer', 
                          padding: 0,
                          lineHeight: 1
                        }}
                        onClick={() => handleRemoveSkill(skill.name)}
                        aria-label={`Remove ${skill.name}`}
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      style={{ 
                        width: '100%', 
                        accentColor: 'var(--sage-green)', 
                        height: '4px', 
                        cursor: 'pointer',
                        margin: '0.2rem 0'
                      }}
                      value={skill.confidence}
                      onChange={(e) => handleUpdateSkillConfidence(skill.name, Number(e.target.value))}
                    />
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSkillSubmit} className="add-tag-inline-form">
              <input
                type="text"
                placeholder="Add skill (e.g. Docker)..."
                className="form-control"
                style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                Add
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Experience, Projects, Education */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Work Experience section */}
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Work Experience</h3>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={handleAddExperience}>
                + Add Experience
              </button>
            </div>

            <div>
              {profile.experience.length > 0 ? (
                profile.experience.map((exp) => (
                  <div key={exp.id} className="list-item-card">
                    <button 
                      className="btn-icon-only delete delete-card-btn" 
                      onClick={() => handleDeleteExperience(exp.id)}
                      title="Delete experience"
                    >
                      &times;
                    </button>
                    <div className="form-row" style={{ marginBottom: '0.75rem', paddingRight: '2rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Company Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={exp.company}
                          onChange={(e) => handleEditExperience(exp.id, 'company', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Role / Job Title</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={exp.role}
                          onChange={(e) => handleEditExperience(exp.id, 'role', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Duration</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={exp.duration}
                        onChange={(e) => handleEditExperience(exp.id, 'duration', e.target.value)}
                        placeholder="e.g. Nov 2025 - Present"
                      />
                    </div>
                    
                    {/* Bullet list edit node */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <label className="form-label">Responsibilities & Outcomes</label>
                        <button 
                          type="button" 
                          style={{ background: 'none', border: 'none', color: 'var(--sage-green)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                          onClick={() => handleAddBullet(exp.id)}
                        >
                          + Add Bullet
                        </button>
                      </div>
                      
                      <div className="bullet-list-editable">
                        {exp.bullets.map((bullet, idx) => (
                          <div key={idx} className="bullet-input-row">
                            <span style={{ color: 'var(--color-text-secondary)' }}>•</span>
                            <input
                              type="text"
                              className="form-control"
                              style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                              value={bullet}
                              onChange={(e) => handleEditBullet(exp.id, idx, e.target.value)}
                            />
                            <button 
                              type="button" 
                              className="btn-icon-only delete"
                              style={{ width: '24px', height: '24px', flexShrink: 0 }}
                              onClick={() => handleDeleteBullet(exp.id, idx)}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  No experience entered yet. Click "+ Add Experience" above to begin.
                </div>
              )}
            </div>
          </div>

          {/* Projects Section */}
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Featured Projects</h3>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={handleAddProject}>
                + Add Project
              </button>
            </div>

            <div>
              {profile.projects.length > 0 ? (
                profile.projects.map((proj) => (
                  <div key={proj.id} className="list-item-card">
                    <button 
                      className="btn-icon-only delete delete-card-btn" 
                      onClick={() => handleDeleteProject(proj.id)}
                      title="Delete project"
                    >
                      &times;
                    </button>
                    <div className="form-row" style={{ marginBottom: '0.75rem', paddingRight: '2rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Project Title</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={proj.title}
                          onChange={(e) => handleEditProject(proj.id, 'title', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Your Role</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={proj.role}
                          onChange={(e) => handleEditProject(proj.id, 'role', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label className="form-label">Tech Stack (comma separated)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={proj.tech.join(', ')}
                        onChange={(e) => handleProjectTechChange(proj.id, e.target.value)}
                        placeholder="e.g. React, TypeScript, Node.js"
                      />
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Description</label>
                      <textarea 
                        className="form-control" 
                        rows={2}
                        value={proj.description}
                        onChange={(e) => handleEditProject(proj.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  No projects added. Track your portfolios to optimize visual keywords matching.
                </div>
              )}
            </div>
          </div>

          {/* Education section */}
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Education</h3>
              <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }} onClick={handleAddEducation}>
                + Add Education
              </button>
            </div>

            <div>
              {profile.education.length > 0 ? (
                profile.education.map((edu) => (
                  <div key={edu.id} className="list-item-card">
                    <button 
                      className="btn-icon-only delete delete-card-btn" 
                      onClick={() => handleDeleteEducation(edu.id)}
                      title="Delete education"
                    >
                      &times;
                    </button>
                    <div className="form-row" style={{ paddingRight: '2rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Degree / Field of Study</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={edu.degree}
                          onChange={(e) => handleEditEducation(edu.id, 'degree', e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">School Name</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={edu.school}
                          onChange={(e) => handleEditEducation(edu.id, 'school', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                      <label className="form-label">Graduation Year / Range</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={edu.year}
                        onChange={(e) => handleEditEducation(edu.id, 'year', e.target.value)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  No education cards recorded.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyProfile;
