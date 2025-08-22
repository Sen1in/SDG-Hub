import { useState, useCallback } from 'react';
import { teamApiService } from '../utils/utils';

/**
 * Member removal management Hook
 * Handles team member removal operations
 */
export const useRemoveMember = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Remove member
  const removeMember = useCallback(async (
    teamId: string, 
    memberId: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call API to remove member
      await teamApiService.removeMember(teamId, memberId);
      
    } catch (err) {
      let errorMessage = 'Failed to remove member';
      
      if (err instanceof Error) {
        const message = err.message;
        
        // Handle specific errors
        if (message.includes('Authentication required')) {
          errorMessage = 'Please login again to remove member.';
        } else if (message.includes('HTTP 403')) {
          errorMessage = 'You do not have permission to remove this member.';
        } else if (message.includes('HTTP 404')) {
          errorMessage = 'Member not found. They may have already been removed.';
        } else if (message.includes('HTTP 400')) {
          errorMessage = 'Invalid request. Cannot remove this member.';
        } else if (message.includes('HTTP 500')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = message;
        }
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate removal permissions
  const canRemoveMember = useCallback((
    currentUserRole: string, 
    targetMemberRole: string,
    currentUserId?: string,
    targetMemberId?: string
  ): { canRemove: boolean; reason?: string } => {
    // Cannot remove self
    if (currentUserId === targetMemberId) {
      return { canRemove: false, reason: 'Cannot remove yourself from the team' };
    }
    
    // Owner can remove anyone (except themselves)
    if (currentUserRole === 'owner') {
      return { canRemove: true };
    }
    
    // View role cannot remove anyone
    return { canRemove: false, reason: 'Insufficient permissions to remove members' };
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    // Core functionality
    removeMember,
    
    // Utility functions
    canRemoveMember,
    
    // State
    isLoading,
    error,
    
    // Utility methods
    clearError,
    reset,
  };
};