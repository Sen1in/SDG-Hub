import { useState, useEffect } from 'react';
import { EducationResource } from '../types';
import { fetchEducationDetail } from '../utils/api';

export const useEducationDetail = (id: string | undefined) => {
  const [resource, setResource] = useState<EducationResource | null>(null);
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
      const data = await fetchEducationDetail(id);
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
