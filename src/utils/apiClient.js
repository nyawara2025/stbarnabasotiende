// API Client Utility for Care Kenya Welfare App
// Handles all HTTP requests to n8n webhooks

import { API_ENDPOINTS } from '../config/apiConfig';

// Storage keys
export const STORAGE_KEYS = {
  CURRENT_USER: 'carekenya_welfare_current_user',
  AUTH_TOKEN: 'carekenya_welfare_auth_token',
  USER_ID: 'carekenya_welfare_user_id',
};

// Get org_id from config (uses ConfigContext or window.config)
export let cachedConfig = null;

// Store config when loaded
export const setConfig = (config) => {
  console.log('[apiClient] setConfig called with:', config?.identity?.orgId);
  cachedConfig = config;
};

const getOrgId = () => {
  try {
    console.log('[apiClient] getOrgId called, cachedConfig:', cachedConfig?.identity?.orgId);
    console.log('[apiClient] window.config:', window.config?.identity?.orgId);
    
    // First try cached config (set by App.jsx after loading)
    if (cachedConfig?.identity?.orgId) {
      const orgId = parseInt(cachedConfig.identity.orgId, 10);
      console.log('[apiClient] Returning orgId from cachedConfig:', orgId);
      if (!isNaN(orgId)) return orgId;
    }
    
    // Fallback to window.config
    if (window.config?.identity?.orgId) {
      const orgId = parseInt(window.config.identity.orgId, 10);
      console.log('[apiClient] Returning orgId from window.config:', orgId);
      if (!isNaN(orgId)) return orgId;
    }
  } catch (e) {
    console.warn('Could not get org_id:', e);
  }
  console.log('[apiClient] getOrgId returning null');
  return null;
};

/**
 * Generic API request handler
 */
export const apiRequest = async (url, options = {}) => {
  const orgId = getOrgId();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(orgId && { 'x-org-id': orgId }),
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    const text = await response.text();
    
    if (!text || text.trim() === '') {
      throw new Error('Empty response from server');
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Invalid JSON response: ${parseError.message}`);
    }

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    
    throw error;
  }
};

/**
 * Login user via n8n webhook
 */
export const loginResident = async (phone, memberId) => {
  const response = await apiRequest(API_ENDPOINTS.residentLogin, {
    method: 'POST',
    body: JSON.stringify({ 
      phone, 
      identifier: memberId 
    }),
  });

  // Handle array response
  let userResponse = response;
  if (Array.isArray(response) && response.length > 0) {
    userResponse = response[0];
  }

  if (!userResponse || !userResponse.id) {
    throw new Error('Invalid response from server');
  }

  // Handle name fields
  let firstName = userResponse.first_name;
  let lastName = userResponse.last_name;
  
  if ((!firstName || !lastName) && userResponse.full_name) {
    const nameParts = userResponse.full_name.split(' ');
    firstName = nameParts[0] || '';
    lastName = nameParts.slice(1).join(' ') || '';
  }

  // Store auth data
  const userData = {
    id: userResponse.id,
    username: userResponse.username,
    first_name: firstName,
    last_name: lastName,
    full_name: userResponse.full_name,
    email: userResponse.email,
    phone: userResponse.phone,
    role: userResponse.role,
    org_id: userResponse.org_id,
    member_id: userResponse.member_id,
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
  localStorage.setItem(STORAGE_KEYS.USER_ID, userResponse.id);

  return { user: userData, token: userResponse.token || 'api_token' };
};

/**
 * Auth hook for login
 */
export const useAuth = () => {
  const login = async (phone, memberId) => {
    return await loginResident(phone, memberId);
  };

  return { login };
};

/**
 * Get the stored current user
 */
export const getStoredUser = () => {
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error('Error parsing stored user:', e);
    return null;
  }
};

/**
 * Get the stored user ID
 */
export const getStoredUserId = () => {
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
};

/**
 * Clear all auth data (logout)
 */
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
};

/**
 * Get broadcasts
 */
export const getBroadcasts = async () => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.getBroadcasts, {
    method: 'POST',
    body: JSON.stringify({ user_id: parseInt(userId) }),
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from server');
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.broadcasts && Array.isArray(response.broadcasts)) {
    return response.broadcasts;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Get count of unread broadcasts
 */
export const getUnreadBroadcastsCount = async () => {
  try {
    const broadcasts = await getBroadcasts();
    return broadcasts.filter(b => !b.read_status).length;
  } catch (error) {
    console.error('Error getting unread broadcasts count:', error);
    return 0;
  }
};

/**
 * Mark a broadcast as read
 */
export const markBroadcastRead = async (broadcastId) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.markBroadcastRead, {
    method: 'POST',
    body: JSON.stringify({
      broadcast_id: broadcastId,
      user_id: parseInt(userId),
    }),
  });

  return response;
};

/**
 * Get active shops for Sokoni marketplace
 */
export const getActiveShops = async () => {
  const response = await apiRequest(API_ENDPOINTS.getActiveShops, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from server');
  }

  return response.shops || response.data || [];
};

// =====================
// Marketplace Inquiry Functions (Sokoni)
// =====================

/**
 * Get customer conversations/inquiries from Sokoni marketplace
 * These are responses from shop owners to product inquiries
 */
export const getCustomerConversations = async () => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.getCustomerConversations, {
    method: 'POST',
    body: JSON.stringify({ user_id: parseInt(userId) }),
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from server');
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.conversations && Array.isArray(response.conversations)) {
    return response.conversations;
  }
  
  if (response.inquiries && Array.isArray(response.inquiries)) {
    return response.inquiries;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Get inquiry responses for a specific conversation
 */
export const getInquiryResponses = async (conversationId) => {
  const response = await apiRequest(API_ENDPOINTS.getInquiryResponses, {
    method: 'POST',
    body: JSON.stringify({ conversation_id: conversationId }),
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from server');
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.responses && Array.isArray(response.responses)) {
    return response.responses;
  }
  
  if (response.messages && Array.isArray(response.messages)) {
    return response.messages;
  }

  return [];
};

// =====================
// MPESA Payment Functions
// =====================

/**
 * Initiate M-PESA STK Push payment
 */
export const initiateSTKPush = async (phoneNumber, amount, accountReference) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.initiatePayment, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      phone: phoneNumber,
      amount: amount,
      account_reference: accountReference,
      description: 'Care Kenya Welfare Contribution'
    }),
  });

  return response;
};

/**
 * Check payment status after STK push
 */
export const checkPaymentStatus = async (checkoutRequestId) => {
  const response = await apiRequest(API_ENDPOINTS.checkPaymentStatus, {
    method: 'POST',
    body: JSON.stringify({
      checkout_request_id: checkoutRequestId
    }),
  });

  return response;
};

/**
 * Record a payment manually (offline or confirmed)
 */
export const recordPayment = async (paymentData) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.recordPayment, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      amount: paymentData.amount,
      payment_method: paymentData.paymentMethod || 'offline',
      payment_date: new Date().toISOString(),
      reference: paymentData.reference,
      notes: paymentData.notes || ''
    }),
  });

  return response;
};

/**
 * Get payment history for user
 */
export const getPaymentHistory = async () => {
  const user = getStoredUser();
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  try {
    const response = await apiRequest(API_ENDPOINTS.getPaymentHistory, {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: parseInt(userId),
        org_id: user?.org_id || parseInt(window.config?.identity?.orgId, 10) || 1
      }),
    });

    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response from server');
    }

    if (Array.isArray(response)) {
      return response;
    }
    
    if (response.payments && Array.isArray(response.payments)) {
      return response.payments;
    }
    
    if (response.history && Array.isArray(response.history)) {
      return response.history;
    }
    
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching payment history:', error);
    // Return empty array on error - don't break the app
    return [];
  }
};

// =====================
// Meeting Notes Functions
// =====================

/**
 * Get meeting notes/documents
 */
export const getMeetingNotes = async (category = null) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const payload = { user_id: parseInt(userId) };
  if (category && category !== 'All') {
    payload.category = category;
  }

  const response = await apiRequest(API_ENDPOINTS.getMeetingNotes, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from server');
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.notes && Array.isArray(response.notes)) {
    return response.notes;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

// =====================
// Welfare Support Functions
// =====================

/**
 * Get welfare support requests
 */
export const getSupportRequests = async () => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.getSupportRequests, {
    method: 'POST',
    body: JSON.stringify({ user_id: parseInt(userId) }),
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from server');
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.support_requests && Array.isArray(response.support_requests)) {
    return response.support_requests;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Create a welfare support request
 */
export const createSupportRequest = async (supportData) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.createSupportRequest, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      support_type: supportData.supportType,
      title: supportData.title,
      description: supportData.description,
      requested_amount: supportData.requestedAmount,
      urgency_level: supportData.urgencyLevel || 'normal'
    }),
  });

  return response;
};

/**
 * Make a donation to a support request
 */
export const makeDonation = async (supportId, amount, message = '') => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.makeDonation, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      support_id: supportId,
      amount: amount,
      message: message
    }),
  });

  return response;
};

// =====================
// Chat Functions
// =====================

/**
 * Get chat messages for the current user
 * Includes internal chat and WhatsApp messages
 */
export const getChatMessages = async () => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.getChatHistory, {
    method: 'POST',
    body: JSON.stringify({ user_id: parseInt(userId) }),
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from server');
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (response.messages && Array.isArray(response.messages)) {
    return response.messages;
  }

  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Get all chat conversations for admin dashboard
 */
export const getAllChatConversations = async (orgId) => {
  const response = await apiRequest(API_ENDPOINTS.getAllChatConversations, {
    method: 'POST',
    body: JSON.stringify({ org_id: orgId }),
  });

  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response from server');
  }

  if (response.conversations && Array.isArray(response.conversations)) {
    return response.conversations;
  }

  return [];
};

/**
 * Send chat reply from admin
 */
export const sendChatReply = async (replyData) => {
  const response = await apiRequest(API_ENDPOINTS.sendChatReply, {
    method: 'POST',
    body: JSON.stringify({
      org_id: replyData.org_id,
      user_id: replyData.user_id,
      admin_id: replyData.admin_id,
      admin_name: replyData.admin_name,
      message: replyData.message,
      timestamp: replyData.timestamp
    }),
  });

  return response;
};

// =====================
// Broadcast Admin Functions
// =====================

/**
 * Get phases for admin broadcast targeting
 */
export const getPhases = async () => {
  const response = await apiRequest(API_ENDPOINTS.getPhases, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.phases && Array.isArray(response.phases)) {
    return response.phases;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Get blocks for admin broadcast targeting
 */
export const getBlocks = async (phaseId = null) => {
  const payload = {};
  if (phaseId) {
    payload.phase_id = phaseId;
  }

  const response = await apiRequest(API_ENDPOINTS.getBlocks, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.blocks && Array.isArray(response.blocks)) {
    return response.blocks;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Create a broadcast/update
 */
export const createBroadcast = async (broadcastData) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.createBroadcast, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      title: broadcastData.title,
      content: broadcastData.content,
      category: broadcastData.category || 'General',
      priority: broadcastData.priority || 'Normal',
      target_type: broadcastData.targetType || 'all',
      target_phase: broadcastData.targetPhase || null,
      target_block: broadcastData.targetBlock || null,
      expiry_date: broadcastData.expiryDate || null
    }),
  });

  return response;
};

// =====================
// Profile Functions
// =====================

/**
 * Get user profile
 */
export const getProfile = async () => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.getProfile, {
    method: 'POST',
    body: JSON.stringify({ user_id: parseInt(userId) }),
  });

  return response;
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.updateProfile, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      ...profileData
    }),
  });

  return response;
};

// =====================
// Utility Functions
// =====================

/**
 * Get vacant houses (placeholder for this app)
 */
export const getVacantHouses = async () => {
  return { total_vacant: 0, vacant_by_phase: [], apartments: [] };
};

// Default export with all functions
export default {
  apiRequest,
  loginResident,
  useAuth,
  getStoredUser,
  getStoredUserId,
  clearAuthData,
  getBroadcasts,
  getUnreadBroadcastsCount,
  markBroadcastRead,
  getActiveShops,
  getCustomerConversations,
  getInquiryResponses,
  getVacantHouses,
  getPaymentHistory,
  initiateSTKPush,
  checkPaymentStatus,
  recordPayment,
  getMeetingNotes,
  getSupportRequests,
  createSupportRequest,
  makeDonation,
  getProfile,
  updateProfile,
  getPhases,
  getBlocks,
  createBroadcast,
  getChatMessages,
  getAllChatConversations,
  sendChatReply,
  STORAGE_KEYS,
};
