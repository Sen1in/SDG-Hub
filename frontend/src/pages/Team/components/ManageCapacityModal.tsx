import React, { useState, useEffect } from 'react';

interface ManageCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCapacity: number) => Promise<void>;
  currentCapacity: number;
  currentMemberCount: number;
  currentUserRole: 'owner' | 'edit' | 'view';
  isLoading?: boolean;
}

const ManageCapacityModal: React.FC<ManageCapacityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentCapacity,
  currentMemberCount,
  currentUserRole,
  isLoading = false
}) => {
  const [capacity, setCapacity] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Constants definition - Updated to match CreateTeamModal
  const MIN_CAPACITY = 1;
  const MAX_CAPACITY = 6;

  // Permission check
  const hasPermission = currentUserRole === 'owner';

  // Initialize capacity value when modal opens
  useEffect(() => {
    if (isOpen) {
      setCapacity(currentCapacity.toString());
      setErrors({});
    }
  }, [isOpen, currentCapacity]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    const capacityNum = parseInt(capacity);

    if (!capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
    } else if (isNaN(capacityNum)) {
      newErrors.capacity = 'Please enter a valid number';
    } else if (capacityNum < MIN_CAPACITY) {
      newErrors.capacity = `Capacity must be at least ${MIN_CAPACITY}`;
    } else if (capacityNum > MAX_CAPACITY) {
      newErrors.capacity = `Capacity cannot exceed ${MAX_CAPACITY} members`;
    } else if (capacityNum < currentMemberCount) {
      newErrors.capacity = `Capacity cannot be less than current member count (${currentMemberCount})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newCapacity = parseInt(capacity);
    
    // If capacity hasn't changed, close directly
    if (newCapacity === currentCapacity) {
      handleClose();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSuccess(newCapacity);
      handleClose();
    } catch (error) {
      let errorMessage = 'Failed to update team capacity. Please try again.';
      
      if (error instanceof Error) {
        const message = error.message;
        
        // Handle specific errors
        if (message.includes('exceed maximum capacity')) {
          errorMessage = `Capacity cannot exceed ${MAX_CAPACITY} members.`;
        } else if (message.includes('less than current member count')) {
          errorMessage = `Capacity cannot be less than current member count (${currentMemberCount}).`;
        } else if (message.includes('Only team owner')) {
          errorMessage = 'Only team owner can manage team capacity.';
        } else if (message.includes('HTTP 403')) {
          errorMessage = 'You do not have permission to modify team capacity.';
        } else {
          errorMessage = message;
        }
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    if (isSubmitting || isLoading) return;
    
    setCapacity('');
    setErrors({});
    onClose();
  };

  // Handle ESC key to close
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isSubmitting && !isLoading) {
      handleClose();
    }
  };

  // Handle input change
  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numeric input, limit to 1 digit since max is 6
    if (value === '' || (/^\d$/.test(value) && parseInt(value) >= 0)) {
      setCapacity(value);
      // Clear related errors
      if (errors.capacity) {
        setErrors(prev => ({ ...prev, capacity: '' }));
      }
    }
  };

  // Return null if modal is not open
  if (!isOpen) {
    return null;
  }

  // Permission check - show permission error page if no access
  if (!hasPermission) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            {/* Permission error header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded hover:bg-gray-100"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Permission error content */}
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Insufficient Permissions
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Only team owners can manage team capacity. Your current role is <strong>{currentUserRole}</strong>.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isDisabled = isSubmitting || isLoading;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && !isDisabled && handleClose()}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Team Capacity</h2>
            <button
              onClick={handleClose}
              disabled={isDisabled}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current status information */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-700">
                <p><strong>Current capacity:</strong> {currentCapacity} {currentCapacity === 1 ? 'member' : 'members'}</p>
                <p><strong>Current members:</strong> {currentMemberCount} {currentMemberCount === 1 ? 'member' : 'members'}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Capacity input */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                New Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="capacity"
                value={capacity}
                onChange={handleCapacityChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  errors.capacity 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter team capacity (1-6)"
                disabled={isDisabled}
                maxLength={1}
                autoFocus
                autoComplete="off"
              />
              {errors.capacity && (
                <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Enter a number between {MIN_CAPACITY} and {MAX_CAPACITY}. Must be at least {currentMemberCount} (current member count).
              </p>
            </div>

            {/* Submit error display */}
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

            {/* Action buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isDisabled}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!capacity.trim() || isDisabled || parseInt(capacity) === currentCapacity}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Capacity'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageCapacityModal;