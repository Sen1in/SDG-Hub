import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { DetailHeader } from './components/detail/DetailHeader';
import { QuickInfoGrid } from './components/detail/QuickInfoGrid';
import { ContentSection } from './components/detail/ContentSection';
import { SidebarCard } from './components/detail/SidebarCard';
import { ResourceLinks } from './components/detail/ResourceLinks';
import { SDGBadge } from './components/shared/SDGBadge';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { useEducationDetail } from './hooks/useEducationDetail';
import { safeArray } from './utils/helpers';
import { getSDGTitle } from './utils/sdg';
import { useEffect, useState } from 'react';
import { likeEducation, unlikeEducation, getLikedEducationIds } from '../../services/likeService';
import { useNotification } from '../../hooks/useNotification';
import { trackPageVisit } from '../../services/tracker';
import { useAuth } from '../../contexts/AuthContext';

const EducationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const { resource, loading, error, retry } = useEducationDetail(id);

    const { warning, error: notifyError } = useNotification();

  const [liked, setLiked] = useState<boolean>(false);
  useEffect(() => {
    const checkIfLiked = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLiked(false);
        return;
      }

      if (resource) {
        try {
          const likedIds = await getLikedEducationIds();
          setLiked(likedIds.includes(resource.id));
        } catch (err) {
          console.error('Failed to obtain the collection status', err);
          notifyError('Failed to obtain the collection status'); 
        }
      }
    };
    checkIfLiked();
  }, [resource, notifyError]);

  useEffect(() => {
    if (resource?.id && user?.id) {
      trackPageVisit(user.id.toString(), location.pathname);
    }
  }, [resource?.id, user?.id]);

  const toggleLike = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      warning('Please log in first before you can add to your favorites!❤️');
      return;
    }

    if (!resource) return;

    try {
      if (liked) {
        await unlikeEducation(resource.id);
      } else {
        await likeEducation(resource.id);
      }
      setLiked(!liked);
    } catch (err) {
      console.error('Collection operation failed', err);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading resource details..." />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error || 'The requested resource could not be found.'} 
          onRetry={error ? retry : undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <DetailHeader 
        resource={resource} 
        liked={liked}
        onToggleLike={toggleLike}
      />

      {/* Quick Info Grid */}
      <QuickInfoGrid resource={resource} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Project Description */}
            <ContentSection
              title="Project Description"
              content={resource.description}
              bgColor="bg-blue-100"
              icon={
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />

            {/* Additional Description */}
            {resource.descriptions && resource.descriptions !== resource.description && (
              <ContentSection
                title="Additional Information"
                content={resource.descriptions}
                bgColor="bg-green-100"
                icon={
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            )}

            {/* Project Aims */}
            <ContentSection
              title="Project Aims"
              content={resource.aims}
              bgColor="bg-purple-100"
              icon={
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              }
            />

            {/* Learning Outcomes */}
            <ContentSection
              title="Project Outcomes"
              content={resource.learning_outcome_expecting_outcome_field}
              bgColor="bg-yellow-100"
              icon={
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Related SDGs Card */}
            {safeArray(resource.sdgs_list).length > 0 && (
              <SidebarCard
                title="Related SDGs"
                icon={
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                  </svg>
                }
              >
                <div className="space-y-3">
                  {safeArray(resource.sdgs_list).map(sdg => (
                    <div key={sdg} className="flex items-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <SDGBadge sdg={sdg} size="md" className="mr-3" />
                      <span className="text-sm font-medium text-gray-900">{getSDGTitle(sdg)}</span>
                    </div>
                  ))}
                </div>
              </SidebarCard>
            )}

            {/* Disciplines */}
            {safeArray(resource.discipline_list).length > 0 && (
              <SidebarCard
                title="Disciplines"
                icon={
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {safeArray(resource.discipline_list).map((discipline, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {discipline}
                    </span>
                  ))}
                </div>
              </SidebarCard>
            )}

            {/* Industries */}
            {safeArray(resource.industry_list).length > 0 && (
              <SidebarCard
                title="Industries"
                icon={
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              >
                <div className="flex flex-wrap gap-2">
                  {safeArray(resource.industry_list).map((industry, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </SidebarCard>
            )}

            {/* Resource Links */}
            <ResourceLinks resource={resource} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationDetail;