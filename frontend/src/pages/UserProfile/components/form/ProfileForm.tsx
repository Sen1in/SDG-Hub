import React , { useState }from 'react';
import { User, ProfileData } from '../../types';
import { FormField } from './FormField';
import { ReadOnlyField } from './ReadOnlyField';
import { AccountInfo } from './AccountInfo';

interface ProfileFormProps {
  user: User;
  profileData: ProfileData;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onTextAreaKeyDown: (e: React.KeyboardEvent) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  profileData,
  isEditing,
  onChange,
  onKeyDown,
  onTextAreaKeyDown
}) => {
  // State: controls whether to show the "Other" input field
  const [isGenderOther, setIsGenderOther] = useState(false);
  const [isLanguageOther, setIsLanguageOther] = useState(false);

  // temporarily store user input for custom values
  const [genderCustomValue, setGenderCustomValue] = useState('');
  const [languageCustomValue, setLanguageCustomValue] = useState('');

  // handles dropdown selection
  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'gender') {
      if (value === 'Other') {
        setIsGenderOther(true);
        setGenderCustomValue(''); // Clear previous input
        // Do not call onChange, wait for user to input custom value
      } else {
        setIsGenderOther(false);
        onChange(e); // Normal selection, update immediately
      }
    } else if (name === 'language') {
      if (value === 'Other') {
        setIsLanguageOther(true);
        setLanguageCustomValue(''); // Clear previous input
        // Do not call onChange, wait for user to input custom value
      } else {
        setIsLanguageOther(false);
        onChange(e); // Normal selection, update immediately
      }
    } else {
      onChange(e);
    }
  };

  // Handle custom input change
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const { value } = e.target;
    
    if (fieldName === 'gender') {
      setGenderCustomValue(value);
    } else if (fieldName === 'language') {
      setLanguageCustomValue(value);
    }
  };

  // Confirm custom input (Enter key or blur)
  const confirmCustomInput = (fieldName: string) => {
    if (fieldName === 'gender' && genderCustomValue.trim()) {
      // Create synthetic event to update main form data
      const syntheticEvent = {
        target: {
          name: 'gender',
          value: genderCustomValue.trim()
        }
      } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
      
      onChange(syntheticEvent);
      setIsGenderOther(false); // Hide input field
    } else if (fieldName === 'language' && languageCustomValue.trim()) {
      // Create synthetic event to update main form data
      const syntheticEvent = {
        target: {
          name: 'language',
          value: languageCustomValue.trim()
        }
      } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
      
      onChange(syntheticEvent);
      setIsLanguageOther(false); // Hide input field
    }
  };

  // Handle Enter key confirmation
  const handleCustomKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmCustomInput(fieldName);
    } else if (e.key === 'Escape') {
      // ESC key cancels input
      if (fieldName === 'gender') {
        setIsGenderOther(false);
        setGenderCustomValue('');
      } else if (fieldName === 'language') {
        setIsLanguageOther(false);
        setLanguageCustomValue('');
      }
    }
  };

  // auto generate Gender options (including user-defined values)
  const getGenderOptions = () => {
    const baseOptions = [
      { value: '', label: 'Please select' },
      { value: 'Female', label: 'Female' },
      { value: 'Male', label: 'Male' },
    ];

    // If current value is not in predefined options, add it as an option
    const predefinedValues = ['', 'Female', 'Male'];
    if (profileData.gender && !predefinedValues.includes(profileData.gender)) {
      baseOptions.push({ value: profileData.gender, label: profileData.gender });
    }
    
    baseOptions.push({ value: 'Other', label: 'Other (please specify)' });
    return baseOptions;
  };

  // auto generate Language options (including user-defined values)
  const getLanguageOptions = () => {
    const baseOptions = [
      { value: '', label: 'Please select' },
      { value: 'English', label: 'English' },
      { value: 'Mandarin', label: 'Mandarin' },
      { value: 'Arabic', label: 'Arabic' },
      { value: 'Cantonese', label: 'Cantonese' },
      { value: 'Vietnamese', label: 'Vietnamese' },
      { value: 'Hindu', label: 'Hindu' },
      { value: 'Italian', label: 'Italian' },
    ];

    // If current value is not in predefined options, add it as an option
    const predefinedValues = ['', 'English', 'Mandarin', 'Arabic', 'Cantonese', 'Vietnamese', 'Hindu', 'Italian'];
    if (profileData.language && !predefinedValues.includes(profileData.language)) {
      baseOptions.push({ value: profileData.language, label: profileData.language });
    }
    
    baseOptions.push({ value: 'Other', label: 'Other (please specify)' });
    return baseOptions;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        <p className="text-sm text-gray-600">Manage your personal information and preferences.</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username (read-only) */}
          <ReadOnlyField
            label="Username"
            value={user.username}
            description="Username cannot be changed"
            className="md:col-span-2"
          />

          {/* Email */}
          <FormField
            id="email"
            name="email"
            label="Email Address"
            value={profileData.email}
            type="email"
            isEditing={isEditing}
            placeholder="Enter your email address"
            required
            onChange={onChange}
            onKeyDown={onKeyDown}
            className="md:col-span-2"
          />

          {/* First Name */}
          <FormField
            id="first_name"
            name="first_name"
            label="First Name"
            value={profileData.first_name}
            isEditing={isEditing}
            required={true} 
            placeholder="Enter your first name"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />

          {/* Last Name */}
          <FormField
            id="last_name"
            name="last_name"
            label="Last Name"
            value={profileData.last_name}
            isEditing={isEditing}
            required={true} 
            placeholder="Enter your last name"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />

          {/* Organization */}
          <FormField
            id="organization"
            name="organization"
            label="Organization"
            value={profileData.organization}
            isEditing={isEditing}
            required={true} 
            placeholder="Enter your organization"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />

          {/* Faculty and Major */}
          <FormField
            id="faculty_and_major"
            name="faculty_and_major"
            label="What is your current major of study?"
            value={profileData.faculty_and_major}
            isEditing={isEditing}
            required={true} 
            type="select"
            options={[
              { value: '', label: 'Please select' },
              { value: 'Architecture and Building', label: 'Architecture and Building' },
              { value: 'Business and Management', label: 'Business and Management' },
              { value: 'Creative Arts', label: 'Creative Arts' },
              { value: 'Education', label: 'Education' },
              { value: 'Engineering and Related Technologies', label: 'Engineering and Related Technologies' },
              { value: 'Environmental and Related Studies', label: 'Environmental and Related Studies' },
              { value: 'Health', label: 'Health' },
              { value: 'Humanities, Law and Social Sciences', label: 'Humanities, Law and Social Sciences' },
              { value: 'Information Technology', label: 'Information Technology' },
              { value: 'Natural and Sciences', label: 'Natural and Sciences' },
            ]}
            onChange={onChange}
            onKeyDown={onKeyDown}
          />

          {/* Gender Field */}
          <div>
            <FormField
              id="gender"
              name="gender"
              label="Gender"
              value={isGenderOther ? 'Other' : profileData.gender}
              isEditing={isEditing}
              required={true}
              type="select"
              options={getGenderOptions()}
              onChange={handleSelectChange}
              onKeyDown={onKeyDown}
            />
            {/* when choosing "Other", show custom input field */}
            {isGenderOther && (
              <div className="mt-2">
                <FormField
                  id="gender_custom"
                  name="gender_custom"
                  label=""
                  value={genderCustomValue}
                  isEditing={isEditing}
                  placeholder="Please specify your gender (Press Enter to confirm)"
                  onChange={(e) => handleCustomInputChange(e as React.ChangeEvent<HTMLInputElement>, 'gender')}
                  onKeyDown={(e) => handleCustomKeyDown(e, 'gender')}
                  onBlur={() => confirmCustomInput('gender')}
                />
              </div>
            )}
          </div>

          {/* Language Spoken at Home */}
          <div>
            <FormField
              id="language"
              name="language"
              label="What language do you speak at home?"
              value={isLanguageOther ? 'Other' : profileData.language}
              isEditing={isEditing}
              required={true}
              type="select"
              options={getLanguageOptions()}
              onChange={handleSelectChange}
              onKeyDown={onKeyDown}
            />
            {/* when choosing "Other", show custom input field */}
            {isLanguageOther && (
              <div className="mt-2">
                <FormField
                  id="language_custom"
                  name="language_custom"
                  label=""
                  value={languageCustomValue}
                  isEditing={isEditing}
                  placeholder="Please specify your language (Press Enter to confirm)"
                  onChange={(e) => handleCustomInputChange(e as React.ChangeEvent<HTMLInputElement>, 'language')}
                  onKeyDown={(e) => handleCustomKeyDown(e, 'language')}
                  onBlur={() => confirmCustomInput('language')}
                />
              </div>
            )}
          </div>

          {/* Phone Number (optional) */}
          <FormField
            id="phone"
            name="phone"
            label="Phone Number"
            value={profileData.phone || ''}
            isEditing={isEditing}
            placeholder="Enter your phone number"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />

          {/* Profile Picture URL (optional) */}
          <FormField
            id="profile_picture"
            name="profile_picture"
            label="Profile Picture URL"
            value={profileData.profile_picture || ''}
            isEditing={isEditing}
            placeholder="Enter image URL or upload in avatar section"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />

          {/* Positions (optional) */}
          <FormField
            id="positions"
            name="positions"
            label="Positions"
            value={profileData.positions || ''}
            isEditing={isEditing}
            placeholder="e.g., Team Leader, Member"
            onChange={onChange}
            onKeyDown={onKeyDown}
          />

          {/* Bio */}
          <FormField
            id="bio"
            name="bio"
            label="Bio"
            value={profileData.bio}
            type="textarea"
            isEditing={isEditing}
            placeholder="Tell us about yourself... (Ctrl+Enter to save)"
            onChange={onChange}
            onKeyDown={onTextAreaKeyDown}
            className="md:col-span-2"
          />
        </div>

        <AccountInfo user={user} />
      </div>
    </div>
  );
};