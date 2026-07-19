import React from 'react';
import type { JobApplication } from '../types';

interface AnalyticsProps {
  applications: JobApplication[];
}

const Analytics: React.FC<AnalyticsProps> = ({ applications }) => {
  const total = applications.length;

  if (total === 0) {
    return (
      <div className="fade-in">
        <div className="header-bar">
          <div className="header-title-container">
            <h1>Analytics Workspace</h1>
            <p className="header-subtitle">Insights and tracking statistics across your applications.</p>
          </div>
        </div>
        <div className="card empty-state" style={{ padding: '5rem 2rem' }}>
          <span className="empty-state-icon" style={{ fontSize: '4rem' }}>📊</span>
          <h2>No analytics data available</h2>
          <p>Please add some job applications first to view visual funnel rates, match scores, and location ratios.</p>
        </div>
      </div>
    );
  }

  // Count calculations
  const wishlist = applications.filter(a => a.status === 'Wishlist').length;
  const applied = applications.filter(a => a.status === 'Applied').length;
  const interviewing = applications.filter(a => a.status === 'Interviewing').length;
  const offer = applications.filter(a => a.status === 'Offer').length;
  const rejected = applications.filter(a => a.status === 'Rejected').length;

  // Work Type counts
  const remote = applications.filter(a => a.workType === 'Remote').length;
  const hybrid = applications.filter(a => a.workType === 'Hybrid').length;
  const onsite = applications.filter(a => a.workType === 'Onsite').length;

  // Percentages for work types
  const remotePercent = total > 0 ? Math.round((remote / total) * 100) : 0;
  const hybridPercent = total > 0 ? Math.round((hybrid / total) * 100) : 0;
  const onsitePercent = total > 0 ? Math.round((onsite / total) * 100) : 0;

  // Conversion Funnel Rates
  // Applied to Interview: (Interviewing + Offer + Rejected applied) / total applied
  const totalAppliedEver = applied + interviewing + offer + rejected;
  const interviewRate = totalAppliedEver > 0 
    ? Math.round(((interviewing + offer) / totalAppliedEver) * 100) 
    : 0;
  const offerRate = (interviewing + offer) > 0 
    ? Math.round((offer / (interviewing + offer)) * 100) 
    : 0;

  // Average Match Score
  const avgMatchScore = Math.round(
    applications.reduce((sum, app) => sum + app.matchScore, 0) / total
  );

  // SVG Radial circle calculations
  // Circle circumference is 2 * PI * r. For r=60, circumference = 376.99
  const radius = 60;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray - (avgMatchScore / 100) * strokeDasharray;

  // Top locations analysis
  const locationCounts = applications.reduce<Record<string, number>>((acc, app) => {
    const loc = app.location.split('(')[0].trim(); // sanitize "Bend, OR (Onsite)" -> "Bend, OR"
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  const sortedLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5 locations

  return (
    <div className="fade-in">
      <div className="header-bar">
        <div className="header-title-container">
          <h1>Analytics & Insights</h1>
          <p className="header-subtitle">A comprehensive breakdown of your job hunting progress.</p>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Card 1: Funnel Statistics */}
        <div className="card">
          <div className="analytics-card-header">Application Funnel Stages</div>
          <div className="funnel-container">
            
            <div className="funnel-step">
              <div className="funnel-meta">
                <span className="funnel-label">🌱 Wishlist</span>
                <span>{wishlist} apps</span>
              </div>
              <div className="funnel-track">
                <div 
                  className="funnel-bar" 
                  style={{ width: `${total > 0 ? (wishlist / total) * 100 : 0}%`, backgroundColor: 'var(--soft-blue)' }} 
                />
              </div>
            </div>

            <div className="funnel-step">
              <div className="funnel-meta">
                <span className="funnel-label">✉️ Applied</span>
                <span>{applied} apps</span>
              </div>
              <div className="funnel-track">
                <div 
                  className="funnel-bar" 
                  style={{ width: `${total > 0 ? (applied / total) * 100 : 0}%`, backgroundColor: 'var(--ochre)' }} 
                />
              </div>
            </div>

            <div className="funnel-step">
              <div className="funnel-meta">
                <span className="funnel-label">🤝 Interviewing</span>
                <span>{interviewing} apps</span>
              </div>
              <div className="funnel-track">
                <div 
                  className="funnel-bar" 
                  style={{ width: `${total > 0 ? (interviewing / total) * 100 : 0}%`, backgroundColor: 'var(--sage-green)' }} 
                />
              </div>
            </div>

            <div className="funnel-step">
              <div className="funnel-meta">
                <span className="funnel-label">🎉 Offers</span>
                <span>{offer} apps</span>
              </div>
              <div className="funnel-track">
                <div 
                  className="funnel-bar" 
                  style={{ width: `${total > 0 ? (offer / total) * 100 : 0}%`, backgroundColor: 'var(--terracotta)' }} 
                />
              </div>
            </div>

            <div className="funnel-step">
              <div className="funnel-meta">
                <span className="funnel-label">🍂 Rejections</span>
                <span>{rejected} apps</span>
              </div>
              <div className="funnel-track">
                <div 
                  className="funnel-bar" 
                  style={{ width: `${total > 0 ? (rejected / total) * 100 : 0}%`, backgroundColor: 'var(--soft-red)' }} 
                />
              </div>
            </div>

          </div>
        </div>

        {/* Card 2: Average Match Score Radial Progress */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="analytics-card-header" style={{ width: '100%' }}>Profile Alignment</div>
          
          <div className="match-score-radial" style={{ position: 'relative' }}>
            <svg className="radial-svg" width="160" height="160" viewBox="0 0 160 160">
              <circle
                className="circle-bg"
                cx="80"
                cy="80"
                r={radius}
                strokeWidth="10"
              />
              <circle
                className="circle-progress"
                cx="80"
                cy="80"
                r={radius}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                style={{ stroke: 'var(--sage-green)' }}
              />
            </svg>
            <div className="radial-center-text">
              <span className="radial-number">{avgMatchScore}%</span>
              <span className="radial-label">Avg Match</span>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            <p>Your average job alignment score is based on the keywords and qualifications match estimated for all tracked jobs.</p>
          </div>
        </div>

        {/* Card 3: Work Style Distributions */}
        <div className="card">
          <div className="analytics-card-header">Workplace Style Ratios</div>
          
          <div className="segment-bar">
            {remote > 0 && (
              <div 
                className="segment segment-remote" 
                style={{ width: `${remotePercent}%` }} 
                title={`Remote: ${remotePercent}%`}
              />
            )}
            {hybrid > 0 && (
              <div 
                className="segment segment-hybrid" 
                style={{ width: `${hybridPercent}%` }} 
                title={`Hybrid: ${hybridPercent}%`}
              />
            )}
            {onsite > 0 && (
              <div 
                className="segment segment-onsite" 
                style={{ width: `${onsitePercent}%` }} 
                title={`Onsite: ${onsitePercent}%`}
              />
            )}
          </div>

          <div className="segment-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'var(--sage-green)' }} />
              <span>Remote ({remote} / {remotePercent}%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'var(--ochre)' }} />
              <span>Hybrid ({hybrid} / {hybridPercent}%)</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: 'var(--terracotta)' }} />
              <span>Onsite ({onsite} / {onsitePercent}%)</span>
            </div>
          </div>
        </div>

        {/* Card 4: Location Ratios & Conversion Summary */}
        <div className="card">
          <div className="analytics-card-header">Geographical Distribution</div>
          <div className="list-container">
            {sortedLocations.map(([loc, count]) => {
              const percent = Math.round((count / total) * 100);
              return (
                <div key={loc} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>📍 {loc}</span>
                    <span>{count} {count === 1 ? 'app' : 'apps'} ({percent}%)</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-sidebar)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--color-text-secondary)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 5: Pipeline Efficiency conversion indicators */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="analytics-card-header">Process Conversion Metrics</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', borderRight: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--sage-green)' }}>{interviewRate}%</div>
              <div style={{ fontWeight: 600, marginTop: '0.5rem', fontSize: '0.95rem' }}>Application-to-Interview Rate</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textAlign: 'center', margin: '0.5rem 0 0' }}>
                Percentage of your applied positions that advanced to the interview phase.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--terracotta)' }}>{offerRate}%</div>
              <div style={{ fontWeight: 600, marginTop: '0.5rem', fontSize: '0.95rem' }}>Interview-to-Offer Rate</div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textAlign: 'center', margin: '0.5rem 0 0' }}>
                Percentage of interview invitations that successfully resulted in job offers.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
