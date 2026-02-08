import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Users, DollarSign, FileText, Plus, 
  ChevronLeft, ChevronRight, Search, Filter,
  CheckCircle, Clock, XCircle, Edit, Trash2, Eye
} from 'lucide-react';
import meetingService from '../services/meetingService';

const MeetingMinutes = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [user, setUser] = useState(null);

  // Get configuration
  const getConfig = () => {
    try {
      if (window.config) {
        return {
          primaryColor: window.config.theme?.colors?.primary || '#E31C23',
          secondaryColor: window.config.theme?.colors?.secondary || '#1F2937',
        };
      }
    } catch (e) {
      console.warn('Could not load config:', e);
    }
    return {
      primaryColor: '#E31C23',
      secondaryColor: '#1F2937',
    };
  };

  const config = getConfig();

  // Check user role
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      console.log('👤 Current user:', userData.role, userData.id);
    }
  }, []);

  // Load meetings (mock for now - will connect to N8N)
  useEffect(() => {
    loadMeetings();
  }, [user]);

  const loadMeetings = async () => {
    if (!user?.org_id) {
      console.log('No org_id found, skipping load');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('📋 Loading meetings from N8N webhook...');
      const response = await meetingService.getMeetings(user.org_id);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setMeetings(response);
      } else if (response.data && Array.isArray(response.data)) {
        setMeetings(response.data);
      } else if (response.meetings && Array.isArray(response.meetings)) {
        setMeetings(response.meetings);
      } else {
        console.warn('Unexpected response format:', response);
        setMeetings([]);
      }
      
      console.log('✅ Meetings loaded successfully');
    } catch (error) {
      console.error('❌ Error loading meetings:', error);
      // Don't set meetings to empty on error - keep current data
      // setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return { bg: '#dcfce7', text: '#166534' };
      case 'DRAFT':
        return { bg: '#fef3c7', text: '#92400e' };
      case 'ARCHIVED':
        return { bg: '#f3f4f6', text: '#374151' };
      default:
        return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const isAdmin = user?.role === 'secretary' || user?.role === 'chair' || user?.role === 'super_admin' || user?.role === 'admin';

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          meeting.venue?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateMeeting = () => {
    setSelectedMeeting({
      id: null,
      title: '',
      meeting_date: '',
      venue: '',
      agenda: '',
      minutes_content: '',
      attendees: [],
      absent_apologies: [],
      action_items: [],
      status: 'DRAFT'
    });
    setShowCreateModal(true);
  };

  const handleEditMeeting = (meeting) => {
    setSelectedMeeting({ ...meeting });
    setShowCreateModal(true);
  };

  const handleViewMeeting = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (window.confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      try {
        console.log('🗑️ Deleting meeting via N8N webhook...');
        await meetingService.deleteMeeting(meetingId);
        setMeetings(meetings.filter(m => m.id !== meetingId));
        console.log('✅ Meeting deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting meeting:', error);
        alert('Failed to delete meeting. Please try again.');
      }
    }
  };

  const handleSaveMeeting = async () => {
    try {
      if (!selectedMeeting.title || !selectedMeeting.meeting_date) {
        alert('Please fill in all required fields');
        return;
      }

      console.log('💾 Saving meeting via N8N webhook...');
      
      const meetingData = {
        ...selectedMeeting,
        org_id: user?.org_id || 1,
        created_by: user?.id
      };

      const response = await meetingService.saveMeeting(meetingData);
      
      // Refresh the meetings list
      await loadMeetings();

      setShowCreateModal(false);
      setSelectedMeeting(null);
      console.log('✅ Meeting saved successfully');
    } catch (error) {
      console.error('❌ Error saving meeting:', error);
      alert('Failed to save meeting. Please try again.');
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.5rem', 
              fontWeight: 700,
              color: '#1F2937'
            }}>
              📋 Meeting Minutes
            </h1>
            <p style={{ 
              margin: '4px 0 0', 
              color: '#6B7280',
              fontSize: '0.875rem'
            }}>
              View and manage meeting records, minutes, and financial contributions
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleCreateMeeting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
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

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '12px', 
        marginBottom: '20px' 
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Total Meetings</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1F2937' }}>{meetings.length}</div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Published</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#166534' }}>
            {meetings.filter(m => m.status === 'PUBLISHED').length}
          </div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Drafts</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#92400e' }}>
            {meetings.filter(m => m.status === 'DRAFT').length}
          </div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '4px' }}>Total Collected</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: config.primaryColor }}>
            {formatCurrency(meetings.reduce((sum, m) => sum + (m.total_contributions || 0), 0))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.875rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '0.875rem',
            background: 'white'
          }}
        >
          <option value="all">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>
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
          <p>Loading meetings...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          color: '#6B7280',
          textAlign: 'center'
        }}>
          <Calendar style={{ width: '48px', height: '48px', marginBottom: '16px', color: '#d1d5db' }} />
          <p>No meetings found</p>
          {isAdmin && (
            <button
              onClick={handleCreateMeeting}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: config.primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Create First Meeting
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredMeetings.map((meeting) => {
            const statusColors = getStatusColor(meeting.status);
            return (
              <div
                key={meeting.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => handleViewMeeting(meeting)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        background: statusColors.bg,
                        color: statusColors.text,
                        borderRadius: '16px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {meeting.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {formatDate(meeting.meeting_date)}
                      </span>
                    </div>
                    <h3 style={{
                      margin: '0 0 8px',
                      fontSize: '1rem',
                      fontWeight: 600,
                      color: '#1F2937'
                    }}>
                      {meeting.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280' }}>
                      📍 {meeting.venue}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginLeft: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6B7280', fontSize: '0.75rem' }}>
                        <Users className="w-4 h-4" />
                        <span>{meeting.attendees_count || 0}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Attendees</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: config.primaryColor, fontSize: '0.75rem' }}>
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(meeting.total_contributions || 0)}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Collected</div>
                    </div>
                  </div>
                </div>

                {/* Action Items Preview */}
                {meeting.action_items?.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '6px' }}>Action Items:</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {meeting.action_items.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            background: item.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                            color: item.status === 'COMPLETED' ? '#166534' : '#92400e',
                            borderRadius: '4px',
                            fontSize: '0.7rem'
                          }}
                        >
                          {item.status === 'COMPLETED' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {item.task}
                        </span>
                      ))}
                      {meeting.action_items.length > 3 && (
                        <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                          +{meeting.action_items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

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
                      onClick={(e) => { e.stopPropagation(); handleViewMeeting(meeting); }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        background: '#f3f4f6',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditMeeting(meeting); }}
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
                      onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(meeting.id); }}
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
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && selectedMeeting && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }} onClick={() => setShowCreateModal(false)}>
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '700px',
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
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <XCircle className="w-5 h-5 text-gray-400" />
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
                onClick={() => setShowCreateModal(false)}
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
                style={{
                  padding: '10px 20px',
                  background: config.primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                {selectedMeeting.id ? 'Update Meeting' : 'Create Meeting'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Detail Modal */}
      {selectedMeeting && !showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          padding: '20px'
        }} onClick={() => setSelectedMeeting(null)}>
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '800px',
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
              alignItems: 'flex-start'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: getStatusColor(selectedMeeting.status).bg,
                    color: getStatusColor(selectedMeeting.status).text,
                    borderRadius: '16px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {selectedMeeting.status}
                  </span>
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                  {selectedMeeting.title}
                </h2>
                <p style={{ margin: '4px 0 0', color: '#6B7280', fontSize: '0.875rem' }}>
                  📅 {formatDate(selectedMeeting.meeting_date)} • 📍 {selectedMeeting.venue}
                </p>
              </div>
              <button
                onClick={() => setSelectedMeeting(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <XCircle className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <Users className="w-5 h-5 mx-auto mb-2" style={{ color: '#16a34a', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>{selectedMeeting.attendees_count || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Attendees</div>
                </div>
                <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <DollarSign className="w-5 h-5 mx-auto mb-2" style={{ color: '#2563eb', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>{formatCurrency(selectedMeeting.total_contributions || 0)}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Collected</div>
                </div>
                <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: '#d97706', margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706' }}>{selectedMeeting.action_items?.length || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Action Items</div>
                </div>
              </div>

              {/* Agenda */}
              {selectedMeeting.agenda && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Agenda</h3>
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                    {selectedMeeting.agenda}
                  </div>
                </div>
              )}

              {/* Minutes */}
              {selectedMeeting.minutes_content && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Minutes</h3>
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                    {selectedMeeting.minutes_content}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {selectedMeeting.action_items?.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>Action Items</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedMeeting.action_items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: item.status === 'COMPLETED' ? '#f0fdf4' : '#fef3c7',
                          borderRadius: '8px',
                          borderLeft: `4px solid ${item.status === 'COMPLETED' ? '#16a34a' : '#d97706'}`
                        }}
                      >
                        {item.status === 'COMPLETED' ? (
                          <CheckCircle className="w-5 h-5" style={{ color: '#16a34a', flexShrink: 0 }} />
                        ) : (
                          <Clock className="w-5 h-5" style={{ color: '#d97706', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item.task}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            Owner: {item.owner} • Due: {item.due_date}
                          </div>
                        </div>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          background: item.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                          color: item.status === 'COMPLETED' ? '#166534' : '#92400e'
                        }}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setSelectedMeeting(null)}
                style={{
                  padding: '10px 20px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Close
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

export default MeetingMinutes;
