import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/apiClient';
import { ConfigContext } from '../App';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const config = useContext(ConfigContext);
  
  const [phone, setPhone] = useState('');
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  // Get config values with fallbacks
  const orgName = config?.identity?.name || 'Care Kenya Welfare';
  const loginPrompt = config?.labels?.loginPrompt || 'Enter your details to access the portal';
  const phoneLabel = config?.labels?.phoneLabel || 'Phone Number';
  const memberIdLabel = config?.labels?.memberIdLabel || 'Member ID';
  const signInButton = config?.labels?.signIn || 'Sign In';
  const signingInText = config?.labels?.signingIn || 'Signing in...';
  const primaryColor = config?.theme?.colors?.primary || '#E31C23';
  const secondaryColor = config?.theme?.colors?.secondary || '#1F2937';
  const requireMemberId = config?.modules?.auth?.requireMemberId || false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(phone, memberId);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '2rem'
          }}>
            🤝
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '1.5rem', color: '#1F2937' }}>
            {orgName}
          </h1>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
            {loginPrompt}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              color: '#dc2626',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#374151'
            }}>
              {phoneLabel}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+2547XXXXXXXX"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
            />
          </div>

          {requireMemberId && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}>
                {memberIdLabel}
              </label>
              <input
                type="text"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                placeholder="e.g., MEM-001"
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: primaryColor,
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s ease'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                {signingInText}
              </span>
            ) : (
              signInButton
            )}
          </button>
        </form>
      </div>

      <p style={{
        marginTop: '24px',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '0.875rem',
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        {orgName}<br />
        Staff Welfare & Mutual Support Platform
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input:focus {
          border-color: ${primaryColor} !important;
        }
      `}</style>
    </div>
  );
};

export default Login;
