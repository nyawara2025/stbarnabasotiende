/**
 * Meeting Service - N8N Webhook Integration
 * Handles meeting minutes, contributions, and attendance via N8N webhooks
 */

const N8N_WEBHOOK_BASE = 'https://n8n.tenear.com/webhook';

class MeetingService {
  /**
   * Get all meetings for an organization
   */
  async getMeetings(orgId, limit = 50, offset = 0) {
    console.log('📋 Fetching meetings for org:', orgId);
    
    try {
      const url = `${N8N_WEBHOOK_BASE}/welfare/meetings/list?org_id=${orgId}&limit=${limit}&offset=${offset}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Meetings fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching meetings:', error);
      throw error;
    }
  }

  /**
   * Create or update a meeting (uses the 'save' action in N8N)
   */
  async saveMeeting(meetingData) {
    console.log('💾 Saving meeting:', meetingData.title);
    
    try {
      const response = await fetch(`${N8N_WEBHOOK_BASE}/welfare/meetings/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'save',
          ...meetingData
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Meeting saved:', data);
      return data;
    } catch (error) {
      console.error('❌ Error saving meeting:', error);
      throw error;
    }
  }

  /**
   * Delete a meeting
   */
  async deleteMeeting(meetingId) {
    console.log('🗑️ Deleting meeting:', meetingId);
    
    try {
      const response = await fetch(`${N8N_WEBHOOK_BASE}/welfare/meetings/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          id: meetingId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Meeting deleted:', data);
      return data;
    } catch (error) {
      console.error('❌ Error deleting meeting:', error);
      throw error;
    }
  }

  /**
   * Publish a meeting (change status to PUBLISHED)
   */
  async publishMeeting(meetingId) {
    console.log('📢 Publishing meeting:', meetingId);
    
    try {
      const response = await fetch(`${N8N_WEBHOOK_BASE}/welfare/meetings/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'publish',
          id: meetingId,
          status: 'PUBLISHED'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Meeting published:', data);
      return data;
    } catch (error) {
      console.error('❌ Error publishing meeting:', error);
      throw error;
    }
  }

  // =========================================
  // CONTRIBUTIONS - To be implemented in Phase 2
  // =========================================

  /*
  async getMeetingContributions(meetingId) {
    // TODO: Implement when Contributions workflow is built
  }

  async addContribution(contributionData) {
    // TODO: Implement when Contributions workflow is built
  }

  async getContributionSummary(meetingId) {
    // TODO: Implement when Contributions workflow is built
  }
  */

  // =========================================
  // ATTENDANCE - To be implemented in Phase 2
  // =========================================

  /*
  async getMeetingAttendance(meetingId) {
    // TODO: Implement when Attendance workflow is built
  }

  async recordAttendance(attendanceData) {
    // TODO: Implement when Attendance workflow is built
  }

  async bulkRecordAttendance(meetingId, attendanceRecords) {
    // TODO: Implement when Attendance workflow is built
  }
  */

  // =========================================
  // DOCUMENTS - To be implemented in Phase 2
  // =========================================

  /*
  async uploadDocument(documentData) {
    // TODO: Implement when Documents workflow is built
  }

  async getMeetingDocuments(meetingId) {
    // TODO: Implement when Documents workflow is built
  }
  */

  // =========================================
  // HELPER METHODS
  // =========================================

  /**
   * Format currency for display
   */
  formatCurrency(amount, currency = 'KES') {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Contribution types
   */
  getContributionTypes() {
    return [
      { value: 'HOSTING', label: 'Hosting Contribution', icon: '🏠' },
      { value: 'FOOD', label: 'Food Contribution', icon: '🍽️' },
      { value: 'REFRESHMENTS', label: 'Refreshments', icon: '🥤' },
      { value: 'MONTHLY_CONTRIBUTION', label: 'Monthly Contribution', icon: '💵' },
      { value: 'ANNUAL_FEES', label: 'Annual Fees', icon: '📅' },
      { value: 'EVENT_FEE', label: 'Event Fee', icon: '🎉' },
      { value: 'OTHER', label: 'Other', icon: '💰' }
    ];
  }

  /**
   * Payment methods
   */
  getPaymentMethods() {
    return [
      { value: 'CASH', label: 'Cash' },
      { value: 'MPESA', label: 'M-Pesa' },
      { value: 'BANK', label: 'Bank Transfer' },
      { value: 'OTHER', label: 'Other' }
    ];
  }

  /**
   * Attendance statuses
   */
  getAttendanceStatuses() {
    return [
      { value: 'PRESENT', label: 'Present', color: '#16a34a' },
      { value: 'ABSENT', label: 'Absent', color: '#dc2626' },
      { value: 'APOLOGY', label: 'Apology', color: '#f59e0b' }
    ];
  }
}

// Export singleton instance
export const meetingService = new MeetingService();
export default meetingService;
