import React from 'react';

interface FormActionsProps {
  onForgotPassword: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({ onForgotPassword }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
          Remember me
        </label>
      </div>
      <button
        type="button"
        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
        onClick={onForgotPassword}
      >
        Forgot password?
      </button>
    </div>
  );
};
