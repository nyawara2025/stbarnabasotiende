import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigContext } from '../App';

const Sermons = () => {
  const navigate = useNavigate();
  const config = useContext(ConfigContext);
  const primaryColor = config?.theme?.colors?.primary || '#7C3AED';
  
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [playingId, setPlayingId] = useState(null);

  const sampleSermons = [
    {
      id: 1,
      title: 'Abiding in the Vine',
      preacher: 'Rev. Sarah Njeri',
      date: '2026-02-02',
      service: 'English Service',
      category: 'Sunday Sermon',
      duration: '35 mins',
      scripture: 'John 15:1-17',
      audioUrl: '#',
      videoUrl: '#',
      hasNotes: true
    },
    {
      id: 2,
      title: 'Walking by Faith',
      preacher: 'Rev. Canon James Mwangi',
      date: '2026-01-26',
      service: 'English Service',
      category: 'Sunday Sermon',
      duration: '40 mins',
      scripture: '2 Corinthians 5:7',
      audioUrl: '#',
      hasNotes: true
    },
    {
      id: 3,
      title: 'Youth on Fire',
      preacher: 'Pastor David Kimani',
      date: '2026-01-26',
      service: 'Youth Service',
      category: 'Youth Teaching',
      duration: '25 mins',
      scripture: 'Jeremiah 29:11',
      audioUrl: '#',
      videoUrl: '#'
    },
    {
      id: 4,
      title: 'The Power of Prayer',
      preacher: 'Rev. Canon James Mwangi',
      date: '2026-01-19',
      service: 'Swahili Service',
      category: 'Sunday Sermon',
      duration: '38 mins',
      scripture: 'James 5:16',
      audioUrl: '#'
    },
    {
      id: 5,
      title: 'Bible Study: Romans 8',
      preacher: 'Rev. Sarah Njeri',
      date: '2026-01-15',
      service: 'Wednesday Bible Study',
      category: 'Bible Study',
      duration: '45 mins',
      scripture: 'Romans 8:1-39',
      audioUrl: '#',
      hasNotes: true
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setSermons(sampleSermons);
      setLoading(false);
    }, 500);
  }, []);

  const filteredSermons = filter === 'all' 
    ? sermons 
    : sermons.filter(s => s.category === filter);

  const categories = ['all', 'Sunday Sermon', 'Youth Teaching', 'Bible Study', 'Special Service'];

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
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

  return (
    <div style={{ padding: '16px', paddingBottom: '100px' }}>
      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px'
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              background: filter === cat ? primaryColor : 'white',
              color: filter === cat ? 'white' : '#374151',
              border: '1px solid #e5e7eb',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat === 'all' ? 'All Sermons' : cat}
          </button>
        ))}
      </div>

      {/* Sermons List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredSermons.map(sermon => (
          <div key={sermon.id} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                background: `${primaryColor}15`,
                color: primaryColor,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                {sermon.category}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                {new Date(sermon.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#1F2937' }}>
              {sermon.title}
            </h3>
            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#6B7280' }}>
              {sermon.preacher} • {sermon.service}
            </p>
            
            <div style={{ 
              background: '#F3F4F6', 
              padding: '8px 12px', 
              borderRadius: '8px',
              marginBottom: '12px',
              fontSize: '0.8rem',
              color: '#374151'
            }}>
              📖 {sermon.scripture} • ⏱️ {sermon.duration}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {sermon.audioUrl && (
                <button
                  onClick={() => setPlayingId(playingId === sermon.id ? null : sermon.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: playingId === sermon.id ? primaryColor : '#F3F4F6',
                    color: playingId === sermon.id ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  {playingId === sermon.id ? '⏸️ Pause' : '🎧 Listen'}
                </button>
              )}
              {sermon.videoUrl && (
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  🎬 Watch
                </button>
              )}
              {sermon.hasNotes && (
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}>
                  📝 Notes
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSermons.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
          <p style={{ fontSize: '2rem', marginBottom: '8px' }}>🎙️</p>
          <p>No sermons found in this category</p>
        </div>
      )}
    </div>
  );
};

export default Sermons;
