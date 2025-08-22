// frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';
// CORRECTED: Import types from the new central file
import { User, ApiResponse } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<ApiResponse<any>>;
  register: (userData: any) => Promise<ApiResponse<any>>;
  logout: () => Promise<void>;
  updateProfile: (userData: any) => Promise<ApiResponse<any>>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean; // Add isAdmin for convenience
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      if (authService.isAuthenticated()) {
        const result = await authService.getUserProfile();
        if (result.success && result.data) {
          setUser(result.data);
        } else {
          // If profile fetch fails, might be an invalid token
          await authService.logout();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginInput: string, password: string): Promise<ApiResponse<any>> => {
    try {
      const result = await authService.login(loginInput, password);
      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, errors: { general: 'Login failed' } };
    }
  };

  const register = async (userData: any): Promise<ApiResponse<any>> => {
    try {
      const result = await authService.register(userData);
      if (result.success && result.data) {
        setUser(result.data.user);
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, errors: { general: 'Registration failed' } };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (userData: any): Promise<ApiResponse<any>> => {
    try {
      const result = await authService.updateProfile(userData);
      if (result.success && result.data) {
        setUser(result.data);
        return { success: true };
      }
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, errors: { general: 'Update failed' } };
    }
  };

  const refreshUser = async (): Promise<void> => {
    setLoading(true);
    await initializeAuth();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: !!user?.is_staff, // Check if the user is staff
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
