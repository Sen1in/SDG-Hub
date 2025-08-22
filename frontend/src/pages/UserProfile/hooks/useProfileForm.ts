import { useState, useEffect } from 'react';
import { ProfileData, Message, User } from '../types';
import { useNotification } from '../../../hooks/useNotification';

export const useProfileForm = (user: User | null, updateProfile: (data: ProfileData) => Promise<any>) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message>({ type: '', content: '' });
  const [isSaved, setIsSaved] = useState(false);
  const { success, error } = useNotification();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    email: '',
    first_name: '',
    last_name: '',
    organization: '',
    faculty_and_major: '',
    bio: '',
    gender: '',
    language: '',
    phone: '',
    profile_picture: '',
    positions: '',
  });

  const [originalData, setOriginalData] = useState<ProfileData>(profileData);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      const userData: ProfileData = {
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        organization: user.userprofile?.organization || '',
        faculty_and_major: user.userprofile?.faculty_and_major || '',
        bio: user.userprofile?.bio || '',
        gender: user.userprofile?.gender || '',
        language: user.userprofile?.language || '',
        phone: user.userprofile?.phone || '',
        profile_picture: user.userprofile?.profile_picture || '',
        positions: user.userprofile?.positions || '', 
      };
      setProfileData(userData);
      setOriginalData(userData);
      
      const isNewUser = !userData.first_name || !userData.last_name || 
                       !userData.organization || !userData.faculty_and_major ||
                       !userData.gender || !userData.language;
      
      setIsSaved(!isNewUser);
    }
  }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    setIsSaved(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    setMessage({ type: '', content: '' });

    // check if the user is new
    const wasNewUser = !originalData.first_name || !originalData.last_name || 
                      !originalData.organization || !originalData.faculty_and_major ||
                      !originalData.gender || !originalData.language;

    try {
      const result = await updateProfile(profileData);

      if (result.success) {
        const successMessage = wasNewUser 
          ? 'Profile created successfully! You can now return to home.' 
          : 'Profile updated successfully!';
        
        success(successMessage);
        setIsEditing(false);
        setOriginalData(profileData);
        setIsSaved(true); // set as saved
      } else {
        const errorMessage = result.errors?.general || 
                           (result.errors && Object.values(result.errors)[0]) || 
                           'Failed to update profile';
        error(errorMessage);
        setIsSaved(false); // set as not saved
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        content: (error as Error).message || 'An unexpected error occurred' 
      });
      setIsSaved(false); // set as not saved
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setMessage({ type: '', content: '' });
    const wasOriginalDataValid = originalData.first_name && originalData.last_name && 
                                originalData.organization && originalData.faculty_and_major &&
                                originalData.gender && originalData.language;
    setIsSaved(!!wasOriginalDataValid);
  };

  const hasChanges = JSON.stringify(profileData) !== JSON.stringify(originalData);

  return {
    isEditing,
    setIsEditing,
    loading,
    message,
    setMessage,
    profileData,
    originalData,
    hasChanges,
    isSaved,
    handleInputChange,
    handleSubmit,
    handleCancel
  };
};
