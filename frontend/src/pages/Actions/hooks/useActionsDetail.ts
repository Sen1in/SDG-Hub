import { useState, useEffect } from 'react';
import { ActionsResource } from '../types';
import { fetchActionsDetail } from '../utils/api';

export const useActionsDetail = (id: string | undefined) => {
  const [resource, setResource] = useState<ActionsResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDetail();
    }
  }, [id]);

  const loadDetail = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await fetchActionsDetail(id);
      setResource(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resource details');
      console.error('Error fetching resource detail:', err);
    } finally {
      setLoading(false);
    }
  };

  return { resource, loading, error, retry: loadDetail };
};
