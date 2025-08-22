import React from 'react';

interface UserAgreementProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

export const UserAgreement: React.FC<UserAgreementProps> = ({ checked, onChange, error }) => {
  const handleTermsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.open('/terms', '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <div className={`flex items-start space-x-3 p-4 border rounded-xl ${
        error ? 'border-red-500 bg-red-50' : 'border-gray-300'
      }`}>
        <input
          id="agreedToTerms"
          name="agreedToTerms"
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
        />
        <label htmlFor="agreedToTerms" className="text-sm text-gray-700">
          I agree to the{' '}
          <a href="#" 
            onClick={handleTermsClick} 
            className="text-blue-600 hover:underline font-medium">
            Terms and Conditions
          </a>
        </label>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
