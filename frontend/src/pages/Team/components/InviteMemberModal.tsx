import React, { useState } from 'react';
import type { InvitationResult, InviteMemberModalProps } from '../types';

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  isLoading = false
}) => {
  const [inviteType, setInviteType] = useState<'email' | 'username'>('email');
  const [identifier, setIdentifier] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showEmailWarning, setShowEmailWarning] = useState<boolean>(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!identifier.trim()) {
      newErrors.identifier = `${inviteType === 'email' ? 'Email' : 'Username'} is required`;
    } else if (inviteType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier.trim())) {
        newErrors.identifier = 'Please enter a valid email address';
      }
    } else {
      if (identifier.trim().length < 3) {
        newErrors.identifier = 'Username must be at least 3 characters';
      } else if (identifier.trim().length > 30) {
        newErrors.identifier = 'Username must be less than 30 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (successMessage) {
      setIdentifier('');
      setErrors({});
      setSuccessMessage('');
      setShowEmailWarning(false);
      return;
    }

    if (!validateForm()) {
      return;
    }

    setErrors({});
    setSuccessMessage('');
    setShowEmailWarning(false);
    
    try {
      const result = await onSuccess(identifier.trim(), inviteType);
      
      if (result && result.success) {
        if (result.type === 'email_sent' || result.emailSent) {
          setSuccessMessage(`Invitation email sent to ${identifier.trim()}`);
          setShowEmailWarning(true);
        } else if (result.type === 'notification_sent') {
          setSuccessMessage(`Invitation sent successfully to ${identifier.trim()}! They will receive a notification in the system.`);
          setShowEmailWarning(false);
        } else if (result.type === 'already_member') {
          setSuccessMessage(`${identifier.trim()} is already a member of this team.`);
          setShowEmailWarning(false);
        } else if (result.type === 'general_success') {
          setSuccessMessage(result.message);
          setShowEmailWarning(result.emailSent || false);
        } else {
          setSuccessMessage(`Invitation sent successfully to ${identifier.trim()}!`);
          setShowEmailWarning(false);
        }
      } else {
        if (inviteType === 'email') {
          setSuccessMessage(`Invitation email sent to ${identifier.trim()}`);
          setShowEmailWarning(true);
        } else {
          setSuccessMessage(`Invitation sent successfully to ${identifier.trim()}!`);
          setShowEmailWarning(false);
        }
      }
      
      setErrors({}); 
    } catch (error) {
      let errorMessage = 'Failed to invite member. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
      setSuccessMessage('');
      setShowEmailWarning(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    
    setIdentifier('');
    setInviteType('email');
    setErrors({});
    setSuccessMessage('');
    setShowEmailWarning(false);
    onClose();
  };

  const handleCloseAfterSuccess = () => {
    if (isLoading) return;
    
    setTimeout(() => {
      handleClose();
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      handleClose();
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && identifier.trim()) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTypeChange = (type: 'email' | 'username') => {
    setInviteType(type);
    setIdentifier('');
    setErrors({});
    setSuccessMessage('');
    setShowEmailWarning(false);
  };

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Invite Member</h2>
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Invite by
              </label>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => handleTypeChange('email')}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    inviteType === 'email'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('username')}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    inviteType === 'username'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Username
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                {inviteType === 'email' ? 'Email Address' : 'Username'} <span className="text-red-500">*</span>
              </label>
              <input
                type={inviteType === 'email' ? 'email' : 'text'}
                id="identifier"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) {
                    setErrors(prev => ({ ...prev, identifier: '' }));
                  }
                  if (successMessage) {
                    setSuccessMessage('');
                    setShowEmailWarning(false);
                  }
                }}
                onKeyDown={handleInputKeyDown}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  errors.identifier 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder={inviteType === 'email' ? 'Enter email address' : 'Enter username'}
                disabled={isLoading}
                autoFocus
                autoComplete="off"
              />
              {errors.identifier && (
                <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {inviteType === 'email' 
                  ? 'If the user is not registered, they will receive an invitation email.'
                  : 'Enter the exact username of the user you want to invite.'
                }
              </p>
            </div>

            {successMessage && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <span className="text-green-600">✉️</span>
                  <p className="text-sm font-medium">
                    {successMessage}
                  </p>
                </div>
                
                {showEmailWarning && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 text-sm">⚠️</span>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p className="font-medium">Can't find the email?</p>
                        <div className="space-y-1 text-blue-700">
                          <p>• <strong>Check your spam/junk folder</strong></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {errors.submit && (
              <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={successMessage ? handleCloseAfterSuccess : handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {successMessage ? 'Close' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!identifier.trim() || isLoading || !!successMessage}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Inviting...
                  </>
                ) : successMessage ? (
                  'Invite Another'
                ) : (
                  'Invite Member'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;