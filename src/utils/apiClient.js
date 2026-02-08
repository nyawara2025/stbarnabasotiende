// API Client Utility for St. Barnabas Church App
// Handles all HTTP requests to n8n webhooks

import { API_ENDPOINTS } from '../config/apiConfig';

// Storage keys - St. Barnabas Church specific
export const STORAGE_KEYS = {
  CURRENT_USER: 'stbarnabas_church_current_user',
  AUTH_TOKEN: 'stbarnabas_church_auth_token',
  USER_ID: 'stbarnabas_church_user_id',
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
 * Login member via n8n webhook
 */
export const loginMember = async (phone, memberId) => {
  const response = await apiRequest(API_ENDPOINTS.memberLogin, {
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

  // Store auth data - now includes zone and ministry info
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
    // Church-specific fields
    zone_id: userResponse.zone_id,
    zone_name: userResponse.zone_name,
    ministry_id: userResponse.ministry_id,
    ministry_name: userResponse.ministry_name,
    is_treasurer: userResponse.is_treasurer || false,
  };

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userData));
  localStorage.setItem(STORAGE_KEYS.USER_ID, userResponse.id);

  return { user: userData, token: userResponse.token || 'api_token' };
};

// Keep the old function name for backwards compatibility
export const loginResident = loginMember;

/**
 * Auth hook for login
 */
export const useAuth = () => {
  const login = async (phone, memberId) => {
    return await loginMember(phone, memberId);
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

// =====================
// Dashboard Functions
// =====================

/**
 * Get member dashboard data
 * Returns statistics, recent activity, and quick info for the home page
 */
export const getMemberDashboard = async () => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  try {
    const response = await apiRequest(API_ENDPOINTS.getDashboard, {
      method: 'POST',
      body: JSON.stringify({ user_id: parseInt(userId) }),
    });

    // Return structured dashboard data
    return {
      stats: response.stats || {
        totalContributions: response.total_contributions || 0,
        pendingPrayers: response.pending_prayers || 0,
        upcomingMeetings: response.upcoming_meetings || 0,
        unreadBroadcasts: response.unread_broadcasts || 0,
      },
      recentActivity: response.recent_activity || response.activities || [],
      upcomingEvents: response.upcoming_events || response.events || [],
      quickInfo: {
        nextService: response.next_service || null,
        currentSermon: response.current_sermon || null,
        zone: response.zone || null,
        ministry: response.ministry || null,
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    // Return default empty structure on error
    return {
      stats: {
        totalContributions: 0,
        pendingPrayers: 0,
        upcomingMeetings: 0,
        unreadBroadcasts: 0,
      },
      recentActivity: [],
      upcomingEvents: [],
      quickInfo: {
        nextService: null,
        currentSermon: null,
        zone: null,
        ministry: null,
      }
    };
  }
};

// =====================
// Broadcast Functions
// =====================

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
      target_zone: broadcastData.targetZone || null,
      target_ministry: broadcastData.targetMinistry || null,
      expiry_date: broadcastData.expiryDate || null
    }),
  });

  return response;
};

// =====================
// Sermons Functions
// =====================

/**
 * Get all sermons
 */
export const getSermons = async (filters = {}) => {
  const response = await apiRequest(API_ENDPOINTS.getSermons, {
    method: 'POST',
    body: JSON.stringify({
      limit: filters.limit || 20,
      offset: filters.offset || 0,
      category: filters.category || null,
      search: filters.search || null,
    }),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.sermons && Array.isArray(response.sermons)) {
    return response.sermons;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Get a single sermon by ID
 */
export const getSermon = async (sermonId) => {
  const response = await apiRequest(API_ENDPOINTS.getSermon, {
    method: 'POST',
    body: JSON.stringify({ sermon_id: sermonId }),
  });

  return response;
};

/**
 * Create a new sermon (admin only)
 */
export const createSermon = async (sermonData) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.createSermon, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      title: sermonData.title,
      preacher: sermonData.preacher,
      scripture: sermonData.scripture,
      content: sermonData.content,
      video_url: sermonData.videoUrl || null,
      audio_url: sermonData.audioUrl || null,
      sermon_date: sermonData.sermonDate || new Date().toISOString(),
      category: sermonData.category || 'Sunday Service',
    }),
  });

  return response;
};

// =====================
// Prayer Request Functions
// =====================

/**
 * Get prayer requests
 */
export const getPrayerRequests = async (filters = {}) => {
  const userId = getStoredUserId();
  
  const response = await apiRequest(API_ENDPOINTS.getPrayerRequests, {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId ? parseInt(userId) : null,
      status: filters.status || null,
      my_requests_only: filters.myRequestsOnly || false,
    }),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.prayer_requests && Array.isArray(response.prayer_requests)) {
    return response.prayer_requests;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Create a prayer request
 */
export const createPrayerRequest = async (requestData) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.createPrayerRequest, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      title: requestData.title,
      description: requestData.description,
      is_anonymous: requestData.isAnonymous || false,
      urgency: requestData.urgency || 'normal',
      category: requestData.category || 'General',
    }),
  });

  return response;
};

/**
 * Update a prayer request (for canon/admin to mark as prayed for, etc.)
 */
export const updatePrayerRequest = async (requestId, updateData) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.updatePrayerRequest, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      request_id: requestId,
      status: updateData.status,
      response_note: updateData.responseNote || null,
    }),
  });

  return response;
};

// =====================
// Meeting Functions
// =====================

/**
 * Get all meetings
 */
export const getMeetings = async (filters = {}) => {
  const userId = getStoredUserId();

  const response = await apiRequest(API_ENDPOINTS.getMeetings, {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId ? parseInt(userId) : null,
      type: filters.type || null,
      zone_id: filters.zoneId || null,
      ministry_id: filters.ministryId || null,
      status: filters.status || 'upcoming',
    }),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.meetings && Array.isArray(response.meetings)) {
    return response.meetings;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

/**
 * Get a single meeting by ID
 */
export const getMeeting = async (meetingId) => {
  const response = await apiRequest(API_ENDPOINTS.getMeeting, {
    method: 'POST',
    body: JSON.stringify({ meeting_id: meetingId }),
  });

  return response;
};

/**
 * Create a new meeting
 */
export const createMeeting = async (meetingData) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.createMeeting, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      title: meetingData.title,
      description: meetingData.description,
      meeting_type: meetingData.meetingType,
      zone_id: meetingData.zoneId || null,
      ministry_id: meetingData.ministryId || null,
      meeting_date: meetingData.meetingDate,
      start_time: meetingData.startTime,
      end_time: meetingData.endTime,
      location: meetingData.location,
      agenda: meetingData.agenda || [],
    }),
  });

  return response;
};

/**
 * Get meeting attendance
 */
export const getMeetingAttendance = async (meetingId) => {
  const response = await apiRequest(API_ENDPOINTS.getMeetingAttendance, {
    method: 'POST',
    body: JSON.stringify({ meeting_id: meetingId }),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.attendance && Array.isArray(response.attendance)) {
    return response.attendance;
  }

  return [];
};

/**
 * Record meeting attendance
 */
export const recordAttendance = async (meetingId, memberIds) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.recordAttendance, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      meeting_id: meetingId,
      member_ids: memberIds,
      recorded_at: new Date().toISOString(),
    }),
  });

  return response;
};

/**
 * Get meeting notes
 */
export const getMeetingNotes = async (meetingId) => {
  const response = await apiRequest(API_ENDPOINTS.getMeetingNotes, {
    method: 'POST',
    body: JSON.stringify({ meeting_id: meetingId }),
  });

  return response;
};

/**
 * Save meeting notes
 */
export const saveMeetingNotes = async (meetingId, notes) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.saveMeetingNotes, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      meeting_id: meetingId,
      notes: notes,
      saved_at: new Date().toISOString(),
    }),
  });

  return response;
};

// =====================
// Photo Gallery Functions
// =====================

/**
 * Get gallery albums
 */
export const getGalleryAlbums = async () => {
  const response = await apiRequest(API_ENDPOINTS.getGalleryAlbums, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.albums && Array.isArray(response.albums)) {
    return response.albums;
  }

  return [];
};

/**
 * Get photos from an album
 */
export const getGalleryPhotos = async (albumId = null) => {
  const response = await apiRequest(API_ENDPOINTS.getGalleryPhotos, {
    method: 'POST',
    body: JSON.stringify({ album_id: albumId }),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.photos && Array.isArray(response.photos)) {
    return response.photos;
  }

  return [];
};

// =====================
// Service Order Functions
// =====================

/**
 * Get service order for a specific date/service
 */
export const getServiceOrder = async (serviceType = null, date = null) => {
  const response = await apiRequest(API_ENDPOINTS.getServiceOrder, {
    method: 'POST',
    body: JSON.stringify({
      service_type: serviceType,
      date: date || new Date().toISOString().split('T')[0],
    }),
  });

  return response;
};

/**
 * Get upcoming services
 */
export const getUpcomingServices = async () => {
  const response = await apiRequest(API_ENDPOINTS.getUpcomingServices, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.services && Array.isArray(response.services)) {
    return response.services;
  }

  return [];
};

// =====================
// Zones Functions
// =====================

/**
 * Get all zones
 */
export const getZones = async () => {
  const response = await apiRequest(API_ENDPOINTS.getZones, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.zones && Array.isArray(response.zones)) {
    return response.zones;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

// =====================
// Ministries Functions
// =====================

/**
 * Get all ministries
 */
export const getMinistries = async () => {
  const response = await apiRequest(API_ENDPOINTS.getMinistries, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.ministries && Array.isArray(response.ministries)) {
    return response.ministries;
  }
  
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  return [];
};

// =====================
// MPESA Payment Functions
// =====================

/**
 * Initiate M-PESA STK Push payment
 */
export const initiateSTKPush = async (phoneNumber, amount, accountReference, category = null) => {
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
      category: category,
      description: 'St. Barnabas Church Contribution'
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
      category: paymentData.category,
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
    return [];
  }
};

/**
 * Get contribution categories
 */
export const getContributionCategories = async () => {
  const response = await apiRequest(API_ENDPOINTS.getContributionCategories, {
    method: 'POST',
    body: JSON.stringify({}),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.categories && Array.isArray(response.categories)) {
    return response.categories;
  }

  return [];
};

// =====================
// Treasurer Functions
// =====================

/**
 * Get treasurer dashboard
 */
export const getTreasurerDashboard = async () => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.getTreasurerDashboard, {
    method: 'POST',
    body: JSON.stringify({ user_id: parseInt(userId) }),
  });

  return response;
};

/**
 * Get all contributions (treasurer only)
 */
export const getAllContributions = async (filters = {}) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.getAllContributions, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      start_date: filters.startDate || null,
      end_date: filters.endDate || null,
      category: filters.category || null,
      zone_id: filters.zoneId || null,
    }),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.contributions && Array.isArray(response.contributions)) {
    return response.contributions;
  }

  return [];
};

/**
 * Create a receipt
 */
export const createReceipt = async (receiptData) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.createReceipt, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      contribution_id: receiptData.contributionId,
      receipt_number: receiptData.receiptNumber,
      notes: receiptData.notes || '',
    }),
  });

  return response;
};

/**
 * Get bank reconciliation data
 */
export const getBankReconciliation = async (filters = {}) => {
  const userId = getStoredUserId();
  if (!userId) {
    throw new Error('User not logged in');
  }

  const response = await apiRequest(API_ENDPOINTS.getBankReconciliation, {
    method: 'POST',
    body: JSON.stringify({
      user_id: parseInt(userId),
      start_date: filters.startDate || null,
      end_date: filters.endDate || null,
    }),
  });

  return response;
};

// =====================
// Chat Functions
// =====================

/**
 * Get chat messages for the current user
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
// Members Functions
// =====================

/**
 * Get all members
 */
export const getMembers = async (filters = {}) => {
  const response = await apiRequest(API_ENDPOINTS.getMembers, {
    method: 'POST',
    body: JSON.stringify({
      search: filters.search || null,
      zone_id: filters.zoneId || null,
      ministry_id: filters.ministryId || null,
    }),
  });

  if (!response || typeof response !== 'object') {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }
  
  if (response.members && Array.isArray(response.members)) {
    return response.members;
  }

  return [];
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
// Legacy Compatibility Functions
// =====================

// These functions are kept for backwards compatibility with the template

export const getVacantHouses = async () => {
  return { total_vacant: 0, vacant_by_phase: [], apartments: [] };
};

export const getPhases = getZones;  // Alias for compatibility
export const getBlocks = getZones;  // Alias for compatibility

export const getActiveShops = async () => {
  return [];  // Not applicable for church app
};

export const getCustomerConversations = async () => {
  return [];  // Not applicable for church app
};

export const getInquiryResponses = async () => {
  return [];  // Not applicable for church app
};

export const getSupportRequests = async () => {
  return [];  // Use prayer requests instead
};

export const createSupportRequest = async () => {
  return {};  // Use prayer requests instead
};

export const makeDonation = async () => {
  return {};  // Use contributions instead
};

// Default export with all functions
export default {
  apiRequest,
  loginMember,
  loginResident,
  useAuth,
  getStoredUser,
  getStoredUserId,
  clearAuthData,
  getMemberDashboard,
  getBroadcasts,
  getUnreadBroadcastsCount,
  markBroadcastRead,
  createBroadcast,
  getSermons,
  getSermon,
  createSermon,
  getPrayerRequests,
  createPrayerRequest,
  updatePrayerRequest,
  getMeetings,
  getMeeting,
  createMeeting,
  getMeetingAttendance,
  recordAttendance,
  getMeetingNotes,
  saveMeetingNotes,
  getGalleryAlbums,
  getGalleryPhotos,
  getServiceOrder,
  getUpcomingServices,
  getZones,
  getMinistries,
  initiateSTKPush,
  checkPaymentStatus,
  recordPayment,
  getPaymentHistory,
  getContributionCategories,
  getTreasurerDashboard,
  getAllContributions,
  createReceipt,
  getBankReconciliation,
  getChatMessages,
  getAllChatConversations,
  sendChatReply,
  getMembers,
  getProfile,
  updateProfile,
  // Legacy compatibility
  getVacantHouses,
  getPhases,
  getBlocks,
  getActiveShops,
  getCustomerConversations,
  getInquiryResponses,
  getSupportRequests,
  createSupportRequest,
  makeDonation,
  STORAGE_KEYS,
};
