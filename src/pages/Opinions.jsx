import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../utils/apiClient';

const Opinions = () => {
  const navigate = useNavigate();
  const [opinion, setOpinion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = getStoredUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!opinion.trim()) return;

    setLoading(true);
    
    // Simulate submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setOpinion('');
    }, 1000);
  };

  if (submitted) {
    return (
      <div style={{ padding: '16px', paddingBottom: '80px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✓</div>
          <h2 style={{ margin: '0 0 8px', color: '#1F2937' }}>Thank You!</h2>
          <p style={{ color: '#6B7280', marginBottom: '24px' }}>
            Your feedback has been submitted successfully.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            style={{
              padding: '12px 24px',
              background: '#E31C23',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: '#E31C23',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginBottom: '12px',
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
          🗣️ Share Your Opinion
        </h1>
        <p style={{ 
          margin: '4px 0 0', 
          color: '#6B7280',
          fontSize: '0.875rem'
        }}>
          Help us improve the welfare scheme
        </p>
      </div>

      {/* Info Card */}
      <div style={{
        background: 'linear-gradient(135deg, #E31C23 0%, #991b1b 100%)',
        borderRadius: '16px',
        padding: '20px',
        color: 'white',
        marginBottom: '24px'
      }}>
        <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6 }}>
          Your feedback is valuable. Share your thoughts, suggestions, or concerns about the welfare scheme. All submissions are anonymous unless you choose to include your name.
        </p>
      </div>

      {/* Opinion Form */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            color: '#374151',
            fontSize: '0.9rem'
          }}>
            Your Feedback *
          </label>
          <textarea
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
            placeholder="Share your thoughts, suggestions, or concerns..."
            rows={6}
            style={{
              width: '100%',
              padding: '14px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              lineHeight: '1.5'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '8px'
          }}>
            <span></span>
            <span style={{
              color: opinion.length > 1000 ? '#EF4444' : '#6B7280',
              fontSize: '0.75rem'
            }}>
              {opinion.length}/1000 characters
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !opinion.trim()}
          style={{
            width: '100%',
            padding: '16px',
            background: (loading || !opinion.trim()) ? '#9CA3AF' : '#E31C23',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: (loading || !opinion.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      {/* Previous Submissions */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ 
          margin: '0 0 16px', 
          fontSize: '1rem', 
          fontWeight: 600,
          color: '#1F2937'
        }}>
          Recent Feedback
        </h3>
        <p style={{ 
          color: '#6B7280', 
          fontSize: '0.875rem',
          textAlign: 'center',
          padding: '20px 0'
        }}>
          No previous submissions
        </p>
      </div>
    </div>
  );
};

export default Opinions;
