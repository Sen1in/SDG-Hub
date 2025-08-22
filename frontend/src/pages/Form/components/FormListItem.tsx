import React from 'react';
import FormActionDropdown from './FormActionDropdown';
import { FormStatus, FormType } from '../types/forms';
import type { TeamForm, UpdateFormRequest } from '../types/forms';

interface FormListItemProps {
  form: TeamForm;
  currentUserRole: 'owner' | 'edit' | 'view';
  onUpdateForm: (formId: string, updates: UpdateFormRequest) => Promise<void>;
  onDeleteForm: (formId: string) => Promise<void>;
  onToggleLock: (formId: string, isLocked: boolean) => Promise<void>;
  onDuplicateForm: (formId: string) => Promise<void>;
  onFormClick: (formId: string) => void;
  isLoading?: boolean;
  getStatusBadgeColor: (status: FormStatus) => string;
  getTypeBadgeColor: (type: FormType) => string;
}

const FormListItem: React.FC<FormListItemProps> = ({
  form,
  currentUserRole,
  onUpdateForm,
  onDeleteForm,
  onToggleLock,
  onDuplicateForm,
  onFormClick,
  isLoading = false,
  getStatusBadgeColor,
  getTypeBadgeColor
}) => {

  // Format the date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Format the form type display
  const formatFormType = (type: FormType) => {
    switch (type) {
      case FormType.ACTION:
        return 'Action';
      case FormType.EDUCATION:
        return 'Education';
      case FormType.BLANK:
        return 'Note';
      case FormType.IDA:
        return 'IDA';
      default:
        return type;
    }
  };

  // Formatting status display
  const formatFormStatus = (status: FormStatus) => {
    switch (status) {
      case FormStatus.ACTIVE:
        return 'Active';
      case FormStatus.LOCKED:
        return 'Locked';
      case FormStatus.ARCHIVED:
        return 'Archived';
      default:
        return status;
    }
  };

  const getFormTypeIcon = (type: FormType) => {
    switch (type) {
      case FormType.ACTION:
        return (
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case FormType.EDUCATION:
        return (
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case FormType.BLANK:
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case FormType.IDA:
        return (
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  // Obtain the background color of the form type
  const getFormTypeBackgroundColor = (type: FormType) => {
    switch (type) {
      case FormType.ACTION:
        return 'bg-blue-100';
      case FormType.EDUCATION:
        return 'bg-purple-100';
      case FormType.BLANK:
        return 'bg-green-100';
      case FormType.IDA:
        return 'bg-orange-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Handling form clicks
  const handleFormClick = () => {
    onFormClick(form.id);
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Form title and description */}
        <div className="col-span-5">
          <div 
            className="cursor-pointer"
            onClick={handleFormClick}
          >
            <div className="flex items-center space-x-3">
              {/* Form icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${getFormTypeBackgroundColor(form.type)}`}>
                {getFormTypeIcon(form.type)}
              </div>

              {/* Title and Description */}
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200 truncate">
                  {form.title}
                </h4>
                {form.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {form.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Type */}
        <div className="col-span-2">
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(form.type)}`}>
            {formatFormType(form.type)}
          </span>
        </div>

        {/* Status */}
        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(form.status)}`}>
              {formatFormStatus(form.status)}
            </span>
            {form.status === FormStatus.LOCKED && (
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            )}
          </div>
        </div>

        {/* Update Time */}
        <div className="col-span-2">
          <span className="text-xs text-gray-500">
            {formatDate(form.updatedAt)}
          </span>
        </div>

        {/* ActionMenu */}
        <div className="col-span-1 flex justify-end">
          <FormActionDropdown
            form={form}
            currentUserRole={currentUserRole}
            onUpdateForm={onUpdateForm}
            onDeleteForm={onDeleteForm}
            onToggleLock={onToggleLock}
            onDuplicateForm={onDuplicateForm}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default FormListItem;