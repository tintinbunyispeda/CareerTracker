import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights';
  setActiveTab: (tab: 'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights') => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void; // Lock session callback
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, onLogout }) => {
  const handleNavClick = (tab: 'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights') => {
    setActiveTab(tab);
    onClose(); // Close sidebar on mobile after navigating
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <img 
          src="/logo.png" 
          alt="CareerTrack Logo" 
          style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '6px', 
            objectFit: 'cover',
            marginRight: '0.2rem'
          }} 
        />
        <span className="sidebar-logo-text">CareerTrack</span>
      </div>

      <nav className="sidebar-nav">
        <button 
          className={`sidebar-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
        >
          {/* House/Cabin SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Dashboard
        </button>

        <button 
          className={`sidebar-nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => handleNavClick('applications')}
        >
          {/* Folder/Notion board SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Applications
        </button>

        <button 
          className={`sidebar-nav-btn ${activeTab === 'analyzer' ? 'active' : ''}`}
          onClick={() => handleNavClick('analyzer')}
        >
          {/* AI Scanner / Scope SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12h20" />
            <path d="M20 12v8H4v-8" />
            <path d="m15 5-3-3-3 3" />
            <path d="M12 2v10" />
          </svg>
          AI Analyzer
        </button>

        <button 
          className={`sidebar-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavClick('profile')}
        >
          {/* Profile card / avatar SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          My Profile
        </button>

        <button 
          className={`sidebar-nav-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => handleNavClick('insights')}
        >
          {/* Math Score / Upgrade index indicator icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="12" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
          Insights
        </button>

        <button 
          className={`sidebar-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => handleNavClick('analytics')}
        >
          {/* Plant Sprout / Analytics SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20V10" />
            <path d="M18 20V4" />
            <path d="M6 20v-4" />
          </svg>
          Analytics
        </button>
      </nav>

      <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1 }}>
          <div className="profile-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" x2="6" y1="2" y2="4" />
              <line x1="10" x2="10" y1="2" y2="4" />
              <line x1="14" x2="14" y1="2" y2="4" />
            </svg>
          </div>
          <div className="profile-info">
            <span className="profile-name">Cristine</span>
            <span className="profile-role">Productivity</span>
          </div>
        </div>
        
        {onLogout && (
          <button 
            onClick={onLogout} 
            title="Lock Dashboard"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ochre)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;