import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../../hooks/useNotification';

interface FormReviewData {
  form: {
    id: string;
    title: string;
    type: string;
    team_name: string;
    submitted_by: string;
    submitted_at: string;
    review_status: string;
  };
  content: any;
}

const FormReviewInterface: React.FC = () => {
  const { teamId, formId } = useParams<{ teamId: string; formId: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useNotification();
  
  const [formData, setFormData] = useState<FormReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchFormData();
  }, [formId]);

  const fetchFormData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/forms/${formId}/review-detail/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch form data');
      }

      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!formData) return;
    
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/forms/${formId}/approve/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: comments.trim() || undefined }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve form');
      }

      const result = await response.json();
      success(`Form approved successfully! Added to main database with ID: ${result.main_db_id}`);
      setShowApprovalModal(false);
      navigate(-1);
      
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to approve form');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!formData || !comments.trim()) return;
    
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/forms/${formId}/reject/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments: comments.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject form');
      }

      success('Form rejected successfully. The submitter has been notified.');
      setShowRejectionModal(false);
      navigate(-1);
      
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to reject form');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFieldValue = (key: string, value: any): string => {
    if (!value) return 'Not specified';
    
    if (key === 'sdgs_related' && Array.isArray(value)) {
      return value.map(sdg => `SDG ${sdg}`).join(', ');
    }
    
    if (key === 'selected_sdgs' && Array.isArray(value)) {
      return value.map(sdg => `SDG ${sdg}`).join(', ');
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form for review...</p>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Form</h2>
          <p className="text-gray-600 mb-4">{error || 'Form not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review Form</h1>
                <p className="text-gray-600 mt-1">
                  {formData.form.type === 'action' ? 'Action Form' : 'Education Form'} submitted for review
                </p>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              Under Review
            </span>
          </div>
          
          {/* Form Metadata */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Team:</span>
              <span className="ml-2 text-gray-600">{formData.form.team_name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Submitted by:</span>
              <span className="ml-2 text-gray-600">{formData.form.submitted_by}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">Submitted on:</span>
              <span className="ml-2 text-gray-600">{formatDate(formData.form.submitted_at)}</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Form Content</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData.content).map(([key, value]) => {
              if (key === 'id' || key === 'form' || key === 'version' || key === 'created_at' || key === 'updated_at' || key === 'form_type' || key === 'form_status') {
                return null;
              }
              
              const displayValue = renderFieldValue(key, value);
              if (displayValue === 'Not specified') return null;
              
              return (
                <div key={key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/_/g, ' ')}
                  </label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{displayValue}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Actions</h3>
              <p className="text-sm text-gray-600">
                Review the form content carefully before making a decision. Approved forms will be added to the main database.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectionModal(true)}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Reject
              </button>
              <button
                onClick={() => setShowApprovalModal(true)}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Approve
              </button>
            </div>
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Form</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will approve the form and add it to the main database. The submitter will be notified.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Comments (Optional)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Add any comments about the approval..."
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setComments('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-lg"
                >
                  {isProcessing ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Form</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this form. The submitter will receive this feedback.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Explain why this form is being rejected..."
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setComments('');
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing || !comments.trim()}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg"
                >
                  {isProcessing ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormReviewInterface;