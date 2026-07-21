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
  const userSkillsLower = profile.skills.map(s => s.name.toLowerCase());

  // Tally collections
  const missingSkillsTally: Record<string, number> = {};
  const matchedSkillsTally: Record<string, number> = {};

  applications.forEach(app => {
    // Process required skills for matches and gaps
    const reqSkills = app.requiredSkills || [];
    
    // Tally gaps (missing skills)
    const gaps = app.skillGaps || reqSkills.filter(s => !userSkillsLower.includes(s.toLowerCase()));
    gaps.forEach(skill => {
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

  // ==========================================
  // Data Scientist Skill Upgrade Index
  // Calculates: Priority = Job_Frequency * (100 - Your_Confidence)
  // ==========================================
  const demandedSkillsMap: Record<string, { count: number; isRequired: boolean }> = {};
  
  applications.forEach(app => {
    const req = app.requiredSkills || [];
    const pref = app.preferredSkills || [];
    
    req.forEach(s => {
      const key = s.toLowerCase();
      const current = demandedSkillsMap[key] || { count: 0, isRequired: true };
      demandedSkillsMap[key] = { count: current.count + 1, isRequired: true };
    });
    
    pref.forEach(s => {
      const key = s.toLowerCase();
      const current = demandedSkillsMap[key] || { count: 0, isRequired: false };
      // Preferred skills carry 0.5 weight in demand frequency
      demandedSkillsMap[key] = { count: current.count + 0.5, isRequired: current.isRequired || false };
    });
  });

  const upgradeIndex = Object.entries(demandedSkillsMap).map(([key, info]) => {
    // Retain original casing
    let originalName = key;
    for (const app of applications) {
      const found = (app.requiredSkills || []).find(s => s.toLowerCase() === key) || 
                    (app.preferredSkills || []).find(s => s.toLowerCase() === key);
      if (found) {
        originalName = found;
        break;
      }
    }
    
    // Get user confidence rating
    const userSkillObj = profile.skills.find(s => s.name.toLowerCase() === key);
    const confidence = userSkillObj ? userSkillObj.confidence : 0;
    const priorityIndex = Math.round(info.count * (100 - confidence));
    
    return {
      name: originalName,
      demandCount: Math.ceil(info.count),
      confidence,
      priorityIndex,
      hasSkill: !!userSkillObj
    };
  });

  // Sort descending by priorityIndex (filter out items where index is 0 - i.e. 100% confidence & no gaps)
  const sortedUpgradeIndex = upgradeIndex
    .filter(item => item.priorityIndex > 0)
    .sort((a, b) => b.priorityIndex - a.priorityIndex);

  // Stats breakdowns
  const highMatchCount = applications.filter(a => a.matchScore >= 80).length;
  const activeTrackerCount = applications.filter(a => a.status === 'Applied' || a.status === 'Interviewing').length;

  const getMasteryLabel = (confidence: number) => {
    if (confidence <= 30) return 'Basic';
    if (confidence <= 60) return 'Intermediate';
    if (confidence <= 85) return 'Advanced';
    return 'Expert';
  };

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

        {/* Right Column: Skill Upgrade Priorities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="card">
            <div className="profile-section-header">
              <h3 style={{ margin: 0 }}>🔬 Skill Upgrade Index</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                Calculated dynamically: <code>Demand_Frequency * (100 - Your_Confidence)</code>. Upgrade targets are ranked by criticality.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {sortedUpgradeIndex.length > 0 ? (
                  sortedUpgradeIndex.slice(0, 5).map((item) => {
                    // Determine status priority classification
                    let badgeClass = 'badge-applied'; 
                    let priorityLabel = 'Minor Polish';
                    if (item.priorityIndex >= 150) {
                      badgeClass = 'badge-rejected'; 
                      priorityLabel = 'Critical Action';
                    } else if (item.priorityIndex >= 50) {
                      badgeClass = 'badge-applied'; 
                      priorityLabel = 'Upgrade Recommended';
                    }
                    
                    return (
                      <div 
                        key={item.name} 
                        style={{ 
                          padding: '0.75rem', 
                          border: '1px solid var(--color-border)', 
                          borderRadius: '8px', 
                          backgroundColor: 'var(--bg-primary)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{item.name}</strong>
                          <span 
                            className={`badge ${badgeClass}`} 
                            style={{ 
                              fontSize: '0.7rem', 
                              padding: '0.15rem 0.4rem',
                              backgroundColor: item.priorityIndex >= 150 ? 'var(--soft-red-light)' : (item.priorityIndex >= 50 ? 'var(--ochre-light)' : 'var(--sage-green-light)'),
                              color: item.priorityIndex >= 150 ? 'var(--soft-red-dark)' : (item.priorityIndex >= 50 ? 'var(--ochre-dark)' : 'var(--sage-green-dark)'),
                              border: '1px solid currentColor'
                            }}
                          >
                            {priorityLabel}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          <span>Asked in <strong>{item.demandCount}</strong> applications</span>
                          <span>Mastery: <strong>{getMasteryLabel(item.confidence)}</strong></span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'var(--bg-sidebar)', borderRadius: '3px', overflow: 'hidden', marginTop: '0.2rem' }}>
                          <div 
                            style={{ 
                              width: `${Math.min(100, item.priorityIndex / 4)}%`, 
                              height: '100%', 
                              backgroundColor: item.priorityIndex >= 150 ? 'var(--soft-red)' : (item.priorityIndex >= 50 ? 'var(--ochre)' : 'var(--sage-green)'),
                              borderRadius: '3px' 
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    🌿 No upgrade targets detected. Your confidence ratings match all requirements!
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <strong style={{ display: 'block', marginBottom: '0.4rem' }}>Funnel Alignment</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
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
                    <span style={{ fontWeight: 'bold', color: 'var(--sage-green-dark)' }}>
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
