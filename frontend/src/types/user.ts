// frontend/src/types/user.ts

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;      // Important: For identifying admin users
  is_superuser: boolean;  // Important: For identifying superusers
  userprofile?: {
    organization?: string;
    faculty_and_major?: string;
    avatar?: string;
    bio?: string;
    created_at?: string;
    updated_at?: string;
    gender?: string;
    language?: string;
    phone?: string;
    profile_picture?: string;
    positions?: string;
  };
}

// Keep the ApiResponse type here as well for auth-related responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export interface LoginResponse {
  message: string;
  user: User;
  tokens: {
    access: string;
    refresh: string;
  };
}
