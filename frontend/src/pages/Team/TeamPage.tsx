import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTeamModal from './components/CreateTeamModal';
import { useTeams } from './hooks/useTeams';
import { useCreateTeam } from './hooks/useCreateTeam';
import type { CreateTeamRequest } from './types';

const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { teams, isLoading, error, addTeam } = useTeams();
  const { createTeam, isLoading: isCreating } = useCreateTeam();
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const handleCreateTeam = () => {
    setShowCreateModal(true);
  };

  const handleTeamClick = (teamId: string) => {
    console.log('Navigating to teamId:', teamId);
    navigate(`/team/${teamId}`);
  };

  // Handle successful team creation
  const handleCreateTeamSuccess = async (teamData: CreateTeamRequest) => {
    try {
      const newTeam = await createTeam(teamData);
      addTeam(newTeam); 
      setShowCreateModal(false); 
    } catch (error) {
      console.error('Failed to create team:', error);
      // Don't close modal, let CreateTeamModal handle error display internally
      // Error message will be shown in modal, so no need to handle anything here
      throw error; 
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading teams...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Teams</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Get role display text
  const getRoleDisplayText = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'edit':
        return 'Edit';
      case 'view':
        return 'View';
      default:
        return role;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Your Teams
            </h1>
            <p className="text-lg text-gray-600">
              All your Teams! ({teams.length} {teams.length === 1 ? 'team' : 'teams'})
            </p>
          </div>
          
          {/* Create a Team button */}
          <button
            onClick={handleCreateTeam}
            disabled={isCreating}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            {isCreating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
            <span>{isCreating ? 'Creating...' : 'Create a Team'}</span>
          </button>
        </div>

     {/* Team cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {teams.map((team) => (
            <div
              key={team.id}
              onClick={() => handleTeamClick(team.id)}
              className="bg-blue-300 hover:bg-blue-400 rounded-xl p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
            >
              {/* Team icon */}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-600 bg-opacity-30 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-800" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    <path d="M17.5 12c1.38 0 2.5-1.12 2.5-2.5S18.88 7 17.5 7 15 8.12 15 9.5s1.12 2.5 2.5 2.5zm0 1c-1.67 0-5 .84-5 2.5V17h3v-1.5c0-.75 1.68-1.32 2-1.41z"/>
                    <path d="M6.5 12c1.38 0 2.5-1.12 2.5-2.5S7.88 7 6.5 7 4 8.12 4 9.5 5.12 12 6.5 12zm0 1c-1.67 0-5 .84-5 2.5V17h3v-1.5c0-.75 1.68-1.32 2-1.41z"/>
                  </svg>
                </div>
              </div>
              
              {/* Team name */}
              <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">
                {team.name}
              </h3>
              
              {/* User role */}
              <p className="text-gray-700 text-center font-medium mb-3">
                {getRoleDisplayText(team.role)}
              </p>
              
              {/* Member count and limit */}
              <p className="text-gray-600 text-sm text-center mt-2">
                {team.memberCount}/{team.maxMembers} members
              </p>
            </div>
          ))}
          
          {/* Empty state - shown when no teams exist */}
          {teams.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No teams yet</h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Create your first team to start collaborating on SDG initiatives with your colleagues.
              </p>
              <button
                onClick={handleCreateTeam}
                disabled={isCreating}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {isCreating ? 'Creating...' : 'Create Your First Team'}
              </button>
            </div>
          )}
        </div>

        {/* Create team modal */}
        <CreateTeamModal 
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateTeamSuccess}
          isLoading={isCreating}
        />
      </div>
    </div>
  );
};

export default TeamPage;