import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, apiRequest } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ConfigContext } from '../App';
import WhatsAppReplyButton from '../components/WhatsAppReplyButton';

const ChatAdmin = () => {
  const navigate = useNavigate();
  const config = useContext(ConfigContext);
  const user = getStoredUser();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is admin (includes shop_admin)
  const isAdmin = user?.role === 'shop_admin' || user?.role === 'admin' || user?.role === 'treasurer' || user?.role === 'secretary';

  // Track if component is mounted to prevent double-fetching
  const isMounted = React.useRef(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/chat');
      return;
    }
    
    // Only load once on mount, not on every user change
    loadConversations();
    
    // Cleanup on unmount
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array - only run on mount

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    
    // Create abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      const response = await apiRequest(API_ENDPOINTS.getAdminChatConversations, {
        method: 'POST',
        body: JSON.stringify({
          org_id: user?.org_id || 3
        }),
        signal: controller.signal
      }, 30000); // Pass timeout to apiRequest

      clearTimeout(timeoutId);

      // Handle different response structures from N8N
      let conversationsData = [];
      
      console.log('Raw API response:', response);
      
      if (Array.isArray(response)) {
        // Direct array response
        conversationsData = response;
        console.log('Using direct array, count:', conversationsData.length);
      } else if (response && Array.isArray(response.conversations)) {
        // Response with conversations property
        conversationsData = response.conversations;
        console.log('Using response.conversations, count:', conversationsData.length);
      } else if (response && Array.isArray(response.data)) {
        // N8N wrapped response {success: true, data: [...]]
        conversationsData = response.data;
        console.log('Using response.data, count:', conversationsData.length);
      } else {
        console.warn('Unexpected response structure:', JSON.stringify(response, null, 2));
      }
      
      // Log first conversation structure for debugging
      if (conversationsData.length > 0) {
        console.log('First conversation:', JSON.stringify(conversationsData[0], null, 2));
      }
      
      // Remove duplicates based on user_id
      const uniqueConversations = [];
      const seenUserIds = new Set();
      conversationsData.forEach(conv => {
        if (!seenUserIds.has(conv.user_id)) {
          seenUserIds.add(conv.user_id);
          uniqueConversations.push(conv);
        }
      });
      
      console.log('Final conversations count:', uniqueConversations.length);
      setConversations(uniqueConversations);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn('Request timed out');
        setError('Request timed out. Please try again.');
      } else {
        console.error('Error loading conversations:', error);
        setError('Unable to load conversations. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversation) => {
    setSelectedConversation(conversation);
    setLoading(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.getChatMessages, {
        method: 'POST',
        body: JSON.stringify({
          user_id: conversation.user_id
        })
      });

      if (response && response.messages) {
        setMessages(response.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await apiRequest(API_ENDPOINTS.sendChatReply, {
        method: 'POST',
        body: JSON.stringify({
          org_id: user?.org_id || 3,
          user_id: selectedConversation.user_id,
          admin_id: user?.id,
          admin_name: user?.full_name || user?.first_name,
          message: replyText,
          timestamp: new Date().toISOString()
        })
      });

      if (response) {
        // Handle both array [{id, success}] and object {success, id} formats
        const success = Array.isArray(response) ? response[0]?.success : response.success;
        if (success) {
          // Reload messages
          await loadMessages(selectedConversation);
          setReplyText('');
        }
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '-';
    // Extract just time from timestamp
    const timeStr = date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
    // Extract date parts
    const day = date.getDate();
    const month = date.toLocaleString('en-KE', { month: 'short' });
    return `${month} ${day}, ${timeStr}`;
  };

  const getLastMessage = (messages) => {
    // Handle null/undefined
    if (!messages) return 'No messages';
    
    // Handle array
    if (Array.isArray(messages)) {
      if (messages.length === 0) return 'No messages';
      
      const lastMsg = messages[messages.length - 1];
      console.log('Last message object:', JSON.stringify(lastMsg));
      
      // Check for 'text' property
      if (lastMsg && typeof lastMsg === 'object') {
        if ('text' in lastMsg) {
          const txt = String(lastMsg.text || '');
          return txt.length > 50 ? txt.substring(0, 50) + '...' : txt;
        }
        // If no 'text' but has other text-like properties
        if ('message' in lastMsg) {
          const txt = String(lastMsg.message || '');
          return txt.length > 50 ? txt.substring(0, 50) + '...' : txt;
        }
      }
    }
    
    return 'No messages';
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#F3F4F6',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <button 
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '8px'
          }}
        >
          ← Back
        </button>
        <h1 style={{ 
          margin: 0, 
          fontSize: '1.25rem', 
          fontWeight: 600,
          color: config?.theme?.colors?.primary || '#E31C23'
        }}>
          💬 Chat Dashboard
        </h1>
      </header>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        overflow: 'hidden'
      }}>
        {/* Conversations List */}
        <div style={{
          width: selectedConversation ? '320px' : '100%',
          borderRight: '1px solid #e5e7eb',
          background: 'white',
          overflow: 'auto',
          transition: 'width 0.2s ease'
        }}>
          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e5e7eb',
                borderTopColor: '#E31C23',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px'
              }} />
              <p style={{ color: '#6B7280' }}>Loading conversations...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <p style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</p>
              <button
                onClick={loadConversations}
                style={{
                  padding: '10px 20px',
                  background: '#E31C23',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
              <p style={{ color: '#6B7280', marginBottom: '8px' }}>No conversations yet</p>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>
                User inquiries will appear here
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              console.log('RENDER - conv:', JSON.stringify(conv));
              console.log('RENDER - conv.messages:', JSON.stringify(conv.messages));
              return (
              <div
                key={conv.user_id}
                onClick={() => loadMessages(conv)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  background: selectedConversation?.user_id === conv.user_id ? '#F3F4F6' : 'white',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontWeight: 600, color: '#1F2937' }}>
                    {conv.user_name || 'Unknown User'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
                    {formatTime(conv.last_message_time)}
                  </span>
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: '#6B7280',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {getLastMessage(conv.messages)}
                </div>
              </div>
            )})
          )}
        </div>

        {/* Chat View */}
        {selectedConversation && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#F9FAFB'
          }}>
            {/* Conversation Header */}
            <div style={{
              padding: '16px',
              background: 'white',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                  {selectedConversation.user_name}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#6B7280' }}>
                  {selectedConversation.phone}
                </p>
              </div>
              <button 
                onClick={() => setSelectedConversation(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#6B7280'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '20px' }}>
                  No messages yet
                </div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isAdmin ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isAdmin 
                          ? (config?.theme?.colors?.primary || '#E31C23') 
                          : 'white',
                        color: isAdmin ? 'white' : '#1F2937',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        <p style={{ margin: '0 0 4px' }}>{msg.text}</p>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          opacity: 0.7 
                        }}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input */}
            <div style={{
              padding: '16px',
              background: 'white',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Message Input */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <input
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '24px',
                    fontSize: '0.9375rem',
                    outline: 'none'
                  }}
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || sending}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: config?.theme?.colors?.primary || '#E31C23',
                    border: 'none',
                    color: 'white',
                    fontSize: '1.25rem',
                    cursor: (!replyText.trim() || sending) ? 'not-allowed' : 'pointer',
                    opacity: (!replyText.trim() || sending) ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ➤
                </button>
              </div>
              
              {/* WhatsApp Send Button */}
              <WhatsAppReplyButton 
                phone={selectedConversation?.phone}
                message={replyText}
                userName={selectedConversation?.user_name}
                disabled={!replyText.trim() || !selectedConversation?.phone}
              />
              
              <p style={{ 
                margin: 0, 
                fontSize: '0.75rem', 
                color: '#9CA3AF', 
                textAlign: 'center' 
              }}>
                Tip: Type your reply above, then click "Send via WhatsApp" to send
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ChatAdmin;
