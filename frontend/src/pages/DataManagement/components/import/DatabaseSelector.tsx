import React from 'react';
import { DatabaseType } from '../../types';

interface DatabaseSelectorProps {
  selectedDatabase: DatabaseType | null;
  onDatabaseSelect: (database: DatabaseType) => void;
  mode?: 'import' | 'manage';
}

export const DatabaseSelector: React.FC<DatabaseSelectorProps> = ({
  selectedDatabase,
  onDatabaseSelect,
  mode = 'import'
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {mode === 'import' ? 'Select Target Database' : 'Select Database to Manage'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onDatabaseSelect('education')}
          className={`p-4 border-2 rounded-lg transition-colors duration-200 text-left ${
            selectedDatabase === 'education'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📚</div>
            <div>
              <h3 className="font-medium text-gray-900">Education Database</h3>
              <p className="text-sm text-gray-500">
                {mode === 'import' ? 'Import educational resources' : 'Manage educational resources'}
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => onDatabaseSelect('actions')}
          className={`p-4 border-2 rounded-lg transition-colors duration-200 text-left ${
            selectedDatabase === 'actions'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h3 className="font-medium text-gray-900">Actions Database</h3>
              <p className="text-sm text-gray-500">
                {mode === 'import' ? 'Import SDG actions' : 'Manage SDG actions'}
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
