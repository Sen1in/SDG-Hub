export interface LoginFormData {
  login: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  agreedToTerms: boolean;
  first_name?: string;
  last_name?: string;
  organization?: string;
  faculty_and_major?: string;
  email_code: string;
}

export interface LoginErrors {
  login?: string;
  password?: string;
  general?: string;
  non_field_errors?: string[];
}

export interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
  password_confirm?: string;
  first_name?: string;
  last_name?: string;
  organization?: string;
  faculty_and_major?: string;
  agreedToTerms?: string;
  general?: string;
  non_field_errors?: string[];
  email_code?: string;
}
export interface ForgotPasswordFormData {
  email: string;
  email_code: string;
}

export interface ForgotPasswordErrors {
  email?: string;
  email_code?: string;
  general?: string;
}

export interface ResetPasswordFormData {
  password: string;
  password_confirm: string;
}

export interface ResetPasswordErrors {
  password?: string;
  password_confirm?: string;
  general?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message?: string;
  reset_token?: string;
  email?: string;
  error?: string;
}