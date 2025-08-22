import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DetailHeader } from './components/detail/DetailHeader';
import { TargetCard } from './components/detail/TargetCard';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { useKeywordDetail } from './hooks/useKeywordDetail';

const KeywordDetail: React.FC = () => {
  const { keyword } = useParams<{ keyword: string }>();
  const navigate = useNavigate();
  const { keywordData, loading, error, retry } = useKeywordDetail(keyword);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading keyword details..." />
      </div>
    );
  }

  if (error || !keywordData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error || 'The requested keyword could not be found.'} 
          onRetry={error ? retry : undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <DetailHeader 
        keyword={keywordData.keyword}
        totalTargets={keywordData.total_targets}
        onBack={() => navigate(-1)}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Targets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {keywordData.targets.map((target, index) => (
            <TargetCard key={`${target.sdg_number}-${target.target_code}-${index}`} target={target} />
          ))}
        </div>

        {/* No Results */}
        {keywordData.targets.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No targets found</h2>
            <p className="text-gray-600 mb-6">
              This keyword doesn't appear to be associated with any SDG targets in our database.
            </p>
            <button
              onClick={() => navigate('/keywords')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordDetail;
