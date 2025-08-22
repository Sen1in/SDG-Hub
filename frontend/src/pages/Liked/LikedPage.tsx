import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';

import { fetchLikedEducationResources, fetchLikedActionResources } from '../../services/likeService';
import { EducationResource } from '../Education/types';
import { ActionsResource } from '../Actions/types';
import { ResourceCard as EducationCard } from '../Education/components/list/ResourceCard';
import { ResourceCard as ActionCard } from '../Actions/components/list/ResourceCard';

const LikedPage: React.FC = () => {
  const [likedEducation, setLikedEducation] = useState<EducationResource[]>([]);
  const [likedActions, setLikedActions] = useState<ActionsResource[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [eduRes, actRes] = await Promise.all([
          fetchLikedEducationResources(),
          fetchLikedActionResources(),
        ]);
        setLikedEducation(eduRes);
        setLikedActions(actRes);
      } catch (error) {
        console.error('Failed to obtain the collection.:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-12">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="text-xl">❤️</span>
          <h1 className="text-2xl font-bold tracking-tight">Your Liked Resources</h1>
        </div>

        {/* Education */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📘 Liked Education</h2>
          {loading ? (
            <p>Loading...</p>
          ) : likedEducation.length === 0 ? (
            <p className="text-gray-500">No liked education resources.</p>
          ) : (
            likedEducation.map((res) => (
              <EducationCard
                key={res.id}
                resource={res}
                onClick={() => navigate(`/education/${res.id}`)}
              />
            ))
          )}
        </section>

        {/* Action */}
        <section>
          <h2 className="text-xl font-semibold mb-4">🌱 Liked Actions</h2>
          {loading ? (
            <p>Loading...</p>
          ) : likedActions.length === 0 ? (
            <p className="text-gray-500">No liked actions.</p>
          ) : (
            likedActions.map((res) => (
              <ActionCard
                key={res.id}
                resource={res}
                onClick={() => navigate(`/actions/${res.id}`)}
              />
            ))
          )}
        </section>
      </div>
    </Layout>
  );
};

export default LikedPage;