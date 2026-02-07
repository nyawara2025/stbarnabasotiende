import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfigContext } from '../App';
import { getStoredUser } from '../utils/apiClient';

const Meetings = () => {
  const navigate = useNavigate();
  const config = useContext(ConfigContext);
  const user = getStoredUser();
  const primaryColor = config?.theme?.colors?.primary || '#7C3AED';
  
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const sampleMeetings = [
    {
      id: 1,
      title: 'PCC Monthly Meeting',
      type: 'PCC',
      date: '2026-02-15',
      time: '2:00 PM',
      venue: 'Church Hall',
      convenor: 'Rev. Canon James Mwangi',
      status: 'upcoming',
      agenda: [
        'Opening Prayer',
        'Reading of Previous Minutes',
        'Matters Arising',
        'Financial Report',
        'Building Project Update',
        'Youth Ministry Report',
        'AOB',
        'Closing Prayer'
      ],
      attendees: 12,
      totalExpected: 15
    },
    {
      id: 2,
      title: 'Mt. Olive Zone Meeting',
      type: 'Zone',
      date: '2026-02-10',
      time: '4:00 PM',
      venue: 'Member\'s Home - Langata',
      convenor: 'John Kamau',
      status: 'upcoming',
      agenda: [
        'Opening Prayer',
        'Welfare Updates',
        'Zone Contributions',
        'Upcoming Zone Events',
        'Closing Prayer'
      ],
      attendees: 0,
      totalExpected: 25
    },
    {
      id: 3,
      title: 'Youth Ministry Meeting',
      type: 'Ministry',
      date: '2026-02-08',
      time: '3:00 PM',
      venue: 'Youth Center',
      convenor: 'Pastor David Kimani',
      status: 'upcoming',
      agenda: [
        'Youth Service Planning',
        'Outreach Programs',
        'Youth Camp 2026',
        'Budget Review'
      ],
      attendees: 0,
      totalExpected: 20
    },
    {
      id: 4,
      title: 'Women Ministry Meeting',
      type: 'Ministry',
      date: '2026-02-01',
      time: '2:00 PM',
      venue: 'Church Hall',
      convenor: 'Mrs. Grace Wanjiku',
      status: 'completed',
      agenda: [
        'Opening Prayer',
        'Women\'s Day Planning',
        'Welfare Support',
        'Closing Prayer'
      ],
      attendees: 35,
      totalExpected: 40,
      minutes: 'Minutes available',
      attendance: [
        { name: 'Grace Wanjiku', zone: 'Mt. Olive', present: true },
        { name: 'Mary Akinyi', zone: 'Bethlehem', present: true },
        { name: 'Sarah Njeri', zone: 'Jerusalem', present: true },
      ]
    },
    {
      id: 5,
      title: 'PCC Meeting - January',
      type: 'PCC',
      date: '2026-01-18',
      time: '2:00 PM',
      venue: 'Church Hall',
      convenor: 'Rev. Canon James Mwangi',
      status: 'completed',
      attendees: 14,
      totalExpected: 15,
      minutes: 'Minutes available'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setMeetings(sampleMeetings);
      setLoading(false);
    }, 500);
  }, []);

  const filteredMeetings = meetings.filter(m => 
    activeTab === 'upcoming' ? m.status === 'upcoming' : m.status === 'completed'
  );

  const getTypeColor = (type) => {
    const colors = {
      'PCC': '#7C3AED',
      'Zone': '#059669',
      'Ministry': '#F59E0B',
      'AGM': '#DC2626'
    };
    return colors[type] || '#6B7280';
  };

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
      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: '#F3F4F6',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'upcoming' ? 'white' : 'transparent',
            color: activeTab === 'upcoming' ? primaryColor : '#6B7280',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'upcoming' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          📅 Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            borderRadius: '10px',
            background: activeTab === 'past' ? 'white' : 'transparent',
            color: activeTab === 'past' ? primaryColor : '#6B7280',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'past' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
          }}
        >
          ✅ Past Meetings
        </button>
      </div>

      {/* Meetings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredMeetings.map(meeting => (
          <div 
            key={meeting.id} 
            onClick={() => setSelectedMeeting(selectedMeeting?.id === meeting.id ? null : meeting)}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              border: selectedMeeting?.id === meeting.id ? `2px solid ${primaryColor}` : '2px solid transparent'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                background: `${getTypeColor(meeting.type)}15`,
                color: getTypeColor(meeting.type),
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                {meeting.type}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                {new Date(meeting.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#1F2937' }}>
              {meeting.title}
            </h3>
            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#6B7280' }}>
              🕐 {meeting.time} • 📍 {meeting.venue}
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#9CA3AF' }}>
              Convenor: {meeting.convenor}
            </p>

            {/* Attendance Stats */}
            {meeting.status === 'completed' && (
              <div style={{
                marginTop: '12px',
                padding: '10px',
                background: '#F3F4F6',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                  👥 Attendance: {meeting.attendees}/{meeting.totalExpected}
                </span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#059669',
                  fontWeight: 600
                }}>
                  {Math.round((meeting.attendees / meeting.totalExpected) * 100)}%
                </span>
              </div>
            )}

            {/* Expanded View */}
            {selectedMeeting?.id === meeting.id && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                {meeting.agenda && (
                  <>
                    <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 600, color: '#1F2937' }}>
                      📋 Agenda
                    </h4>
                    <ol style={{ margin: '0 0 16px', paddingLeft: '20px', fontSize: '0.85rem', color: '#374151' }}>
                      {meeting.agenda.map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
                      ))}
                    </ol>
                  </>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {meeting.status === 'upcoming' && (
                    <>
                      <button style={{
                        background: primaryColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        ✅ RSVP
                      </button>
                      <button style={{
                        background: '#F3F4F6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                        📅 Add to Calendar
                      </button>
                    </>
                  )}
                  {meeting.status === 'completed' && meeting.minutes && (
                    <>
                      <button style={{
                        background: primaryColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}>
                        📄 View Minutes
                      </button>
                      <button style={{
                        background: '#F3F4F6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 16px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}>
                        👥 View Attendance
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredMeetings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF' }}>
          <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📅</p>
          <p>No {activeTab} meetings found</p>
        </div>
      )}
    </div>
  );
};

export default Meetings;
