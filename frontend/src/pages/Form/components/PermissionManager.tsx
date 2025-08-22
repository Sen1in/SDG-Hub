import React, { useState, useEffect } from 'react';
import { FormFieldConfig, FieldPermission } from '../types/collaboration';

interface PermissionManagerProps {
  formId: string;
  fieldConfigs: FormFieldConfig[];
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ formId, fieldConfigs }) => {
  const [permissions, setPermissions] = useState<FieldPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<'read' | 'edit' | 'admin'>('edit');

  useEffect(() => {
    // Obtain the current permission settings
    fetchPermissions();
  }, [formId]);

  const fetchPermissions = async () => {
    setIsLoading(false);
  };

  const handleAssignPermission = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/forms/${formId}/assign-permission/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          field_name: selectedField,
          permission: selectedPermission,
        }),
      });

      if (response.ok) {
        await fetchPermissions();
        setShowAssignModal(false);
        setUserEmail('');
        setSelectedField('');
      }
    } catch (error) {
      console.error('Failed to assign permission:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Field Permissions</h3>
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors duration-200"
        >
          Assign
        </button>
      </div>

      <div className="space-y-2">
        {fieldConfigs.map((field) => (
          <div key={field.name} className="flex items-center justify-between p-2 border border-gray-100 rounded">
            <span className="text-sm font-medium text-gray-700">{field.label}</span>
            <span className="text-xs text-gray-500">
              Default access
            </span>
          </div>
        ))}
      </div>

      {/* Permission Allocation Modal Box */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h4 className="text-lg font-semibold mb-4">Assign Field Permission</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field
                </label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a field</option>
                  {fieldConfigs.map((field) => (
                    <option key={field.name} value={field.name}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Level
                </label>
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value as 'read' | 'edit' | 'admin')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="read">Read Only</option>
                  <option value="edit">Edit</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPermission}
                disabled={!userEmail || !selectedField}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManager;
