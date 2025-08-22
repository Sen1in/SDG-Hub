import React, { useState, useRef, useEffect } from 'react';
import { FormStatus } from '../types/forms';
import type { TeamForm, UpdateFormRequest } from '../types/forms';

interface FormActionDropdownProps {
  form: TeamForm;
  currentUserRole: 'owner' | 'edit' | 'view';
  onUpdateForm: (formId: string, updates: UpdateFormRequest) => Promise<void>;
  onDeleteForm: (formId: string) => Promise<void>;
  onToggleLock: (formId: string, isLocked: boolean) => Promise<void>;
  onDuplicateForm?: (formId: string) => Promise<void>;
  isLoading?: boolean;
}

const FormActionDropdown: React.FC<FormActionDropdownProps> = ({
  form,
  currentUserRole,
  onUpdateForm,
  onDeleteForm,
  onToggleLock,
  onDuplicateForm,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<{top: number, right: number}>({top: 0, right: 0});
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);


  const isOperationLoading = isLoading || internalLoading;


  const canEdit = currentUserRole === 'owner' || currentUserRole === 'edit';
  const canDelete = currentUserRole === 'owner';
  const canToggleLock = currentUserRole === 'owner';


  const canLockUnlock = canToggleLock && (form.status === FormStatus.ACTIVE || form.status === FormStatus.LOCKED);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        calculateMenuPosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculateMenuPosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      calculateMenuPosition();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);


  if (!canEdit && !canDelete && !canToggleLock) {
    return null;
  }

  // Calculate the position of the dish
  const calculateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      setMenuPosition({
        top: rect.bottom + scrollY + 8,
        right: window.innerWidth - rect.right - scrollX
      });
    }
  };

  // Process the editing form
  const handleEdit = () => {
    console.log('Edit form:', form.id);
    setIsOpen(false);
  };

  // Handle the copied form
  const handleDuplicate = async () => {
    if (!onDuplicateForm) {
      try {
        setInternalLoading(true);
        await onUpdateForm(form.id, {
          title: `${form.title} (Copy)`,
          status: FormStatus.ACTIVE
        });
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to duplicate form:', error);
      } finally {
        setInternalLoading(false);
      }
    } else {
      try {
        setInternalLoading(true);
        await onDuplicateForm(form.id);
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to duplicate form:', error);
      } finally {
        setInternalLoading(false);
      }
    }
  };


  const handleToggleLock = async () => {
    const isCurrentlyLocked = form.status === FormStatus.LOCKED;
    
    try {
      setInternalLoading(true);
      await onToggleLock(form.id, !isCurrentlyLocked);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to toggle form lock:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  // Handle archiving
  const handleArchive = async () => {
    if (window.confirm('Are you sure you want to archive this form? It will no longer accept new responses.')) {
      try {
        setInternalLoading(true);
        await onUpdateForm(form.id, {
          status: FormStatus.ARCHIVED
        });
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to archive form:', error);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  // Handle deletion
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${form.title}"? This action cannot be undone.`)) {
      try {
        setInternalLoading(true);
        await onDeleteForm(form.id);
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to delete form:', error);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  // Handle the sharing form
  const handleShare = () => {
    console.log('Share form:', form.id);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            calculateMenuPosition();
          }
        }}
        disabled={isOperationLoading}
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Form actions"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {/* Drop-down menu */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed w-56 bg-white rounded-md shadow-lg border border-gray-200 z-[99999] overflow-visible"
          style={{
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`
          }}
        >
          <div className="py-1">
            {/* edit */}
            {canEdit && (
              <button
                onClick={handleEdit}
                disabled={isOperationLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Form
              </button>
            )}

            {/* duplicate */}
            {canEdit && (
              <button
                onClick={handleDuplicate}
                disabled={isOperationLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </button>
            )}

            {/* share */}
            <button
              onClick={handleShare}
              disabled={isOperationLoading}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            {/* Lock/Unlock */}
            {canLockUnlock && (
              <button
                onClick={handleToggleLock}
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
            )}

            {/* Archiving */}
            {canEdit && form.status !== FormStatus.ARCHIVED && (
              <button
                onClick={handleArchive}
                disabled={isOperationLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8l6 6m0 0l6-6m-6 6V3" />
                </svg>
                Archive
              </button>
            )}

            {canDelete && (
              <div className="border-t border-gray-100 my-1"></div>
            )}

            {/* delete */}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isOperationLoading}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Form
              </button>
            )}
          </div>
        </div>
      )}

      {/* Load Mask */}
      {isOperationLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </>
  );
};

export default FormActionDropdown;