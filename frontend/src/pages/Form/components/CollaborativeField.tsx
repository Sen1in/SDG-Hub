import React, { useState, useRef, useEffect } from 'react';
import { FormFieldConfig, ActiveEditor } from '../types/collaboration';

interface CollaborativeFieldProps {
  config: FormFieldConfig;
  value: any;
  onChange: (value: any) => void;
  onFocus: () => void;
  onBlur: () => void;
  onCursorChange: (position: number, selectionStart?: number, selectionEnd?: number) => void;
  activeEditors: ActiveEditor[];
  isReadOnly: boolean;
}

const CollaborativeField: React.FC<CollaborativeFieldProps> = ({
  config,
  value,
  onChange,
  onFocus,
  onBlur,
  onCursorChange,
  activeEditors,
  isReadOnly
}) => {
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (config.type === 'select' && value !== undefined && value !== null) {
      setLocalValue(value.toString());
    } else if (config.type === 'multiselect') {
      setLocalValue(Array.isArray(value) ? value : []);
    } else {
      setLocalValue(value);
    }
  }, [value, config.type]);

  // A tool function for calculating word count
  const countWords = (text: string): number => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Get the current word count
  const getCurrentWordCount = (): number => {
    if (config.maxWords && typeof localValue === 'string') {
      return countWords(localValue);
    }
    return 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let newValue;
    
    if (config.type === 'boolean') {
      newValue = (e.target as any).checked;
    } else if (config.type === 'multiselect') {
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions);
      newValue = selectedOptions.map(option => option.value);
    } else if (config.type === 'select') {
      const stringValue = e.target.value;
      
      if (config.name === 'level' || config.name === 'individual_organization') {
        newValue = stringValue ? parseInt(stringValue, 10) : null;
      } else if (config.name === 'digital_actions' || config.name === 'award') {
        newValue = stringValue;
      } else {
        newValue = stringValue;
      }
    } else {
      newValue = e.target.value;

      if (config.maxWords && typeof newValue === 'string') {
        const wordCount = countWords(newValue);
        if (wordCount > config.maxWords) {
          const words = newValue.trim().split(/\s+/);
          newValue = words.slice(0, config.maxWords).join(' ');
        }
      }
    }
    
    setLocalValue(config.type === 'select' ? e.target.value : newValue);
    onChange(newValue);
  };

  const handleMultiSelectChange = (selectedValue: string) => {
    if (isReadOnly) {
      return;
    }
    const currentValues = Array.isArray(localValue) ? localValue : [];
    let newValues;
    
    if (currentValues.includes(selectedValue)) {
      newValues = currentValues.filter(v => v !== selectedValue);
    } else {
      newValues = [...currentValues, selectedValue];
    }
    
    setLocalValue(newValues);
    onChange(newValues);
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur();
  };

  const handleSelectionChange = () => {
    if (inputRef.current && config.type !== 'select' && config.type !== 'multiselect') {
      const element = inputRef.current as HTMLInputElement | HTMLTextAreaElement;
      onCursorChange(
        element.selectionStart || 0,
        element.selectionStart || undefined,
        element.selectionEnd || undefined
      );
    }
  };

  const getEditorIndicator = () => {
    if (activeEditors.length === 0) return null;

    return (
      <div className="absolute top-2 right-2 flex -space-x-1">
        {activeEditors.slice(0, 3).map((editor) => (
          <div
            key={editor.user_id}
            className="w-6 h-6 rounded-full border-2 border-white bg-blue-500 flex items-center justify-center text-xs font-medium text-white"
            title={`${editor.user_name} is editing`}
          >
            {editor.user_name.charAt(0).toUpperCase()}
          </div>
        ))}
        {activeEditors.length > 3 && (
          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-500 flex items-center justify-center text-xs font-medium text-white">
            +{activeEditors.length - 3}
          </div>
        )}
      </div>
    );
  };

  const renderField = () => {
    const baseClasses = `
      w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
      ${isFocused || activeEditors.length > 0 
        ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' 
        : 'border-gray-300'
      }
      ${isReadOnly 
        ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
        : 'bg-white text-gray-900'
      }
      ${activeEditors.length > 0 && !isReadOnly ? 'ring-2 ring-blue-200' : ''}
    `;

    switch (config.type) {
      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localValue || ''}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelect={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            onClick={handleSelectionChange}
            className={baseClasses}
            placeholder={config.placeholder}
            maxLength={config.maxLength}
            rows={config.rows || 3}
            disabled={isReadOnly}
          />
        );
      
      case 'number':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={localValue || ''}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelect={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            onClick={handleSelectionChange}
            className={baseClasses}
            placeholder={config.placeholder}
            disabled={isReadOnly}
          />
        );
      
      case 'boolean':
        return (
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={localValue || false}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isReadOnly}
            />
            <span className="text-sm text-gray-700">{config.label}</span>
          </label>
        );

      case 'select':
        // Handling the conversion of display values
        let displayValue = localValue || '';
        if (config.name === 'digital_actions' || config.name === 'award') {
          displayValue = localValue || '';
        } else if (config.name === 'level' || config.name === 'individual_organization') {
          displayValue = localValue !== null && localValue !== undefined ? localValue.toString() : '';
        } else if (typeof localValue === 'number') {
          displayValue = localValue.toString();
        } else {
          displayValue = localValue || '';
        }
        
        return (
          <select
            ref={inputRef as React.RefObject<HTMLSelectElement>}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={baseClasses}
            disabled={isReadOnly}
          >
            <option value="">Select {config.label}</option>
            {config.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(localValue) ? localValue : [];
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
              {config.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => handleMultiSelectChange(option.value)}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isReadOnly}
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {selectedValues.length > 0 && (
              <div className="text-sm text-gray-600">
                Selected: {selectedValues.join(', ')}
              </div>
            )}
          </div>
        );
      
      case 'url':
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="url"
            value={localValue || ''}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelect={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            onClick={handleSelectionChange}
            className={baseClasses}
            placeholder={config.placeholder || 'https://example.com'}
            disabled={isReadOnly}
          />
        );
      
      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={localValue || ''}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelect={handleSelectionChange}
            onKeyUp={handleSelectionChange}
            onClick={handleSelectionChange}
            className={baseClasses}
            placeholder={config.placeholder}
            maxLength={config.maxLength}
            disabled={isReadOnly}
          />
        );
    }
  };

  if (config.type === 'boolean') {
    return (
      <div className="relative">
        {renderField()}
        {getEditorIndicator()}
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {config.label}
        {config.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {getEditorIndicator()}
      
      {/* Word/Character count */}
      {(config.maxLength || config.maxWords) && config.type !== 'select' && config.type !== 'multiselect' && (
        <div className="mt-1 flex justify-between text-xs text-gray-500">
          {config.maxWords && (
            <span className={getCurrentWordCount() > config.maxWords ? 'text-red-500' : ''}>
              {getCurrentWordCount()}/{config.maxWords} words
            </span>
          )}
          {config.maxLength && !config.maxWords && (
            <span className="ml-auto">
              {(localValue || '').toString().length}/{config.maxLength} characters
            </span>
          )}
        </div>
      )}
      
      {/* Editor's Note */}
      {activeEditors.length > 0 && (
        <div className="mt-1 text-xs text-blue-600">
          {activeEditors.length === 1 
            ? `${activeEditors[0].user_name} is editing` 
            : `${activeEditors.length} people are editing`
          }
        </div>
      )}
    </div>
  );
};

export default CollaborativeField;