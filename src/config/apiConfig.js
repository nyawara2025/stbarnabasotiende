// API Configuration for St. Barnabas Church App
// Multi-tenant N8N Webhook Endpoints (using /church/ for all endpoints)
// Organization ID is passed via x-org-id header for multi-tenant support

export const API_ENDPOINTS = {
  // Authentication
  memberLogin: 'https://n8n.tenear.com/webhook/stbarnabas/login',
  
  // Dashboard
  getDashboard: 'https://n8n.tenear.com/webhook/church/dashboard',
  
  // Broadcasts/Updates
  getBroadcasts: 'https://n8n.tenear.com/webhook/church/broadcasts',
  markBroadcastRead: 'https://n8n.tenear.com/webhook/church/broadcast-read',
  createBroadcast: 'https://n8n.tenear.com/webhook/church/broadcast-create',
  
  // Zones (replaces phases)
  getZones: 'https://n8n.tenear.com/webhook/church/zones',
  
  // Ministries
  getMinistries: 'https://n8n.tenear.com/webhook/church/ministries',
  
  // Sermons
  getSermons: 'https://n8n.tenear.com/webhook/church/sermons',
  getSermon: 'https://n8n.tenear.com/webhook/church/sermon',
  createSermon: 'https://n8n.tenear.com/webhook/church/sermon-create',
  
  // Prayer Requests
  getPrayerRequests: 'https://n8n.tenear.com/webhook/church/prayer-requests',
  createPrayerRequest: 'https://n8n.tenear.com/webhook/church/prayer-request-create',
  updatePrayerRequest: 'https://n8n.tenear.com/webhook/church/prayer-request-update',
  
  // Meetings
  getMeetings: 'https://n8n.tenear.com/webhook/church/meetings',
  getMeeting: 'https://n8n.tenear.com/webhook/church/meeting',
  createMeeting: 'https://n8n.tenear.com/webhook/church/meeting-create',
  updateMeeting: 'https://n8n.tenear.com/webhook/church/meeting-update',
  
  // Meeting Attendance
  getMeetingAttendance: 'https://n8n.tenear.com/webhook/church/meeting-attendance',
  recordAttendance: 'https://n8n.tenear.com/webhook/church/attendance-record',
  
  // Meeting Notes & Agenda
  getMeetingNotes: 'https://n8n.tenear.com/webhook/church/meeting-notes',
  saveMeetingNotes: 'https://n8n.tenear.com/webhook/church/meeting-notes-save',
  getMeetingAgenda: 'https://n8n.tenear.com/webhook/church/meeting-agenda',
  
  // Photo Gallery
  getGalleryAlbums: 'https://n8n.tenear.com/webhook/church/gallery-albums',
  getGalleryPhotos: 'https://n8n.tenear.com/webhook/church/gallery-photos',
  uploadPhoto: 'https://n8n.tenear.com/webhook/church/gallery-upload',
  
  // Services (Sunday Service Order)
  getServiceOrder: 'https://n8n.tenear.com/webhook/church/service-order',
  getUpcomingServices: 'https://n8n.tenear.com/webhook/church/services-upcoming',
  
  // MPESA Payments / Contributions
  initiatePayment: 'https://n8n.tenear.com/webhook/church/stk-push',
  checkPaymentStatus: 'https://n8n.tenear.com/webhook/church/payment-status',
  recordPayment: 'https://n8n.tenear.com/webhook/church/record-payment',
  getPaymentHistory: 'https://n8n.tenear.com/webhook/church/payments-history',
  getContributionCategories: 'https://n8n.tenear.com/webhook/church/contribution-categories',
  
  // Treasurer Functions
  getTreasurerDashboard: 'https://n8n.tenear.com/webhook/church/treasurer-dashboard',
  getAllContributions: 'https://n8n.tenear.com/webhook/church/contributions-all',
  createReceipt: 'https://n8n.tenear.com/webhook/church/receipt-create',
  getBankReconciliation: 'https://n8n.tenear.com/webhook/church/bank-reconciliation',
  
  // Chat Support
  sendChatMessage: 'https://n8n.tenear.com/webhook/church/chat',
  getChatHistory: 'https://n8n.tenear.com/webhook/church/chat-history',
  getAllChatConversations: 'https://n8n.tenear.com/webhook/church/chat-conversations',
  sendChatReply: 'https://n8n.tenear.com/webhook/church/chat-reply',
  
  // Profile
  updateProfile: 'https://n8n.tenear.com/webhook/church/profile-update',
  getProfile: 'https://n8n.tenear.com/webhook/church/profile',
  
  // Members Directory
  getMembers: 'https://n8n.tenear.com/webhook/church/members',
  getMembersByZone: 'https://n8n.tenear.com/webhook/church/members-by-zone',
  getMembersByMinistry: 'https://n8n.tenear.com/webhook/church/members-by-ministry',
};

export default API_ENDPOINTS;
