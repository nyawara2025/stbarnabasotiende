// API Configuration for Care Kenya Welfare App
// Multi-tenant N8N Webhook Endpoints (using /welfare/ for all endpoints)
// Organization ID is passed via x-org-id header for multi-tenant support

export const API_ENDPOINTS = {
  // Authentication
  residentLogin: 'https://n8n.tenear.com/webhook/welfare/login',
  
  // Broadcasts/Updates
  getBroadcasts: 'https://n8n.tenear.com/webhook/welfare/broadcasts',
  markBroadcastRead: 'https://n8n.tenear.com/webhook/welfare/broadcast-read',
  createBroadcast: 'https://n8n.tenear.com/webhook/welfare/broadcast-create',
  getPhases: 'https://n8n.tenear.com/webhook/welfare/phases',
  getBlocks: 'https://n8n.tenear.com/webhook/welfare/blocks',
  
  // Marketplace (Sokoni)
  getActiveShops: 'https://n8n.tenear.com/webhook/welfare/shops',
  getCustomerConversations: 'https://n8n.tenear.com/webhook/welfare/customer-conversations',
  getInquiryResponses: 'https://n8n.tenear.com/webhook/welfare/inquiry-responses',
  
  // MPESA Payments
  initiatePayment: 'https://n8n.tenear.com/webhook/welfare/stk-push',
  checkPaymentStatus: 'https://n8n.tenear.com/webhook/welfare/payment-status',
  recordPayment: 'https://n8n.tenear.com/webhook/welfare/record-payment',
  getPaymentHistory: 'https://n8n.tenear.com/webhook/welfare/payments-history',
  
  // Meeting Notes
  getMeetingNotes: 'https://n8n.tenear.com/webhook/welfare/meeting-notes',
  
  // Chat Support
  sendChatMessage: 'https://n8n.tenear.com/webhook/welfare/chat',
  getChatHistory: 'https://n8n.tenear.com/webhook/welfare/chat-history',
  getAllChatConversations: 'https://n8n.tenear.com/webhook/welfare/chat-conversations',
  getAdminChatConversations: 'https://n8n.tenear.com/webhook/welfare/admin-chat-conversations',
  getChatMessages: 'https://n8n.tenear.com/webhook/welfare/chat-messages',
  sendChatReply: 'https://n8n.tenear.com/webhook/welfare/chat-reply',
  
  // Welfare Support
  getSupportRequests: 'https://n8n.tenear.com/webhook/welfare/support-requests',
  createSupportRequest: 'https://n8n.tenear.com/webhook/welfare/support-request',
  makeDonation: 'https://n8n.tenear.com/webhook/welfare/donate',
  
  // Profile
  updateProfile: 'https://n8n.tenear.com/webhook/welfare/profile-update',
  getProfile: 'https://n8n.tenear.com/webhook/welfare/profile',
};

export default API_ENDPOINTS;
