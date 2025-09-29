import { useState, useCallback } from 'react';
import { teamApiService } from '../utils/utils';
import { InvitationResult } from '../types';

export const useInviteMember = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const inviteMember = useCallback(async (
    teamId: string,
    identifier: string, 
    type: 'email' | 'username' = 'email'
  ): Promise<InvitationResult> => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await teamApiService.inviteMember(teamId, identifier, type);
      return result;
    } catch (err) {
      let errorMessage = 'Failed to invite member';
      
      if (err instanceof Error) {
        const message = err.message;
        
        if (message.includes('Please wait') && message.includes('seconds before resending')) {
          const secondsMatch = message.match(/(\d+)\s+seconds/);
          const remainingSeconds = secondsMatch ? parseInt(secondsMatch[1]) : 60;
          
          if (remainingSeconds <= 10) {
            errorMessage = `Please wait ${remainingSeconds} seconds before resending invitation.`;
          } else {
            const minutes = Math.ceil(remainingSeconds / 60);
            errorMessage = `Please wait about ${minutes} minute${minutes > 1 ? 's' : ''} before resending invitation.`;
          }
        }
        
        else if (message.includes('No user found') || 
            message.includes('not found') ||
            message.includes('does not exist')) {
          errorMessage = `No user found with this ${type}. Please check and try again.`;
        } else if (message.includes('already a member') || 
                   message.includes('already in team') ||
                   message.includes('is already a member')) {
          errorMessage = 'This user is already a member of the team.';
        } else if (message.includes('already been sent') ||
                   message.includes('pending invitation')) {
          errorMessage = 'An invitation has already been sent to this user.';
        } else if (message.includes('Team is full') || 
                   message.includes('maximum capacity') ||
                   message.includes('max_members')) {
          errorMessage = 'Team has reached maximum capacity. Cannot add more members.';
        } else if (message.includes('HTTP 401') || message.includes('unauthorized')) {
          errorMessage = 'You are not authorized to invite members.';
        } else if (message.includes('HTTP 403') || message.includes('forbidden')) {
          errorMessage = 'Only team owners and editors can invite members.';
        } else if (message.includes('inactive') || message.includes('not active')) {
          errorMessage = 'This user account is inactive and cannot be invited.';
        } else if (message.includes('Failed to send invitation email')) {
          errorMessage = 'Failed to send invitation email. Please try again later.';
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    inviteMember,
    isLoading,
    error,
    clearError,
    reset,
  };
};