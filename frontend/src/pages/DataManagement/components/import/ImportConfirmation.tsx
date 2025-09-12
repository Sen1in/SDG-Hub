import React, { useState } from 'react';
import { ProcessFileResponse, DatabaseType, ImportResponse } from '../../types';

interface ImportConfirmationProps {
  data: ProcessFileResponse;
  database: DatabaseType;
  onConfirmImport: (database: DatabaseType, data: any[], skipDuplicates: boolean) => Promise<ImportResponse>;
  onReset: () => void;
  loading: boolean;
}

export const ImportConfirmation: React.FC<ImportConfirmationProps> = ({
  data,
  database,
  onConfirmImport,
  onReset,
  loading
}) => {
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  const handleConfirmImport = async () => {
    try {
      setImporting(true);
      let dataToImport = data.validation_results.valid_records;
      
      if (skipDuplicates && data.duplicate_results.duplicate_count > 0) {
        const duplicateIndices = new Set(data.duplicate_results.duplicates.map(d => d.index));
        dataToImport = data.validation_results.valid_records.filter((_, index) => !duplicateIndices.has(index));
      }

      const result = await onConfirmImport(database, dataToImport, skipDuplicates);
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setImporting(false);
    }
  };

  if (importResult) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-900 mb-2">Import Completed</h2>
          <p className="text-gray-600 mb-4">{importResult.message}</p>
          
          {/* Import Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">
                <span className="font-medium text-lg block">{importResult.imported_count}</span>
                <span className="text-sm">Successfully Imported</span>
              </p>
            </div>
            {importResult.skipped_count > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-yellow-800">
                  <span className="font-medium text-lg block">{importResult.skipped_count}</span>
                  <span className="text-sm">Skipped (Duplicates)</span>
                </p>
              </div>
            )}
            {importResult.failed_count > 0 && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-800">
                  <span className="font-medium text-lg block">{importResult.failed_count}</span>
                  <span className="text-sm">Failed to Import</span>
                </p>
              </div>
            )}
          </div>

          {/* Failed Records Details */}
          {importResult.failed_records && importResult.failed_records.length > 0 && (
            <div className="mb-6">
              <h3 className="text-left font-medium text-gray-800 mb-3">
                Failed Import Records ({importResult.failed_records.length} total)
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 text-left">
                {importResult.failed_records.map((failedRecord, index) => (
                  <div key={index} className="p-3 bg-red-50 border border-red-200 rounded shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">
                            "{database === 'education' ? failedRecord.record.title : failedRecord.record.actions}"
                          </span>
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-red-600">
                            Row {failedRecord.record._row_index || 'Unknown'}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                            {failedRecord.error}
                          </span>
                        </div>
                        {failedRecord.details && (
                          <p className="text-xs text-red-600 mt-1">
                            Details: {failedRecord.details}
                          </p>
                        )}
                      </div>
                      <span className="text-red-600 text-lg">❌</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-xs text-gray-600 text-left">
                <span>These records could not be imported. Please check the data and try again.</span>
              </div>
            </div>
          )}

          <button
            onClick={onReset}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Import Another File
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Import Confirmation</h2>
      
      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Ready to Import</h3>
          <p className="text-blue-800">
            {data.validation_results.valid_count} valid records will be imported to the {database} database.
          </p>
          {data.duplicate_results.duplicate_count > 0 && (
            <p className="text-blue-800 mt-1">
              {data.duplicate_results.duplicate_count} duplicate records found.
            </p>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={skipDuplicates}
            onChange={(e) => setSkipDuplicates(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span className="text-gray-700">Skip duplicate records (recommended)</span>
        </label>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleConfirmImport}
          disabled={importing || loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          {importing ? 'Importing...' : 'Confirm Import'}
        </button>
        <button
          onClick={onReset}
          disabled={importing}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Start Over
        </button>
      </div>
    </div>
  );
};