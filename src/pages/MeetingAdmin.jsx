import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMeeting } from '../utils/apiClient';
import { ConfigContext } from '../App';

const MeetingAdmin = () => {
  const navigate = useNavigate();
  const config = useContext(ConfigContext);
  const primaryColor = config?.theme?.colors?.primary || '#E31C23';

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    meeting_date: new Date().toISOString().split('T')[0], // Default to today
    location: '',
    summary: '',
    attendance_count: 0
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createMeeting(formData);
      alert('Meeting logged successfully!');
      navigate('/meeting-notes'); // Go back to the list
    } catch (err) {
      console.error('Failed to save meeting:', err);
      alert('Error saving meeting. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    marginBottom: '16px',
    fontSize: '1rem'
  };

  return (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Log New Meeting</h2>
      
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Meeting Title</label>
        <input 
          type="text" 
          placeholder="e.g., February Monthly Meeting"
          style={inputStyle}
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required 
        />

        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Date</label>
        <input 
          type="date" 
          style={inputStyle}
          value={formData.meeting_date}
          onChange={(e) => setFormData({...formData, meeting_date: e.target.value})}
          required 
        />

        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Location</label>
        <input 
          type="text" 
          placeholder="e.g., Community Hall or Zoom"
          style={inputStyle}
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
        />

        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Meeting Minutes / Summary</label>
        <textarea 
          placeholder="What was discussed?"
          style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
          value={formData.summary}
          onChange={(e) => setFormData({...formData, summary: e.target.value})}
          required 
        />

        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '600' }}>Attendance Count</label>
        <input 
          type="number" 
          style={inputStyle}
          value={formData.attendance_count}
          onChange={(e) => setFormData({...formData, attendance_count: e.target.value})}
        />

        <button 
          type="submit" 
          disabled={submitting}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: primaryColor,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? 'Saving...' : 'Save Meeting Minutes'}
        </button>
      </form>
    </div>
  );
};

export default MeetingAdmin;
