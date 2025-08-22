import React from 'react';
import { User } from '../../types';

interface AccountInfoProps {
  user: User;
}

export const AccountInfo: React.FC<AccountInfoProps> = ({ user }) => {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">User ID:</span>
          <span className="ml-2 text-gray-600">{user.id}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">Account Status:</span>
          <span className="ml-2 text-green-600 font-medium">Active</span>
        </div>
      </div>
    </div>
  );
};
