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
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <p className="text-green-800">
              <span className="font-medium">Imported:</span> {importResult.imported_count} records
            </p>
            {importResult.skipped_count > 0 && (
              <p className="text-green-800">
                <span className="font-medium">Skipped:</span> {importResult.skipped_count} duplicates
              </p>
            )}
          </div>
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
