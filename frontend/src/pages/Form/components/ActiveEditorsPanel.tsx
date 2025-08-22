import React from 'react';
import { ActiveEditor } from '../types/collaboration';

interface ActiveEditorsPanelProps {
  activeEditors: ActiveEditor[];
}

const ActiveEditorsPanel: React.FC<ActiveEditorsPanelProps> = ({ activeEditors }) => {
  const formatLastActivity = (timestamp: string) => {
    const now = new Date();
    const activity = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - activity.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Active Editors ({activeEditors.length})
      </h3>
      
      {activeEditors.length === 0 ? (
        <p className="text-gray-500 text-sm">No one is currently editing</p>
      ) : (
        <div className="space-y-3">
          {activeEditors.map((editor) => (
            <div key={editor.user_id} className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {editor.user_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {editor.user_name}
                </p>
                <p className="text-xs text-gray-500">
                  {editor.field_name ? `Editing ${editor.field_name}` : 'Active'}
                </p>
              </div>
              <div className="text-xs text-gray-400">
                {formatLastActivity(editor.last_activity)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveEditorsPanel;
