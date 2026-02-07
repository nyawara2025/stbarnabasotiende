import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, clearAuthData, setConfig as storeConfigInApiClient } from './utils/apiClient';

// Page Imports
import Home from './pages/Home';
import Finance from './pages/Finance';
import MeetingNotes from './pages/MeetingNotes';
import Broadcasts from './pages/Broadcasts';
import BroadcastDetail from './pages/BroadcastDetail';
import BroadcastAdmin from './pages/BroadcastAdmin';
import Opinions from './pages/Opinions';
import Notices from './pages/Notices';
import Chat from './pages/Chat';
import ChatAdmin from './pages/ChatAdmin';
import Login from './pages/Login';
import Profile from './pages/Profile';

// New Church Pages
import ServiceOrder from './pages/ServiceOrder';
import Sermons from './pages/Sermons';
import PrayerRequest from './pages/PrayerRequest';
import Meetings from './pages/Meetings';
import Gallery from './pages/Gallery';

// Context for configuration
export const ConfigContext = createContext(null);

// Bottom Navigation Component
const BottomNav = () => {
  const config = useContext(ConfigContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!config?.navigation?.showBottomNav) return null;

  const navItems = ['home', 'sermons', 'finance', 'broadcasts', 'profile'];

  const getIcon = (item) => {
    const icons = {
      home: '🏠',
      sermons: '🎙️',
      finance: '💰',
      broadcasts: '📢',
      profile: '👤',
      meetings: '📅',
      gallery: '📸'
    };
    return icons[item] || '•';
  };

  const getLabel = (item) => {
    const labels = {
      home: 'Home',
      sermons: 'Sermons',
      finance: 'Giving',
      broadcasts: 'Updates',
      profile: 'Profile'
    };
    return labels[item] || item;
  };

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #e5e7eb',
      padding: '8px 0',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 1000,
      paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 0px))'
    }}>
      {navItems.map((item) => {
        const isActive = location.pathname === `/${item}` || 
                        (item === 'home' && location.pathname === '/');

        return (
          <button
            key={item}
            onClick={() => navigate(`/${item === 'home' ? '' : item}`)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 12px',
              color: isActive ? config?.theme?.colors?.primary || '#7C3AED' : '#64748b',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{getIcon(item)}</span>
            <span style={{ 
              fontSize: '0.625rem', 
              fontWeight: 500
            }}>
              {getLabel(item)}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

// Header Component - Hidden on Home page for St. Barnabas
const Header = () => {
  const config = useContext(ConfigContext);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  // Hide header on home page (has its own header)
  if (location.pathname === '/' || location.pathname === '/home') return null;

  const getTitle = () => {
    const path = location.pathname;
    if (path.includes('service-order')) return 'Order of Service';
    if (path.includes('sermons')) return 'Sermons';
    if (path.includes('prayer-request')) return 'Prayer Request';
    if (path.includes('meetings')) return 'Meetings';
    if (path.includes('gallery')) return 'Photo Gallery';
    if (path.includes('finance')) return 'My Giving';
    if (path.includes('meeting-notes')) return 'Meeting Notes';
    if (path.includes('broadcasts')) return 'Broadcasts';
    if (path.includes('opinions')) return 'Share Opinion';
    if (path.includes('notices')) return 'Notices';
    if (path.includes('profile')) return 'My Profile';
    if (path.includes('chat')) return 'Support';
    return config?.identity?.shortName || 'St. Barnabas';
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '12px 16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '1rem',
            color: '#64748b'
          }}
        >
          ←
        </button>
        <h1 style={{
          margin: 0,
          fontSize: '1rem',
          fontWeight: 600,
          color: config?.theme?.colors?.primary || '#7C3AED'
        }}>
          {getTitle()}
        </h1>
      </div>
    </header>
  );
};

// Loading Component
const Loading = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#F3F4F6'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #e5e7eb',
      borderTopColor: '#7C3AED',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <p style={{ marginTop: '16px', color: '#64748b' }}>Loading...</p>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Main Layout
const Layout = ({ children }) => {
  const config = useContext(ConfigContext);
  
  return (
    <div style={{
      minHeight: '100vh',
      background: config?.theme?.colors?.background || '#F3F4F6',
      paddingBottom: config?.navigation?.showBottomNav ? '80px' : '0'
    }}>
      <Header />
      <main>{children}</main>
      <BottomNav />
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const user = getStoredUser();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Logout Handler
const Logout = () => {
  clearAuthData();
  return <Navigate to="/login" replace />;
};

function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/config.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load config');
        return res.json();
      })
      .then((data) => {
        setConfig(data);
        storeConfigInApiClient(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading config:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Loading />;

  return (
    <ConfigContext.Provider value={config}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
        {/* Church Service Order */}
        <Route path="/service-order" element={<ProtectedRoute><ServiceOrder /></ProtectedRoute>} />
        <Route path="/service-order/:serviceId" element={<ProtectedRoute><ServiceOrder /></ProtectedRoute>} />
        
        {/* Sermons */}
        <Route path="/sermons" element={<ProtectedRoute><Sermons /></ProtectedRoute>} />
        
        {/* Prayer Requests */}
        <Route path="/prayer-request" element={<ProtectedRoute><PrayerRequest /></ProtectedRoute>} />
        
        {/* Meetings */}
        <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
        
        {/* Photo Gallery */}
        <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
        
        {/* Finance/Contributions */}
        <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
        
        {/* Meeting Notes */}
        <Route path="/meeting-notes" element={<ProtectedRoute><MeetingNotes /></ProtectedRoute>} />
        
        {/* Broadcasts */}
        <Route path="/broadcasts" element={<ProtectedRoute><Broadcasts /></ProtectedRoute>} />
        <Route path="/broadcast-detail" element={<ProtectedRoute><BroadcastDetail /></ProtectedRoute>} />
        <Route path="/broadcast-admin" element={<ProtectedRoute><BroadcastAdmin /></ProtectedRoute>} />
        
        {/* Opinions */}
        <Route path="/opinions" element={<ProtectedRoute><Opinions /></ProtectedRoute>} />
        
        {/* Notices */}
        <Route path="/notices" element={<ProtectedRoute><Notices /></ProtectedRoute>} />
        
        {/* Chat Support */}
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/chat-admin" element={<ProtectedRoute><ChatAdmin /></ProtectedRoute>} />
        
        {/* Profile */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ConfigContext.Provider>
  );
}

export default App;
