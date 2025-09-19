import { useState, useCallback } from 'react';
import { 
  DatabaseType, 
  PaginatedResponse, 
  DatabaseRecord, 
  SearchFilters 
} from '../types';
import { dataManagementApi } from '../services/dataManagementApi';

export const useDataManagement = () => {
  const [data, setData] = useState<PaginatedResponse<DatabaseRecord> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    search: '',
    year: '',
    page: 1,
    page_size: 20
  });

  const loadData = useCallback(async (database: DatabaseType) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = database === 'education' 
        ? await dataManagementApi.getEducationRecords(searchFilters)
        : await dataManagementApi.getActionsRecords(searchFilters);
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [searchFilters]);

  const deleteRecords = useCallback(async (database: DatabaseType, ids: number[]) => {
    try {
      setLoading(true);
      
      const result = database === 'education'
        ? await dataManagementApi.deleteEducationRecords(ids)
        : await dataManagementApi.deleteActionsRecords(ids);
      
      // Reload data after deletion
      await loadData(database);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete records');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const updateSearchFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setSearchFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    searchFilters,
    loadData,
    deleteRecords,
    updateSearchFilters,
    clearError
  };
};
