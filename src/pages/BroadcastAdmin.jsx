import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBroadcast, getStoredUser } from '../utils/apiClient';
import { isAdmin, isSecretary } from '../utils/authUtils';

const BroadcastAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    targetType: 'all'
  });
  const [errors, setErrors] = useState({});
  const contentRef = useRef(null);

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('carekenya_welfare_current_user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        
        // Check permissions
        if (!isAdmin() && !isSecretary()) {
          navigate('/');
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (formData.content.length > 2000) {
      newErrors.content = 'Content must be 2000 characters or less';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const result = await createBroadcast(formData);
      
      if (result && (result.success !== false)) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          content: '',
          category: 'General',
          priority: 'Normal',
          targetType: 'all'
        });
        
        // Scroll to top to show success message
        window.scrollTo(0, 0);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } else {
        setErrors({ submit: result?.message || 'Failed to create broadcast' });
      }
    } catch (error) {
      console.error('Error creating broadcast:', error);
      setErrors({ submit: error.message || 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const charCount = formData.content.length;
  const maxChars = 2000;

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
          📢 Create Update
        </h1>
        <p style={{ 
          margin: '4px 0 0', 
          color: '#6B7280',
          fontSize: '0.875rem'
        }}>
          Share news with all staff members
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #10B981',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          color: '#065f46'
        }}>
          <strong>✓ Success!</strong> Your update has been published to all staff.
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #EF4444',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          color: '#991b1b'
        }}>
          <strong>Error:</strong> {errors.submit}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            color: '#374151',
            fontSize: '0.9rem'
          }}>
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter update title..."
            style={{
              width: '100%',
              padding: '12px 14px',
              border: errors.title ? '2px solid #EF4444' : '1px solid #d1d5db',
              borderRadius: '10px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
          {errors.title && (
            <p style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '4px' }}>
              {errors.title}
            </p>
          )}
        </div>

        {/* Category */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            color: '#374151',
            fontSize: '0.9rem'
          }}>
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="General">📢 General</option>
            <option value="Meeting">📅 Meeting</option>
            <option value="Event">🎉 Event</option>
            <option value="Urgent">🚨 Urgent</option>
            <option value="Finance">💰 Finance</option>
            <option value="Welfare">🤝 Welfare</option>
          </select>
        </div>

        {/* Priority */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            color: '#374151',
            fontSize: '0.9rem'
          }}>
            Priority
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {['Normal', 'Important', 'Urgent'].map((priority) => (
              <label
                key={priority}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  border: formData.priority === priority 
                    ? '2px solid #E31C23' 
                    : '1px solid #d1d5db',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  backgroundColor: formData.priority === priority ? '#fef2f2' : 'white',
                  flex: 1,
                  justifyContent: 'center'
                }}
              >
                <input
                  type="radio"
                  name="priority"
                  value={priority}
                  checked={formData.priority === priority}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <span style={{ 
                  fontSize: '0.9rem',
                  color: formData.priority === priority ? '#E31C23' : '#374151',
                  fontWeight: formData.priority === priority ? 600 : 400
                }}>
                  {priority === 'Normal' && '🟢'}
                  {priority === 'Important' && '🟡'}
                  {priority === 'Urgent' && '🔴'}
                  {' '}{priority}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 500,
            color: '#374151',
            fontSize: '0.9rem'
          }}>
            Content *
          </label>
          <textarea
            ref={contentRef}
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your update here..."
            rows={6}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: errors.content ? '2px solid #EF4444' : '1px solid #d1d5db',
              borderRadius: '10px',
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
            marginTop: '4px'
          }}>
            {errors.content ? (
              <p style={{ color: '#EF4444', fontSize: '0.8rem' }}>
                {errors.content}
              </p>
            ) : (
              <span></span>
            )}
            <span style={{
              color: charCount > maxChars * 0.9 ? '#EF4444' : '#6B7280',
              fontSize: '0.75rem'
            }}>
              {charCount}/{maxChars} characters
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading ? '#9CA3AF' : '#E31C23',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Publishing...
            </span>
          ) : (
            '📢 Publish to All Staff'
          )}
        </button>
      </form>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input[type="text"]:focus,
        textarea:focus,
        select:focus {
          border-color: #E31C23 !important;
          box-shadow: 0 0 0 3px rgba(227, 28, 35, 0.1);
        }
      `}</style>
    </div>
  );
};

export default BroadcastAdmin;
