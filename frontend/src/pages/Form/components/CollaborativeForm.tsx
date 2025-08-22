import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollaborativeForm } from '../hooks/useCollaborativeForm';
import CollaborativeField from './CollaborativeField';
import ActiveEditorsPanel from './ActiveEditorsPanel';
import FormVersionHistory from './FormVersionHistory';
import { FormType } from '../types/forms';
import { 
  FormFieldConfig, 
  FormContent, 
  EDUCATION_OPTIONS,
  ACTION_OPTIONS,
  COMMON_OPTIONS,
  generateSelectOptions, 
  generateSDGOptions,
  generateImpactTypeOptions,
  IDA_IMPACT_TYPES 
} from '../types/collaboration';
import { useNotification } from '../../../hooks/useNotification';

const CollaborativeForm: React.FC = () => {
  const { teamId, formId } = useParams<{ teamId: string; formId: string }>();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: showError } = useNotification();
  
  const {
    content,
    activeEditors,
    isLoading,
    error,
    isConnected,
    hasUnsavedChanges,
    debouncedUpdate,
    startEditing,
    stopEditing,
    updateCursor,
    saveNow
  } = useCollaborativeForm(formId!);

  // Return to the previous page
  const handleGoBack = () => {
    if (teamId) {
      navigate(`/team/${teamId}/forms`);
    } else {
      navigate(-1); 
    }
  };

  // Handle form submission for review
  const handleSubmitForReview = async (submissionData: any) => {
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/forms/${formId}/submit-for-review/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit for review');
      }

      // Processing after successful submission
      success('Form submitted for review successfully!');
      setShowSubmissionModal(false);
      
    } catch (error) {
      console.error('Submission failed:', error);
      showError('Failed to submit form for review. Please try again.');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const exportUrl = content?.form_type === 'ida' 
        ? `/api/forms/${formId}/export-ppt/`
        : `/api/forms/${formId}/export/`;
      
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error('Export failed');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Set the file name and extension according to the form type
      const fileExtension = content?.form_type === 'ida' ? 'pptx' : 'pdf';
    
      let fileName;
      if (content?.form_type === 'ida') {
        const safeTitle = (content?.title || 'IDA_Form').replace(/[^a-zA-Z0-9]/g, '_');
        fileName = `${safeTitle}_${formId}.${fileExtension}`;
      } else {
        fileName = `${content?.title || 'form'}_${formId}.${fileExtension}`;
      }
      
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      showError('Export failed. Please try again later.');
    }
  };

  // Obtain field configuration based on the form type
  const getFieldConfigs = (formType: FormType): FormFieldConfig[] => {
    const commonFields: FormFieldConfig[] = [
      { name: 'title', label: 'Title', type: 'text', required: true, maxLength: 200 },
      { name: 'description', label: 'Description', type: 'textarea', rows: 3, maxLength: 1000 },
      { 
        name: 'location', 
        label: 'Location', 
        type: 'select',
        options: generateSelectOptions(COMMON_OPTIONS.regions)
      },
      { name: 'organization', label: 'Organization', type: 'text', maxLength: 128 },
      { 
        name: 'year', 
        label: 'Year', 
        type: 'select',
        options: generateSelectOptions(COMMON_OPTIONS.years)
      },
      { 
        name: 'sdgs_related', 
        label: 'SDGs Related', 
        type: 'multiselect',
        options: generateSDGOptions()
      },
      { name: 'source', label: 'Source', type: 'textarea', rows: 2 },
      { name: 'link', label: 'Link', type: 'url' },
    ];

    if (formType === FormType.EDUCATION) {
      return [
        ...commonFields,
        { name: 'aims', label: 'Aims', type: 'textarea', rows: 3 },
        { name: 'learning_outcomes', label: 'Learning Outcomes', type: 'textarea', rows: 3 },
        { name: 'type_label', label: 'Type Label', type: 'text', maxLength: 50 },
        { 
          name: 'related_discipline', 
          label: 'Related Discipline', 
          type: 'select',
          options: generateSelectOptions(EDUCATION_OPTIONS.disciplines)
        },
        { 
          name: 'useful_industries', 
          label: 'Useful Industries', 
          type: 'select',
          options: generateSelectOptions(EDUCATION_OPTIONS.industries)
        },
      ];
    } else if (formType === FormType.ACTION) {
      return [
        ...commonFields,
        { name: 'actions', label: 'Actions', type: 'textarea', rows: 3 },
        { name: 'action_detail', label: 'Action Detail', type: 'textarea', rows: 4 },
        { 
          name: 'level', 
          label: 'Level', 
          type: 'select',
          options: ACTION_OPTIONS.levels
        },
        { 
          name: 'individual_organization', 
          label: 'Individual/Organization', 
          type: 'select',
          options: ACTION_OPTIONS.individual_organization
        },
        { name: 'location_specific', label: 'Location Specific', type: 'textarea', rows: 2 },
        { 
          name: 'related_industry', 
          label: 'Related Industry', 
          type: 'select',
          options: generateSelectOptions(ACTION_OPTIONS.industries)
        },
        { 
          name: 'digital_actions', 
          label: 'Digital Actions', 
          type: 'select',
          options: ACTION_OPTIONS.digital_actions
        },
        { name: 'source_descriptions', label: 'Source Descriptions', type: 'textarea', rows: 2 },
        { 
          name: 'award', 
          label: 'Award', 
          type: 'select',
          options: ACTION_OPTIONS.award
        },
        { name: 'source_links', label: 'Source Links', type: 'textarea', rows: 2 },
        { name: 'additional_notes', label: 'Additional Notes', type: 'textarea', rows: 3 },
        { name: 'award_descriptions', label: 'Award Descriptions', type: 'textarea', rows: 2 },
      ];
    } else if (formType === FormType.BLANK) {
      return [
        { name: 'title', label: 'Document Title', type: 'text', required: true, maxLength: 200 },
        { name: 'description', label: 'Description', type: 'textarea', rows: 2, maxLength: 500 },
        { 
          name: 'free_content', 
          label: 'Content (Markdown supported)', 
          type: 'textarea', 
          rows: 20,
          placeholder: 'Start editing...' 
        },
      ];
    } else if (formType === FormType.IDA) {
      return [
        { name: 'title', label: 'Document Title', type: 'text', required: true, maxLength: 200 },
        { name: 'description', label: 'Description', type: 'textarea', rows: 2, maxLength: 500 },
        { name: 'designer_names', label: 'Name of Designer(s)', type: 'text', required: true, maxLength: 200 },
        { name: 'current_role_affiliation', label: 'Current Role and Affiliation', type: 'text', required: true, maxLength: 200 },
        
        { name: 'impact_project_name', label: 'Name of Impact Project (max 10 words)', type: 'text', required: true, maxWords: 10, maxLength: 100 },
        { name: 'main_challenge', label: 'What is the main challenge your Project tries to solve? (max 50 words)', type: 'textarea', rows: 2, maxWords: 50 },
        { name: 'project_description', label: 'Provide a description of the impact project (max 200 words)', type: 'textarea', rows: 4, maxWords: 200 },
        
        { 
          name: 'selected_sdgs', 
          label: 'Which SDGs do you believe your Project has the most impact on? (Select top 3)', 
          type: 'multiselect',
          options: generateSDGOptions(),
          required: true
        },
        
        { 
          name: 'impact_types', 
          label: 'What are the types of impact your Project creates? (Pick 3 and rank 1-3)', 
          type: 'multiselect',
          options: generateImpactTypeOptions(),
          required: true
        },
        
        { name: 'project_importance', label: 'Why is the impact project important? (max 200 words)', type: 'textarea', rows: 4, maxWords: 200 },
        { name: 'existing_example', label: 'Provide an existing example that shows similar impact (max 200 words)', type: 'textarea', rows: 4, maxWords: 200 },
        
        { name: 'implementation_step1', label: 'Implementation Step 1 (max 100 words)', type: 'textarea', rows: 3, maxWords: 100 },
        { name: 'implementation_step2', label: 'Implementation Step 2 (max 100 words)', type: 'textarea', rows: 3, maxWords: 100 },
        { name: 'implementation_step3', label: 'Implementation Step 3 (max 100 words)', type: 'textarea', rows: 3, maxWords: 100 },
        { name: 'implementation_step4', label: 'Implementation Step 4 (max 100 words)', type: 'textarea', rows: 3, maxWords: 100 },
        { name: 'implementation_step5', label: 'Implementation Step 5 (max 100 words)', type: 'textarea', rows: 3, maxWords: 100 },
        { name: 'implementation_step6', label: 'Implementation Step 6 (max 100 words)', type: 'textarea', rows: 3, maxWords: 100 },
        
        { name: 'resources_partnerships', label: 'Top three resources or partnerships required (max 200 words)', type: 'textarea', rows: 4, maxWords: 200 },
        { name: 'skills_capabilities', label: 'Top three skills and capabilities required (max 200 words)', type: 'textarea', rows: 4, maxWords: 200 },
        
        { name: 'impact_avenues', label: 'Top three impact avenues to demonstrate your impact (max 200 words)', type: 'textarea', rows: 4, maxWords: 200 },
        { name: 'risks_inhibitors', label: 'Top three risks or inhibitors (max 200 words)', type: 'textarea', rows: 4, maxWords: 200 },
        { name: 'mitigation_strategies', label: 'Mitigation strategies for the risks identified (max 200 words)', type: 'textarea', rows: 4, maxWords: 200 },
      ];
    }

    return commonFields;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaborative form...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Form</h2>
          <p className="text-gray-600">{error || 'Form not found'}</p>
        </div>
      </div>
    );
  }

  const fieldConfigs = getFieldConfigs(content.form_type as FormType);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top toolbar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Return Button */}
              <button
                onClick={handleGoBack}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <h1 className="text-2xl font-bold text-gray-900">
                {content.title || 'Untitled Form'}
              </h1>
              
              {/* Connection status indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Save */}
              <div className="flex items-center space-x-2">
                {hasUnsavedChanges ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-orange-600">Unsaved changes</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Saved</span>
                  </div>
                )}
              </div>
              
              {/* Version */}
              <span className="text-sm text-gray-500">
                Version {content.version}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Submit for Review Button */}
              <button
                onClick={() => setShowSubmissionModal(true)}
                // disabled={isSubmitting}
                disabled={true} // Temporarily disable the submit button
                className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200"
              >
                Submit for Review
              </button>
              
              {/* Manual Save Button */}
              {hasUnsavedChanges && (
                <button
                  onClick={saveNow}
                  className="px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                >
                  Save Now
                </button>
              )}
              
              <button
                onClick={handleExport}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>
                  {content?.form_type === 'ida' ? 'Export PPT' : 'Export PDF'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main editing area */}
          <div className="col-span-12 lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {content.form_type === FormType.IDA ? (
                <div className="space-y-8">
                  {/* Basic Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Basic Information
                    </h3>
                    <div className="space-y-6">
                      {fieldConfigs.slice(0, 4).map((fieldConfig) => (
                        <CollaborativeField
                          key={fieldConfig.name}
                          config={fieldConfig}
                          value={content[fieldConfig.name as keyof FormContent] || (fieldConfig.type === 'multiselect' ? [] : '')}
                          onChange={(value) => debouncedUpdate(fieldConfig.name, value)}
                          onFocus={() => startEditing(fieldConfig.name)}
                          onBlur={stopEditing}
                          onCursorChange={(position, selectionStart, selectionEnd) => 
                            updateCursor(fieldConfig.name, position, selectionStart, selectionEnd)
                          }
                          activeEditors={activeEditors.filter(editor => editor.field_name === fieldConfig.name)}
                          isReadOnly={content.form_status === 'locked'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Project Information Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Project Information
                    </h3>
                    <div className="space-y-6">
                      {fieldConfigs.slice(4, 9).map((fieldConfig) => (
                        <CollaborativeField
                          key={fieldConfig.name}
                          config={fieldConfig}
                          value={content[fieldConfig.name as keyof FormContent] || (fieldConfig.type === 'multiselect' ? [] : '')}
                          onChange={(value) => debouncedUpdate(fieldConfig.name, value)}
                          onFocus={() => startEditing(fieldConfig.name)}
                          onBlur={stopEditing}
                          onCursorChange={(position, selectionStart, selectionEnd) => 
                            updateCursor(fieldConfig.name, position, selectionStart, selectionEnd)
                          }
                          activeEditors={activeEditors.filter(editor => editor.field_name === fieldConfig.name)}
                          isReadOnly={content.form_status === 'locked'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Detailed description section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Project Details
                    </h3>
                    <div className="space-y-6">
                      {fieldConfigs.slice(9, 11).map((fieldConfig) => (
                        <CollaborativeField
                          key={fieldConfig.name}
                          config={fieldConfig}
                          value={content[fieldConfig.name as keyof FormContent] || (fieldConfig.type === 'multiselect' ? [] : '')}
                          onChange={(value) => debouncedUpdate(fieldConfig.name, value)}
                          onFocus={() => startEditing(fieldConfig.name)}
                          onBlur={stopEditing}
                          onCursorChange={(position, selectionStart, selectionEnd) => 
                            updateCursor(fieldConfig.name, position, selectionStart, selectionEnd)
                          }
                          activeEditors={activeEditors.filter(editor => editor.field_name === fieldConfig.name)}
                          isReadOnly={content.form_status === 'locked'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Implementation Steps Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Implementation Steps
                    </h3>
                    <div className="space-y-6">
                      {fieldConfigs.slice(11, 17).map((fieldConfig) => (
                        <CollaborativeField
                          key={fieldConfig.name}
                          config={fieldConfig}
                          value={content[fieldConfig.name as keyof FormContent] || (fieldConfig.type === 'multiselect' ? [] : '')}
                          onChange={(value) => debouncedUpdate(fieldConfig.name, value)}
                          onFocus={() => startEditing(fieldConfig.name)}
                          onBlur={stopEditing}
                          onCursorChange={(position, selectionStart, selectionEnd) => 
                            updateCursor(fieldConfig.name, position, selectionStart, selectionEnd)
                          }
                          activeEditors={activeEditors.filter(editor => editor.field_name === fieldConfig.name)}
                          isReadOnly={content.form_status === 'locked'}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resources and Risks Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                      Resources, Impact & Risk Assessment
                    </h3>
                    <div className="space-y-6">
                      {fieldConfigs.slice(17).map((fieldConfig) => (
                        <CollaborativeField
                          key={fieldConfig.name}
                          config={fieldConfig}
                          value={content[fieldConfig.name as keyof FormContent] || (fieldConfig.type === 'multiselect' ? [] : '')}
                          onChange={(value) => debouncedUpdate(fieldConfig.name, value)}
                          onFocus={() => startEditing(fieldConfig.name)}
                          onBlur={stopEditing}
                          onCursorChange={(position, selectionStart, selectionEnd) => 
                            updateCursor(fieldConfig.name, position, selectionStart, selectionEnd)
                          }
                          activeEditors={activeEditors.filter(editor => editor.field_name === fieldConfig.name)}
                          isReadOnly={content.form_status === 'locked'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Other form types use the original grid layout.
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fieldConfigs.map((fieldConfig) => (
                    <div
                      key={fieldConfig.name}
                      className={
                        fieldConfig.type === 'textarea' || 
                        fieldConfig.type === 'multiselect' || 
                        fieldConfig.name === 'sdgs_related' ||
                        fieldConfig.name === 'actions' ||
                        fieldConfig.name === 'action_detail' ||
                        fieldConfig.name === 'additional_notes'
                          ? 'md:col-span-2' 
                          : 'md:col-span-1'
                      }
                    >
                      <CollaborativeField
                        config={fieldConfig}
                        value={content[fieldConfig.name as keyof FormContent] || (fieldConfig.type === 'multiselect' ? [] : '')}
                        onChange={(value) => debouncedUpdate(fieldConfig.name, value)}
                        onFocus={() => startEditing(fieldConfig.name)}
                        onBlur={stopEditing}
                        onCursorChange={(position, selectionStart, selectionEnd) => 
                          updateCursor(fieldConfig.name, position, selectionStart, selectionEnd)
                        }
                        activeEditors={activeEditors.filter(editor => editor.field_name === fieldConfig.name)}
                        isReadOnly={content.form_status === 'locked'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Side */}
          <div className="col-span-12 lg:col-span-3">
            <ActiveEditorsPanel activeEditors={activeEditors} />
            
            {showHistory && (
              <div className="mt-6">
                <FormVersionHistory formId={formId!} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeForm;