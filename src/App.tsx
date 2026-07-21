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
import { supabase } from './utils/supabase';

const API_BASE = 'http://localhost:8000/api';

// ==========================================
// Supabase Login Lock Screen Component
// ==========================================
interface LoginProps {
  onAuthenticate: () => void;
}

const SupabaseLoginScreen: React.FC<LoginProps> = ({ onAuthenticate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('Check your email for the confirmation link.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          onAuthenticate();
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eaf2eb 0%, #f7f3ec 100%)',
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '1.5rem',
      boxSizing: 'border-box'
    }}>
      <div className="card" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(45, 51, 47, 0.08)',
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        border: '1px solid var(--color-border)',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
          <img 
            src="/logo.png" 
            alt="CareerTrack Logo" 
            style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '12px', 
              objectFit: 'cover',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }} 
          />
        </div>
        
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>
          Welcome to CareerTrack
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 1.75rem', lineHeight: '1.4' }}>
          {isSignUp ? 'Create a new account to get started.' : 'Sign in to access your Career Portfolio dashboard.'}
        </p>

        <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p style={{ color: error.includes('Check your email') ? 'var(--sage-green)' : 'var(--color-rejected)', fontSize: '0.8rem', margin: '0', fontWeight: 'bold' }}>
              {error.includes('Check your email') ? '✅ ' : '⚠️ '} {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontWeight: 600, marginTop: '0.5rem' }}>
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-secondary)',
              fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </form>
      </div>
    </div>
  );
};

const defaultEmptyProfile: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  website: '',
  resumeName: '',
  resumeStatus: '',
  skills: [],
  education: [],
  experience: [],
  projects: []
};

function App() {
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthenticated(!!session);
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthenticated(!!session);
      setIsInitializing(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // State for active tab/page view
  const [activeTab, setActiveTab] = useState<'dashboard' | 'applications' | 'analytics' | 'analyzer' | 'profile' | 'insights'>('dashboard');
  
  // State for applications list
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // State for user resume profile
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ==========================================
  // Hybrid Initial Data Loading Effect
  // ==========================================
  useEffect(() => {
    if (!session) return;
    
    const loadInitialData = async () => {
      // 1. Fetch from FastAPI Backend
      try {
        const token = session.access_token;
        const headers = { 'Authorization': `Bearer ${token}` };
        
        console.log('Attempting to fetch applications from backend...');
        const appsRes = await fetch(`${API_BASE}/applications`, { headers });
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (Array.isArray(appsData)) {
            setApplications(appsData);
            console.log('Successfully loaded applications from backend.');
          }
        }
      } catch (err) {
        console.warn('Backend API applications offline.', err);
      }

      try {
        const token = session.access_token;
        const headers = { 'Authorization': `Bearer ${token}` };
        
        console.log('Attempting to fetch profile from backend...');
        const profileRes = await fetch(`${API_BASE}/profile`, { headers });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData && profileData.id) {
            setProfile(profileData);
            console.log('Successfully loaded profile from backend.');
          }
        } else if (profileRes.status === 404) {
          setProfile(null);
        }
      } catch (err) {
        console.warn('Backend API profile offline.', err);
      }
    };

    loadInitialData();
  }, [session]);

  // ==========================================
  // CRUD API Handlers
  // ==========================================
  
  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
  };
  
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
            profile={profile || defaultEmptyProfile}
            onAdd={handleAddApplication}
            onEdit={handleEditApplication}
            onDelete={handleDeleteApplication}
          />
        );
      case 'analyzer':
        return (
          <AIAnalyzer 
            profile={profile || defaultEmptyProfile}
            onSaveApplication={handleAddApplication}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'profile':
        return (
          <MyProfile 
            profile={profile || defaultEmptyProfile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'insights':
        return (
          <Insights 
            applications={applications}
            profile={profile || defaultEmptyProfile}
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

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-primary)' }}>
        <div className="loader-spinner"></div>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '1rem', fontWeight: 600 }}>Initializing CareerTrack...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SupabaseLoginScreen onAuthenticate={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-container">
      {/* Mobile Top Navigation Header */}
      <header className="mobile-nav-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img 
            src="/logo.png" 
            alt="CareerTrack Logo" 
            style={{ 
              width: '28px', 
              height: '28px', 
              borderRadius: '6px', 
              objectFit: 'cover' 
            }} 
          />
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
        onLogout={handleLogout}
      />

      {/* Main Page Workspace */}
      <main className="main-content">
        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;