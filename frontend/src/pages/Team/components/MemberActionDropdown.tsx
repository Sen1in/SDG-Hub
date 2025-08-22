import React, { useState, useRef, useEffect } from 'react';
import type { TeamMember, MemberActionDropdownProps } from '../types';

const MemberActionDropdown: React.FC<MemberActionDropdownProps> = ({
  member,
  currentUserRole,
  onUpdateRole,
  onRemoveMember,
  isLoading: externalLoading = false
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [menuPosition, setMenuPosition] = useState<{top: number, right: number}>({top: 0, right: 0});
  const [showRoleConfirm, setShowRoleConfirm] = useState<boolean>(false);
  const [pendingRole, setPendingRole] = useState<'owner' | 'edit' | 'view' | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Merge internal and external loading states
  const isLoading = externalLoading || internalLoading;

  // Calculate menu position
  const calculateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      setMenuPosition({
        top: rect.bottom + scrollY + 8, // 8px gap
        right: window.innerWidth - rect.right - scrollX
      });
    }
  };

  // Close dropdown when clicking outside
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

  // Only owners can see action menu, and can't operate on themselves
  if (currentUserRole !== 'owner' || member.role === 'owner') {
    return null;
  }

  const handleRoleChange = async (newRole: 'owner' | 'edit' | 'view') => {
    if (newRole === member.role) return;

    // Show confirmation dialog
    setPendingRole(newRole);
    setShowRoleConfirm(true);
    setIsOpen(false);
  };

  const confirmRoleChange = async () => {
    if (!pendingRole) return;

    try {
      setInternalLoading(true);
      await onUpdateRole(member.id, pendingRole);
      setShowRoleConfirm(false);
      setPendingRole(null);
    } catch (error) {
      console.error('Failed to update role:', error);
      // Error handling can add toast notifications here
    } finally {
      setInternalLoading(false);
    }
  };

  const cancelRoleChange = () => {
    setShowRoleConfirm(false);
    setPendingRole(null);
  };

  const handleRemoveMember = async () => {
    // Show confirmation dialog
    setShowRemoveConfirm(true);
    setIsOpen(false);
  };

  const confirmRemoveMember = async () => {
    try {
      setInternalLoading(true);
      await onRemoveMember(member.id);
      setShowRemoveConfirm(false);
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  const cancelRemoveMember = () => {
    setShowRemoveConfirm(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-green-100 text-green-800';
      case 'edit': return 'bg-blue-100 text-blue-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-green-700';
      case 'edit': return 'text-blue-700';
      case 'view': return 'text-gray-700';
      default: return 'text-gray-700';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'owner': return 'Owner';
      case 'edit': return 'Editor';
      case 'view': return 'Viewer';
      default: return role;
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner': return 'Full access to manage team and all content';
      case 'edit': return 'Can edit content and invite members';
      case 'view': return 'Can only view content';
      default: return '';
    }
  };

  return (
    <>
      {/* Three dots button */}
      <button
        ref={buttonRef}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            calculateMenuPosition();
          }
        }}
        disabled={isLoading}
        className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        aria-label="Member actions"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>

      {/* Dropdown menu - uses fixed positioning to break out of all container constraints */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[99999] overflow-visible"
          style={{
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`
          }}
        >
          <div className="py-1">
            {/* Role selection header */}
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Change Role
            </div>
            
            {/* Display role options directly */}
            {['owner', 'edit', 'view'].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role as 'owner' | 'edit' | 'view')}
                disabled={isLoading || role === member.role}
                className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center justify-between ${
                  role === member.role 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className={getRoleColor(role)}>
                    {getRoleDisplayName(role)}
                  </span>
                </div>
                {role === member.role && (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Remove member option */}
            <button
              onClick={handleRemoveMember}
              disabled={isLoading}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove Member
            </button>
          </div>
        </div>
      )}

      {/* Role confirmation dialog */}
      {showRoleConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirm Role Change
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to change <span className="font-medium text-gray-900">{member.username}</span>'s role?
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Current Role:</span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(member.role)}`}>
                    {getRoleDisplayName(member.role)}
                  </span>
                </div>
                
                <div className="flex items-center justify-center text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">New Role:</span>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(pendingRole || '')}`}>
                    {getRoleDisplayName(pendingRole || '')}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">{getRoleDisplayName(pendingRole || '')} permissions:</span>
                  <br />
                  {getRoleDescription(pendingRole || '')}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelRoleChange}
                disabled={internalLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                disabled={internalLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
              >
                {internalLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Confirm Change'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove member confirmation dialog */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000]">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Remove Member
                </h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Are you sure you want to remove <span className="font-medium text-gray-900">{member.username}</span> from the team? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={cancelRemoveMember}
                disabled={internalLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                disabled={internalLoading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center justify-center"
              >
                {internalLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </>
  );
};

export default MemberActionDropdown;