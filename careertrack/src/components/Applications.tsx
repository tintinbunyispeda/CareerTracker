import React, { useState } from 'react';
import type { JobApplication, ApplicationStatus, WorkType } from '../types';
import Modal from './Modal';

interface ApplicationsProps {
  applications: JobApplication[];
  onAdd: (app: Omit<JobApplication, 'id'>) => void;
  onEdit: (app: JobApplication) => void;
  onDelete: (id: string) => void;
}

// Extended form state representation
const initialFormState = {
  company: '',
  position: '',
  jobLink: '',
  location: '',
  workType: 'Remote' as WorkType,
  dateFound: new Date().toISOString().split('T')[0],
  deadline: '',
  dateApplied: '',
  status: 'Wishlist' as ApplicationStatus,
  matchScore: 80,
  followUpDate: '',
  nextAction: '',
  notes: '',
  
  // New extended fields (stored as strings in form for easy editing, converted on save)
  screenshot: '',
  priority: 'Medium' as 'High' | 'Medium' | 'Low',
  requiredSkills: '',
  preferredSkills: '',
  skillGaps: '',
  requirements: '',
  responsibilities: '',
  benefits: ''
};

const Applications: React.FC<ApplicationsProps> = ({ applications, onAdd, onEdit, onDelete }) => {
  // Navigation & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dateFound' | 'matchScore' | 'deadline'>('dateFound');

  // Modal Control States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Expanded card details tracker
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Delete confirmation tracker
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Handle Form changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'matchScore' ? Math.max(0, Math.min(100, Number(value) || 0)) : value
    }));
  };

  // Submit trigger (creates new app or edits existing)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.position || !formData.location) {
      alert('Please fill out all required fields: Company, Position, and Location.');
      return;
    }

    // Convert string inputs back to arrays
    const formattedApp: Omit<JobApplication, 'id'> = {
      company: formData.company,
      position: formData.position,
      jobLink: formData.jobLink || undefined,
      location: formData.location,
      workType: formData.workType,
      dateFound: formData.dateFound,
      deadline: formData.deadline || undefined,
      dateApplied: formData.dateApplied || undefined,
      status: formData.status,
      matchScore: formData.matchScore,
      followUpDate: formData.followUpDate || undefined,
      nextAction: formData.nextAction || undefined,
      notes: formData.notes || undefined,
      
      // Extended fields
      screenshot: formData.screenshot || undefined,
      priority: formData.priority,
      requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      preferredSkills: formData.preferredSkills ? formData.preferredSkills.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      skillGaps: formData.skillGaps ? formData.skillGaps.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      requirements: formData.requirements ? formData.requirements.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
      responsibilities: formData.responsibilities ? formData.responsibilities.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
      benefits: formData.benefits ? formData.benefits.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
      aiMatchScore: formData.matchScore // Sync match score to AI match score for display
    };

    if (editingId) {
      onEdit({
        ...formattedApp,
        id: editingId
      });
    } else {
      onAdd(formattedApp);
    }
    closeFormModal();
  };

  const openAddModal = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEditModal = (app: JobApplication) => {
    setFormData({
      company: app.company,
      position: app.position,
      jobLink: app.jobLink || '',
      location: app.location,
      workType: app.workType,
      dateFound: app.dateFound,
      deadline: app.deadline || '',
      dateApplied: app.dateApplied || '',
      status: app.status,
      matchScore: app.matchScore,
      followUpDate: app.followUpDate || '',
      nextAction: app.nextAction || '',
      notes: app.notes || '',
      
      // Map arrays back to string formats for form inputs
      screenshot: app.screenshot || '',
      priority: app.priority || 'Medium',
      requiredSkills: app.requiredSkills ? app.requiredSkills.join(', ') : '',
      preferredSkills: app.preferredSkills ? app.preferredSkills.join(', ') : '',
      skillGaps: app.skillGaps ? app.skillGaps.join(', ') : '',
      requirements: app.requirements ? app.requirements.join('\n') : '',
      responsibilities: app.responsibilities ? app.responsibilities.join('\n') : '',
      benefits: app.benefits ? app.benefits.join('\n') : ''
    });
    setEditingId(app.id);
    setIsFormOpen(true);
  };

  const closeFormModal = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Delete Action handling
  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  // Filter & Sort applications list
  const filteredApplications = applications
    .filter((app) => {
      const matchText = (app.company + ' ' + app.position + ' ' + app.location)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchStatus = selectedStatus === 'All' || app.status === selectedStatus;
      
      return matchText && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'matchScore') {
        return b.matchScore - a.matchScore; // descending score
      }
      if (sortBy === 'deadline') {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime();
    });

  // Toggle expanded details inside the list card
  const toggleExpand = (id: string) => {
    setExpandedCardId(expandedCardId === id ? null : id);
  };

  const getScoreClass = (score: number) => {
    if (score >= 85) return 'score-high';
    if (score >= 70) return 'score-medium';
    return 'score-low';
  };

  const getPriorityBadgeClass = (priority?: string) => {
    if (priority === 'High') return 'badge-priority-high';
    if (priority === 'Low') return 'badge-priority-low';
    return 'badge-priority-medium';
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="header-bar">
        <div className="header-title-container">
          <h1>My Job Applications</h1>
          <p className="header-subtitle">Track, filter, and plan your next steps for applications.</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          Add Application
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="filter-bar">
        <div className="search-box-container">
          <div className="search-icon-input">
            <svg className="search-svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by company, title, or location..."
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="filter-tabs">
          {['All', 'Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'].map((status) => (
            <button
              key={status}
              className={`filter-tab-btn ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="sort-select-container">
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Sort by:</span>
          <select 
            className="form-control" 
            style={{ width: '150px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dateFound' | 'matchScore' | 'deadline')}
          >
            <option value="dateFound">Date Found</option>
            <option value="matchScore">Match Score</option>
            <option value="deadline">Upcoming Deadline</option>
          </select>
        </div>
      </div>

      {/* Grid of application cards */}
      {filteredApplications.length > 0 ? (
        <div className="applications-grid">
          {filteredApplications.map((app) => {
            const isExpanded = expandedCardId === app.id;
            return (
              <div 
                key={app.id} 
                className="card app-card" 
                style={{ cursor: 'pointer' }}
                onClick={() => toggleExpand(app.id)}
              >
                <div>
                  <div className="app-card-header">
                    <span className="app-card-company">{app.company}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      
                      {/* Priority Tag */}
                      <span className={`badge ${getPriorityBadgeClass(app.priority)}`} style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        {app.priority || 'Medium'}
                      </span>
                      
                      <span className={`badge badge-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                      {app.jobLink && (
                        <a 
                          href={app.jobLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="app-card-link-icon"
                          title="View job posting"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" x2="21" y1="14" y2="3" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <h3 className="app-card-title">{app.position}</h3>
                  
                  <div className="app-card-meta">
                    <span>📍 {app.location}</span>
                    <span>•</span>
                    <span>🏡 {app.workType}</span>
                  </div>
                </div>

                <div className="app-card-details">
                  <div className="app-card-detail-item">
                    <span className="detail-label">Match Score</span>
                    <span className={`detail-value score-badge ${getScoreClass(app.matchScore)}`}>
                      {app.matchScore}%
                    </span>
                  </div>
                  <div className="app-card-detail-item">
                    <span className="detail-label">Date Found</span>
                    <span className="detail-value">{app.dateFound}</span>
                  </div>
                  {app.dateApplied && (
                    <div className="app-card-detail-item">
                      <span className="detail-label">Applied On</span>
                      <span className="detail-value">{app.dateApplied}</span>
                    </div>
                  )}
                  {app.deadline && (
                    <div className="app-card-detail-item">
                      <span className="detail-label">Deadline</span>
                      <span className="detail-value" style={{ color: 'var(--terracotta-dark)' }}>{app.deadline}</span>
                    </div>
                  )}

                  {/* Toggle expand container details */}
                  {isExpanded && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--color-border)', animation: 'fadeIn 0.2s ease' }}>
                      {app.followUpDate && (
                        <p style={{ margin: '0 0 0.4rem', fontSize: '0.8rem' }}>
                          <strong>Follow Up:</strong> {app.followUpDate}
                        </p>
                      )}
                      {app.nextAction && (
                        <p style={{ margin: '0 0 0.4rem', fontSize: '0.8rem' }}>
                          <strong>Next Action:</strong> {app.nextAction}
                        </p>
                      )}
                      {app.notes && (
                        <p style={{ margin: '0 0 0.75rem', fontSize: '0.8rem', whiteSpace: 'pre-wrap', color: 'var(--color-text-secondary)' }}>
                          <strong>Notes:</strong> {app.notes}
                        </p>
                      )}

                      {/* AI Extracted screenshot */}
                      {app.screenshot && (
                        <div className="app-detail-block">
                          <div className="app-detail-section-title">Original Job Screenshot</div>
                          <img 
                            src={app.screenshot} 
                            alt="Job description screenshot" 
                            className="app-detail-screenshot-thumb"
                            onClick={(e) => {
                              e.stopPropagation();
                              const win = window.open();
                              win?.document.write(`<img src="${app.screenshot}" style="max-width:100%;" />`);
                            }}
                          />
                        </div>
                      )}

                      {/* AI skill checklist */}
                      {app.requiredSkills && app.requiredSkills.length > 0 && (
                        <div className="app-detail-block">
                          <div className="app-detail-section-title">Required Skills</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                            {app.requiredSkills.map(s => {
                              const isGap = app.skillGaps?.some(g => g.toLowerCase() === s.toLowerCase());
                              return (
                                <span key={s} className={`badge ${isGap ? 'badge-rejected' : 'badge-interviewing'}`} style={{ fontSize: '0.7rem' }}>
                                  {s}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {app.preferredSkills && app.preferredSkills.length > 0 && (
                        <div className="app-detail-block">
                          <div className="app-detail-section-title">Preferred Skills</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                            {app.preferredSkills.map(s => (
                              <span key={s} className="badge badge-applied" style={{ fontSize: '0.75rem' }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bullet lists */}
                      {app.requirements && app.requirements.length > 0 && (
                        <div className="app-detail-block">
                          <div className="app-detail-section-title">Job Requirements</div>
                          <ul className="app-detail-bullets">
                            {app.requirements.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}

                      {app.responsibilities && app.responsibilities.length > 0 && (
                        <div className="app-detail-block">
                          <div className="app-detail-section-title">Responsibilities</div>
                          <ul className="app-detail-bullets">
                            {app.responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}

                      {app.benefits && app.benefits.length > 0 && (
                        <div className="app-detail-block">
                          <div className="app-detail-section-title">Benefits & Perks</div>
                          <ul className="app-detail-bullets">
                            {app.benefits.map((b, i) => <li key={i}>{b}</li>)}
                          </ul>
                        </div>
                      )}

                    </div>
                  )}
                </div>

                <div className="app-card-actions">
                  <button 
                    className="btn-icon-only edit" 
                    title="Edit application"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(app);
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                  </button>
                  <button 
                    className="btn-icon-only delete" 
                    title="Delete application"
                    onClick={(e) => handleDeleteClick(app.id, e)}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card empty-state">
          <span className="empty-state-icon">🌾</span>
          <h3>No applications found</h3>
          <p>Try searching another keyword, refining filters, or create a brand new application track.</p>
        </div>
      )}

      {/* Form Dialog Modal for Add/Edit application */}
      <Modal 
        isOpen={isFormOpen} 
        onClose={closeFormModal} 
        title={editingId ? 'Edit Application' : 'Track New Application'}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <h4 style={{ margin: '0 0 -0.5rem', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>
            OVERVIEW
          </h4>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                name="company"
                className="form-control"
                placeholder="e.g. Sage Creative Studio"
                value={formData.company}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Job Position *</label>
              <input
                type="text"
                name="position"
                className="form-control"
                placeholder="e.g. UI Developer"
                value={formData.position}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Job Link URL</label>
              <input
                type="url"
                name="jobLink"
                className="form-control"
                placeholder="https://company.com/careers"
                value={formData.jobLink}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Job Location *</label>
              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="e.g. Remote, Portland OR"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Work Type</label>
              <select
                name="workType"
                className="form-control"
                value={formData.workType}
                onChange={handleInputChange}
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-control"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Wishlist">Wishlist</option>
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Match Score (0 - 100)</label>
              <input
                type="number"
                name="matchScore"
                className="form-control"
                min="0"
                max="100"
                value={formData.matchScore}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date Found *</label>
              <input
                type="date"
                name="dateFound"
                className="form-control"
                value={formData.dateFound}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date Applied</label>
              <input
                type="date"
                name="dateApplied"
                className="form-control"
                value={formData.dateApplied}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline Date</label>
              <input
                type="date"
                name="deadline"
                className="form-control"
                value={formData.deadline}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Follow-Up Date</label>
              <input
                type="date"
                name="followUpDate"
                className="form-control"
                value={formData.followUpDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Next Action Step</label>
              <input
                type="text"
                name="nextAction"
                className="form-control"
                placeholder="e.g. Follow up on Tuesday"
                value={formData.nextAction}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <h4 style={{ margin: '1rem 0 -0.5rem', borderBottom: '1px dashed var(--color-border)', paddingBottom: '0.25rem', color: 'var(--color-text-secondary)' }}>
            AI METADATA & ARRAYS
          </h4>

          <div className="form-row">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Screenshot Image DataURL / URL</label>
              <input
                type="text"
                name="screenshot"
                className="form-control"
                placeholder="data:image/png;base64,... or filepath"
                value={formData.screenshot}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Required Skills (comma separated)</label>
              <input
                type="text"
                name="requiredSkills"
                className="form-control"
                placeholder="React, TypeScript, CSS"
                value={formData.requiredSkills}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Preferred Skills (comma separated)</label>
              <input
                type="text"
                name="preferredSkills"
                className="form-control"
                placeholder="Next.js, Docker"
                value={formData.preferredSkills}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Skill Gaps (comma separated)</label>
              <input
                type="text"
                name="skillGaps"
                className="form-control"
                placeholder="GraphQL, Next.js"
                value={formData.skillGaps}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Requirements (one per line)</label>
            <textarea
              name="requirements"
              className="form-control"
              rows={3}
              placeholder="Requirement A&#10;Requirement B"
              value={formData.requirements}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Responsibilities (one per line)</label>
            <textarea
              name="responsibilities"
              className="form-control"
              rows={3}
              placeholder="Task A&#10;Task B"
              value={formData.responsibilities}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Benefits & Perks (one per line)</label>
            <textarea
              name="benefits"
              className="form-control"
              rows={3}
              placeholder="Benefit A&#10;Benefit B"
              value={formData.benefits}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Comments</label>
            <textarea
              name="notes"
              className="form-control"
              rows={2}
              placeholder="Personal logs..."
              value={formData.notes}
              onChange={handleInputChange}
            />
          </div>

          <div className="modal-footer" style={{ borderTop: 'none', paddingRight: 0, paddingBottom: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={closeFormModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Save Changes' : 'Track Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal Dialog */}
      <Modal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Deletion"
      >
        <p>Are you sure you want to delete this job application? This action is permanent and cannot be undone.</p>
        <div className="modal-footer" style={{ borderTop: 'none', paddingRight: 0, paddingBottom: 0 }}>
          <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
            Keep It
          </button>
          <button className="btn btn-danger" onClick={confirmDelete}>
            Confirm Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Applications;
