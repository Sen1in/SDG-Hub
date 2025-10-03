import type { 
  NotificationResponse, 
  NotificationListResponse,
  AcceptInvitationRequest,
  RejectInvitationRequest 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_FULL_URL = `${API_BASE_URL}/api`;

class NotificationApiService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_FULL_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please login.');
      }
      
      let errorData: any = {};
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return null;
    }

    let responseText = '';
    try {
      responseText = await response.text();
    } catch (error) {
      console.warn('Failed to read response text:', error);
      return null;
    }

    if (!responseText) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return responseText;
    }

    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.warn('Failed to parse response as JSON:', error);
      return responseText;
    }
  }

  // Get all notifications for current user
  async getNotifications(): Promise<NotificationResponse[]> {
    const data = await this.fetchWithAuth('/notifications/');
    
    let notifications = [];
    if (Array.isArray(data)) {
      notifications = data;
    } else if (data && Array.isArray(data.results)) {
      notifications = data.results;
    } else if (data && data.data && Array.isArray(data.data)) {
      notifications = data.data;
    } else {
      return [];
    }
    
    try {
      return notifications.map((notification: any) => {
        const baseNotification = {
          id: notification.id?.toString() || '',
          notification_type: notification.notification_type || 'team_invitation',
          created_at: notification.created_at || '',
          expires_at: notification.expires_at || '',
          is_read: notification.is_read || false,
          status: notification.status || 'pending',
        };

        // Handle different notification types with different data structures
        if (notification.notification_type === 'team_invitation') {
          return {
            ...baseNotification,
            data: {
              id: notification.data?.id?.toString() || '',
              team_id: notification.data?.team_id?.toString() || '',
              team_name: notification.data?.team_name || 'Unknown Team',
              inviter_username: notification.data?.inviter_username || '',
              inviter_email: notification.data?.inviter_email || '',
              invited_by_email: notification.data?.invited_by_email || false,
              invited_identifier: notification.data?.invited_identifier || '',
              created_at: notification.data?.created_at || '',
              expires_at: notification.data?.expires_at || '',
              status: notification.data?.status || 'pending',
            },
          };
        } else if (notification.notification_type === 'form_review_request') {
          return {
            ...baseNotification,
            data: {
              form_id: notification.data?.form_id?.toString() || '',
              form_title: notification.data?.form_title || 'Unknown Form',
              form_type: notification.data?.form_type || 'action',
              team_id: notification.data?.team_id?.toString() || '',
              team_name: notification.data?.team_name || 'Unknown Team',
              submitter_username: notification.data?.submitter_username || '',
              submitter_email: notification.data?.submitter_email || '',
              submitted_at: notification.data?.submitted_at || '',
              comments: notification.data?.comments || undefined,
            },
          };
        } else {
          return {
            ...baseNotification,
            data: notification.data || {},
          };
        }
      });
    } catch (error) {
      console.error('Error parsing notifications:', error);
      return [];
    }
  }

  // Accept team invitation
  async acceptInvitation(notificationId: string): Promise<any> {
    const response = await this.fetchWithAuth('/notifications/accept/', {
      method: 'POST',
      body: JSON.stringify({
        notification_id: notificationId,
      }),
    });
    
    return response;
  }

  // Reject team invitation
  async rejectInvitation(notificationId: string): Promise<any> {
    const response = await this.fetchWithAuth('/notifications/reject/', {
      method: 'POST',
      body: JSON.stringify({
        notification_id: notificationId,
      }),
    });
    
    return response;
  }

  // Accept form review request (NEW)
  async acceptReviewRequest(notificationId: string): Promise<any> {
    const response = await this.fetchWithAuth('/notifications/accept-review/', {
      method: 'POST',
      body: JSON.stringify({
        notification_id: notificationId,
      }),
    });
    
    return response;
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await this.fetchWithAuth(`/notifications/${notificationId}/read/`, {
      method: 'PATCH',
    });
  }

  // Delete notification (for expired ones)
  async deleteNotification(notificationId: string): Promise<void> {
    await this.fetchWithAuth(`/notifications/${notificationId}/`, {
      method: 'DELETE',
    });
  }

  // Get unread notification count
  async getUnreadCount(): Promise<number> {
    const data = await this.fetchWithAuth('/notifications/unread-count/');
    return data?.count || 0;
  }
}

export const notificationApiService = new NotificationApiService();