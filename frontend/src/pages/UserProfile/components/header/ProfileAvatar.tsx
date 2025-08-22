import React from 'react';
import { User } from '../../types';

interface ProfileAvatarProps {
  user: User;
  previewUrl?: string | null;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ user, previewUrl }) => {
  // first display the preview URL if available, otherwise fall back to user profile avatar or profile picture
  const displayUrl = previewUrl || user.userprofile?.avatar || user.userprofile?.profile_picture;
  
  return (
    <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
      {displayUrl ? (
        <img 
          src={displayUrl} 
          alt={`${user.username}'s avatar`} 
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide image and show default avatar
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}
      <span 
        className="text-gray-600 text-xl font-bold w-full h-full flex items-center justify-center"
        style={{ display: displayUrl ? 'none' : 'flex' }}
      >
        {user.username?.charAt(0).toUpperCase() || 'U'}
      </span>
    </div>
  );
};
