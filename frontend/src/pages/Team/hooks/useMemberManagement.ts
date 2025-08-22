import { useState, useCallback } from 'react';
import { teamApiService } from '../utils/utils';

/**
 * Member management Hook
 * Handles member role updates and removal operations
 */
export const useMemberManagement = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update member role
  const updateMemberRole = useCallback(async (
    teamId: string,
    memberId: string,
    newRole: 'owner' | 'edit' | 'view'
  ): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await teamApiService.updateMemberRole(teamId, memberId, newRole);
      return result;
    } catch (err) {
      let errorMessage = 'Failed to update member role';
      
      if (err instanceof Error) {
        const message = err.message;
        
        // Handle specific errors
        if (message.includes('Only team owner can update')) {
          errorMessage = 'Only team owner can update member roles.';
        } else if (message.includes('Member not found')) {
          errorMessage = 'Member not found in this team.';
        } else if (message.includes('Cannot modify your own role')) {
          errorMessage = 'You cannot modify your own role.';
        } else if (message.includes('Valid role is required')) {
          errorMessage = 'Please select a valid role.';
        } else if (message.includes('HTTP 403')) {
          errorMessage = 'You do not have permission to update member roles.';
        } else if (message.includes('HTTP 404')) {
          errorMessage = 'Member or team not found.';
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

  // Remove member
  const removeMember = useCallback(async (
    teamId: string,
    memberId: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await teamApiService.removeMember(teamId, memberId);
    } catch (err) {
      let errorMessage = 'Failed to remove member';
      
      if (err instanceof Error) {
        const message = err.message;
        
        // Handle specific errors
        if (message.includes('Only team owner can remove')) {
          errorMessage = 'Only team owner can remove members.';
        } else if (message.includes('Member not found')) {
          errorMessage = 'Member not found in this team.';
        } else if (message.includes('Cannot remove yourself')) {
          errorMessage = 'You cannot remove yourself from the team.';
        } else if (message.includes('Cannot remove team owner')) {
          errorMessage = 'Cannot remove team owner.';
        } else if (message.includes('HTTP 403')) {
          errorMessage = 'You do not have permission to remove members.';
        } else if (message.includes('HTTP 404')) {
          errorMessage = 'Member or team not found.';
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

  // Batch operation: update multiple member roles
  const updateMultipleMemberRoles = useCallback(async (
    teamId: string,
    updates: Array<{ memberId: string; newRole: 'owner' | 'edit' | 'view' }>
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Execute updates sequentially to avoid concurrency conflicts
      for (const update of updates) {
        await teamApiService.updateMemberRole(teamId, update.memberId, update.newRole);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update member roles';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Batch operation: remove multiple members
  const removeMultipleMembers = useCallback(async (
    teamId: string,
    memberIds: string[]
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Execute deletions sequentially to avoid concurrency issues
      for (const memberId of memberIds) {
        await teamApiService.removeMember(teamId, memberId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove members';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Special method for ownership transfer
  const transferOwnership = useCallback(async (
    teamId: string,
    newOwnerId: string
  ): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await teamApiService.updateMemberRole(teamId, newOwnerId, 'owner');
      return result;
    } catch (err) {
      let errorMessage = 'Failed to transfer ownership';
      
      if (err instanceof Error) {
        const message = err.message;
        if (message.includes('Only team owner')) {
          errorMessage = 'Only current owner can transfer ownership.';
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
    updateMemberRole,
    removeMember,
    transferOwnership,
    
    // Batch operations
    updateMultipleMemberRoles,
    removeMultipleMembers,
    
    // State
    isLoading,
    error,
    
    // Utility methods
    clearError,
    reset,
  };
};