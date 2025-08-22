import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DetailHeader } from './components/detail/DetailHeader';
import { QuickInfoGrid } from './components/detail/QuickInfoGrid';
import { ContentSection } from './components/detail/ContentSection';
import { SidebarCard } from './components/detail/SidebarCard';
import { ResourceLinks } from './components/detail/ResourceLinks';
import { SDGBadge } from './components/shared/SDGBadge';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { ErrorMessage } from './components/shared/ErrorMessage';
import { useActionsDetail } from './hooks/useActionsDetail';
import { safeArray, safeValue } from './utils/helpers';
import { getSDGTitle } from './utils/sdg';

import { useEffect, useState } from 'react';
import { likeAction, unlikeAction, getLikedActionIds } from '../../services/likeService';

import { useNotification } from '../../hooks/useNotification';

const ActionsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resource, loading, error, retry } = useActionsDetail(id);

  const { warning, error: notifyError } = useNotification();

  const [liked, setLiked] = useState<boolean>(false);
  useEffect(() => {
    const fetchLiked = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLiked(false);
        return;
      }
      if (resource?.id) {
        try {
          const likedIds = await getLikedActionIds();
          setLiked(likedIds.includes(resource.id));
        } catch (e) {
          console.error('Failed to obtain the collection status', e);
          notifyError('Failed to obtain the collection status');
        }
      }
    };
    fetchLiked();
  }, [resource?.id, notifyError]);

  const toggleLike = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      
      warning('Please log in first before you can add to your favorites!❤️');
      return;
    }

    if (!resource) return;

    try {
      if (liked) {
        await unlikeAction(resource.id);
      } else {
        await likeAction(resource.id);
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Collection operation failed', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading action details..." />
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message={error || 'The requested action could not be found.'} 
          onRetry={error ? retry : undefined}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <DetailHeader resource={resource} liked={liked} onToggleLike={toggleLike} onBack={() => navigate(-1)}/>
      
      {/* Quick Info Grid */}
      <QuickInfoGrid resource={resource} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Action Title */}
            <ContentSection
              title="Action Title"
              content={resource.actions}
              bgColor="bg-blue-100"
              icon={
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />

            {/* Action Details */}
            <ContentSection
              title="Action Details"
              content={resource.action_detail}
              bgColor="bg-green-100"
              icon={
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />

            {/* Additional Notes */}
            {resource.additional_notes && (
              <ContentSection
                title="Additional Notes"
                content={resource.additional_notes}
                bgColor="bg-purple-100"
                icon={
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              />
            )}

            {/* Award Description */}
            {resource.award_descriptions && (
              <ContentSection
                title="Award Information"
                content={resource.award_descriptions}
                bgColor="bg-yellow-100"
                icon={
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                }
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Action Properties Card */}
            <SidebarCard
              title="Action Properties"
              icon={
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Level:</span>
                  <span className="text-sm text-gray-900">{resource.level_label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Type:</span>
                  <span className="text-sm text-gray-900">{resource.individual_organization_label}</span>
                </div>
                {resource.digital_actions_label && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Digital:</span>
                    <span className="text-sm text-gray-900">{resource.digital_actions_label}</span>
                  </div>
                )}
                {resource.award_label && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Award:</span>
                    <span className="text-sm text-gray-900">{resource.award_label}</span>
                  </div>
                )}
                {resource.location && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Location:</span>
                    <span className="text-sm text-gray-900">{resource.location}</span>
                  </div>
                )}
              </div>
            </SidebarCard>

            {/* Related SDGs Card */}
            {safeArray(resource.sdgs_list).length > 0 && (
              <SidebarCard
                title="Related SDGs"
                icon={
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            {/* Industries */}
            {safeArray(resource.industry_list).length > 0 && (
              <SidebarCard
                title="Related Industries"
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

export default ActionsDetail;