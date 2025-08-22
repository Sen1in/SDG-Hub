import { useState, useEffect, useCallback } from 'react';
import { teamApiService } from '../utils/utils'; 
import type { Team } from '../types';

/**
 * Team list management Hook
 * Handles fetching and deleting team lists
 */
export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const teamsData = await teamApiService.getTeams();
      setTeams(teamsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      await teamApiService.deleteTeam(teamId);
      setTeams(prev => prev.filter(team => team.id !== teamId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete team';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const addTeam = useCallback((newTeam: Team) => {
    setTeams(prev => [newTeam, ...prev]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    isLoading,
    error,
    refetch: fetchTeams,
    deleteTeam,
    addTeam,
    clearError,
  };
};