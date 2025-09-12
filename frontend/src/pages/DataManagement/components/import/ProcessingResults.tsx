import React from 'react';
import { ProcessFileResponse, DatabaseType } from '../../types';

interface ProcessingResultsProps {
  data: ProcessFileResponse;
  database: DatabaseType;
}

export const ProcessingResults: React.FC<ProcessingResultsProps> = ({ data, database }) => {
  // Calculate which records will be imported (valid records that aren't duplicates)
  const getRecordsToImport = () => {
    if (!data.validation_results.valid_records.length) return [];
    
    const duplicateIndices = new Set(data.duplicate_results.duplicates.map(d => d.index));
    return data.validation_results.valid_records.filter((_, index) => !duplicateIndices.has(index));
  };

  const recordsToImport = getRecordsToImport();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Processing Results</h2>
      
      {/* Validation Summary */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-800 mb-3">Validation Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="font-medium text-green-800">Valid Records</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{data.validation_results.valid_count}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">📥</span>
              <span className="font-medium text-blue-800">To Import</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{recordsToImport.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⚠</span>
              <span className="font-medium text-yellow-800">Duplicates</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{data.duplicate_results.duplicate_count}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">✗</span>
              <span className="font-medium text-red-800">Invalid Records</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{data.validation_results.invalid_count}</p>
          </div>
        </div>
      </div>

      {/* Column Mapping */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-800 mb-3">Column Mapping</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Excel Column
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Maps To
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.values(data.column_mapping).map((mapping, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-2 border-b text-sm">{mapping.excel_column}</td>
                  <td className="px-4 py-2 border-b text-sm">
                    {mapping.mapped_field || 'Not Mapped'}
                  </td>
                  <td className={`px-4 py-2 border-b text-sm ${
                    mapping.status === 'required' ? 'text-green-600' :
                    mapping.status === 'optional' ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {mapping.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Records to Import */}
      {recordsToImport.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-3">
            Records Ready to Import ({recordsToImport.length} total)
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
            {recordsToImport.map((record, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">
                        "{database === 'education' ? record.title : record.actions}"
                      </span>
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-blue-600">
                        Row {record._row_index || 'Unknown'}
                      </span>
                      {database === 'education' && record.organization && (
                        <span className="text-xs text-blue-600">
                          {record.organization}
                        </span>
                      )}
                      {database === 'actions' && record.level && (
                        <span className="text-xs text-blue-600">
                          Level {record.level}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-blue-600 text-lg">📥</span>
                </div>
              </div>
            ))}
            {recordsToImport.length === 0 && (
              <p className="text-center text-gray-500 py-4">No records to import</p>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
            <span>Scroll to view all records ready to import</span>
            <span>{recordsToImport.length} records shown</span>
          </div>
        </div>
      )}

      {/* Duplicates */}
      {data.duplicate_results.duplicate_count > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-3">
            Duplicate Records Found ({data.duplicate_results.duplicate_count} total)
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
            {data.duplicate_results.duplicates.map((duplicate, index) => (
              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">"{duplicate.duplicate_title}"</span>
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-yellow-600">
                        Row {duplicate.record._row_index || 'Unknown'}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        duplicate.type === 'existing' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {duplicate.type === 'existing' ? 'Exists in Database' : 'Duplicate in File'}
                      </span>
                    </div>
                  </div>
                  <span className="text-yellow-600 text-lg">⚠</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-600 flex items-center justify-between">
            <span>Scroll to view all duplicate records</span>
            <span>{data.duplicate_results.duplicates.length} records shown</span>
          </div>
        </div>
      )}

      {/* Invalid Records */}
      {data.validation_results.invalid_count > 0 && (
        <div>
          <h3 className="font-medium text-gray-800 mb-3">
            Invalid Records ({data.validation_results.invalid_count} total)
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
            {data.validation_results.invalid_records.slice(0, 5).map((invalid, index) => (
              <div key={index} className="p-3 bg-red-50 border border-red-200 rounded shadow-sm">
                <p className="text-sm text-red-800">
                  <span className="font-medium">Row {invalid.row_index}:</span>
                  <span className="ml-2">{invalid.errors.join(', ')}</span>
                </p>
              </div>
            ))}
            {data.validation_results.invalid_records.length > 5 && (
              <p className="text-sm text-gray-600">
                ... and {data.validation_results.invalid_records.length - 5} more invalid records
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};