import { useState, useEffect, useCallback } from 'react';
import type { TeamForm, FormStats, CreateFormRequest, UpdateFormRequest } from '../types/forms';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_FULL_URL = `${API_BASE_URL}/api`;

// Pagination response interface
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Team Information Interface
interface TeamInfo {
  id: string;
  name: string;
  role: 'owner' | 'edit' | 'view';
  memberCount: number;
  maxMembers: number;
  createdAt: string;
}

// API
class FormApiService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('accessToken');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_FULL_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required. Please login.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    const text = await response.text();
    return text ? { message: text } : null;
  }

  // Obtain the list of team forms (with support for pagination and search)
  async getTeamForms(
    teamId: string, 
    page: number = 1, 
    pageSize: number = 20,
    search?: string,
    status?: string,
    type?: string
  ): Promise<{
    forms: TeamForm[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    if (type && type !== 'all') params.append('type', type);

    const url = `/team/${teamId}/forms/?${params.toString()}`;
    const data: PaginatedResponse<any> = await this.fetchWithAuth(url);
    
    const formsArray = data.results || [];
    const totalCount = data.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    const forms: TeamForm[] = formsArray.map((form: any) => ({
      id: form.id.toString(),
      title: form.title || '',
      description: form.description || '',
      type: form.type,
      status: form.status,
      teamId: teamId,
      createdBy: form.created_by_username || '',
      createdAt: form.created_at || new Date().toISOString(),
      updatedAt: form.updated_at || new Date().toISOString(),
      lastModifiedBy: form.last_modified_by_username,
      responseCount: form.response_count || 0,
      isTemplate: form.is_template || false,
      permission: form.permission || 'read',
      settings: {
        allowAnonymous: form.allow_anonymous || false,
        allowMultipleSubmissions: form.allow_multiple_submissions || false,
        requireLogin: form.require_login !== false,
        isPublic: form.is_public || false,
        deadline: form.deadline,
      }
    }));

    return {
      forms,
      totalCount,
      totalPages,
      currentPage: page,
      hasNext: !!data.next,
      hasPrevious: !!data.previous
    };
  }

  // Obtain the statistics of the team form
  async getTeamFormStats(teamId: string): Promise<FormStats> {
    const data = await this.fetchWithAuth(`/team/${teamId}/forms/stats/`);
    
    return {
      totalForms: data.total_forms || 0,
      activeForms: data.active_forms || 0,
      lockedForms: data.locked_forms || 0,
      formsByType: {
        action: data.forms_by_type?.action || 0,
        education: data.forms_by_type?.education || 0,
        blank: data.forms_by_type?.blank || 0,
        ida: data.forms_by_type?.ida || 0,
      }
    };
  }

  // Create a form
  async createTeamForm(teamId: string, formData: CreateFormRequest): Promise<TeamForm> {
    const payload = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: 'active',
      allow_anonymous: formData.settings?.allowAnonymous || false,
      allow_multiple_submissions: formData.settings?.allowMultipleSubmissions || false,
      require_login: formData.settings?.requireLogin || true,
      is_public: formData.settings?.isPublic || false,
      deadline: formData.settings?.deadline,
    };

    const data = await this.fetchWithAuth(`/team/${teamId}/forms/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      teamId: teamId,
      createdBy: 'current-user',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      responseCount: 0,
      isTemplate: data.is_template,
      permission: data.permission,
      settings: {
        allowAnonymous: data.allow_anonymous,
        allowMultipleSubmissions: data.allow_multiple_submissions,
        requireLogin: data.require_login,
        isPublic: data.is_public,
        deadline: data.deadline,
      }
    };
  }

  // Get personal forms (with support for pagination and search)
  async getPersonalForms(
    page: number = 1, 
    pageSize: number = 20,
    search?: string,
    status?: string,
    type?: string
  ): Promise<{
    forms: TeamForm[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status);
    if (type && type !== 'all') params.append('type', type);

    const url = `/forms/personal/?${params.toString()}`;
    const data: PaginatedResponse<any> = await this.fetchWithAuth(url);
    
    const formsArray = data.results || [];
    const totalCount = data.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    const forms: TeamForm[] = formsArray.map((form: any) => ({
      id: form.id.toString(),
      title: form.title || '',
      description: form.description || '',
      type: form.type,
      status: form.status,
      teamId: null,
      createdBy: form.created_by_username || '',
      createdAt: form.created_at || new Date().toISOString(),
      updatedAt: form.updated_at || new Date().toISOString(),
      lastModifiedBy: form.last_modified_by_username,
      responseCount: form.response_count || 0,
      isTemplate: form.is_template || false,
      permission: form.permission || 'admin',
      settings: {
        allowAnonymous: form.allow_anonymous || false,
        allowMultipleSubmissions: form.allow_multiple_submissions || false,
        requireLogin: form.require_login !== false,
        isPublic: form.is_public || false,
        deadline: form.deadline,
      }
    }));

    return {
      forms,
      totalCount,
      totalPages,
      currentPage: page,
      hasNext: !!data.next,
      hasPrevious: !!data.previous
    };
  }

  // Get personal form statistics
  async getPersonalFormStats(): Promise<FormStats> {
    const data = await this.fetchWithAuth('/forms/personal/stats/');
    
    return {
      totalForms: data.total_forms || 0,
      activeForms: data.active_forms || 0,
      lockedForms: data.locked_forms || 0,
      formsByType: {
        action: data.forms_by_type?.action || 0,
        education: data.forms_by_type?.education || 0,
        blank: data.forms_by_type?.blank || 0,
        ida: data.forms_by_type?.ida || 0,
      }
    };
  }

  // Create personal form
  async createPersonalForm(formData: CreateFormRequest): Promise<TeamForm> {
    const payload = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: 'active',
      allow_anonymous: formData.settings?.allowAnonymous || false,
      allow_multiple_submissions: formData.settings?.allowMultipleSubmissions || false,
      require_login: formData.settings?.requireLogin || true,
      is_public: formData.settings?.isPublic || false,
      deadline: formData.settings?.deadline,
    };

    const data = await this.fetchWithAuth('/forms/personal/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return {
      id: data.id.toString(),
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status,
      teamId: null,
      createdBy: 'current-user',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      responseCount: 0,
      isTemplate: data.is_template,
      permission: data.permission,
      settings: {
        allowAnonymous: data.allow_anonymous,
        allowMultipleSubmissions: data.allow_multiple_submissions,
        requireLogin: data.require_login,
        isPublic: data.is_public,
        deadline: data.deadline,
      }
    };
  }

  // Update the form
  async updateForm(formId: string, updates: UpdateFormRequest): Promise<void> {
    const payload: any = {};
    
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.settings) {
      if (updates.settings.allowAnonymous !== undefined) payload.allow_anonymous = updates.settings.allowAnonymous;
      if (updates.settings.allowMultipleSubmissions !== undefined) payload.allow_multiple_submissions = updates.settings.allowMultipleSubmissions;
      if (updates.settings.requireLogin !== undefined) payload.require_login = updates.settings.requireLogin;
      if (updates.settings.isPublic !== undefined) payload.is_public = updates.settings.isPublic;
      if (updates.settings.deadline !== undefined) payload.deadline = updates.settings.deadline;
    }

    await this.fetchWithAuth(`/forms/${formId}/`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Delete the form
  async deleteForm(formId: string): Promise<void> {
    await this.fetchWithAuth(`/forms/${formId}/`, {
      method: 'DELETE',
    });
  }

  // Switch the form lock status
  async toggleFormLock(formId: string, isLocked: boolean): Promise<void> {
    await this.fetchWithAuth(`/forms/${formId}/toggle-lock/`, {
      method: 'PATCH',
    });
  }

  // duplicate form
  async duplicateForm(formId: string): Promise<TeamForm> {
    const data = await this.fetchWithAuth(`/forms/${formId}/duplicate/`, {
      method: 'POST',
    });

    return {
      id: data.form.id.toString(),
      title: data.form.title,
      description: data.form.description,
      type: data.form.type,
      status: data.form.status,
      teamId: data.form.team_id?.toString() || null,
      createdBy: data.form.created_by_username,
      createdAt: data.form.created_at,
      updatedAt: data.form.updated_at,
      responseCount: 0,
      isTemplate: data.form.is_template,
      permission: data.form.permission,
      settings: {
        allowAnonymous: data.form.allow_anonymous,
        allowMultipleSubmissions: data.form.allow_multiple_submissions,
        requireLogin: data.form.require_login,
        isPublic: data.form.is_public,
        deadline: data.form.deadline,
      }
    };
  }
}

const formApiService = new FormApiService();

/**
 * Team Form Management Hook - Supports Pagination
 */
export const useTeamForms = (teamId: string | undefined) => {
  const [forms, setForms] = useState<TeamForm[]>([]);
  const [stats, setStats] = useState<FormStats | null>(null);
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Page pagination status
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);

  // Search and filtering status
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchTeamForms = useCallback(async (
    page: number = 1,
    search?: string,
    status?: string,
    type?: string
  ) => {
    if (!teamId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Parallel acquisition of the list of forms and statistical information
      const [formsResponse, statsData] = await Promise.all([
        formApiService.getTeamForms(teamId, page, pageSize, search, status, type),
        formApiService.getTeamFormStats(teamId)
      ]);
      
      // Set form data
      setForms(formsResponse.forms);
      setCurrentPage(formsResponse.currentPage);
      setTotalPages(formsResponse.totalPages);
      setTotalCount(formsResponse.totalCount);
      setHasNext(formsResponse.hasNext);
      setHasPrevious(formsResponse.hasPrevious);
      
      // Set statistical data
      setStats(statsData);
      
    
      try {
        const { teamApiService } = await import('../utils/utils');
        const teamData = await teamApiService.getTeamDetail(teamId);
        setTeam({
          id: teamData.id,
          name: teamData.name,
          role: teamData.role as 'owner' | 'edit' | 'view',
          memberCount: teamData.member_count,
          maxMembers: teamData.max_members,
          createdAt: teamData.created_at,
        });
      } catch (teamError) {
        console.warn('Failed to fetch team details:', teamError);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team forms');
    } finally {
      setIsLoading(false);
    }
  }, [teamId, pageSize]);

  // Page division function
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchTeamForms(page, searchQuery, statusFilter, typeFilter);
    }
  }, [totalPages, searchQuery, statusFilter, typeFilter, fetchTeamForms]);

  const goToNextPage = useCallback(() => {
    if (hasNext && currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [hasNext, currentPage, totalPages, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPrevious && currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [hasPrevious, currentPage, goToPage]);

  // Search and filtering functions
  const applyFilters = useCallback((
    search: string,
    status: string,
    type: string
  ) => {
    setSearchQuery(search);
    setStatusFilter(status);
    setTypeFilter(type);
    setCurrentPage(1); 
    fetchTeamForms(1, search, status, type);
  }, [fetchTeamForms]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh
  const refetch = useCallback(() => {
    fetchTeamForms(currentPage, searchQuery, statusFilter, typeFilter);
  }, [fetchTeamForms, currentPage, searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    fetchTeamForms(1); 
  }, [teamId, pageSize]);

  return {
    // Data
    forms,
    stats,
    team,
    
    // State
    isLoading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasNext,
    hasPrevious,
    
    // Search and filtering status
    searchQuery,
    statusFilter,
    typeFilter,
    
    // Operation functions
    refetch,
    clearError,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    applyFilters,
  };
};

/**
 * Personal Form Management Hook - Supports Pagination
 */
export const usePersonalForms = () => {
  const [forms, setForms] = useState<TeamForm[]>([]);
  const [stats, setStats] = useState<FormStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchPersonalForms = useCallback(async (
    page: number = 1,
    search?: string,
    status?: string,
    type?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [formsResponse, statsData] = await Promise.all([
        formApiService.getPersonalForms(page, pageSize, search, status, type),
        formApiService.getPersonalFormStats()
      ]);
      
      setForms(formsResponse.forms);
      setCurrentPage(formsResponse.currentPage);
      setTotalPages(formsResponse.totalPages);
      setTotalCount(formsResponse.totalCount);
      setHasNext(formsResponse.hasNext);
      setHasPrevious(formsResponse.hasPrevious);
      
      setStats(statsData);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch personal forms');
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchPersonalForms(page, searchQuery, statusFilter, typeFilter);
    }
  }, [totalPages, searchQuery, statusFilter, typeFilter, fetchPersonalForms]);

  const goToNextPage = useCallback(() => {
    if (hasNext && currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [hasNext, currentPage, totalPages, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPrevious && currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [hasPrevious, currentPage, goToPage]);

  const applyFilters = useCallback((
    search: string,
    status: string,
    type: string
  ) => {
    setSearchQuery(search);
    setStatusFilter(status);
    setTypeFilter(type);
    setCurrentPage(1); 
    fetchPersonalForms(1, search, status, type);
  }, [fetchPersonalForms]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refetch = useCallback(() => {
    fetchPersonalForms(currentPage, searchQuery, statusFilter, typeFilter);
  }, [fetchPersonalForms, currentPage, searchQuery, statusFilter, typeFilter]);

  useEffect(() => {
    fetchPersonalForms(1); 
  }, [pageSize]);

  return {
    forms,
    stats,
    
    isLoading,
    error,
    
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    hasNext,
    hasPrevious,
    
    searchQuery,
    statusFilter,
    typeFilter,
    
    refetch,
    clearError,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    applyFilters,
  };
};

/**
 * create form Hook
 */
export const useCreateForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createForm = useCallback(async (formData: CreateFormRequest): Promise<TeamForm> => {
    try {
      setIsLoading(true);
      setError(null);
      
      let newForm: TeamForm;
      
      if (formData.teamId) {
        newForm = await formApiService.createTeamForm(formData.teamId, formData);
      } else {
        newForm = await formApiService.createPersonalForm(formData);
      }
      
      return newForm;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create form';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createForm,
    isLoading,
    error,
    clearError,
  };
};

/**
 * manage form Hook
 */
export const useFormManagement = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateForm = useCallback(async (formId: string, updates: UpdateFormRequest): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await formApiService.updateForm(formId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update form';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteForm = useCallback(async (formId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await formApiService.deleteForm(formId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete form';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleFormLock = useCallback(async (formId: string, isLocked: boolean): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      await formApiService.toggleFormLock(formId, isLocked);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle form lock';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const duplicateForm = useCallback(async (formId: string): Promise<TeamForm> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const duplicatedForm = await formApiService.duplicateForm(formId);
      return duplicatedForm;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to duplicate form';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    updateForm,
    deleteForm,
    toggleFormLock,
    duplicateForm,
    isLoading,
    error,
    clearError,
  };
};

// 导出API服务实例，供其他组件使用
export { formApiService };