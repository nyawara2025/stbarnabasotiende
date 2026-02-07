import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, markBroadcastRead } from '../utils/apiClient';

const BroadcastDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();
  
  const broadcast = location.state?.broadcast;

  React.useEffect(() => {
    if (broadcast && !broadcast.read_status) {
      markBroadcastRead(broadcast.id).catch(console.error);
    }
  }, [broadcast]);

  if (!broadcast) {
    return (
      <div style={{ 
        padding: '16px', 
        textAlign: 'center', 
        color: '#6B7280',
        paddingTop: '60px'
      }}>
        <p>Update not found</p>
        <button 
          onClick={() => navigate('/broadcasts')}
          style={{
            marginTop: '16px',
            padding: '12px 24px',
            background: '#E31C23',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Back to Updates
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return '#EF4444';
      case 'Important': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Finance': '#10B981',
      'Welfare': '#E31C23',
      'Meeting': '#3B82F6',
      'General': '#8B5CF6',
      'Event': '#EC4899'
    };
    return colors[category] || '#6B7280';
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      {/* Header */}
      <button
        onClick={() => navigate('/broadcasts')}
        style={{
          background: 'none',
          border: 'none',
          color: '#E31C23',
          cursor: 'pointer',
          fontSize: '0.875rem',
          marginBottom: '16px',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        ← Back to Updates
      </button>

      {/* Category & Priority */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <span style={{
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '0.8rem',
          fontWeight: 600,
          background: `${getCategoryColor(broadcast.category)}15`,
          color: getCategoryColor(broadcast.category)
        }}>
          {broadcast.category}
        </span>
        <span style={{
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '0.8rem',
          fontWeight: 600,
          background: `${getPriorityColor(broadcast.priority)}15`,
          color: getPriorityColor(broadcast.priority)
        }}>
          {broadcast.priority}
        </span>
      </div>

      {/* Title */}
      <h1 style={{ 
        margin: '0 0 16px', 
        fontSize: '1.5rem', 
        fontWeight: 700,
        color: '#1F2937',
        lineHeight: 1.3
      }}>
        {broadcast.title}
      </h1>

      {/* Date */}
      <p style={{ 
        margin: '0 0 24px', 
        fontSize: '0.875rem', 
        color: '#9CA3AF'
      }}>
        Posted on {formatDate(broadcast.created_at)}
      </p>

      {/* Divider */}
      <div style={{ 
        height: '1px', 
        background: '#e5e7eb', 
        marginBottom: '24px' 
      }} />

      {/* Content */}
      <div style={{ 
        fontSize: '1rem', 
        color: '#374151',
        lineHeight: 1.8,
        whiteSpace: 'pre-wrap'
      }}>
        {broadcast.content}
      </div>

      {/* Footer Actions */}
      <div style={{ 
        marginTop: '32px',
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <p style={{ 
          margin: 0, 
          fontSize: '0.875rem', 
          color: '#6B7280',
          textAlign: 'center'
        }}>
          Have questions about this update?
        </p>
        <button
          onClick={() => navigate('/chat')}
          style={{
            width: '100%',
            padding: '14px',
            background: '#E31C23',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          💬 Contact Support
        </button>
      </div>
    </div>
  );
};

export default BroadcastDetail;
