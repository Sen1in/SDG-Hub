import type { 
  Team, 
  TeamMember, 
  TeamDetailResponse, 
  CreateTeamRequest, 
  UserCheckResponse 
} from '../../Team/types/index';

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
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Obtain all the teams to which the user belongs
  async getTeams(): Promise<Team[]> {
    const data = await this.fetchWithAuth('/team/');
    
    // Check whether the data is an array or a paginated response
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

  // Obtain team details and member list
  async getTeamDetail(teamId: string): Promise<TeamDetailResponse> {
    return this.fetchWithAuth(`/team/${teamId}/`);
  }

  // Establish a new team
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
        
        // Construct detailed error information
        let errorMessage = '';
        
        // Prioritize the handling of specific field errors
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

  // deleteTeam
  async deleteTeam(teamId: string): Promise<void> {
    await this.fetchWithAuth(`/team/${teamId}/`, {
      method: 'DELETE',
    });
  }

  // leaveTeam
  async leaveTeam(teamId: string): Promise<void> {
    await this.fetchWithAuth(`/team/${teamId}/leave/`, {
      method: 'POST',
    });
  }

  // inviteMember
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

  // checkUserExists
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

  // updateTeam
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

  // updateMemberRole
  async updateMemberRole(teamId: string, memberId: string, role: 'owner' | 'edit' | 'view'): Promise<TeamMember> {
    const data = await this.fetchWithAuth(`/team/${teamId}/members/${memberId}/role/`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    
    return data.member;
  }

  // removeMember
  async removeMember(teamId: string, memberId: string): Promise<void> {
    await this.fetchWithAuth(`/team/${teamId}/members/${memberId}/`, {
      method: 'DELETE',
    });
  }
}

export const teamApiService = new TeamApiService();