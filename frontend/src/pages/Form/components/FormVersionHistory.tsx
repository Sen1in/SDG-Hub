import React, { useState, useEffect } from 'react';
import { EditHistory } from '../types/collaboration';

interface FormVersionHistoryProps {
  formId: string;
}

const FormVersionHistory: React.FC<FormVersionHistoryProps> = ({ formId }) => {
  const [history, setHistory] = useState<EditHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [formId]);

  const fetchHistory = async () => {
    try {
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'create':
        return 'text-green-600 bg-green-100';
      case 'update':
        return 'text-blue-600 bg-blue-100';
      case 'delete':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Version History</h3>
      
      {isLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : history.length === 0 ? (
        <p className="text-gray-500 text-sm">No history available</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {history.map((entry) => (
            <div key={entry.id} className="border-l-2 border-gray-200 pl-3 pb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {entry.user_name}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${getChangeTypeColor(entry.change_type)}`}>
                  {entry.change_type}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                Modified {entry.field_name}
              </p>
              <p className="text-xs text-gray-500">
                {formatTimestamp(entry.timestamp)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormVersionHistory;