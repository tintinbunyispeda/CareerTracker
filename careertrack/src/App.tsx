import { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Applications from './components/Applications';
import Analytics from './components/Analytics';
import MyProfile from './components/MyProfile';
import AIAnalyzer from './components/AIAnalyzer';
import Insights from './components/Insights';
import type { JobApplication, UserProfile } from './types';
import { initialApplications, mockProfile } from './data/mockData';

function App() {
  // State for active tab/page view
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights'>('dashboard');
  
  // State for applications list
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);

  // State for user resume profile
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  
  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // CRUD Operations
  const handleAddApplication = (newApp: Omit<JobApplication, 'id'>) => {
    const createdApp: JobApplication = {
      ...newApp,
      id: Date.now().toString() // unique simple timestamp id
    };
    setApplications((prev) => [createdApp, ...prev]);
  };

  const handleEditApplication = (updatedApp: JobApplication) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );
  };

  const handleDeleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            applications={applications} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        );
      case 'applications':
        return (
          <Applications
            applications={applications}
            onAdd={handleAddApplication}
            onEdit={handleEditApplication}
            onDelete={handleDeleteApplication}
          />
        );
      case 'analyzer':
        return (
          <AIAnalyzer 
            profile={profile}
            onSaveApplication={handleAddApplication}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'profile':
        return (
          <MyProfile 
            profile={profile}
            onUpdateProfile={setProfile}
          />
        );
      case 'insights':
        return (
          <Insights 
            applications={applications}
            profile={profile}
          />
        );
      case 'analytics':
        return <Analytics applications={applications} />;
      default:
        return (
          <Dashboard 
            applications={applications} 
            onNavigate={(tab) => setActiveTab(tab)} 
          />
        );
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Top Navigation Header */}
      <header className="mobile-nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="sidebar-logo-icon" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22V12" />
              <path d="M12 12c0-2.8-2.2-5-5-5S2 9.2 2 12h10z" />
              <path d="M12 12c0-2.8 2.2-5 5-5s5 2.2 5 5H12z" />
            </svg>
          </div>
          <span className="sidebar-logo-text" style={{ fontSize: '1.1rem' }}>CareerTrack</span>
        </div>
        <button 
          className="btn-icon-only" 
          aria-label="Toggle menu"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          {isMobileSidebarOpen ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" x2="6" y1="6" y2="18" />
              <line x1="6" x2="18" y1="6" y2="18" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          )}
        </button>
      </header>

      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Page Workspace */}
      <main className="main-content">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;