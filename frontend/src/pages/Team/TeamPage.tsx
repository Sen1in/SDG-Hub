import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTeamModal from './components/CreateTeamModal';
import CreateFormModal from '../Form/components/CreateFormModal';
import FormStatsCard from '../Form/components/FormStatsCard';
import PersonalFormCard from '../Form/components/PersonalFormCard';
import { useTeams } from './hooks/useTeams';
import { useCreateTeam } from './hooks/useCreateTeam';
import { usePersonalForms, useCreateForm, useFormManagement } from '../Form/hooks/useTeamForms';
import type { CreateTeamRequest } from './types';
import type { CreateFormRequest, UpdateFormRequest } from '../Form/types/forms';

const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { teams, isLoading, error, addTeam } = useTeams();
  const { createTeam, isLoading: isCreating } = useCreateTeam();
  
  // Personal forms functionality
  const {
    forms: personalForms,
    stats: personalStats,
    isLoading: formsLoading,
    error: formsError,
    refetch: refetchPersonalForms
  } = usePersonalForms();
  
  const { createForm: createPersonalForm, isLoading: isCreatingPersonalForm } = useCreateForm();
  
  // Form management for personal forms
  const {
    updateForm,
    deleteForm,
    toggleFormLock,
    duplicateForm,
    isLoading: isFormOperating
  } = useFormManagement();
  
  const [showCreateTeamModal, setShowCreateTeamModal] = useState<boolean>(false);
  const [showCreateFormModal, setShowCreateFormModal] = useState<boolean>(false);

  const handleCreateTeam = () => {
    setShowCreateTeamModal(true);
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
      setShowCreateTeamModal(false); 
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error; 
    }
  };

  // Handle personal form creation
  const handleCreatePersonalForm = () => {
    setShowCreateFormModal(true);
  };

  const handleCreatePersonalFormSuccess = async (formData: CreateFormRequest) => {
    try {
      await createPersonalForm(formData);
      await refetchPersonalForms();
      setShowCreateFormModal(false);
    } catch (error) {
      console.error('Failed to create personal form:', error);
      throw error;
    }
  };

  const handlePersonalFormClick = (formId: string) => {
    navigate(`/forms/${formId}`);
  };

  // Handle personal form operations
  const handleUpdatePersonalForm = async (formId: string, updates: UpdateFormRequest): Promise<void> => {
    try {
      await updateForm(formId, updates);
      await refetchPersonalForms();
    } catch (error) {
      console.error('Failed to update personal form:', error);
      throw error;
    }
  };

  const handleDeletePersonalForm = async (formId: string): Promise<void> => {
    try {
      await deleteForm(formId);
      await refetchPersonalForms();
    } catch (error) {
      console.error('Failed to delete personal form:', error);
      throw error;
    }
  };

  const handleTogglePersonalFormLock = async (formId: string, isLocked: boolean): Promise<void> => {
    try {
      await toggleFormLock(formId, isLocked);
      await refetchPersonalForms();
    } catch (error) {
      console.error('Failed to toggle personal form lock:', error);
      throw error;
    }
  };

  const handleDuplicatePersonalForm = async (formId: string): Promise<void> => {
    try {
      await duplicateForm(formId);
      await refetchPersonalForms();
    } catch (error) {
      console.error('Failed to duplicate personal form:', error);
      throw error;
    }
  };

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

  // Get form type display text
  const getFormTypeDisplay = (type: string) => {
    switch (type) {
      case 'action':
        return 'Action';
      case 'education':
        return 'Education';
      case 'blank':
        return 'Note';
      case 'ida':
        return 'IDA';
      default:
        return type;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Loading state
  if (isLoading && teams.length === 0) {
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
  if (error && teams.length === 0) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
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

        {/* Personal Forms Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Personal Forms</h2>
              <p className="text-lg text-gray-600">
                Forms you created for personal use ({personalForms.length} forms)
              </p>
            </div>
            <button
              onClick={handleCreatePersonalForm}
              disabled={isCreatingPersonalForm}
              className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              {isCreatingPersonalForm ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              <span>{isCreatingPersonalForm ? 'Creating...' : 'Create Personal Form'}</span>
            </button>
          </div>

          {/* Personal forms statistics cards */}
          {personalStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <FormStatsCard
                title="Total Forms"
                value={personalStats.totalForms}
                icon="document"
                color="blue"
              />
              <FormStatsCard
                title="Active Forms"
                value={personalStats.activeForms}
                icon="check-circle"
                color="green"
              />
              <FormStatsCard
                title="Locked Forms"
                value={personalStats.lockedForms}
                icon="lock"
                color="red"
              />
            </div>
          )}

          {/* Personal forms grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {personalForms.map((form) => (
              <PersonalFormCard
                key={form.id}
                form={form}
                onUpdateForm={handleUpdatePersonalForm}
                onDeleteForm={handleDeletePersonalForm}
                onToggleLock={handleTogglePersonalFormLock}
                onDuplicateForm={handleDuplicatePersonalForm}
                onFormClick={handlePersonalFormClick}
                formatDate={formatDate}
                getFormTypeDisplay={getFormTypeDisplay}
                isLoading={isFormOperating}
              />
            ))}
            
            {/* Empty state for personal forms */}
            {personalForms.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No personal forms yet</h3>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                  Create your first personal form to start working on your own projects and ideas.
                </p>
                <button
                  onClick={handleCreatePersonalForm}
                  disabled={isCreatingPersonalForm}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  {isCreatingPersonalForm ? 'Creating...' : 'Create Your First Personal Form'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create team modal */}
        <CreateTeamModal 
          isOpen={showCreateTeamModal}
          onClose={() => setShowCreateTeamModal(false)}
          onSuccess={handleCreateTeamSuccess}
          isLoading={isCreating}
        />

        {/* Create personal form modal */}
        <CreateFormModal
          isOpen={showCreateFormModal}
          onClose={() => setShowCreateFormModal(false)}
          onSuccess={handleCreatePersonalFormSuccess}
          teamId=""
          isLoading={isCreatingPersonalForm}
          isPersonal={true}
        />
      </div>
    </div>
  );
};

export default TeamPage;