import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigContext } from '../App';
import { getStoredUser } from '../utils/apiClient';

const PrayerRequest = () => {
  const navigate = useNavigate();
  const config = useContext(ConfigContext);
  const user = getStoredUser();
  const primaryColor = config?.theme?.colors?.primary || '#7C3AED';
  
  const [formData, setFormData] = useState({
    category: '',
    request: '',
    isPrivate: true,
    isUrgent: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    'Health & Healing',
    'Family',
    'Financial',
    'Spiritual Growth',
    'Guidance & Direction',
    'Thanksgiving',
    'Bereavement',
    'Travel Mercies',
    'Employment',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.request) return;

    setSubmitting(true);
    // In production, send to API/Canon
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: '#D1FAE5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          marginBottom: '20px'
        }}>
          🙏
        </div>
        <h2 style={{ margin: '0 0 12px', fontSize: '1.5rem', color: '#1F2937' }}>
          Prayer Request Submitted
        </h2>
        <p style={{ margin: '0 0 24px', color: '#6B7280', maxWidth: '300px' }}>
          Your prayer request has been sent to Canon James Mwangi. The church will be praying with you.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            background: primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 32px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #EC4899 0%, #BE185D 100%)',
        borderRadius: '16px',
        padding: '20px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 700 }}>
          🙏 Prayer Request
        </h2>
        <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
          Submit your prayer request to the Church Canon. Your request will be treated with confidentiality and care.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Category */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1F2937', fontSize: '0.9rem' }}>
            Prayer Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              fontSize: '1rem',
              background: 'white'
            }}
            required
          >
            <option value="">Select a category...</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Request */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1F2937', fontSize: '0.9rem' }}>
            Your Prayer Request
          </label>
          <textarea
            value={formData.request}
            onChange={(e) => setFormData({ ...formData, request: e.target.value })}
            placeholder="Share your prayer request here. Be as detailed as you'd like..."
            rows={6}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              fontSize: '1rem',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            required
          />
        </div>

        {/* Options */}
        <div style={{ 
          background: '#F9FAFB', 
          borderRadius: '12px', 
          padding: '16px',
          marginBottom: '20px'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '12px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: primaryColor }}
            />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#1F2937', fontSize: '0.9rem' }}>Keep Private</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
                Only the Canon will see this request
              </p>
            </div>
          </label>

          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.isUrgent}
              onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
              style={{ width: '20px', height: '20px', accentColor: '#EF4444' }}
            />
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: '#1F2937', fontSize: '0.9rem' }}>Mark as Urgent</p>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
                Request requires immediate prayer attention
              </p>
            </div>
          </label>
        </div>

        {/* Your Info */}
        <div style={{
          background: '#F3F4F6',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '0.85rem',
          color: '#6B7280'
        }}>
          <p style={{ margin: 0 }}>
            Submitting as: <strong style={{ color: '#1F2937' }}>{user?.first_name} {user?.last_name}</strong>
          </p>
          <p style={{ margin: '4px 0 0' }}>
            Zone: <strong style={{ color: '#1F2937' }}>{user?.zone_name || 'Mt. Olive'}</strong>
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || !formData.category || !formData.request}
          style={{
            width: '100%',
            background: submitting ? '#9CA3AF' : primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {submitting ? (
            <>
              <span style={{
                width: '20px',
                height: '20px',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Submitting...
            </>
          ) : (
            <>🙏 Submit Prayer Request</>
          )}
        </button>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </form>

      {/* Scripture */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: '#EDE9FE',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#5B21B6', fontStyle: 'italic' }}>
          "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '0.8rem', color: '#7C3AED', fontWeight: 600 }}>
          - Philippians 4:6
        </p>
      </div>
    </div>
  );
};

export default PrayerRequest;
