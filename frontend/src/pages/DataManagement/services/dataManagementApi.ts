import authService from '../../../services/authService';
import { 
  DatabaseRecord, 
  PaginatedResponse, 
  ProcessFileResponse, 
  ImportResponse,
  SearchFilters 
} from '../types';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class DataManagementApi {
  // Education API methods
  async getEducationRecords(params: SearchFilters): Promise<PaginatedResponse<DatabaseRecord>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.year) queryParams.append('year', params.year);
    queryParams.append('page', params.page.toString());
    queryParams.append('page_size', params.page_size.toString());

    const response = await authService.authenticatedFetch(
      `${API_BASE}/api/data-management/education/list/?${queryParams}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch education records');
    }

    return response.json();
  }

  async deleteEducationRecords(ids: number[]): Promise<{ message: string; deleted_count: number }> {
    const response = await authService.authenticatedFetch(
      `${API_BASE}/api/data-management/education/delete/`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete education records');
    }

    return response.json();
  }

  async uploadEducationFile(file: File): Promise<ProcessFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await authService.authenticatedFetch(
      `${API_BASE}/api/data-management/education/upload/`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }

    return response.json();
  }

  async importEducationData(data: any[], skipDuplicates: boolean = true): Promise<ImportResponse> {
    const response = await authService.authenticatedFetch(
      `${API_BASE}/api/data-management/education/import/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, skip_duplicates: skipDuplicates }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to import education data');
    }

    return response.json();
  }

  // Actions API methods
  async getActionsRecords(params: SearchFilters): Promise<PaginatedResponse<DatabaseRecord>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.year) queryParams.append('level', params.year); // Actions use level instead of year
    queryParams.append('page', params.page.toString());
    queryParams.append('page_size', params.page_size.toString());

    const response = await authService.authenticatedFetch(
      `${API_BASE}/api/data-management/actions/list/?${queryParams}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch actions records');
    }

    return response.json();
  }

  async deleteActionsRecords(ids: number[]): Promise<{ message: string; deleted_count: number }> {
    const response = await authService.authenticatedFetch(
      `${API_BASE}/api/data-management/actions/delete/`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete actions records');
    }

    return response.json();
  }

  async uploadActionsFile(file: File): Promise<ProcessFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await authService.authenticatedFetch(
      `${API_BASE}/api/data-management/actions/upload/`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }

    return response.json();
  }

  async importActionsData(data: any[], skipDuplicates: boolean = true): Promise<ImportResponse> {
    const response = await authService.authenticatedFetch(
      `${API_BASE}/api/data-management/actions/import/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, skip_duplicates: skipDuplicates }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to import actions data');
    }

    return response.json();
  }

  // Utility methods
  validateFileType(file: File): boolean {
    return file.name.match(/\.(xlsx|xls)$/i) !== null;
  }

  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const dataManagementApi = new DataManagementApi();