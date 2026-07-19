import React from 'react';
import type { JobApplication } from '../types';

interface DashboardProps {
  applications: JobApplication[];
  onNavigate: (tab: 'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ applications, onNavigate }) => {
  // Get time-based greeting for Cristine
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Metrics calculations
  const totalCount = applications.length;
  const appliedCount = applications.filter(app => app.status === 'Applied').length;
  const interviewCount = applications.filter(app => app.status === 'Interviewing').length;
  const offerCount = applications.filter(app => app.status === 'Offer').length;

  // Recent 3 applications based on date found or date applied (descending order)
  const recentApplications = [...applications]
    .sort((a, b) => {
      const dateA = a.dateApplied || a.dateFound;
      const dateB = b.dateApplied || b.dateFound;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 3);

  // Filter and sort upcoming deadlines/follow-ups (anything with deadline or follow-up date)
  // Let's filter dates that are within a reasonable range or just active upcoming ones.
  const upcomingEvents = applications
    .reduce<{ id: string; company: string; position: string; type: 'Deadline' | 'Follow-up'; date: string; action?: string }[]>((acc, app) => {
      if (app.deadline) {
        acc.push({
          id: `${app.id}-deadline`,
          company: app.company,
          position: app.position,
          type: 'Deadline',
          date: app.deadline,
          action: 'Submit application requirements'
        });
      }
      if (app.followUpDate) {
        acc.push({
          id: `${app.id}-followup`,
          company: app.company,
          position: app.position,
          type: 'Follow-up',
          date: app.followUpDate,
          action: app.nextAction || 'Send polite follow-up email'
        });
      }
      return acc;
    }, [])
    // Sort chronologically
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // top 5 upcoming events

  // Check if a date is overdue compared to today (July 18, 2026, or actual system date)
  const isOverdue = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    return eventDate < today;
  };

  // Humanize date displays
  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  return (
    <div className="fade-in">
      <div className="header-bar">
        <div className="header-title-container">
          <h1>{getGreeting()}, Cristine</h1>
          <p className="header-subtitle">Welcome back to your workspace. Here is your application update.</p>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('applications')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" x2="12" y1="5" y2="19" />
            <line x1="5" x2="19" y1="12" y2="12" />
          </svg>
          Add Application
        </button>
      </div>

      {/* Metrics Row */}
      <div className="metrics-row">
        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Total tracked</span>
            <div className="metric-icon-bg" style={{ backgroundColor: 'var(--soft-blue-light)', color: 'var(--soft-blue)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{totalCount}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Applied</span>
            <div className="metric-icon-bg" style={{ backgroundColor: 'var(--ochre-light)', color: 'var(--ochre)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{appliedCount}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Interviews</span>
            <div className="metric-icon-bg" style={{ backgroundColor: 'var(--sage-green-light)', color: 'var(--sage-green)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{interviewCount}</div>
        </div>

        <div className="card metric-card">
          <div className="metric-header">
            <span className="metric-title">Offers</span>
            <div className="metric-icon-bg" style={{ backgroundColor: 'var(--terracotta-light)', color: 'var(--terracotta)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
                <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" />
              </svg>
            </div>
          </div>
          <div className="metric-value">{offerCount}</div>
        </div>
      </div>

      {/* Main Dashboard Content Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Applications & Status Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Recent Applications List */}
          <div className="card">
            <div className="dashboard-card-header">
              <span className="dashboard-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Recent Applications
              </span>
              <button 
                className="btn-secondary" 
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
                onClick={() => onNavigate('applications')}
              >
                View All
              </button>
            </div>
            
            <div className="list-container">
              {recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <div key={app.id} className="recent-app-item">
                    <div className="recent-app-info">
                      <span className="recent-app-title">{app.position}</span>
                      <div className="recent-app-meta">
                        <span style={{ fontWeight: 550, color: 'var(--color-text)' }}>{app.company}</span>
                        <span className="dot-separator"></span>
                        <span>{app.location}</span>
                        <span className="dot-separator"></span>
                        <span>{app.workType}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`badge badge-${app.status.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-state-icon">🌾</span>
                  <p>Your field is currently empty. Add your first application to start tracking!</p>
                </div>
              )}
            </div>
          </div>

          {/* Status Progress Ring / Overview Bar */}
          <div className="card">
            <div className="dashboard-card-header">
              <span className="dashboard-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20v-8" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
                Status Progress Breakdown
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(['Wishlist', 'Applied', 'Interviewing', 'Offer', 'Rejected'] as const).map(status => {
                const count = applications.filter(app => app.status === status).length;
                const percent = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                
                // Get corresponding classes for styles
                let themeClass = 'wishlist';
                if (status === 'Applied') themeClass = 'applied';
                if (status === 'Interviewing') themeClass = 'interviewing';
                if (status === 'Offer') themeClass = 'offer';
                if (status === 'Rejected') themeClass = 'rejected';

                return (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ width: '110px', fontSize: '0.85rem', fontWeight: 600 }}>{status}</span>
                    <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-sidebar)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                      <div 
                        style={{ 
                          width: `${percent}%`, 
                          height: '100%', 
                          backgroundColor: `var(--${themeClass === 'wishlist' ? 'soft-blue' : themeClass === 'interviewing' ? 'sage-green' : themeClass === 'applied' ? 'ochre' : themeClass === 'offer' ? 'terracotta' : 'soft-red'})`,
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }} 
                      />
                    </div>
                    <span style={{ width: '45px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 550 }}>
                      {count} ({percent}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deadlines and Follow-ups */}
        <div className="card" style={{ height: 'fit-content' }}>
          <div className="dashboard-card-header">
            <span className="dashboard-card-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Upcoming Deadlines & Follow-ups
            </span>
          </div>

          <div>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((evt) => {
                const overdue = isOverdue(evt.date);
                const urgencyClass = evt.type === 'Deadline'
                  ? (overdue ? 'danger' : 'warning')
                  : (overdue ? 'danger' : '');

                return (
                  <div key={evt.id} className={`deadline-item ${urgencyClass}`}>
                    <div className="deadline-content">
                      <div className="deadline-title">
                        {evt.company} - {evt.position}
                      </div>
                      <div className="deadline-meta">
                        <strong>{evt.type}:</strong> {evt.action}
                      </div>
                      {evt.type === 'Follow-up' && (
                        <div className="deadline-action">
                          Next step: {evt.action}
                        </div>
                      )}
                    </div>
                    <div 
                      className="deadline-date-badge"
                      style={{ 
                        color: overdue ? 'var(--soft-red-dark)' : evt.type === 'Deadline' ? 'var(--terracotta-dark)' : 'var(--sage-green-dark)',
                        backgroundColor: overdue ? 'var(--soft-red-light)' : evt.type === 'Deadline' ? 'var(--terracotta-light)' : 'var(--sage-green-light)',
                        border: `1px solid ${overdue ? 'var(--soft-red-border)' : evt.type === 'Deadline' ? 'var(--terracotta-border)' : 'var(--sage-green-border)'}`
                      }}
                    >
                      {formatDate(evt.date)}
                      {overdue && <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '2px' }}>Overdue</div>}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <span className="empty-state-icon" style={{ fontSize: '2.5rem' }}>🍵</span>
                <p style={{ fontSize: '0.9rem' }}>All tasks and deadlines are fully cleared. Time to brew a warm cup of herbal tea!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
