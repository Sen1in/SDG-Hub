// components/PersonalFormCard.tsx (Fixed Version)
import React, { useState, useRef, useEffect } from 'react';
import { FormStatus, FormType } from '../types/forms';
import type { TeamForm, UpdateFormRequest } from '../types/forms';

interface PersonalFormCardProps {
  form: TeamForm;
  onUpdateForm: (formId: string, updates: UpdateFormRequest) => Promise<void>;
  onDeleteForm: (formId: string) => Promise<void>;
  onToggleLock: (formId: string, isLocked: boolean) => Promise<void>;
  onDuplicateForm: (formId: string) => Promise<void>;
  onFormClick: (formId: string) => void;
  formatDate: (dateString: string) => string;
  getFormTypeDisplay: (type: string) => string;
  isLoading?: boolean;
}

const PersonalFormCard: React.FC<PersonalFormCardProps> = ({
  form,
  onUpdateForm,
  onDeleteForm,
  onToggleLock,
  onDuplicateForm,
  onFormClick,
  formatDate,
  getFormTypeDisplay,
  isLoading = false
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const isOperationLoading = isLoading || internalLoading;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isDropdownOpen]);

  // Handle duplicate form
  const handleDuplicate = async () => {
    try {
      setInternalLoading(true);
      await onDuplicateForm(form.id);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to duplicate form:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  // Handle toggle lock
  const handleToggleLock = async () => {
    const isCurrentlyLocked = form.status === FormStatus.LOCKED;
    
    try {
      setInternalLoading(true);
      await onToggleLock(form.id, !isCurrentlyLocked);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to toggle form lock:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  // Handle archive
  const handleArchive = async () => {
    if (window.confirm('Are you sure you want to archive this form? It will no longer accept new responses.')) {
      try {
        setInternalLoading(true);
        await onUpdateForm(form.id, {
          status: FormStatus.ARCHIVED
        });
        setIsDropdownOpen(false);
      } catch (error) {
        console.error('Failed to archive form:', error);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${form.title}"? This action cannot be undone.`)) {
      try {
        setInternalLoading(true);
        await onDeleteForm(form.id);
        setIsDropdownOpen(false);
      } catch (error) {
        console.error('Failed to delete form:', error);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const handleFormClick = () => {
    onFormClick(form.id);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Menu toggle clicked, current state:', isDropdownOpen);
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div 
      ref={cardRef}
      className="bg-green-300 hover:bg-green-400 rounded-xl p-6 cursor-pointer transition-all duration-200 transform hover:scale-105 hover:shadow-lg relative"
    >
      {/* Form icon */}
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-green-600 bg-opacity-30 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-green-800" fill="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
      
      {/* Three dots button */}
      <div className="absolute top-2 right-2 z-20">
        <button
          ref={buttonRef}
          onClick={handleMenuToggle}
          disabled={isOperationLoading}
          className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-2 rounded-full hover:bg-green-500 hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Form actions"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {/* Dropdown menu - positioned relative to button */}
        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute top-full right-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-[9999] overflow-visible"
            style={{ minWidth: '224px' }}
          >
            <div className="py-1">
              {/* Edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFormClick();
                  setIsDropdownOpen(false);
                }}
                disabled={isOperationLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Form
              </button>

              {/* Duplicate */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDuplicate();
                }}
                disabled={isOperationLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              {/* Lock/Unlock */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleLock();
                }}
                disabled={isOperationLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              >
                {form.status === FormStatus.LOCKED ? (
                  <>
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Unlock Form
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Lock Form
                  </>
                )}
              </button>

              {/* Archive */}
              {form.status !== FormStatus.ARCHIVED && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchive();
                  }}
                  disabled={isOperationLoading}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m0 0l6-6m-6 6V3" />
                  </svg>
                  Archive
                </button>
              )}

              <div className="border-t border-gray-100 my-1"></div>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isOperationLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Form
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Main card content - clickable */}
      <div onClick={handleFormClick}>
        {/* Form name */}
        <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">
          {form.title}
        </h3>
        
        {/* Form type */}
        <p className="text-gray-700 text-center font-medium mb-3">
          {getFormTypeDisplay(form.type)}
        </p>
        
        {/* Status indicator */}
        {form.status === FormStatus.LOCKED && (
          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </span>
          </div>
        )}
        
        {/* Update time */}
        <p className="text-gray-600 text-sm text-center mt-2">
          Updated {formatDate(form.updatedAt)}
        </p>
      </div>

      {/* Loading overlay */}
      {isOperationLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center z-30">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      )}
    </div>
  );
};

export default PersonalFormCard;