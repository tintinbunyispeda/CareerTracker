import React from 'react';
import type { JobApplication, UserProfile } from '../types';

interface InsightsProps {
  applications: JobApplication[];
  profile: UserProfile;
}

const Insights: React.FC<InsightsProps> = ({ applications, profile }) => {
  const totalApps = applications.length;

  if (totalApps === 0) {
    return (
      <div className="fade-in">
        <div className="header-bar">
          <div className="header-title-container">
            <h1>Career Insights</h1>
            <p className="header-subtitle">Skill gap analytics and target recommendation models.</p>
          </div>
        </div>
        <div className="card empty-state" style={{ padding: '5rem 2rem' }}>
          <span className="empty-state-icon" style={{ fontSize: '4rem' }}>💡</span>
          <h2>Accumulating insights...</h2>
          <p>Please track or analyze at least one application to aggregate skill demands and recommendations.</p>
        </div>
      </div>
    );
  }

  // 1. Average Job Match Score
  const avgMatchScore = Math.round(
    applications.reduce((sum, app) => sum + (app.matchScore || 0), 0) / totalApps
  );

  // Sanitized profile skills lowercased for quick lookup
  const userSkillsLower = profile.skills.map(s => s.toLowerCase());

  // Tally collections
  const missingSkillsTally: Record<string, number> = {};
  const matchedSkillsTally: Record<string, number> = {};

  applications.forEach(app => {
    // Process required skills for matches and gaps
    const reqSkills = app.requiredSkills || [];
    
    // Tally gaps (missing skills)
    // If application has custom skillGaps, use it; otherwise calculate dynamically
    const gaps = app.skillGaps || reqSkills.filter(s => !userSkillsLower.includes(s.toLowerCase()));
    gaps.forEach(skill => {
      // Normalise key casing to display nicely (e.g. "docker" -> "Docker")
      // find original case from requiredSkills or default to title case
      const originalCase = reqSkills.find(rs => rs.toLowerCase() === skill.toLowerCase()) || skill;
      missingSkillsTally[originalCase] = (missingSkillsTally[originalCase] || 0) + 1;
    });

    // Tally matches (matched skills)
    reqSkills.forEach(skill => {
      if (userSkillsLower.includes(skill.toLowerCase())) {
        matchedSkillsTally[skill] = (matchedSkillsTally[skill] || 0) + 1;
      }
    });
  });

  // Sort tallies
  const sortedMissing = Object.entries(missingSkillsTally)
    .sort((a, b) => b[1] - a[1]);

  const sortedMatched = Object.entries(matchedSkillsTally)
    .sort((a, b) => b[1] - a[1]);

  // Recommended skill to learn next
  const topSkillToLearn = sortedMissing.length > 0 ? sortedMissing[0][0] : 'N/A';
  const topSkillToLearnCount = sortedMissing.length > 0 ? sortedMissing[0][1] : 0;

  // Stats breakdowns
  const highMatchCount = applications.filter(a => a.matchScore >= 80).length;
  const activeTrackerCount = applications.filter(a => a.status === 'Applied' || a.status === 'Interviewing').length;

  return (
    <div className="fade-in">
      <div className="header-bar">
        <div className="header-title-container">
          <h1>Career Insights & Gaps</h1>
          <p className="header-subtitle">Actionable advice extracted from your job hunting history.</p>
        </div>
      </div>

      {/* Main KPI metrics row */}
      <div className="insights-grid-3">
        
        <div className="card metric-card" style={{ borderLeft: '4px solid var(--sage-green)' }}>
          <div className="metric-header">
            <span className="metric-title" style={{ fontSize: '0.8rem' }}>Average Match Score</span>
            <span style={{ fontSize: '1.25rem' }}>🎯</span>
          </div>
          <div className="metric-value">{avgMatchScore}%</div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
            Overall alignment with tracked job criteria.
          </p>
        </div>

        <div className="card metric-card" style={{ borderLeft: '4px solid var(--ochre)' }}>
          <div className="metric-header">
            <span className="metric-title" style={{ fontSize: '0.8rem' }}>Top Target Skill</span>
            <span style={{ fontSize: '1.25rem' }}>💡</span>
          </div>
          <div className="metric-value" style={{ fontSize: '1.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.75rem' }}>
            {topSkillToLearn !== 'N/A' ? topSkillToLearn : 'None detected'}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
            {topSkillToLearn !== 'N/A' 
              ? `Missing in ${topSkillToLearnCount} of your tracked applications.`
              : 'You match all required skills!'
            }
          </p>
        </div>

        <div className="card metric-card" style={{ borderLeft: '4px solid var(--terracotta)' }}>
          <div className="metric-header">
            <span className="metric-title" style={{ fontSize: '0.8rem' }}>High-Match Pipeline</span>
            <span style={{ fontSize: '1.25rem' }}>🚀</span>
          </div>
          <div className="metric-value">{highMatchCount} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--color-text-secondary)' }}>/ {totalApps} apps</span></div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: '0.5rem 0 0' }}>
            Applications matching over 80% of requirements.
          </p>
        </div>

      </div>

      {/* Two Column details layout */}
      <div className="analyzer-layout-grid" style={{ marginTop: '1.5rem' }}>
        
        {/* Left Column: Missing and Matched Skill Tallies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Missing Skills Tally */}
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Frequently Missing Skills (Gaps)</h3>
            </div>
            
            <div className="list-container">
              {sortedMissing.length > 0 ? (
                sortedMissing.slice(0, 5).map(([skill, count]) => {
                  const percent = Math.round((count / totalApps) * 100);
                  return (
                    <div key={skill} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="badge badge-rejected" style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }}>Gap</span>
                          {skill}
                        </span>
                        <span>Appeared in {count} {count === 1 ? 'job' : 'jobs'} ({percent}%)</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--bg-sidebar)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--soft-red)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  No missing skills! Your profile covers all requirements.
                </div>
              )}
            </div>
          </div>

          {/* Matched Skills Tally */}
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Frequently Matched Skills</h3>
            </div>
            
            <div className="list-container">
              {sortedMatched.length > 0 ? (
                sortedMatched.slice(0, 5).map(([skill, count]) => {
                  const percent = Math.round((count / totalApps) * 100);
                  return (
                    <div key={skill} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span className="badge badge-interviewing" style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem' }}>Match</span>
                          {skill}
                        </span>
                        <span>Satisfied in {count} {count === 1 ? 'job' : 'jobs'} ({percent}%)</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--bg-sidebar)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: 'var(--sage-green)', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                  No matched skills registered across tracked job listings.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: AI Explanations and CV Improvement Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>Dynamic Learning Strategy</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
              
              {topSkillToLearn !== 'N/A' ? (
                <div 
                  style={{ 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--ochre-light)', 
                    border: '1px solid var(--ochre-border)' 
                  }}
                >
                  <strong style={{ color: 'var(--ochre-dark)', display: 'block', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    💡 Top Priority: Learn {topSkillToLearn}
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--color-text)' }}>
                    <strong>{topSkillToLearn}</strong> appeared in {topSkillToLearnCount} of your analyzed job opportunities. 
                    Acquiring basic proficiency in this tool will directly unlock access to these applications.
                  </p>
                </div>
              ) : (
                <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--sage-green-light)', border: '1px solid var(--sage-green-border)' }}>
                  <strong style={{ color: 'var(--sage-green-dark)', display: 'block', fontSize: '1rem', marginBottom: '0.4rem' }}>
                    🌿 Excellent Standing
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.5', color: 'var(--color-text)' }}>
                    You currently satisfy all mandatory required skills extracted from your active listings. Keep searching for postings that leverage your strengths!
                  </p>
                </div>
              )}

              <div>
                <strong style={{ display: 'block', marginBottom: '0.4rem' }}>Resume Optimization Advice</strong>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                  Based on current market demands in your workspace, tailors should weave descriptions of 
                  {sortedMissing.slice(0, 2).map((item, idx) => (
                    <span key={item[0]}>
                      {idx > 0 ? ' and ' : ' '}
                      <strong>{item[0]}</strong>
                    </span>
                  ))}
                  into their personal projects section to immediately address automated reviewer constraints.
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Application Funnel Strength</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Active trackers (Applied / Interviews)</span>
                    <span style={{ fontWeight: 'bold' }}>{activeTrackerCount} jobs</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>High alignment prospects (&ge;80% score)</span>
                    <span style={{ fontWeight: 'bold' }}>{highMatchCount} prospects</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Skill coverage index</span>
                    <span style={{ fontWeight: 'bold', color: 'var(--sage-green)' }}>
                      {sortedMatched.length + sortedMissing.length > 0 
                        ? Math.round((sortedMatched.length / (sortedMatched.length + sortedMissing.length)) * 100)
                        : 100
                      }%
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Insights;
