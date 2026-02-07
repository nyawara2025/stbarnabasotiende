import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../utils/apiClient';

const Notices = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setTimeout(() => {
        setNotices([
          {
            id: 1,
            title: 'Annual General Meeting Notice',
            content: 'Notice is hereby given that the Annual General Meeting of Care Kenya Staff Welfare Scheme will be held on Saturday, February 15th, 2025 at 10:00 AM at the designated venue. All members are requested to attend.',
            priority: 'Urgent',
            expiry_date: '2025-02-15',
            created_at: '2025-01-05T09:00:00Z'
          },
          {
            id: 2,
            title: 'Contribution Deadline Reminder',
            content: 'This is a friendly reminder that all monthly contributions for January 2025 should be paid by January 15th. Late payments may affect eligibility for welfare benefits.',
            priority: 'Important',
            expiry_date: '2025-01-15',
            created_at: '2025-01-02T10:00:00Z'
          },
          {
            id: 3,
            title: 'Updated Welfare Guidelines',
            content: 'The welfare guidelines have been updated as of January 1st, 2025. Members are advised to review the new policies in the Meeting Notes section.',
            priority: 'Normal',
            expiry_date: null,
            created_at: '2024-12-28T14:00:00Z'
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading notices:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Urgent':
        return { background: '#EF4444', color: 'white' };
      case 'Important':
        return { background: '#F59E0B', color: 'white' };
      default:
        return { background: '#3B82F6', color: 'white' };
    }
  };

  if (loading) {
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
        <p>Loading notices...</p>
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
          📋 Notices
        </h1>
        <p style={{ 
          margin: '4px 0 0', 
          color: '#6B7280',
          fontSize: '0.875rem'
        }}>
          Official announcements from the welfare committee
        </p>
      </div>

      {/* Notices List */}
      {notices.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          color: '#6B7280',
          textAlign: 'center',
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
          <p>No notices available</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notices.map((notice) => (
            <div
              key={notice.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                borderLeft: '4px solid #E31C23'
              }}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    ...getPriorityStyle(notice.priority)
                  }}>
                    {notice.priority}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                  {formatDate(notice.created_at)}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ 
                margin: '0 0 12px', 
                fontSize: '1.1rem', 
                fontWeight: 600,
                color: '#1F2937'
              }}>
                {notice.title}
              </h3>

              {/* Content */}
              <p style={{ 
                margin: '0 0 16px', 
                fontSize: '0.9rem', 
                color: '#6B7280',
                lineHeight: 1.6
              }}>
                {notice.content}
              </p>

              {/* Expiry */}
              {notice.expiry_date && (
                <div style={{
                  padding: '8px 12px',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  display: 'inline-block'
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#92400e' }}>
                    ⏰ Valid until {formatDate(notice.expiry_date)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Notices;
