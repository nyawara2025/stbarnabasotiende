import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, apiRequest, getChatMessages } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/apiConfig';
import { ConfigContext } from '../App';

const Chat = () => {
  const navigate = useNavigate();
  const config = useContext(ConfigContext);
  const [user] = useState(() => getStoredUser());
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const messagesEndRef = useRef(null);
  const initialized = useRef(false);
  const lastSyncRef = useRef(null);

  // Get config values with fallbacks
  const whatsappNumber = config?.modules?.support?.whatsappNumber || '+254700000000';
  const orgName = config?.identity?.name || 'St. Barnabas Church';
  const orgId = user?.org_id || user?.orgId || 1;

  // Load chat history from server (includes WhatsApp messages)
  const loadChatMessages = async () => {
    try {
      const serverMessages = await getChatMessages();
      if (serverMessages && serverMessages.length > 0) {
        // Merge server messages with local messages
        setMessages(prev => {
          const localIds = new Set(prev.filter(m => m.id < 1000000000).map(m => m.id));
          const newMessages = serverMessages.filter(m => !localIds.has(m.id));
          if (newMessages.length === 0) return prev;
          return [...prev, ...newMessages];
        });
      }
    } catch (error) {
      console.warn('Could not load chat messages:', error);
    }
  };

  // Initial load and polling for WhatsApp message receipts
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      
      // Load welcome message and server messages
      const initChat = async () => {
        setMessages([
          {
            id: 1,
            text: `Welcome to ${orgName} Support! ⛪\n\nHow can we help you today? You can:\n\n• Ask questions about church activities or contributions\n• Use the WhatsApp button below to chat directly with our team\n• Leave a message and we'll respond shortly`,
            sender: 'admin',
            timestamp: new Date().toISOString()
          }
        ]);
        
        // Load existing chat history (includes WhatsApp messages)
        await loadChatMessages();
        lastSyncRef.current = new Date().toISOString();
      };
      
      initChat();
    }
  }, [user, orgName]);

  // Poll for new messages (WhatsApp receipts) every 10 seconds
  useEffect(() => {
    if (!initialized.current) return;

    const pollInterval = setInterval(async () => {
      try {
        await loadChatMessages();
        lastSyncRef.current = new Date().toISOString();
      } catch (error) {
        // Silent fail for polling
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [user]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString(),
      source: 'app'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Send to N8N for automated response
      const response = await apiRequest(API_ENDPOINTS.sendChatMessage, {
        method: 'POST',
        body: JSON.stringify({
          org_id: orgId,
          user_id: user?.id,
          user_name: user?.full_name || user?.first_name,
          phone: user?.phone,
          message: userMessage.text,
          timestamp: userMessage.timestamp
        })
      });

      // Get reply text
      let replyText = 'Thank you for your message. Our church team will respond shortly.';
      
      if (response && response.reply) {
        replyText = response.reply;
      } else if (typeof response === 'string') {
        replyText = response;
      } else if (response && response.data) {
        replyText = response.data.reply || replyText;
      }

      const adminResponse = {
        id: Date.now() + 1,
        text: replyText,
        sender: 'admin',
        timestamp: new Date().toISOString(),
        source: 'auto'
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, adminResponse]);
      }, 500);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: 'Thanks for your message! For urgent matters, please use the WhatsApp button below. We\'ll respond shortly.',
        sender: 'admin',
        timestamp: new Date().toISOString(),
        source: 'auto'
      };
      setTimeout(() => {
        setMessages(prev => [...prev, errorResponse]);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  // Manual sync for WhatsApp messages
  const handleSync = async () => {
    setSyncing(true);
    await loadChatMessages();
    lastSyncRef.current = new Date().toISOString();
    setSyncing(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
  };

  const getSourceLabel = (source) => {
    if (source === 'whatsapp') return 'WhatsApp';
    if (source === 'app') return 'App';
    return '';
  };

  const openWhatsApp = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${orgName}, I need assistance.`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const primaryColor = config?.theme?.colors?.primary || '#7C3AED';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div style={styles.headerInfo}>
          <h1 style={styles.title}>Support Chat</h1>
          <span style={styles.status}>● Auto-sync enabled</span>
        </div>
        <button 
          style={styles.syncButton} 
          onClick={handleSync}
          disabled={syncing}
          title="Sync WhatsApp messages"
        >
          {syncing ? '↻' : '🔄'}
        </button>
      </div>

      {/* WhatsApp Quick Action */}
      {showWhatsApp && (
        <div style={styles.whatsappBanner}>
          <div style={styles.whatsappContent}>
            <span style={styles.whatsappIcon}>📱</span>
            <div>
              <p style={styles.whatsappTitle}>Chat on WhatsApp</p>
              <p style={styles.whatsappSubtitle}>Get instant response from our team</p>
            </div>
          </div>
          <button style={styles.whatsappButton} onClick={openWhatsApp}>
            Open WhatsApp
          </button>
        </div>
      )}

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => {
          // Show date separator
          const showDate = index === 0 || formatDate(msg.timestamp) !== formatDate(messages[index - 1].timestamp);
          const isUser = msg.sender === 'user';
          const sourceLabel = getSourceLabel(msg.source);
          
          return (
            <React.Fragment key={msg.id}>
              {showDate && (
                <div style={styles.dateSeparator}>
                  <span style={styles.dateLabel}>{formatDate(msg.timestamp)}</span>
                </div>
              )}
              <div
                style={{
                  ...styles.messageWrapper,
                  justifyContent: isUser ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  ...styles.messageBubble,
                  background: isUser ? primaryColor : '#f3f4f6',
                  color: isUser ? 'white' : '#1f2937',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
                }}>
                  {/* Source indicator for WhatsApp messages */}
                  {!isUser && sourceLabel && (
                    <span style={styles.sourceLabel}>📱 {sourceLabel}</span>
                  )}
                  <p style={styles.messageText}>{msg.text}</p>
                  <span style={{
                    ...styles.timestamp,
                    color: isUser ? 'rgba(255,255,255,0.7)' : '#9ca3af'
                  }}>
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        
        {loading && (
          <div style={{ ...styles.messageWrapper, justifyContent: 'flex-start' }}>
            <div style={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        {['Service times?', 'My contributions?', 'Prayer request', 'Church events'].map((q) => (
          <button
            key={q}
            style={styles.quickButton}
            onClick={() => setInputText(q)}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <button style={styles.whatsappBtn} onClick={openWhatsApp} title="Chat on WhatsApp">
          💬
        </button>
        <input
          style={styles.input}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button
          style={{
            ...styles.sendButton,
            background: primaryColor,
            opacity: inputText.trim() && !loading ? 1 : 0.5,
            cursor: inputText.trim() && !loading ? 'pointer' : 'not-allowed'
          }}
          onClick={handleSend}
          disabled={!inputText.trim() || loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#f3f4f6',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    gap: '12px',
  },
  backButton: {
    padding: '8px 12px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1f2937',
  },
  status: {
    fontSize: '0.75rem',
    color: '#22c55e',
  },
  syncButton: {
    padding: '8px 12px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  whatsappBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#25D366',
    color: 'white',
  },
  whatsappContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  whatsappIcon: {
    fontSize: '1.5rem',
  },
  whatsappTitle: {
    margin: 0,
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  whatsappSubtitle: {
    margin: '2px 0 0',
    fontSize: '0.75rem',
    opacity: 0.9,
  },
  whatsappButton: {
    padding: '8px 16px',
    background: 'white',
    color: '#25D366',
    border: 'none',
    borderRadius: '20px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  dateSeparator: {
    display: 'flex',
    justifyContent: 'center',
    margin: '8px 0',
  },
  dateLabel: {
    background: '#e5e7eb',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  messageWrapper: {
    display: 'flex',
    width: '100%',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '12px 16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  sourceLabel: {
    fontSize: '0.7rem',
    opacity: 0.8,
    marginBottom: '4px',
    display: 'block',
  },
  messageText: {
    margin: '0 0 4px 0',
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    whiteSpace: 'pre-wrap',
  },
  timestamp: {
    fontSize: '0.6875rem',
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
    padding: '12px 16px',
    background: '#f3f4f6',
    borderRadius: '16px',
  },
  quickActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    padding: '12px 16px',
    background: 'white',
    borderTop: '1px solid #e5e7eb',
  },
  quickButton: {
    padding: '8px 12px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '16px',
    fontSize: '0.75rem',
    color: '#374151',
    cursor: 'pointer',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'white',
    borderTop: '1px solid #e5e7eb',
    gap: '12px',
  },
  whatsappBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#25D366',
    border: 'none',
    color: 'white',
    fontSize: '1.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '24px',
    fontSize: '0.9375rem',
    outline: 'none',
  },
  sendButton: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    color: 'white',
    fontSize: '1.125rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default Chat;
