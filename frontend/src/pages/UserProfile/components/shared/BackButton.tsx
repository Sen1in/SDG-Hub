import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// add props interface to allow passing onClick
interface BackButtonProps {
  onClick?: () => void;
  disabled?: boolean; // add：allow disabling the button
  disabledMessage?: string; // add：message to show when disabled
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  disabled = false, 
  disabledMessage = "Please complete the required fields and save your personal information." 
}) => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (disabled) {
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="fixed top-6 left-6 z-10">
      <div className="relative inline-block">
        <button
          onClick={handleClick}
          disabled={disabled}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg transition-all duration-200 group ${
            disabled 
              ? 'bg-gray-300/90 text-gray-500 cursor-not-allowed backdrop-blur-sm' 
              : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:shadow-xl hover:bg-white'
          }`}
          title={disabled ? disabledMessage : ""}
        >
          <svg 
            className={`w-5 h-5 transition-transform ${
              disabled ? '' : 'group-hover:-translate-x-1'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">
            {'Back'}
          </span>
          {disabled && (
            <svg className="w-4 h-4 ml-1 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {showTooltip && disabled && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 text-sm font-medium text-white bg-orange-600 rounded-lg shadow-lg whitespace-nowrap z-50 max-w-xs">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {disabledMessage}
            </div>
            {/* 🔥 Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-orange-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};
