import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { DetailHeader } from './components/detail/DetailHeader';
import { TargetCard } from './components/detail/TargetCard';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { useKeywordDetail } from './hooks/useKeywordDetail';
import { useEffect } from 'react';
import { trackPageVisit } from '../../services/tracker';
import { useAuth } from '../../contexts/AuthContext';

const KeywordDetail: React.FC = () => {
  const { keyword } = useParams<{ keyword: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const { keywordData, loading, error, retry } = useKeywordDetail(keyword);

  useEffect(() => {
    if (keywordData?.keyword && user?.id) {
      trackPageVisit(user.id.toString(), location.pathname);
    }
  }, [keywordData?.keyword, user?.id]);

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
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Targets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {keywordData.targets.map((target, index) => (
            <TargetCard key={`${target.sdg_number}-${target.target_code}-${index}`} target={target} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default KeywordDetail;
