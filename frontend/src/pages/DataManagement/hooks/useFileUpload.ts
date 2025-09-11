import { useState, useCallback } from 'react';
import { 
  DatabaseType, 
  ProcessFileResponse, 
  ImportResponse 
} from '../types';
import { dataManagementApi } from '../services/dataManagementApi';

export const useFileUpload = () => {
  const [processedData, setProcessedData] = useState<ProcessFileResponse | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, database: DatabaseType) => {
    try {
      setUploadLoading(true);
      setUploadError(null);
      
      const result = database === 'education'
        ? await dataManagementApi.uploadEducationFile(file)
        : await dataManagementApi.uploadActionsFile(file);
      
      setProcessedData(result);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setUploadLoading(false);
    }
  }, []);

  const confirmImport = useCallback(async (
    database: DatabaseType,
    data: any[],
    skipDuplicates: boolean = true
  ): Promise<ImportResponse> => {
    try {
      setImportLoading(true);
      
      const result = database === 'education'
        ? await dataManagementApi.importEducationData(data, skipDuplicates)
        : await dataManagementApi.importActionsData(data, skipDuplicates);
      
      return result;
    } catch (err) {
      throw err;
    } finally {
      setImportLoading(false);
    }
  }, []);

  const resetUpload = useCallback(() => {
    setProcessedData(null);
    setUploadError(null);
  }, []);

  return {
    uploadFile,
    processedData,
    uploadLoading,
    importLoading,
    uploadError,
    resetUpload,
    confirmImport
  };
};
