import { useState, useCallback } from 'react';
import { teamApiService } from '../utils/utils';

export const useDeleteTeam = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Delete team
  const deleteTeam = useCallback(async (teamId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call API to delete team
      await teamApiService.deleteTeam(teamId);
      
    } catch (err) {
      let errorMessage = 'Failed to delete team';
      
      if (err instanceof Error) {
        const message = err.message;
        
        // Handle specific errors
        if (message.includes('Authentication required')) {
          errorMessage = 'Please login again to delete the team.';
        } else if (message.includes('HTTP 403')) {
          errorMessage = 'You do not have permission to delete this team.';
        } else if (message.includes('HTTP 404')) {
          errorMessage = 'Team not found. It may have been already deleted.';
        } else if (message.includes('HTTP 400')) {
          errorMessage = 'Invalid request. Please try again.';
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

  // Validate delete permissions
  const canDeleteTeam = useCallback((userRole: string): boolean => {
    return userRole === 'owner';
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
    deleteTeam,
    
    // Utility functions
    canDeleteTeam,
    
    // State
    isLoading,
    error,
    
    // Utility methods
    clearError,
    reset,
  };
};