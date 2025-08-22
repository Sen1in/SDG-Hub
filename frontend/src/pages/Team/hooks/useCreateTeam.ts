import { useState, useCallback } from 'react';
import { teamApiService } from '../utils/utils'; 
import type { Team, CreateTeamRequest } from '../types';

export const useCreateTeam = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createTeam = useCallback(async (teamData: CreateTeamRequest): Promise<Team> => {
    try {
      setIsLoading(true);
      setError(null);
      const newTeam = await teamApiService.createTeam(teamData);
      return newTeam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create team';
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
    createTeam,
    isLoading,
    error,
    clearError,
    reset,
  };
};