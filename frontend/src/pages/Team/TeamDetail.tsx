import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTeamDetails } from './hooks/useTeamDetails';
import { useInviteMember } from './hooks/useInviteMember';
import { useMemberManagement } from './hooks/useMemberManagement';
import { useTeamCapacity } from './hooks/useTeamCapacity';
import { useDeleteTeam } from './hooks/useDeleteTeam';
import { useRemoveMember } from './hooks/useRemoveMember';
import InviteMemberModal from './components/InviteMemberModal';
import MemberActionDropdown from './components/MemberActionDropdown';
import ManageCapacityModal from './components/ManageCapacityModal';

const TeamDetails: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use your hooks to fetch data
  const { 
    team, 
    members, 
    isLoading, 
    error, 
    leaveTeam,
    refetch // Used to refresh team data
  } = useTeamDetails(teamId);
  
  // Use independent invite hook
  const { 
    inviteMember,
    isLoading: isInviting,
    error: inviteError
  } = useInviteMember();
  
  const {
    updateMemberRole,
    isLoading: isMemberOperating,
    error: memberError
  } = useMemberManagement();

  // Use capacity management hook
  const { 
    updateTeamCapacity, 
    isLoading: isCapacityLoading 
  } = useTeamCapacity();

  // Use delete team hook
  const { 
    deleteTeam, 
    isLoading: isDeletingTeam, 
    error: deleteError 
  } = useDeleteTeam();

  // Use remove member hook
  const { 
    removeMember, 
    isLoading: isRemovingMember, 
    canRemoveMember,
    error: removeError 
  } = useRemoveMember();
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showCapacityModal, setShowCapacityModal] = useState<boolean>(false);

  // Filter members by search
  const filteredMembers = members.filter(member =>
    member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGoBack = () => {
    navigate('/team');
  };

  const handleTeamForms = () => {
    navigate(`/team/${teamId}/forms`);
  };

  const handleInvite = () => {
    setShowInviteModal(true);
  };

  const handleManageCapacity = () => {
    setShowCapacityModal(true);
  };

  const handleInviteSuccess = async (identifier: string, type: 'email' | 'username'): Promise<void> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    try {
      const result = await inviteMember(teamId, identifier, type);
      await refetch();
      // setShowInviteModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleCapacityUpdate = async (newCapacity: number): Promise<void> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    try {
      await updateTeamCapacity(teamId, newCapacity);
      // Refresh team data after successful update
      await refetch();
      setShowCapacityModal(false);
    } catch (error) {
      // Error already handled in hook, re-throw to modal
      throw error;
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: 'owner' | 'edit' | 'view'): Promise<void> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    try {
      await updateMemberRole(teamId, memberId, newRole);
      // Refresh data after successful update
      await refetch();
    } catch (error) {
      // Error already handled in hook, re-throw directly
      throw error;
    }
  };

  const handleRemoveMember = async (memberId: string): Promise<void> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    // Only do permission check, no confirmation dialog (confirmation handled by MemberActionDropdown)
    const targetMember = members.find(m => m.id === memberId);
    if (targetMember && team) {
      const currentUserId = user?.id ? String(user.id) : undefined;
      const { canRemove, reason } = canRemoveMember(
        team.role, 
        targetMember.role, 
        currentUserId,
        memberId
      );
      
      if (!canRemove) {
        alert(reason || 'Cannot remove this member');
        return;
      }
    }
    
    try {
      await removeMember(teamId, memberId);
      await refetch();
    } catch (error) {
      console.error('Remove member failed:', error);
      // Show error message
      if (error instanceof Error) {
        alert(`Failed to remove member: ${error.message}`);
      }
    }
  };

  const handleDeleteTeam = async () => {
    if (!team || !teamId) return;
    
    if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
      try {
        await deleteTeam(teamId);
        navigate('/team');
      } catch (error) {
        console.error('Delete team failed:', error);
        if (error instanceof Error && error.message.includes('Team not found')) {
          navigate('/team');
        }
      }
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    
    if (window.confirm('Are you sure you want to leave this team?')) {
      try {
        await leaveTeam();
        navigate('/team');
      } catch (error) {
        console.error('Failed to leave team:', error);
        alert('Failed to leave team. Please try again.');
      }
    }
  };

  const handleMemberActions = (memberId: string) => {
    // This function is now handled by MemberActionDropdown component
    console.log('Member actions for:', memberId);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-green-100 text-green-800';
      case 'edit':
        return 'bg-blue-100 text-blue-800';
      case 'view':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRoleDisplay = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'Owner';
      case 'edit':
        return 'Editor';
      case 'view':
        return 'Viewer';
      default:
        return role;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Team not found'}
          </h2>
          <button
            onClick={handleGoBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {team.name} Members
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your team members and their permissions ({team.memberCount}/{team.maxMembers} members)
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleTeamForms}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Team Forms
            </button>

            {/* Manage Capacity button - only visible to owner */}
            {team.role === 'owner' && (
              <button
                onClick={handleManageCapacity}
                disabled={isCapacityLoading}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                {isCapacityLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                )}
                <span>{isCapacityLoading ? 'Updating...' : 'Manage Capacity'}</span>
              </button>
            )}
            
            {(team.role === 'owner' || team.role === 'edit') && (
              <button
                onClick={handleInvite}
                disabled={isInviting}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                {isInviting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                <span>{isInviting ? 'Inviting...' : 'Invite'}</span>
              </button>
            )}

            {team.role === 'owner' ? (
              <button
                onClick={handleDeleteTeam}
                disabled={isDeletingTeam}
                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                {isDeletingTeam ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Team</span>
                )}
              </button>
            ) : (
              <button
                onClick={handleLeaveTeam}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Leave
              </button>
            )}
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search for people"
            />
          </div>
        </div>

        {/* Member table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 w-full">
              <div className="col-span-4">
                <h3 className="text-sm font-medium text-gray-900">Username</h3>
              </div>
              <div className="col-span-4">
                <h3 className="text-sm font-medium text-gray-900">Email</h3>
              </div>
              <div className="col-span-3">
                <h3 className="text-sm font-medium text-gray-900">Role</h3>
              </div>
              <div className="col-span-1">
                <h3 className="text-sm font-medium text-gray-900"></h3>
              </div>
            </div>
          </div>

          {/* Member list */}
          <div className="divide-y divide-gray-200">
            {filteredMembers && filteredMembers.length > 0 && filteredMembers.map((member) => (
              <div key={member.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-gray-900">{member.username}</p>
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <div className="col-span-3">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(member.role)}`}>
                      {formatRoleDisplay(member.role)}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <MemberActionDropdown
                      member={member}
                      currentUserRole={team?.role || ''}
                      onUpdateRole={handleUpdateMemberRole}
                      onRemoveMember={handleRemoveMember}
                      isLoading={isMemberOperating || isRemovingMember}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search query.' : 'Invite members to get started.'}
            </p>
          </div>
        )}

        {/* Invite member modal */}
        <InviteMemberModal 
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
          isLoading={isInviting}
        />

        {/* Capacity management modal */}
        <ManageCapacityModal
          isOpen={showCapacityModal}
          onClose={() => setShowCapacityModal(false)}
          onSuccess={handleCapacityUpdate}
          currentCapacity={team.maxMembers}
          currentMemberCount={team.memberCount}
          currentUserRole={team.role}
          isLoading={isCapacityLoading}
        />
      </div>
    </div>
  );
};

export default TeamDetails;