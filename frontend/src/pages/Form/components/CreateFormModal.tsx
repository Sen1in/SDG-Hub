import React, { useState } from 'react';
import { FormType } from '../types/forms';
import type { CreateFormRequest } from '../types/forms';

interface CreateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (formData: CreateFormRequest) => Promise<void>;
  teamId: string;
  isLoading?: boolean;
  isPersonal?: boolean; // New prop to identify personal forms
}

const CreateFormModal: React.FC<CreateFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  teamId,
  isLoading = false,
  isPersonal = false // New prop
}) => {
  const [selectedType, setSelectedType] = useState<FormType | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Form type configuration
  const formTypes = [
    {
      type: FormType.ACTION,
      title: 'Action Form',
      description: ' Submit and track SDG-related actions, initiatives, and projects to contribute to our community action database.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: 'blue',
      features: ['Action documentation', 'Impact level assessment', 'Industry & location targeting', 'Award & recognition tracking']
    },
    {
      type: FormType.EDUCATION,
      title: 'Education Form',
      description: 'Create and submit educational content, resources, and learning materials to enrich our knowledge database.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'purple',
      features: ['Learning aims & outcomes', 'Discipline & industry mapping', 'Organization & location details', 'Educational type classification']
    },
    {
      type: FormType.IDA,
      title: 'Impact Design Analysis',
      description: 'Impact Design Analysis tool for creating comprehensive SDG action plans and impact assessments.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'orange',
      features: ['Project challenge analysis', '6-step implementation planning', 'Risk assessment & mitigation', 'Impact pathway evaluation']
    },
    {
      type: FormType.BLANK,
      title: 'Free Notes',
      description: 'Create personal notes, brainstorm ideas, and document thoughts with our flexible note-taking tool.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'green',
      features: ['Markdown support', 'Free-form editing', 'Idea brainstorming', 'Flexible note structure']
    } 
  ];

  // Get color styles
  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = 'border-2 rounded-lg transition-all duration-200 cursor-pointer';
    
    switch (color) {
      case 'blue':
        return isSelected 
          ? `${baseClasses} border-blue-500 bg-blue-50`
          : `${baseClasses} border-gray-200 hover:border-blue-300 hover:bg-blue-50`;
      case 'purple':
        return isSelected
          ? `${baseClasses} border-purple-500 bg-purple-50`
          : `${baseClasses} border-gray-200 hover:border-purple-300 hover:bg-purple-50`;
      case 'green':
        return isSelected
          ? `${baseClasses} border-green-500 bg-green-50`
          : `${baseClasses} border-gray-200 hover:border-green-300 hover:bg-green-50`;
      case 'orange':
        return isSelected
          ? `${baseClasses} border-orange-500 bg-orange-50`
          : `${baseClasses} border-gray-200 hover:border-orange-300 hover:bg-orange-50`;
      default:
        return isSelected
          ? `${baseClasses} border-gray-500 bg-gray-50`
          : `${baseClasses} border-gray-200 hover:border-gray-300 hover:bg-gray-50`;
    }
  };

  const getIconColorClass = (color: string, isSelected: boolean) => {
    switch (color) {
      case 'blue':
        return isSelected ? 'text-blue-600' : 'text-gray-400';
      case 'purple':
        return isSelected ? 'text-purple-600' : 'text-gray-400';
      case 'green':
        return isSelected ? 'text-green-600' : 'text-gray-400';
      case 'orange':
        return isSelected ? 'text-orange-600' : 'text-gray-400';
      default:
        return isSelected ? 'text-gray-600' : 'text-gray-400';
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedType) {
      newErrors.type = 'Please select a form type';
    }

    if (!formTitle.trim()) {
      newErrors.title = 'Form title is required';
    } else if (formTitle.trim().length < 3) {
      newErrors.title = 'Form title must be at least 3 characters';
    } else if (formTitle.trim().length > 100) {
      newErrors.title = 'Form title must be less than 100 characters';
    }

    if (formDescription.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
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

    setErrors({});
    
    try {
      const formData: CreateFormRequest = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        type: selectedType!,
        teamId: isPersonal ? undefined : teamId,
        settings: {
          allowAnonymous: false,
          allowMultipleSubmissions: false,
          requireLogin: true,
          isPublic: false
        }
      };
      
      await onSuccess(formData);
      handleClose();
    } catch (error) {
      let errorMessage = 'Failed to create form. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    if (isLoading) return;
    
    setSelectedType(null);
    setFormTitle('');
    setFormDescription('');
    setErrors({});
    onClose();
  };

  // Handle ESC key to close
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isLoading) {
      handleClose();
    }
  };

  // Return null if modal is not open
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isPersonal ? 'Create Personal Form' : 'Create New Form'}
            </h2>
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

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Form type selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Choose Form Type <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formTypes.map((formType) => (
                  <div
                    key={formType.type}
                    className={getColorClasses(formType.color, selectedType === formType.type)}
                    onClick={() => {
                      setSelectedType(formType.type);
                      if (errors.type) {
                        setErrors(prev => ({ ...prev, type: '' }));
                      }
                    }}
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`${getIconColorClass(formType.color, selectedType === formType.type)} mr-3`}>
                          {formType.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formType.title}
                        </h3>
                        {selectedType === formType.type && (
                          <svg className="w-5 h-5 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">
                        {formType.description}
                      </p>
                      
                      <div className="space-y-1">
                        {formType.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-500">
                            <svg className="w-3 h-3 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {errors.type && (
                <p className="mt-2 text-sm text-red-600">{errors.type}</p>
              )}
            </div>

            {/* Form title */}
            <div>
              <label htmlFor="formTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Form Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="formTitle"
                value={formTitle}
                onChange={(e) => {
                  setFormTitle(e.target.value);
                  if (errors.title) {
                    setErrors(prev => ({ ...prev, title: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
                  errors.title 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Enter a descriptive title for your form"
                disabled={isLoading}
                maxLength={100}
                autoComplete="off"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formTitle.length}/100 characters
              </p>
            </div>

            {/* Form description */}
            <div>
              <label htmlFor="formDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="formDescription"
                value={formDescription}
                onChange={(e) => {
                  setFormDescription(e.target.value);
                  if (errors.description) {
                    setErrors(prev => ({ ...prev, description: '' }));
                  }
                }}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 resize-none ${
                  errors.description 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
                placeholder="Provide additional details about your form (optional)"
                disabled={isLoading}
                maxLength={500}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formDescription.length}/500 characters
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
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedType || !formTitle.trim() || isLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Form...
                  </>
                ) : (
                  'Create Form'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateFormModal;