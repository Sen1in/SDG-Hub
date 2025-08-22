import { useState, useCallback } from 'react';
import { teamApiService } from '../utils/utils';

/**
 * Team capacity management Hook
 * Handles team capacity update operations
 */
export const useTeamCapacity = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Update team capacity
  const updateTeamCapacity = useCallback(async (
    teamId: string,
    newCapacity: number
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Basic validation
      if (newCapacity < 1 || newCapacity > 100) {
        throw new Error('Capacity must be between 1 and 100');
      }
      
      await teamApiService.updateTeam(teamId, {
        max_members: newCapacity
      });
      
    } catch (err) {
      let errorMessage = 'Failed to update team capacity';
      
      if (err instanceof Error) {
        const message = err.message;
        
        // Handle specific errors
        if (message.includes('Capacity must be between')) {
          errorMessage = message;
        } else if (message.includes('exceed maximum capacity')) {
          errorMessage = 'Capacity cannot exceed maximum limit of 100 members.';
        } else if (message.includes('less than current member count')) {
          errorMessage = 'Capacity cannot be less than current member count.';
        } else if (message.includes('Only team owner')) {
          errorMessage = 'Only team owner can update team capacity.';
        } else if (message.includes('HTTP 403')) {
          errorMessage = 'You do not have permission to update team capacity.';
        } else if (message.includes('HTTP 404')) {
          errorMessage = 'Team not found.';
        } else if (message.includes('HTTP 400')) {
          errorMessage = 'Invalid capacity value. Please check your input.';
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

  // Validate capacity value
  const validateCapacity = useCallback((
    newCapacity: number,
    currentMemberCount: number
  ): { isValid: boolean; error?: string } => {
    if (newCapacity < 1) {
      return { isValid: false, error: 'Capacity must be at least 1' };
    }
    
    if (newCapacity > 100) {
      return { isValid: false, error: 'Capacity cannot exceed 100' };
    }
    
    if (newCapacity < currentMemberCount) {
      return { 
        isValid: false, 
        error: `Capacity cannot be less than current member count (${currentMemberCount})` 
      };
    }
    
    return { isValid: true };
  }, []);

  // Get recommended capacity values
  const getRecommendedCapacity = useCallback((currentMemberCount: number) => {
    const recommendations = [];
    
    // 1.5x current member count (rounded up)
    const recommended = Math.ceil(currentMemberCount * 1.5);
    if (recommended <= 100 && recommended !== currentMemberCount) {
      recommendations.push(recommended);
    }
    
    // Common capacity sizes
    const commonSizes = [5, 10, 15, 20, 25, 30, 50, 75, 100];
    for (const size of commonSizes) {
      if (size > currentMemberCount && !recommendations.includes(size)) {
        recommendations.push(size);
      }
    }
    
    return recommendations.slice(0, 4); // Return maximum 4 recommendations
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
    updateTeamCapacity,
    
    // Utility functions
    validateCapacity,
    getRecommendedCapacity,
    
    // State
    isLoading,
    error,
    
    // Utility methods
    clearError,
    reset,
  };
};