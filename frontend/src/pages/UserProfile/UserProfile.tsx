import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BackButton } from './components/shared/BackButton';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { AuthError } from './components/shared/AuthError';
import { Message } from './components/shared/Message';
import { ProfileHeader } from './components/header/ProfileHeader';
import { ProfileForm } from './components/form/ProfileForm';
import { AvatarUpload } from './components/avatar/AvatarUpload';
import { useProfileForm } from './hooks/useProfileForm';
import { useNotification } from '../../hooks/useNotification';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, refreshUser, loading: authLoading } = useAuth();
  const { warning } = useNotification();
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  
  const {
    isEditing,
    setIsEditing,
    loading,
    message,
    profileData,
    hasChanges,
    isSaved,
    handleInputChange,
    handleSubmit,
    handleCancel
  } = useProfileForm(user, updateProfile);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && hasChanges && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextAreaKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && hasChanges && !loading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // add form validation logic
  const isFormValid = () => {
    if (!user) return false;
    return (
      profileData.first_name?.trim() &&
      profileData.last_name?.trim() &&
      profileData.email?.trim() &&
      user.username?.trim() &&
      profileData.organization?.trim() &&
      profileData.faculty_and_major?.trim() &&
      profileData.gender?.trim() &&
      profileData.language?.trim()
    );
  };

  // handle avatar upload success
  const handleAvatarUploadSuccess = async (avatarUrl: string) => {
    console.log('Avatar uploaded successfully:', avatarUrl);

    // refresh user info first to ensure the latest avatar URL is loaded into AuthContext
    await refreshUser();

    // Then clear the preview state so that the updated real avatar is displayed
    setAvatarPreview(null);
  };

  // handle avatar preview change
  const handleAvatarPreviewChange = (previewUrl: string | null) => {
    setAvatarPreview(previewUrl);
  };

  // Loading state
  if (authLoading) {
    return <LoadingSpinner text="Loading profile..." />;
  }

  // Not authenticated
  if (!user) {
    return <AuthError />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <BackButton
        disabled={!isSaved}
        onClick={() => window.history.back()}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <ProfileHeader
          user={user}
          avatarPreview={avatarPreview}
          isEditing={isEditing}
          loading={loading}
          hasChanges={hasChanges}
          onEditClick={() => setIsEditing(true)}
          onCancelClick={() => {
            if (isFormValid()) handleCancel();
            else warning('Please complete all required fields before cancelling.');
          }}
          onSaveClick={() => {
            if (isFormValid()) handleSubmit();
            else warning('Please complete all required fields before saving.');
          }}
        />

        {/* Success/Error Message */}
        <Message message={message} />

        {/* Avatar Upload Section */}
        { isEditing && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile Picture</h2>
            <p className="text-sm text-gray-600">Upload your profile picture to personalize your account.</p>
          </div>
          <div className="p-6">
            <AvatarUpload
              onUploadSuccess={handleAvatarUploadSuccess}
              onPreviewChange={handleAvatarPreviewChange}
              currentAvatar={user.userprofile?.avatar || user.userprofile?.profile_picture}
            />
          </div>
        </div>
        )}
        
        {/* Profile Information Card */}
        <ProfileForm
          user={user}
          profileData={profileData}
          isEditing={isEditing}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onTextAreaKeyDown={handleTextAreaKeyDown}
        />
      </div>
    </div>
  );
};

export default UserProfile;