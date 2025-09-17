import React from 'react';
import { FormFieldConfig } from '../types/collaboration';

interface ReadOnlyCollaborativeFieldProps {
  config: FormFieldConfig;
  value: any;
}

const ReadOnlyCollaborativeField: React.FC<ReadOnlyCollaborativeFieldProps> = ({ config, value }) => {
  
  const formatValue = (val: any): string => {
    if (val === null || val === undefined || val === '') {
      return 'Not specified';
    }
    
    if (config.type === 'boolean') {
      return val ? 'Yes' : 'No';
    }
    
    if (config.type === 'multiselect' && Array.isArray(val)) {
      if (val.length === 0) return 'None selected';
      
      // For SDGs, show the labels
      if (config.name === 'selected_sdgs') {
        return val.map(sdgNum => `SDG ${sdgNum}`).join(', ');
      }
      
      // For other multiselect, try to find labels from options
      if (config.options) {
        const labels = val.map(v => {
          const option = config.options?.find(opt => opt.value === v);
          return option ? option.label : v;
        });
        return labels.join(', ');
      }
      
      return val.join(', ');
    }
    
    if (config.type === 'select' && config.options) {
      const option = config.options.find(opt => opt.value === val.toString());
      return option ? option.label : val.toString();
    }
    
    return val.toString();
  };

  const displayValue = formatValue(value);

  if (config.type === 'boolean') {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {config.label}
          {config.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
            value ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'
          }`}>
            {value && (
              <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-700">{displayValue}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className={`
        w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg 
        ${config.type === 'textarea' ? 'min-h-[80px]' : 'min-h-[40px]'}
        ${displayValue === 'Not specified' ? 'italic text-gray-400' : 'text-gray-700'}
      `}>
        {config.type === 'textarea' ? (
          <div className="whitespace-pre-wrap">{displayValue}</div>
        ) : (
          <div className="truncate" title={displayValue}>{displayValue}</div>
        )}
      </div>
      
      {/* Word/Character count for read-only */}
      {(config.maxLength || config.maxWords) && value && value !== '' && (
        <div className="text-xs text-gray-500">
          {config.maxWords && (
            <span>
              {value.toString().trim().split(/\s+/).filter((word: string) => word.length > 0).length}/{config.maxWords} words
            </span>
          )}
          {config.maxLength && !config.maxWords && (
            <span>
              {value.toString().length}/{config.maxLength} characters
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReadOnlyCollaborativeField;