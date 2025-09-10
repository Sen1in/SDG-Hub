import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseSelector } from './components/import/DatabaseSelector';
import { FileUploader } from './components/import/FileUploader';
import { ProcessingResults } from './components/import/ProcessingResults';
import { ImportConfirmation } from './components/import/ImportConfirmation';
import { DataTable } from './components/manage/DataTable';
import { SearchFilters } from './components/manage/SearchFilters';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { useDataManagement } from './hooks/useDataManagement';
import { useFileUpload } from './hooks/useFileUpload';
import { DatabaseType } from './types';
import { useNavigate } from 'react-router-dom';

const DataManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'import' | 'manage'>('import');
  const [selectedDatabase, setSelectedDatabase] = useState<DatabaseType | null>(null);
  const navigate = useNavigate();
  
  const {
    data,
    loading,
    error,
    searchFilters,
    loadData,
    deleteRecords,
    updateSearchFilters,
    clearError
  } = useDataManagement();

  const {
    uploadFile,
    processedData,
    uploadLoading,
    uploadError,
    resetUpload,
    confirmImport,
    importLoading
  } = useFileUpload();

  // Redirect if not admin
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/';
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={clearError} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              
              {/* Page Title */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Management</h1>
                <p className="text-gray-600 mt-1">Import and manage database resources</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-600 font-medium">Admin Access</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('import');
                setSelectedDatabase(null);
                resetUpload();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'import'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Data Import
            </button>
            <button
              onClick={() => {
                setActiveTab('manage');
                setSelectedDatabase(null);
                resetUpload();
              }}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manage'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Data
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'import' ? (
          <div className="space-y-6">
            {/* Step 1: Database Selection */}
            <DatabaseSelector
              selectedDatabase={selectedDatabase}
              onDatabaseSelect={setSelectedDatabase}
            />

            {/* Step 2: File Upload */}
            {selectedDatabase && (
              <FileUploader
                selectedDatabase={selectedDatabase}
                onFileUpload={uploadFile}
                loading={uploadLoading}
                error={uploadError}
              />
            )}

            {/* Step 3: Processing Results */}
            {processedData && (
              <ProcessingResults
                data={processedData}
                database={selectedDatabase!}
              />
            )}

            {/* Step 4: Import Confirmation */}
            {processedData && (
              <ImportConfirmation
                data={processedData}
                database={selectedDatabase!}
                onConfirmImport={confirmImport}
                onReset={resetUpload}
                loading={importLoading}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Database Selection for Management */}
            <DatabaseSelector
              selectedDatabase={selectedDatabase}
              onDatabaseSelect={(db) => {
                setSelectedDatabase(db);
                if (db) {
                  loadData(db);
                }
              }}
              mode="manage"
            />

            {/* Search and Filters */}
            {selectedDatabase && data && (
              <SearchFilters
                database={selectedDatabase}
                filters={searchFilters}
                onUpdateFilters={updateSearchFilters}
                onSearch={() => loadData(selectedDatabase)}
              />
            )}

            {/* Data Table */}
            {selectedDatabase && (
              <>
                {loading ? (
                  <LoadingSpinner text="Loading records..." />
                ) : data ? (
                  <DataTable
                    database={selectedDatabase}
                    data={data}
                    onDeleteRecords={deleteRecords}
                    onRefresh={() => loadData(selectedDatabase)}
                  />
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataManagement;