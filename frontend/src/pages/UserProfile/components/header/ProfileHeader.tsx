import React from 'react';
import { User } from '../../types';
import { ProfileAvatar } from './ProfileAvatar';
import { getDisplayName } from '../../utils/helpers';

interface ProfileHeaderProps {
  user: User;
  avatarPreview?: string | null;
  isEditing: boolean;
  loading: boolean;
  hasChanges: boolean;
  onEditClick: () => void;
  onCancelClick: () => void;
  onSaveClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  avatarPreview,
  isEditing,
  loading,
  hasChanges,
  onEditClick,
  onCancelClick,
  onSaveClick
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-green-600 h-16"></div>
      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-4">
          <div className="flex items-end space-x-4">
            <ProfileAvatar user={user} previewUrl={avatarPreview} />
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="pb-1">
            {!isEditing ? (
              <button
                onClick={onEditClick}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={onCancelClick}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={onSaveClick}
                  disabled={loading || !hasChanges}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
