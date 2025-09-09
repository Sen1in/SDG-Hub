// src/pages/Notifications/hooks/useUnreadNotifications.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationApiService } from '../utils/utils';
import { useAuth } from '../../../contexts/AuthContext';

export const useUnreadNotifications = (pollingInterval: number = 30000) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef<boolean>(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!isActiveRef.current || !isAuthenticated) return;
    
    try {
      setError(null);
      const count = await notificationApiService.getUnreadCount();
      if (isActiveRef.current) {
        setUnreadCount(count);
      }
    } catch (err) {
      if (isActiveRef.current) {
        if (err instanceof Error && err.message.includes('Authentication required')) {
          setUnreadCount(0);
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch unread count');
        }
        console.error('Error fetching unread count:', err);
      }
    } finally {
      if (isActiveRef.current) {
        setIsLoading(false);
      }
    }
  }, [isAuthenticated]);

  const startPolling = useCallback(() => {
    if (!isAuthenticated) return;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, pollingInterval);
  }, [fetchUnreadCount, pollingInterval, isAuthenticated]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    isActiveRef.current = true;
    
    if (isAuthenticated) {
      startPolling();
    } else {
      stopPolling();
      setUnreadCount(0);
      setError(null);
      setIsLoading(false);
    }

    const handleVisibilityChange = () => {
      if (!isAuthenticated) return;
      
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      isActiveRef.current = false;
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [startPolling, stopPolling, fetchUnreadCount, isAuthenticated]);

  return {
    unreadCount,
    isLoading,
    error,
  };
};