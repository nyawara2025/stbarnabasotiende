import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBroadcasts, getUnreadBroadcastsCount, markBroadcastRead, getStoredUser } from '../utils/apiClient';

const Broadcasts = () => {
  const navigate = useNavigate();
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const userData = getStoredUser();
    setUser(userData);
    loadBroadcasts();
  }, []);

  const loadBroadcasts = async () => {
    try {
      setLoading(true);
      const data = await getBroadcasts();
      setBroadcasts(data || []);
    } catch (error) {
      console.error('Error loading broadcasts:', error);
      setBroadcasts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
      'Event': '#EC4899',
      'Announcement': '#6366F1',
      'Prayer': '#14B8A6'
    };
    return colors[category] || '#6B7280';
  };

  const handleBroadcastClick = async (broadcast) => {
    // Mark as read if not already
    if (!broadcast.read_status) {
      try {
        await markBroadcastRead(broadcast.id);
        // Update local state
        setBroadcasts(prev => prev.map(b => 
          b.id === broadcast.id ? { ...b, read_status: true } : b
        ));
      } catch (error) {
        console.error('Error marking broadcast as read:', error);
      }
    }
    navigate('/broadcast-detail', { state: { broadcast } });
  };

  const filteredBroadcasts = filter === 'all' 
    ? broadcasts 
    : broadcasts.filter(b => b.category === filter);

  // Get unique categories from broadcasts
  const categories = ['all', ...new Set(broadcasts.map(b => b.category).filter(Boolean))];

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
        <p>Loading updates...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
          📢 Updates
        </h1>
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
        scrollbarWidth: 'none'
      }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: filter === cat ? '#E31C23' : 'white',
              color: filter === cat ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              border: filter === cat ? 'none' : '1px solid #e5e7eb'
            }}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Broadcasts List */}
      {filteredBroadcasts.length === 0 ? (
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
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📢</div>
          <p style={{ margin: 0 }}>No updates yet</p>
          <p style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>
            Check back later for announcements
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredBroadcasts.map((broadcast) => (
            <div
              key={broadcast.id}
              onClick={() => handleBroadcastClick(broadcast)}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                opacity: broadcast.read_status ? 0.7 : 1
              }}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: `${getCategoryColor(broadcast.category)}15`,
                    color: getCategoryColor(broadcast.category)
                  }}>
                    {broadcast.category || 'General'}
                  </span>
                  {!broadcast.read_status && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#E31C23'
                    }} />
                  )}
                </div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: getPriorityColor(broadcast.priority),
                  fontWeight: 600
                }}>
                  {broadcast.priority || 'Normal'}
                </span>
              </div>

              {/* Title */}
              <h3 style={{ 
                margin: '0 0 8px', 
                fontSize: '1rem', 
                fontWeight: 600,
                color: '#1F2937'
              }}>
                {broadcast.title}
              </h3>

              {/* Content Preview */}
              <p style={{ 
                margin: '0 0 12px', 
                fontSize: '0.875rem', 
                color: '#6B7280',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {broadcast.content}
              </p>

              {/* Footer */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                  {formatDate(broadcast.created_at)}
                </span>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#E31C23',
                  fontWeight: 500
                }}>
                  Read more →
                </span>
              </div>
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

export default Broadcasts;
