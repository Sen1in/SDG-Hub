// frontend/src/services/authService.ts
import { User, LoginResponse, ApiResponse } from '../types/user'; // Import from new file

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  // Token management
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // User management
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // API calls
  async login(loginInput: string, password: string): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          login: loginInput, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setTokens(data.tokens.access, data.tokens.refresh);
        this.setUser(data.user); // This now includes is_staff
        return { success: true, data };
      } else {
        return { success: false, errors: data };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, errors: { general: 'Network error' } };
    }
  }

  async register(userData: any): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        this.setTokens(data.tokens.access, data.tokens.refresh);
        this.setUser(data.user); // This now includes is_staff
        return { success: true, data };
      } else {
        return { success: false, errors: data };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, errors: { general: 'Registration failed' } };
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (refreshToken) {
        await fetch(`${API_BASE}/api/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      
      if (!refreshToken) {
        this.clearTokens();
        return null;
      }

      const response = await fetch(`${API_BASE}/api/auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        return data.access;
      } else {
        this.clearTokens();
        return null;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearTokens();
      return null;
    }
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE}/api/auth/profile/`);
      
      if (response.ok) {
        const userData = await response.json();
        this.setUser(userData); // This now includes is_staff
        return { success: true, data: userData };
      } else {
        return { success: false };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false };
    }
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE}/api/auth/profile/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        this.setUser(data.user); // This now includes is_staff
        return { success: true, data: data.user };
      } else {
        return { success: false, errors: data };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, errors: { general: 'Network error' } };
    }
  }

  async uploadAvatar(formData: FormData): Promise<ApiResponse<{ avatar_url: string }>> {
    try {
      const response = await this.authenticatedFetch(`${API_BASE}/api/auth/upload/avatar/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const currentUser = this.getUser();
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            userprofile: {
              ...currentUser.userprofile,
              avatar: data.avatar_url
            }
          };
          this.setUser(updatedUser);
        }
        return { success: true, data: data };
      } else {
        return { success: false, errors: data };
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      return { success: false, errors: { general: 'Network error' } };
    }
  }

  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    let accessToken = this.getAccessToken();

    const makeRequest = async (token: string) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });
    };

    if (!accessToken) {
      throw new Error('No access token available');
    }

    let response = await makeRequest(accessToken);

    if (response.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        response = await makeRequest(newToken);
      }
    }

    return response;
  }
}

export default new AuthService();