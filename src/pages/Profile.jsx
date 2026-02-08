import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, clearAuthData, updateProfile, STORAGE_KEYS } from '../utils/apiClient';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const userData = getStoredUser();
    if (userData) {
      setUser(userData);
      setFormData(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveMessage('');
    try {
      await updateProfile(formData);
      setUser(formData);
      // Use the correct storage key from apiClient
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(formData));
      setEditing(false);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        color: '#6B7280'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#7C3AED',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '12px'
        }} />
        <p>Loading profile...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#7C3AED',
            cursor: 'pointer',
            fontSize: '0.875rem',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ← Back
        </button>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.5rem', 
          fontWeight: 700,
          color: '#1F2937'
        }}>
          👤 Profile
        </h1>
        <div style={{ width: '60px' }} />
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '8px',
          background: saveMessage.includes('success') ? '#D1FAE5' : '#FEE2E2',
          color: saveMessage.includes('success') ? '#065F46' : '#991B1B',
          fontSize: '0.875rem',
          textAlign: 'center'
        }}>
          {saveMessage}
        </div>
      )}

      {/* Profile Card */}
      <div style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
        borderRadius: '20px',
        padding: '32px',
        color: 'white',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          fontSize: '2rem',
          fontWeight: 700,
          color: '#7C3AED'
        }}>
          {user?.first_name?.charAt(0) || 'M'}
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem' }}>
          {user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Member'}
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
          {user?.role || 'Member'} • St. Barnabas Church
        </p>
        {user?.zone_name && (
          <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: '0.8rem' }}>
            {user.zone_name} Zone {user?.ministry_name && `• ${user.ministry_name}`}
          </p>
        )}
      </div>

      {/* Profile Info */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
            Personal Information
          </h3>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: loading ? '#9CA3AF' : editing ? '#10B981' : '#f3f4f6',
              color: editing ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Saving...' : editing ? 'Save' : 'Edit'}
          </button>
        </div>

        {/* Info Fields */}
        {[
          { label: 'Full Name', key: 'full_name', icon: '👤', editable: true },
          { label: 'Phone', key: 'phone', icon: '📱', editable: true },
          { label: 'Email', key: 'email', icon: '📧', editable: true },
          { label: 'Member ID', key: 'member_id', icon: '🪪', editable: false },
          { label: 'Zone', key: 'zone_name', icon: '📍', editable: false },
          { label: 'Ministry', key: 'ministry_name', icon: '⛪', editable: false },
          { label: 'Role', key: 'role', icon: '⭐', editable: false },
        ].map((field) => (
          <div key={field.key} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.25rem' }}>{field.icon}</span>
              <span style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                {field.label}
              </span>
            </div>
            {editing && field.editable ? (
              <input
                type="text"
                name={field.key}
                value={formData[field.key] || ''}
                onChange={handleChange}
                style={{
                  textAlign: 'right',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '0.875rem',
                  width: '150px'
                }}
              />
            ) : (
              <span style={{ fontWeight: 500, color: '#1F2937' }}>
                {user[field.key] || '-'}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid #e5e7eb',
        marginBottom: '24px'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 600 }}>
          Quick Links
        </h3>
        {[
          { label: '🎵 Sermons', route: '/sermons' },
          { label: '📅 Meetings', route: '/meetings' },
          { label: '🙏 Prayer Requests', route: '/prayer-requests' },
          { label: '📸 Gallery', route: '/gallery' },
          { label: '📢 Updates', route: '/broadcasts' },
          { label: '💰 My Contributions', route: '/finance' },
        ].map((link) => (
          <div
            key={link.route}
            onClick={() => navigate(link.route)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid #f3f4f6',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: '#374151', fontSize: '0.9rem' }}>
              {link.label}
            </span>
            <span style={{ color: '#9CA3AF' }}>→</span>
          </div>
        ))}
        
        {/* Admin/Treasurer Links */}
        {(user?.role === 'admin' || user?.role === 'treasurer' || user?.role === 'secretary' || user?.is_treasurer) && (
          <>
            <div style={{ 
              marginTop: '16px', 
              paddingTop: '16px', 
              borderTop: '2px solid #e5e7eb',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
                ADMIN FUNCTIONS
              </span>
            </div>
            <div
              onClick={() => navigate('/chat-admin')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                cursor: 'pointer',
                color: '#7C3AED',
                fontWeight: 500,
                borderBottom: '1px solid #f3f4f6'
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>
                💬 Chat Dashboard
              </span>
              <span style={{ color: '#7C3AED' }}>→</span>
            </div>
            <div
              onClick={() => navigate('/broadcast-admin')}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                cursor: 'pointer',
                color: '#7C3AED',
                fontWeight: 500
              }}
            >
              <span style={{ fontSize: '0.9rem' }}>
                📢 Send Broadcast
              </span>
              <span style={{ color: '#7C3AED' }}>→</span>
            </div>
          </>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '16px',
          background: 'white',
          color: '#EF4444',
          border: '1px solid #EF4444',
          borderRadius: '12px',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        🚪 Logout
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
