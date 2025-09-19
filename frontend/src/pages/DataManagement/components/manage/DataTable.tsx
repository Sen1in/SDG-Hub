import React, { useState } from 'react';
import { DatabaseType, PaginatedResponse, DatabaseRecord } from '../../types';

interface DataTableProps {
  database: DatabaseType;
  data: PaginatedResponse<DatabaseRecord>;
  onDeleteRecords: (database: DatabaseType, ids: number[]) => Promise<any>;
  onRefresh: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  database,
  data,
  onDeleteRecords,
  onRefresh
}) => {
  const [selectedRecords, setSelectedRecords] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleRecordSelection = (id: number) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecords(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRecords.size === data.results.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(data.results.map(r => r.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedRecords.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedRecords.size} record(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const ids = Array.from(selectedRecords);
      await onDeleteRecords(database, ids);
      setSelectedRecords(new Set());
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete records. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTitleField = (record: DatabaseRecord) => {
    return record.title || record.actions || 'N/A';
  };

  const getDescriptionField = (record: DatabaseRecord) => {
    const description = record.description || record.action_detail || '';
    return description.length > 100 ? description.substring(0, 100) + '...' : description;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Table Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {database === 'education' ? 'Education' : 'Actions'} Records
          </h2>
          <p className="text-sm text-gray-600">{data.count} total records</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedRecords.size > 0 && (
            <span className="text-sm text-gray-600">
              {selectedRecords.size} selected
            </span>
          )}
          <button
            onClick={handleDeleteSelected}
            disabled={selectedRecords.size === 0 || isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isDeleting ? 'Deleting...' : `Delete Selected${selectedRecords.size > 0 ? ` (${selectedRecords.size})` : ''}`}
          </button>
          <button
            onClick={onRefresh}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRecords.size === data.results.length && data.results.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {database === 'education' ? 'Year' : 'Level'}
              </th>
              {database === 'education' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.results.length === 0 ? (
              <tr>
                <td colSpan={database === 'education' ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                  No records found
                </td>
              </tr>
            ) : (
              data.results.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedRecords.has(record.id)}
                      onChange={() => toggleRecordSelection(record.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.id}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {getTitleField(record)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {getDescriptionField(record)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {database === 'education' ? (record.year || 'N/A') : (record.level_label || record.level || 'N/A')}
                  </td>
                  {database === 'education' && (
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {record.organization || 'N/A'}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.num_pages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((data.current_page - 1) * 20) + 1} to {Math.min(data.current_page * 20, data.count)} of {data.count} results
            </div>
            <div className="flex space-x-2">
              <button
                disabled={!data.has_previous}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {data.current_page} of {data.num_pages}
              </span>
              <button
                disabled={!data.has_next}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
