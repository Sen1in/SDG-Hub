import { useState, useEffect, useCallback } from 'react';
import { notificationApiService } from '../utils/utils';
import type { NotificationResponse } from '../types';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const notificationsData = await notificationApiService.getNotifications();
      setNotifications(notificationsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptInvitation = useCallback(async (notificationId: string) => {
    try {
      await notificationApiService.acceptInvitation(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'accepted' }
            : notification
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept invitation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const rejectInvitation = useCallback(async (notificationId: string) => {
    try {
      await notificationApiService.rejectInvitation(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'rejected' }
            : notification
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reject invitation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // New function to accept form review requests
  const acceptReviewRequest = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationApiService.acceptReviewRequest(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, status: 'accepted' }
            : notification
        )
      );
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to accept review request';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationApiService.markAsRead(notificationId);
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationApiService.deleteNotification(notificationId);
      // Remove from local state
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete notification';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    error,
    refetch: fetchNotifications,
    acceptInvitation,
    rejectInvitation,
    acceptReviewRequest, // New function
    markAsRead,
    deleteNotification,
    clearError,
  };
};
