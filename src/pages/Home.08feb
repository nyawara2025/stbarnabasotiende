import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, getBroadcasts, getUnreadBroadcastsCount, getActiveShops } from '../utils/apiClient';
import { ConfigContext } from '../App';
import SokoniModal from '../components/SokoniModal';

const Home = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const config = useContext(ConfigContext);
  
  const [stats, setStats] = useState({
    balance: 3500,
    contributions: 500,
    events: 3,
    notices: 2
  });
  const [recentBroadcasts, setRecentBroadcasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sokoniOpen, setSokoniOpen] = useState(false);
  const [shops, setShops] = useState([]);

  // Get config values with fallbacks
  const title = config?.identity?.name || 'St. Barnabas Church';
  const shortName = config?.identity?.shortName || 'St. Barnabas';
  const primaryColor = config?.theme?.colors?.primary || '#7C3AED';
  const secondaryColor = config?.theme?.colors?.secondary || '#1F2937';
  const paymentName = config?.labels?.paymentName || 'Contributions';
  const broadcastsLabel = config?.labels?.broadcastsLabel || 'Broadcasts';
  const marketplaceLabel = config?.labels?.marketplaceLabel || 'Sokoni';
  const welcomeMessage = config?.labels?.welcomeMessage || `Welcome to ${title}`;
  const tagline = config?.branding?.tagline || 'Growing in Faith Together';
  const currency = config?.localization?.currency || 'KES';
  
  // Features
  const features = config?.features || {};
  const hasFinance = features.finance !== false;
  const hasMeetingNotes = features.meetingNotes !== false;
  const hasBroadcasts = features.broadcasts !== false;
  const hasAnnouncements = features.announcements !== false;
  const hasMarketplace = features.marketplace !== false;
  const hasEvents = features.events !== false;
  const hasSermons = features.sermons !== false;

  // Church specific data
  const services = config?.church?.services || [];
  const zones = config?.church?.zones || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        try {
          const broadcasts = await getBroadcasts();
          setRecentBroadcasts((broadcasts || []).slice(0, 3));
          const unread = await getUnreadBroadcastsCount();
          setUnreadCount(unread);
        } catch (e) {
          console.warn('Could not load broadcasts:', e);
        }
        setTimeout(() => {
          setLoading(false);
        }, 300);
      } catch (err) {
        console.error('Error loading home data:', err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return `${currency} ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
  };

  function openSokoni() {
    setSokoniOpen(true);
    try {
      getActiveShops().then(shopsData => {
        setShops(shopsData);
      }).catch(error => {
        console.error('Error fetching shops:', error);
        setShops([]);
      });
    } catch (error) {
      setShops([]);
    }
  }

  if (loading) {
    return (
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
          borderTopColor: primaryColor,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Quick Actions for Church
  const quickActions = [
    { id: 'sermons', label: 'Sermons', icon: '🎙️', color: '#7C3AED', route: '/sermons' },
    { id: 'prayer', label: 'Prayer Request', icon: '🙏', color: '#EC4899', route: '/prayer-request' },
    { id: 'finance', label: 'My Giving', icon: '💰', color: '#059669', route: '/finance' },
    { id: 'broadcasts', label: 'Broadcasts', icon: '📢', color: '#3B82F6', route: '/broadcasts', badge: unreadCount },
    { id: 'meetings', label: 'Meetings', icon: '📅', color: '#F59E0B', route: '/meetings' },
    { id: 'gallery', label: 'Photo Gallery', icon: '📸', color: '#06B6D4', route: '/gallery' },
    { id: 'opinions', label: 'Share Opinion', icon: '💬', color: '#8B5CF6', route: '/opinions' },
    { id: 'sokoni', label: 'Sokoni', icon: '🛒', color: '#10B981', isModal: true },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      {/* Hero Section with Church Background */}
      <div style={{
        background: `linear-gradient(135deg, rgba(124, 58, 237, 0.9) 0%, rgba(91, 33, 182, 0.95) 100%), url('/images/church-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '24px 16px 40px',
        borderRadius: '0 0 32px 32px',
        color: 'white',
        position: 'relative'
      }}>
        {/* Logo and Welcome */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <img 
            src="/logos/stbarnabas-logo.png" 
            alt="St. Barnabas" 
            style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'white', padding: '4px' }}
          />
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
              {shortName}
            </h1>
            <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.9 }}>
              Anglican Church, Otiende
            </p>
          </div>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            Hello, {user?.first_name || 'Member'} 👋
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
            {tagline}
          </p>
        </div>

        {/* Sunday Services */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          borderRadius: '16px',
          padding: '12px 16px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ⛪ Sunday Services - Tap for Order of Service
          </p>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {services.map((service, idx) => (
              <div 
                key={idx} 
                onClick={() => navigate(`/service-order/${service.id}`)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  minWidth: '120px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600 }}>{service.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.65rem', opacity: 0.9 }}>{service.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '16px', marginTop: '-20px' }}>
        {/* Quick Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div onClick={() => navigate('/finance')} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '14px 10px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>💰</div>
            <p style={{ margin: 0, fontSize: '0.65rem', color: '#6B7280' }}>My Giving</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
              {formatCurrency(stats.balance)}
            </p>
          </div>

          <div onClick={() => navigate('/meetings')} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '14px 10px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            cursor: 'pointer'
          }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>📅</div>
            <p style={{ margin: 0, fontSize: '0.65rem', color: '#6B7280' }}>Meetings</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>
              {stats.events} upcoming
            </p>
          </div>

          <div onClick={() => navigate('/broadcasts')} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '14px 10px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>📢</div>
            <p style={{ margin: 0, fontSize: '0.65rem', color: '#6B7280' }}>Broadcasts</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 700, color: '#1F2937' }}>
              {stats.notices} new
            </p>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: '#EF4444',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '0.6rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>{unreadCount}</span>
            )}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.9rem', fontWeight: 600, color: '#1F2937' }}>
            Quick Actions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px'
          }}>
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => action.isModal ? openSokoni() : navigate(action.route)}
                style={{
                  background: 'white',
                  borderRadius: '14px',
                  padding: '14px 8px',
                  textAlign: 'center',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                <div style={{ 
                  fontSize: '1.5rem', 
                  marginBottom: '6px',
                  width: '40px',
                  height: '40px',
                  background: `${action.color}15`,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 6px'
                }}>
                  {action.icon}
                </div>
                <p style={{ margin: 0, fontSize: '0.65rem', fontWeight: 500, color: '#374151', lineHeight: 1.2 }}>
                  {action.label}
                </p>
                {action.badge > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: '#EF4444',
                    color: 'white',
                    borderRadius: '50%',
                    width: '16px',
                    height: '16px',
                    fontSize: '0.55rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>{action.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Member Info Card */}
        {user && (
          <div style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            borderRadius: '16px',
            padding: '16px',
            color: 'white',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 600 }}>
              👤 My Membership
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Zone</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
                  {user.zone_name || 'Mt. Olive'}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Ministry</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
                  {user.ministry_name || 'Youth'}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Service</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
                  {user.preferred_service || 'English'}
                </p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.7rem', opacity: 0.8 }}>Member Since</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.85rem', fontWeight: 600 }}>
                  {user.member_since || '2020'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Broadcasts */}
        {hasBroadcasts && recentBroadcasts.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1F2937' }}>
                📢 Recent Broadcasts
              </h3>
              <button onClick={() => navigate('/broadcasts')} style={{
                background: 'none',
                border: 'none',
                color: primaryColor,
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500
              }}>
                View All →
              </button>
            </div>
            {recentBroadcasts.map((broadcast) => (
              <div key={broadcast.id} onClick={() => navigate('/broadcasts')} style={{
                padding: '10px',
                background: '#F9FAFB',
                borderRadius: '10px',
                marginBottom: '8px',
                cursor: 'pointer'
              }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '0.85rem', fontWeight: 600, color: '#1F2937' }}>
                  {broadcast.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>
                  {broadcast.content?.substring(0, 60)}...
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '20px 0 80px', color: '#9CA3AF', fontSize: '0.7rem' }}>
          <p style={{ margin: 0 }}>© 2024 {shortName} - Otiende, Langata</p>
          <p style={{ margin: '4px 0 0' }}>{tagline}</p>
        </div>
      </div>

      {/* Sokoni Modal */}
      <SokoniModal isOpen={sokoniOpen} onClose={() => setSokoniOpen(false)} shops={shops} />
    </div>
  );
};

export default Home;
