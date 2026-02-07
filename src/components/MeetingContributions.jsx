import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

const MeetingContributions = ({ 
  meetingId, 
  contributions = [], 
  onAddContribution, 
  onDeleteContribution,
  isAdmin = false 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    member_name: '',
    member_id: '',
    contribution_type: 'HOSTING',
    amount: '',
    payment_method: 'CASH',
    transaction_reference: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const getConfig = () => {
    try {
      if (window.config) {
        return {
          primaryColor: window.config.theme?.colors?.primary || '#E31C23',
        };
      }
    } catch (e) {
      console.warn('Could not load config:', e);
    }
    return { primaryColor: '#E31C23' };
  };

  const config = getConfig();

  const contributionTypes = [
    { value: 'HOSTING', label: 'Hosting', icon: '🏠', color: '#8b5cf6' },
    { value: 'FOOD', label: 'Food', icon: '🍽️', color: '#f59e0b' },
    { value: 'REFRESHMENTS', label: 'Refreshments', icon: '🥤', color: '#06b6d4' },
    { value: 'MONTHLY_CONTRIBUTION', label: 'Monthly', icon: '💵', color: '#10b981' },
    { value: 'ANNUAL_FEES', label: 'Annual Fees', icon: '📅', color: '#3b82f6' },
    { value: 'EVENT_FEE', label: 'Event Fee', icon: '🎉', color: '#ec4899' },
    { value: 'OTHER', label: 'Other', icon: '💰', color: '#6b7280' }
  ];

  const paymentMethods = [
    { value: 'CASH', label: 'Cash' },
    { value: 'MPESA', label: 'M-Pesa' },
    { value: 'BANK', label: 'Bank Transfer' },
    { value: 'OTHER', label: 'Other' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeInfo = (type) => {
    return contributionTypes.find(t => t.value === type) || contributionTypes[6];
  };

  const getTotalByType = (type) => {
    return contributions
      .filter(c => c.contribution_type === type)
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  };

  const grandTotal = contributions.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!formData.member_name || !formData.amount) {
        throw new Error('Please fill in all required fields');
      }

      await onAddContribution({
        meeting_id: meetingId,
        member_name: formData.member_name,
        member_id: formData.member_id || null,
        contribution_type: formData.contribution_type,
        amount: parseFloat(formData.amount),
        payment_method: formData.payment_method,
        transaction_reference: formData.transaction_reference || null,
        notes: formData.notes || null
      });

      // Reset form
      setFormData({
        member_name: '',
        member_id: '',
        contribution_type: 'HOSTING',
        amount: '',
        payment_method: 'CASH',
        transaction_reference: '',
        notes: ''
      });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (contributionId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      await onDeleteContribution(contributionId);
    }
  };

  // Group contributions by type
  const contributionsByType = contributionTypes.reduce((acc, type) => {
    acc[type.value] = contributions.filter(c => c.contribution_type === type.value);
    return acc;
  }, {});

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
            💰 Financial Contributions
          </h3>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
            {contributions.length} contributions • Total: {formatCurrency(grandTotal)}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: showForm ? '#f3f4f6' : config.primaryColor,
              color: showForm ? '#374151' : 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500
            }}
          >
            {showForm ? (
              <>
                <XCircle className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Contribution
              </>
            )}
          </button>
        )}
      </div>

      {/* Summary by Type */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
        gap: '8px',
        marginBottom: '16px'
      }}>
        {contributionTypes.map(type => {
          const total = getTotalByType(type.value);
          if (total === 0 && !isAdmin) return null;
          return (
            <div
              key={type.value}
              style={{
                background: `${type.color}15`,
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{type.icon}</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{type.label}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: type.color }}>
                {formatCurrency(total)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Contribution Form */}
      {showForm && isAdmin && (
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '0.875rem', fontWeight: 600 }}>
            Record New Contribution
          </h4>
          
          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              marginBottom: '12px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {/* Member Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '4px' }}>
                  Member Name *
                </label>
                <input
                  type="text"
                  value={formData.member_name}
                  onChange={(e) => setFormData({ ...formData, member_name: e.target.value })}
                  placeholder="Enter member name"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '4px' }}>
                  Amount (KES) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="100"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {/* Contribution Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '4px' }}>
                  Contribution Type
                </label>
                <select
                  value={formData.contribution_type}
                  onChange={(e) => setFormData({ ...formData, contribution_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    background: 'white'
                  }}
                >
                  {contributionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '4px' }}>
                  Payment Method
                </label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    background: 'white'
                  }}
                >
                  {paymentMethods.map(method => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transaction Reference */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '4px' }}>
                Transaction Reference (Optional)
              </label>
              <input
                type="text"
                value={formData.transaction_reference}
                onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
                placeholder="e.g., M-PESA code or Bank reference"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, marginBottom: '4px' }}>
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  background: config.primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.8rem',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                {isSubmitting ? 'Saving...' : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Contribution
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contributions List */}
      {contributions.length === 0 ? (
        <div style={{
          background: '#f9fafb',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <DollarSign className="w-8 h-8 mx-auto mb-4" style={{ color: '#d1d5db' }} />
          <p style={{ margin: 0 }}>No contributions recorded yet</p>
          {isAdmin && (
            <p style={{ margin: '8px 0 0', fontSize: '0.75rem' }}>
              Click "Add Contribution" to record financial contributions
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {contributions.map((contribution) => {
            const typeInfo = getTypeInfo(contribution.contribution_type);
            return (
              <div
                key={contribution.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}
              >
                {/* Type Icon */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: `${typeInfo.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  flexShrink: 0
                }}>
                  {typeInfo.icon}
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {contribution.member_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {typeInfo.label} • {contribution.payment_method}
                    {contribution.transaction_reference && ` • ${contribution.transaction_reference}`}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: typeInfo.color }}>
                    {formatCurrency(contribution.amount)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                    {formatDate(contribution.created_at)}
                  </div>
                </div>

                {/* Delete Button */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(contribution.id)}
                    style={{
                      padding: '6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#9ca3af'
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Grand Total */}
      {contributions.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          padding: '12px 16px',
          background: config.primaryColor,
          color: 'white',
          borderRadius: '8px'
        }}>
          <span style={{ fontWeight: 500 }}>Total Collected</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {formatCurrency(grandTotal)}
          </span>
        </div>
      )}
    </div>
  );
};

export default MeetingContributions;
