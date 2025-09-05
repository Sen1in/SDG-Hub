// src/pages/Notifications/NotificationsPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from './hooks/useNotifications';
import type { NotificationResponse } from './types';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    isLoading, 
    error, 
    acceptInvitation, 
    rejectInvitation, 
    markAsRead,
    deleteNotification,
    clearError 
  } = useNotifications();

  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleAcceptInvitation = async (notification: NotificationResponse) => {
    if (processingIds.has(notification.id)) return;

    setProcessingIds(prev => new Set(prev).add(notification.id));
    try {
      await acceptInvitation(notification.id);
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const handleRejectInvitation = async (notification: NotificationResponse) => {
    if (processingIds.has(notification.id)) return;

    setProcessingIds(prev => new Set(prev).add(notification.id));
    try {
      await rejectInvitation(notification.id);
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Failed to reject invitation:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification.id);
        return newSet;
      });
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (processingIds.has(notificationId)) return;

    setProcessingIds(prev => new Set(prev).add(notificationId));
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Expires soon';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'expired':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      default:
        return 'Pending';
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Notifications</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              window.location.reload();
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const processedNotifications = notifications.filter(n => n.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button positioned in top-left */}
          <button
            onClick={handleGoBack}
            className="absolute top-6 left-6 flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200 bg-white hover:bg-gray-50 rounded-xl px-4 py-3 shadow-sm border border-gray-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          {/* Page title and description */}
          <div className="text-center text-white mt-8">
            <h1 className="text-4xl font-bold mb-2">Notifications</h1>
            <p className="text-xl opacity-90">Manage your team invitations and notifications</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
        {/* Pending Invitations */}
        {pendingNotifications.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Pending Invitations ({pendingNotifications.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {pendingNotifications.map((notification) => (
                  <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Team Invitation</h3>
                            {!notification.is_read && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-16">
                          <p className="text-gray-700 mb-3">
                            <span className="font-semibold text-gray-900">{notification.data.inviter_username}</span> invited you to join the team{' '}
                            <span className="font-semibold text-blue-600">"{notification.data.team_name}"</span>
                          </p>
                          
                          <div className="space-y-1 text-sm text-gray-500">
                            <p>
                              Invited via: {notification.data.invited_by_email ? 'Email' : 'Username'} ({notification.data.invited_identifier})
                            </p>
                            <p>
                              Sent: {new Date(notification.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-orange-600 font-medium">
                              {getTimeRemaining(notification.expires_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 ml-6">
                        <button
                          onClick={() => handleAcceptInvitation(notification)}
                          disabled={processingIds.has(notification.id)}
                          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 min-w-[100px] justify-center"
                        >
                          {processingIds.has(notification.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Accept</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleRejectInvitation(notification)}
                          disabled={processingIds.has(notification.id)}
                          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 min-w-[100px] justify-center"
                        >
                          {processingIds.has(notification.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              <span>Reject</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {processedNotifications.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Recent Activity ({processedNotifications.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {processedNotifications.map((notification) => (
                  <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center flex-1">
                        <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mr-4">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 mr-3">Team Invitation</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(notification.status)}`}>
                              {getStatusText(notification.status)}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-2">
                            <span className="font-semibold text-gray-900">{notification.data.inviter_username}</span> invited you to join the team{' '}
                            <span className="font-semibold text-blue-600">"{notification.data.team_name}"</span>
                          </p>
                          
                          <p className="text-sm text-gray-500">
                            {new Date(notification.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        disabled={processingIds.has(notification.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                        title="Delete notification"
                      >
                        {processingIds.has(notification.id) ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {notifications.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You don't have any notifications at the moment. Team invitations and updates will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;