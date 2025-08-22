import type { 
  Team, 
  TeamMember, 
  TeamDetailResponse, 
  CreateTeamRequest, 
  UserCheckResponse 
} from '../types/index';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const API_FULL_URL = `${API_BASE_URL}/api`;

class TeamApiService {
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
      
      // Try parsing error response
      let errorData: any = {};
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
    }

    // Check for no content response (DELETE operations usually return 204)
    if (response.status === 204) {
      return null;
    }

    // Check content length
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0') {
      return null;
    }

    // Try reading response text
    let responseText = '';
    try {
      responseText = await response.text();
    } catch (error) {
      console.warn('Failed to read response text:', error);
      return null;
    }

    // Return null if no content
    if (!responseText) {
      return null;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Return text if not JSON
      return responseText;
    }

    // Try parsing JSON
    try {
      return JSON.parse(responseText);
    } catch (error) {
      console.warn('Failed to parse response as JSON:', error);
      return responseText; // Return raw text instead of null
    }
  }

  // Get all teams user belongs to
  async getTeams(): Promise<Team[]> {
    const data = await this.fetchWithAuth('/team/');
    
    // Check if data is array or paginated response
    let teams = [];
    if (Array.isArray(data)) {
      teams = data;
    } else if (data && Array.isArray(data.results)) {
      teams = data.results;
    } else if (data && data.data && Array.isArray(data.data)) {
      teams = data.data;
    } else {
      return [];
    }
    
    try {
      return teams.map((team: any) => ({
        id: team.id.toString(),
        name: team.name || 'Unknown Team',
        role: team.role || 'view',
        memberCount: team.member_count || 0,
        maxMembers: team.max_members || 10,
        createdAt: team.created_at || '',
      }));
    } catch (error) {
      return [];
    }
  }

  // Get team details and member list
  async getTeamDetail(teamId: string): Promise<TeamDetailResponse> {
    return this.fetchWithAuth(`/team/${teamId}/`);
  }

  // Create new team
  async createTeam(teamData: CreateTeamRequest): Promise<Team> {
    const payload = {
      name: teamData.name.trim(),
      max_members: teamData.max_members || 10
    };
    
    try {
      const response = await fetch(`${API_FULL_URL}/team/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        // Build detailed error message
        let errorMessage = '';
        
        // Handle specific field errors first
        if (errorData.name) {
          const nameError = Array.isArray(errorData.name) ? errorData.name[0] : errorData.name;
          if (nameError.includes('already exists')) {
            errorMessage = 'A team with this name already exists. Please choose a different name.';
          } else {
            errorMessage = `Team name: ${nameError}`;
          }
        } else if (errorData.max_members) {
          const maxMembersError = Array.isArray(errorData.max_members) ? errorData.max_members[0] : errorData.max_members;
          errorMessage = `Maximum members: ${maxMembersError}`;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const safeTeam: Team = {
        id: String(data?.id || data?.pk || Math.random().toString(36).substr(2, 9)),
        name: String(data?.name || teamData.name || 'New Team'),
        role: String(data?.role || 'owner') as 'owner' | 'edit' | 'view',
        memberCount: Number(data?.member_count || 1),
        maxMembers: Number(data?.max_members || teamData.max_members || 10),
        createdAt: String(data?.created_at || new Date().toISOString()),
      };
      
      return safeTeam;
      
    } catch (error) {
      throw error;
    }
  }

  // Delete team (owner only)
  async deleteTeam(teamId: string): Promise<void> {
    await this.fetchWithAuth(`/team/${teamId}/`, {
      method: 'DELETE',
    });
  }

  // Leave team
  async leaveTeam(teamId: string): Promise<void> {
    await this.fetchWithAuth(`/team/${teamId}/leave/`, {
      method: 'POST',
    });
  }

  // Invite member - supports email or username
  async inviteMember(
    teamId: string, 
    identifier: string, 
    type: 'email' | 'username' = 'email'
  ): Promise<TeamMember> {
    const payload = type === 'email' ? { email: identifier } : { username: identifier };
    const response = await this.fetchWithAuth(`/team/${teamId}/invite/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    
    return response.member;
  }

  // Check if user exists
  async checkUserExists(
    identifier: string, 
    type: 'email' | 'username' = 'email'
  ): Promise<UserCheckResponse> {
    const payload = type === 'email' ? { email: identifier } : { username: identifier };
    return this.fetchWithAuth('/team/check-user/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Update team information
  async updateTeam(teamId: string, updates: Partial<CreateTeamRequest>): Promise<Team> {
    const data = await this.fetchWithAuth(`/team/${teamId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    
    return {
      id: data.id.toString(),
      name: data.name,
      role: data.role,
      memberCount: data.member_count,
      maxMembers: data.max_members,
      createdAt: data.created_at,
    };
  }

  // Update member role
  async updateMemberRole(teamId: string, memberId: string, role: 'owner' | 'edit' | 'view'): Promise<TeamMember> {
    const data = await this.fetchWithAuth(`/team/${teamId}/members/${memberId}/role/`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    
    return data.member;
  }

  // Remove member
  async removeMember(teamId: string, memberId: string): Promise<void> {
    await this.fetchWithAuth(`/team/${teamId}/members/${memberId}/`, {
      method: 'DELETE',
    });
  }
}

export const teamApiService = new TeamApiService();