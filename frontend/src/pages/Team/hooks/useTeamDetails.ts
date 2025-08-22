import { useState, useEffect, useCallback } from 'react';
import { teamApiService } from '../utils/utils'; 
import type { Team, TeamMember, UserCheckResponse } from '../types';

/**
 * Team details management Hook
 * Handles team detail fetching, member management, member invitation, etc.
 */
export const useTeamDetails = (teamId: string | undefined) => {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamDetail = useCallback(async () => {
    if (!teamId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const teamData = await teamApiService.getTeamDetail(teamId);
      
      // Transform API response to frontend expected format
      const team: Team = {
        id: teamData.id,
        name: teamData.name,
        role: teamData.role as 'owner' |'edit' | 'view',
        memberCount: teamData.member_count,
        maxMembers: teamData.max_members,
        createdAt: teamData.created_at,
      };
      
      setTeam(team);
      setMembers(teamData.members || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team details');
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  const leaveTeam = useCallback(async () => {
    if (!teamId) return;
    
    try {
      await teamApiService.leaveTeam(teamId);
      // Can trigger navigation back to team list after successful leave
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave team';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [teamId]);

  const deleteTeam = useCallback(async () => {
    if (!teamId) return;
    
    try {
      await teamApiService.deleteTeam(teamId);
      // Can trigger navigation back to team list after successful deletion
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete team';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [teamId]);

  const inviteMember = useCallback(async (
    identifier: string, 
    type: 'email' | 'username' = 'email'
  ): Promise<TeamMember> => {
    if (!teamId) throw new Error('Team ID is required');
    
    try {
      const newMember = await teamApiService.inviteMember(teamId, identifier, type);
      setMembers(prev => [...prev, newMember]);
      
      // Update team member count
      setTeam(prev => prev ? {
        ...prev,
        memberCount: prev.memberCount + 1
      } : null);
      
      return newMember;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to invite member';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [teamId]);

  const checkUserExists = useCallback(async (
    identifier: string, 
    type: 'email' | 'username' = 'email'
  ): Promise<UserCheckResponse> => {
    try {
      return await teamApiService.checkUserExists(identifier, type);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateTeam = useCallback(async (updates: Partial<{ name: string; max_members: number }>) => {
    if (!teamId) return;
    
    try {
      const updatedTeam = await teamApiService.updateTeam(teamId, updates);
      setTeam(updatedTeam);
      return updatedTeam;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update team';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [teamId]);

  const removeMember = useCallback(async (memberId: string) => {
    // Note: This functionality needs to be implemented in teamApiService
    // Interface provided here, actual implementation requires backend support
    try {
      // await teamApiService.removeMember(teamId, memberId);
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      // Update team member count
      setTeam(prev => prev ? {
        ...prev,
        memberCount: prev.memberCount - 1
      } : null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove member';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchTeamDetail();
  }, [fetchTeamDetail]);

  return {
    team,
    members,
    isLoading,
    error,
    refetch: fetchTeamDetail,
    leaveTeam,
    deleteTeam,
    inviteMember,
    checkUserExists,
    updateTeam,
    removeMember,
    clearError,
  };
};