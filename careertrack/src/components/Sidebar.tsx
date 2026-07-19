import React from 'react';

interface SidebarProps {
  activeTab: 'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights';
  setActiveTab: (tab: 'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights') => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const handleNavClick = (tab: 'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights') => {
    setActiveTab(tab);
    onClose(); // Close sidebar on mobile after navigating
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo-icon" aria-hidden="true">
          {/* Custom SVG logo: a little seedling/sprout representing career growth */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22V12" />
            <path d="M12 12c0-2.8-2.2-5-5-5S2 9.2 2 12h10z" />
            <path d="M12 12c0-2.8 2.2-5 5-5s5 2.2 5 5H12z" />
            <path d="M12 8c0-2.2 1.8-4 4-4s4 1.8 4 4H12z" />
          </svg>
        </div>
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
          {/* Microscope / Scan SVG Icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <path d="M11 8v6M8 11h6" />
          </svg>
          AI Analyzer
        </button>

        <button 
          className={`sidebar-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleNavClick('profile')}
        >
          {/* User profile SVG icon */}
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
          {/* Lightbulb / Insights SVG icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <line x1="9" x2="15" y1="18" y2="18" />
            <line x1="10" x2="14" y1="22" y2="22" />
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

      <div className="sidebar-footer">
        <div className="profile-avatar">
          {/* Cozy Tea Mug SVG */}
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
          <span className="profile-role">Productivity Mode</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;