import { useState, useEffect } from 'react';
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

const API_BASE = 'http://localhost:8000/api';

function App() {
  // State for active tab/page view
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights'>('dashboard');
  
  // State for applications list (starts with empty array, loads from DB or local storage)
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // State for user resume profile (starts with mockProfile, loaded from DB or local storage)
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  
  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ==========================================
  // Hybrid Initial Data Loading Effect
  // ==========================================
  useEffect(() => {
    const loadInitialData = async () => {
      let appsLoaded = false;
      let profileLoaded = false;

      // 1. Try to fetch from FastAPI Backend (Supabase or Backend RAM Cache)
      try {
        console.log('Attempting to fetch applications from backend...');
        const appsRes = await fetch(`${API_BASE}/applications`);
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (Array.isArray(appsData)) {
            setApplications(appsData);
            appsLoaded = true;
            console.log('Successfully loaded applications from backend.');
          }
        }
      } catch (err) {
        console.warn('Backend API applications offline. Falling back to local storage caching.', err);
      }

      try {
        console.log('Attempting to fetch profile from backend...');
        const profileRes = await fetch(`${API_BASE}/profile`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData && profileData.skills) {
            setProfile(profileData);
            profileLoaded = true;
            console.log('Successfully loaded profile from backend.');
          }
        }
      } catch (err) {
        console.warn('Backend API profile offline. Falling back to local storage caching.', err);
      }

      // 2. Fallback to LocalStorage if backend requests failed
      if (!appsLoaded) {
        const cachedApps = localStorage.getItem('careertrack_applications');
        if (cachedApps) {
          setApplications(JSON.parse(cachedApps));
        } else {
          setApplications(initialApplications);
        }
      }

      if (!profileLoaded) {
        const cachedProfile = localStorage.getItem('careertrack_profile');
        if (cachedProfile) {
          setProfile(JSON.parse(cachedProfile));
        } else {
          setProfile(mockProfile);
        }
      }
    };

    loadInitialData();
  }, []);

  // ==========================================
  // Local Backup Syncing Effects
  // ==========================================
  useEffect(() => {
    if (applications.length > 0) {
      localStorage.setItem('careertrack_applications', JSON.stringify(applications));
    }
  }, [applications]);

  useEffect(() => {
    if (profile && profile.skills.length > 0) {
      localStorage.setItem('careertrack_profile', JSON.stringify(profile));
    }
  }, [profile]);

  // ==========================================
  // CRUD API & State Handlers
  // ==========================================
  
  const handleAddApplication = async (newApp: Omit<JobApplication, 'id'>) => {
    const createdId = Date.now().toString();
    const createdApp: JobApplication = {
      ...newApp,
      id: createdId
    };

    // Staging local update first (Optimistic UI update)
    setApplications((prev) => [createdApp, ...prev]);

    // Send background sync request to FastAPI
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdApp),
      });
      if (!res.ok) {
        console.error('Failed to sync new application to backend.');
      }
    } catch (err) {
      console.warn('Backend offline. Application saved locally to browser cache.', err);
    }
  };

  const handleEditApplication = async (updatedApp: JobApplication) => {
    // Optimistic local state update
    setApplications((prev) =>
      prev.map((app) => (app.id === updatedApp.id ? updatedApp : app))
    );

    // Send background sync request to FastAPI
    try {
      const res = await fetch(`${API_BASE}/applications/${updatedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedApp),
      });
      if (!res.ok) {
        console.error('Failed to sync updated application to backend.');
      }
    } catch (err) {
      console.warn('Backend offline. Application edits saved locally.', err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    // Optimistic local state update
    setApplications((prev) => prev.filter((app) => app.id !== id));

    // Send background sync request to FastAPI
    try {
      const res = await fetch(`${API_BASE}/applications/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        console.error('Failed to delete application from backend.');
      }
    } catch (err) {
      console.warn('Backend offline. Deletion queued locally.', err);
    }
  };

  const handleUpdateProfile = async (updatedProfile: UserProfile) => {
    // Optimistic local state update
    setProfile(updatedProfile);

    // Send background sync request to FastAPI
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });
      if (!res.ok) {
        console.error('Failed to sync updated profile to backend.');
      }
    } catch (err) {
      console.warn('Backend offline. Profile edits saved locally.', err);
    }
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
            profile={profile}
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
            onUpdateProfile={handleUpdateProfile}
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