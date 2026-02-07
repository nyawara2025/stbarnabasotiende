import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, X, CheckCircle, 
  Clock, FileText, Calendar, MapPin
} from 'lucide-react';
import { getStoredUser } from '../utils/apiClient';
import meetingService from '../services/meetingService';

const MeetingNotes = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [saving, setSaving] = useState(false);

  // Get configuration
  const getConfig = () => {
    try {
      if (window.config) {
        return {
          categories: window.config.modules?.meetingNotes?.categories || ['Minutes', 'Agendas', 'Constitution', 'Reports', 'Policies'],
          primaryColor: window.config.theme?.colors?.primary || '#E31C23',
          secondaryColor: window.config.theme?.colors?.secondary || '#1F2937',
        };
      }
    } catch (e) {
      console.warn('Could not load config:', e);
    }
    return {
      categories: ['Minutes', 'Agendas', 'Constitution', 'Reports', 'Policies'],
      primaryColor: '#E31C23',
      secondaryColor: '#1F2937',
    };
  };

  const config = getConfig();
  const categories = ['All', ...config.categories];

  // Check user and load meetings from N8N
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      console.log('👤 Current user:', storedUser.role, storedUser.id, 'org_id:', storedUser.org_id);
    }
  }, []);

  // Load meetings from N8N webhook
  useEffect(() => {
    if (!user?.org_id) {
      console.log('No org_id found, using empty data');
      setLoading(false);
      return;
    }

    const loadMeetings = async () => {
      setLoading(true);
      try {
        console.log('📋 Loading meetings from N8N webhook...');
        const response = await meetingService.getMeetings(user.org_id);
        
        // Transform the response to match the document format
        let meetings = [];
        if (Array.isArray(response)) {
          meetings = response;
        } else if (response.data && Array.isArray(response.data)) {
          meetings = response.data;
        } else if (response.meetings && Array.isArray(response.meetings)) {
          meetings = response.meetings;
        }

        // Transform meetings to document format
        const documents = meetings.map(meeting => ({
          id: meeting.id,
          title: meeting.title,
          category: 'Minutes',
          date: meeting.meeting_date ? meeting.meeting_date.split('T')[0] : new Date().toISOString().split('T')[0],
          size: 'N/A',
          description: meeting.agenda || 'Meeting minutes and details',
          meetingData: meeting // Keep original data for viewing
        }));

        setNotes(documents);
        console.log('✅ Meetings loaded:', documents.length);
      } catch (error) {
        console.error('❌ Error loading meetings:', error);
        // Keep empty on error
      } finally {
        setLoading(false);
      }
    };

    loadMeetings();
  }, [user]);

  const filteredNotes = activeCategory === 'All' 
    ? notes 
    : notes.filter(note => note.category === activeCategory);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Minutes': '#3B82F6',
      'Agendas': '#8B5CF6',
      'Constitution': '#059669',
      'Reports': '#F59E0B',
      'Policies': '#EC4899'
    };
    return colors[category] || config.primaryColor;
  };

  const isAdmin = user?.role === 'secretary' || user?.role === 'chair' || user?.role === 'super_admin' || user?.role === 'admin' || user?.role === 'shop_admin';

  const handleCreateMeeting = () => {
    setSelectedMeeting({
      id: null,
      title: '',
      meeting_date: '',
      venue: '',
      agenda: '',
      minutes_content: '',
      status: 'DRAFT'
    });
    setShowModal(true);
  };

  const handleEditMeeting = (note) => {
    if (note.meetingData) {
      setSelectedMeeting({
        ...note.meetingData,
        meeting_date: note.meetingData.meeting_date ? note.meetingData.meeting_date.slice(0, 16) : ''
      });
      setShowModal(true);
    }
  };

  const handleDeleteMeeting = async (note) => {
    if (window.confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)) {
      try {
        console.log('🗑️ Deleting meeting via N8N webhook...');
        await meetingService.deleteMeeting(note.id);
        setNotes(notes.filter(n => n.id !== note.id));
        console.log('✅ Meeting deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting meeting:', error);
        alert('Failed to delete meeting. Please try again.');
      }
    }
  };

  const handleSaveMeeting = async () => {
    if (!selectedMeeting.title || !selectedMeeting.meeting_date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      console.log('💾 Saving meeting via N8N webhook...');
      
      await meetingService.saveMeeting({
        ...selectedMeeting,
        org_id: user?.org_id || 1,
        created_by: user?.id
      });

      // Refresh the list
      const response = await meetingService.getMeetings(user.org_id);
      let meetings = [];
      if (Array.isArray(response)) {
        meetings = response;
      } else if (response.data && Array.isArray(response.data)) {
        meetings = response.data;
      } else if (response.meetings && Array.isArray(response.meetings)) {
        meetings = response.meetings;
      }

      const documents = meetings.map(meeting => ({
        id: meeting.id,
        title: meeting.title,
        category: 'Minutes',
        date: meeting.meeting_date ? meeting.meeting_date.split('T')[0] : new Date().toISOString().split('T')[0],
        size: 'N/A',
        description: meeting.agenda || 'Meeting minutes and details',
        meetingData: meeting
      }));

      setNotes(documents);
      setShowModal(false);
      setSelectedMeeting(null);
      console.log('✅ Meeting saved successfully');
    } catch (error) {
      console.error('❌ Error saving meeting:', error);
      alert('Failed to save meeting. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenNote = (note) => {
    // Navigate to meeting details or show in viewer
    if (note.meetingData) {
      // In production, this would navigate to a detail view or open PDF
      alert(`📋 ${note.title}\n\nDate: ${formatDate(note.date)}\n\nThis meeting record would be displayed here.\n\nAgenda: ${note.meetingData.agenda || 'N/A'}`);
    } else {
      alert(`Opening: ${note.title}\n\nThis would display the PDF document in production.`);
    }
  };

  return (
    <div style={{ padding: '16px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: config.primaryColor,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: 700,
              color: '#1F2937'
            }}>
              📋 {config.modules?.meetingNotes?.name || 'Meeting Notes'}
            </h1>
            <p style={{ 
              margin: '4px 0 0', 
              color: '#6B7280',
              fontSize: '0.875rem'
            }}>
              Access official documents, minutes, and policies
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleCreateMeeting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: config.primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              <Plus className="w-4 h-4" />
              New Meeting
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '16px',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: activeCategory === category ? config.primaryColor : 'white',
              color: activeCategory === category ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              boxShadow: activeCategory === category 
                ? 'none' 
                : '0 1px 2px rgba(0,0,0,0.05)',
              border: activeCategory === category 
                ? 'none' 
                : '1px solid #e5e7eb',
              transition: 'all 0.2s ease'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading ? (
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
            borderTopColor: config.primaryColor,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '12px'
          }} />
          <p>Loading documents...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          color: '#6B7280',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📄</div>
          <p>No documents found in this category</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => handleOpenNote(note)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Document Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: `${getCategoryColor(note.category)}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  flexShrink: 0
                }}>
                  📄
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: `${getCategoryColor(note.category)}15`,
                      color: getCategoryColor(note.category),
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {note.category}
                    </span>
                    <span style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                      {formatDate(note.date)} • {note.size}
                    </span>
                  </div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: '#1F2937',
                    lineHeight: 1.4
                  }}>
                    {note.title}
                  </h3>
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '0.8rem',
                    color: '#6B7280',
                    lineHeight: 1.5
                  }}>
                    {note.description}
                  </p>
                </div>

                {/* Download Arrow */}
                <div style={{
                  color: '#9CA3AF',
                  fontSize: '1.25rem'
                }}>
                  →
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid #f3f4f6',
                  display: 'flex',
                  gap: '8px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditMeeting(note); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      background: '#dbeafe',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: '#1e40af'
                    }}
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(note); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      background: '#fee2e2',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      color: '#991b1b'
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Meeting Modal */}
      {showModal && selectedMeeting && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }} onClick={() => setShowModal(false)}>
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                {selectedMeeting.id ? 'Edit Meeting' : 'Create New Meeting'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>
                    Meeting Title *
                  </label>
                  <input
                    type="text"
                    value={selectedMeeting.title}
                    onChange={(e) => setSelectedMeeting({ ...selectedMeeting, title: e.target.value })}
                    placeholder="e.g., January 2026 Monthly Meeting"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Date and Venue */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>
                      Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={selectedMeeting.meeting_date}
                      onChange={(e) => setSelectedMeeting({ ...selectedMeeting, meeting_date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>
                      Venue
                    </label>
                    <input
                      type="text"
                      value={selectedMeeting.venue || ''}
                      onChange={(e) => setSelectedMeeting({ ...selectedMeeting, venue: e.target.value })}
                      placeholder="e.g., Community Hall"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={selectedMeeting.status}
                    onChange={(e) => setSelectedMeeting({ ...selectedMeeting, status: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      background: 'white'
                    }}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                {/* Agenda */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>
                    Agenda
                  </label>
                  <textarea
                    value={selectedMeeting.agenda || ''}
                    onChange={(e) => setSelectedMeeting({ ...selectedMeeting, agenda: e.target.value })}
                    placeholder="1. Opening Prayer&#10;2. Attendance&#10;3. Financial Report&#10;4. Any Other Business"
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Minutes Content */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>
                    Meeting Minutes
                  </label>
                  <textarea
                    value={selectedMeeting.minutes_content || ''}
                    onChange={(e) => setSelectedMeeting({ ...selectedMeeting, minutes_content: e.target.value })}
                    placeholder="Record the discussion points, decisions made, and other important details from the meeting..."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeeting}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  background: config.primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? 'Saving...' : (selectedMeeting.id ? 'Update Meeting' : 'Create Meeting')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default MeetingNotes;
