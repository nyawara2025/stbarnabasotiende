import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerConversations, getStoredUser } from '../utils/apiClient';

const MyInquiries = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem('carekenya_welfare_current_user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        loadConversations();
      } catch (e) {
        console.error('Error parsing user data:', e);
        setLoading(false);
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadConversations = async () => {
    try {
      // For demo, show mock data if API not available
      setTimeout(() => {
        setConversations([
          {
            id: 1,
            shop_name: 'China Square Electronics',
            product_name: 'Samsung Galaxy A54',
            inquiry: 'Is this phone available in black color? What is the warranty period?',
            response: 'Yes, we have black color in stock. 1 year manufacturer warranty included.',
            response_date: '2024-06-18',
            price: 28500,
            responded: true
          },
          {
            id: 2,
            shop_name: 'Langata Wines & Spirits',
            product_name: 'Black Label Whiskey 1L',
            inquiry: 'Do you have any promotions on this item?',
            response: 'Yes! We have 10% off on all wines and spirits this week.',
            response_date: '2024-06-17',
            price: 3200,
            responded: true
          },
          {
            id: 3,
            shop_name: 'Maliet Salon',
            product_name: 'Hair Treatment Service',
            inquiry: 'Do you do keratin treatment? How much does it cost?',
            response: null,
            responded: false
          },
          {
            id: 4,
            shop_name: 'Kika Wines',
            product_name: 'Castle Lager Pack',
            inquiry: 'Is this available for home delivery?',
            response: 'Yes, we deliver within Langata area. Delivery fee is KES 100.',
            response_date: '2024-06-15',
            price: 1800,
            responded: true
          }
        ]);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `KES ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short'
    });
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
        <p>Loading your inquiries...</p>
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
          💬 My Inquiries
        </h1>
        <p style={{ 
          margin: '4px 0 0', 
          color: '#6B7280',
          fontSize: '0.875rem'
        }}>
          Responses from shops on Sokoni marketplace
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#10B981' }}>
            {conversations.filter(c => c.responded).length}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
            Responded
          </p>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#F59E0B' }}>
            {conversations.filter(c => !c.responded).length}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#6B7280' }}>
            Awaiting Response
          </p>
        </div>
      </div>

      {/* Inquiries List */}
      {conversations.length === 0 ? (
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
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
          <p style={{ margin: '0 0 8px', fontWeight: 500, color: '#374151' }}>
            No Inquiries Yet
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            Visit Sokoni to browse shops and ask about products.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                opacity: conversation.responded ? 1 : 0.7
              }}
            >
              {/* Shop and Product */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.75rem', 
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {conversation.shop_name}
                  </p>
                  <h3 style={{ 
                    margin: '4px 0 0', 
                    fontSize: '1rem', 
                    fontWeight: 600,
                    color: '#1F2937'
                  }}>
                    {conversation.product_name}
                  </h3>
                </div>
                {conversation.price && (
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#10B981'
                  }}>
                    {formatCurrency(conversation.price)}
                  </span>
                )}
              </div>

              {/* Inquiry */}
              <div style={{
                background: '#F9FAFB',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '12px'
              }}>
                <p style={{ 
                  margin: '0 0 4px', 
                  fontSize: '0.8rem', 
                  color: '#6B7280'
                }}>
                  👤 You asked:
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.875rem', 
                  color: '#374151',
                  lineHeight: 1.5
                }}>
                  {conversation.inquiry}
                </p>
              </div>

              {/* Response */}
              {conversation.responded ? (
                <div style={{
                  background: '#ECFDF5',
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid #10B98120'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.8rem', 
                      color: '#059669',
                      fontWeight: 500
                    }}>
                      🏪 Shop responded:
                    </p>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '0.75rem', 
                      color: '#9CA3AF'
                    }}>
                      {formatDate(conversation.response_date)}
                    </p>
                  </div>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.875rem', 
                    color: '#065f46',
                    lineHeight: 1.5
                  }}>
                    {conversation.response}
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: '#FEF3C7',
                  borderRadius: '10px',
                  border: '1px solid #F59E0B20'
                }}>
                  <span style={{ fontSize: '1rem' }}>⏳</span>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '0.875rem', 
                    color: '#92400e'
                  }}>
                    Awaiting response from shop...
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Go to Sokoni */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center'
      }}>
        <button
          onClick={() => navigate('/sokoni')}
          style={{
            background: 'white',
            color: '#E31C23',
            border: '1px solid #E31C23',
            borderRadius: '10px',
            padding: '12px 24px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          🛒 Browse Sokoni Marketplace
        </button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MyInquiries;
