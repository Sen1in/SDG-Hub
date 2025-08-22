import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTeamForms, useCreateForm, useFormManagement } from './hooks/useTeamForms';
import FormListItem from './components/FormListItem';
import CreateFormModal from './components/CreateFormModal';
import FormStatsCard from './components/FormStatsCard';
import { FormType, FormStatus } from './types/forms';
import type { CreateFormRequest, UpdateFormRequest } from './types/forms';

// PaginationProps
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onGoToPage: (page: number) => void;
  onGoToNext: () => void;
  onGoToPrevious: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  hasNext,
  hasPrevious,
  onGoToPage,
  onGoToNext,
  onGoToPrevious,
}) => {
  // getPageNumbers
  const getPageNumbers = () => {
    const delta = 2; 
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, array) => 
      index === 0 || page !== array[index - 1]
    );
  };

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      {/* Mobile application pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={onGoToPrevious}
          disabled={!hasPrevious}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={onGoToNext}
          disabled={!hasNext}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Desktop page navigation */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            {/* Previous page button */}
            <button
              onClick={onGoToPrevious}
              disabled={!hasPrevious}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* page button */}
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => onGoToPage(page as number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}

            {/* Next page button */}
            <button
              onClick={onGoToNext}
              disabled={!hasNext}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const TeamForms: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use form management hooks
  const {
    forms,
    stats,
    team,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasNext,
    hasPrevious,
    searchQuery,
    statusFilter,
    typeFilter,
    refetch,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    applyFilters,
  } = useTeamForms(teamId);
  
  const {
    createForm,
    isLoading: isCreating
  } = useCreateForm();
  
  const {
    updateForm,
    deleteForm,
    toggleFormLock,
    duplicateForm,
    isLoading: isOperating
  } = useFormManagement();

  // Local status (temporary search and filtering input)
  const [tempSearchQuery, setTempSearchQuery] = useState<string>('');
  const [tempStatusFilter, setTempStatusFilter] = useState<FormStatus | 'all'>('all');
  const [tempTypeFilter, setTempTypeFilter] = useState<FormType | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Initialize the temporary state
  React.useEffect(() => {
    setTempSearchQuery(searchQuery);
    setTempStatusFilter(statusFilter as FormStatus | 'all');
    setTempTypeFilter(typeFilter as FormType | 'all');
  }, [searchQuery, statusFilter, typeFilter]);

  // Apply search and filtering
  const handleApplyFilters = useCallback(() => {
    applyFilters(tempSearchQuery, tempStatusFilter, tempTypeFilter);
  }, [tempSearchQuery, tempStatusFilter, tempTypeFilter, applyFilters]);

 
  // const debouncedApplyFilters = useCallback(
  //   debounce(() => handleApplyFilters(), 500),
  //   [handleApplyFilters]
  // );

  // React.useEffect(() => {
  //   debouncedApplyFilters();
  // }, [tempSearchQuery, tempStatusFilter, tempTypeFilter, debouncedApplyFilters]);

  // Event handling function
  const handleGoBack = () => {
    navigate(`/team/${teamId}`);
  };

  const handleCreateForm = () => {
    setShowCreateModal(true);
  };

  const handleCreateFormSuccess = async (formData: CreateFormRequest): Promise<void> => {
    if (!teamId) {
      throw new Error('Team ID is required');
    }
    
    try {
      await createForm({ ...formData, teamId });
      await refetch();
      setShowCreateModal(false);
    } catch (error) {
      throw error; 
    }
  };

  const handleUpdateForm = async (formId: string, updates: UpdateFormRequest): Promise<void> => {
    try {
      await updateForm(formId, updates);
      await refetch();
    } catch (error) {
      console.error('Failed to update form:', error);
      throw error;
    }
  };

  const handleDeleteForm = async (formId: string): Promise<void> => {
    try {
      await deleteForm(formId);
      await refetch();
    } catch (error) {
      console.error('Failed to delete form:', error);
      throw error;
    }
  };

  const handleToggleLock = async (formId: string, isLocked: boolean): Promise<void> => {
    try {
      await toggleFormLock(formId, isLocked);
      await refetch();
    } catch (error) {
      console.error('Failed to toggle form lock:', error);
      throw error;
    }
  };

  const handleDuplicateForm = async (formId: string): Promise<void> => {
    try {
      await duplicateForm(formId);
      await refetch(); // Refresh the list to display the newly copied forms
    } catch (error) {
      console.error('Failed to duplicate form:', error);
      throw error;
    }
  };

  const handleFormClick = (formId: string) => {
    // Navigate to the form details or editing page
    navigate(`/team/${teamId}/forms/${formId}`);
  };

  // Obtain the style of the status label
  const getStatusBadgeColor = (status: FormStatus) => {
    switch (status) {
      case FormStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case FormStatus.LOCKED:
        return 'bg-red-100 text-red-800';
      case FormStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: FormType) => {
    switch (type) {
      case FormType.ACTION:
        return 'bg-blue-100 text-blue-800';
      case FormType.EDUCATION:
        return 'bg-purple-100 text-purple-800';
      case FormType.BLANK:
        return 'bg-green-100 text-green-800';
      case FormType.IDA:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Load
  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading team forms...</p>
        </div>
      </div>
    );
  }

  // Error status
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Forms</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {team?.name} Forms
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your team's forms and surveys ({totalCount} total forms)
              </p>
            </div>
          </div>

          {/* Create Form Button - Visible only to owner and editor */}
          {(team?.role === 'owner' || team?.role === 'edit') && (
            <button
              onClick={handleCreateForm}
              disabled={isCreating}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              {isCreating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              <span>{isCreating ? 'Creating...' : 'Create Form'}</span>
            </button>
          )}
        </div>

        {/* Statistical card */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <FormStatsCard
              title="Total Forms"
              value={stats.totalForms}
              icon="document"
              color="blue"
            />
            <FormStatsCard
              title="Active Forms"
              value={stats.activeForms}
              icon="check-circle"
              color="green"
            />
            <FormStatsCard
              title="Locked Forms"
              value={stats.lockedForms}
              icon="lock"
              color="red"
            />
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search forms..."
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={tempStatusFilter}
                onChange={(e) => setTempStatusFilter(e.target.value as FormStatus | 'all')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value={FormStatus.ACTIVE}>Active</option>
                <option value={FormStatus.LOCKED}>Locked</option>
                <option value={FormStatus.ARCHIVED}>Archived</option>
              </select>
            </div>

            {/* Type filtering */}
            <div className="sm:w-48">
              <select
                value={tempTypeFilter}
                onChange={(e) => setTempTypeFilter(e.target.value as FormType | 'all')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value={FormType.ACTION}>Action Forms</option>
                <option value={FormType.EDUCATION}>Education Forms</option>
                <option value={FormType.BLANK}>Free Notes</option>
                <option value={FormType.IDA}>IDA Analyses</option>
              </select>
            </div>

            {/* Apply the filter button */}
            <div className="sm:w-32">
              <button
                onClick={handleApplyFilters}
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                {isLoading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>
        </div>

        {/* List of forms */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {forms.length > 0 ? (
            <>
              {/* Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5">
                    <h3 className="text-sm font-medium text-gray-900">Form Title</h3>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-900">Type</h3>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-900">Status</h3>
                  </div>
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-gray-900">Updated</h3>
                  </div>
                  <div className="col-span-1">
                    <h3 className="text-sm font-medium text-gray-900"></h3>
                  </div>
                </div>
              </div>

              {/* Form list item */}
              <div className="divide-y divide-gray-200">
                {forms.map((form) => (
                  <FormListItem
                    key={form.id}
                    form={form}
                    currentUserRole={team?.role || 'view'}
                    onUpdateForm={handleUpdateForm}
                    onDeleteForm={handleDeleteForm}
                    onToggleLock={handleToggleLock}
                    onDuplicateForm={handleDuplicateForm}
                    onFormClick={handleFormClick}
                    isLoading={isOperating}
                    getStatusBadgeColor={getStatusBadgeColor}
                    getTypeBadgeColor={getTypeBadgeColor}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                onGoToPage={goToPage}
                onGoToNext={goToNextPage}
                onGoToPrevious={goToPreviousPage}
              />
            </>
          ) : (
            /* Empty state */
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No forms found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by creating your first form.'
                }
              </p>
              {(team?.role === 'owner' || team?.role === 'edit') && 
               !searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                <div className="mt-6">
                  <button
                    onClick={handleCreateForm}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Create your first form
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create a form modal box */}
        <CreateFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateFormSuccess}
          teamId={teamId || ''}
          isLoading={isCreating}
        />
      </div>
    </div>
  );
};

export default TeamForms;