import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, clearAuthData, updateProfile } from '../utils/apiClient';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

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
    try {
      await updateProfile(formData);
      setUser(formData);
      localStorage.setItem('carekenya_welfare_current_user', JSON.stringify(formData));
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
          borderTopColor: '#E31C23',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '12px'
        }} />
        <p>Loading profile...</p>
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
            color: '#E31C23',
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

      {/* Profile Card */}
      <div style={{
        background: 'linear-gradient(135deg, #E31C23 0%, #991b1b 100%)',
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
          color: '#E31C23'
        }}>
          {user?.first_name?.charAt(0) || 'M'}
        </div>
        <h2 style={{ margin: '0 0 4px', fontSize: '1.5rem' }}>
          {user?.full_name || user?.first_name || 'Member'}
        </h2>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
          {user?.role || 'Member'} • Care Kenya Welfare
        </p>
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
            style={{
              padding: '8px 16px',
              background: editing ? '#10B981' : '#f3f4f6',
              color: editing ? 'white' : '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            {editing ? 'Save' : 'Edit'}
          </button>
        </div>

        {/* Info Fields */}
        {[
          { label: 'Full Name', key: 'full_name', icon: '👤' },
          { label: 'Phone', key: 'phone', icon: '📱' },
          { label: 'Email', key: 'email', icon: '📧' },
          { label: 'Member ID', key: 'member_id', icon: '🪪' },
          { label: 'Role', key: 'role', icon: '⭐' },
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
            {editing && field.key !== 'role' ? (
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
          { label: '📋 Meeting Notes', route: '/meeting-notes' },
          { label: '📢 Updates', route: '/broadcasts' },
          { label: '📋 Notices', route: '/notices' },
          { label: '💬 My Inquiries', route: '/my-inquiries' },
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
        
        {/* Admin Link - Chat Dashboard */}
        {(user?.role === 'shop_admin' || user?.role === 'admin' || user?.role === 'treasurer' || user?.role === 'secretary') && (
          <div
            onClick={() => navigate('/chat-admin')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              cursor: 'pointer',
              color: '#E31C23',
              fontWeight: 500
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>
              💬 Chat Dashboard (Admin)
            </span>
            <span style={{ color: '#E31C23' }}>→</span>
          </div>
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
