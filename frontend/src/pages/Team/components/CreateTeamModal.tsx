import React, { useState } from 'react';
import type { CreateTeamModalProps, CreateTeamRequest } from '../types';

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  isLoading = false
}) => {
  const [teamName, setTeamName] = useState<string>('');
  const [maxMembers, setMaxMembers] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    } else if (teamName.trim().length < 2) {
      newErrors.teamName = 'Team name must be at least 2 characters';
    } else if (teamName.trim().length > 50) {
      newErrors.teamName = 'Team name must be less than 50 characters';
    }

    if (!maxMembers || parseInt(maxMembers) < 1) {
      newErrors.maxMembers = 'Team must have at least 1 member';
    } else if (parseInt(maxMembers) > 100) {
      newErrors.maxMembers = 'Team cannot exceed 100 members';
    } else if (isNaN(parseInt(maxMembers))) {
      newErrors.maxMembers = 'Please enter a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setErrors({});
    
    try {
      const teamData: CreateTeamRequest = {
        name: teamName.trim(),
        max_members: parseInt(maxMembers)
      };
      
      console.log('Preparing to create team with data:', teamData);
      
      await onSuccess(teamData);
      handleClose();
    } catch (error) {
      let errorMessage = 'Failed to create team. Please try again.';
      
      if (error instanceof Error) {
        const message = error.message;
        
        // Provide user-friendly messages for specific errors
        if (message.includes('team with this name already exists') || 
            message.includes('already exists') ||
            message.includes('A team with this name already exists')) {
          errorMessage = 'A team with this name already exists. Please choose a different name.';
        } else if (message.toLowerCase().includes('name')) {
          errorMessage = message;
        } else if (message.includes('maximum members') || message.includes('max_members')) {
          errorMessage = message;
        } else if (message.includes('HTTP 401') || message.includes('unauthorized')) {
          errorMessage = 'You are not authorized to create teams. Please login again.';
        } else if (message.includes('HTTP 400') || message.includes('Bad Request')) {
          errorMessage = 'Please check your input and try again.';
        } else {
          errorMessage = message;
        }
      }
      
      setErrors({ submit: errorMessage });
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    if (isLoading) return;
    
    setTeamName('');
    setMaxMembers('');
    setErrors({});
    onClose();
  };

  // Handle ESC key to close
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      handleClose();
    }
  };

  // Return null if modal is not open
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !isLoading && handleClose()}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create a Team</h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Team name input */}
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  if (errors.teamName) {
                    setErrors(prev => ({ ...prev, teamName: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  errors.teamName 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter team name"
                disabled={isLoading}
                maxLength={50}
                autoFocus
                autoComplete="off"
              />
              {errors.teamName && (
                <p className="mt-1 text-sm text-red-600">{errors.teamName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {teamName.length}/50 characters
              </p>
            </div>

            {/* Maximum members input */}
            <div>
              <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Members <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="maxMembers"
                value={maxMembers}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length <= 3) {
                    setMaxMembers(value);
                  }
                  if (errors.maxMembers) {
                    setErrors(prev => ({ ...prev, maxMembers: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  errors.maxMembers 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter maximum number of members"
                disabled={isLoading}
                maxLength={3}
                autoComplete="off"
              />
              {errors.maxMembers && (
                <p className="mt-1 text-sm text-red-600">{errors.maxMembers}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter a number between 1 and 100. You can change this limit later in team settings.
              </p>
            </div>

            {/* Submit error display */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!teamName.trim() || !maxMembers.trim() || isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Team'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTeamModal;