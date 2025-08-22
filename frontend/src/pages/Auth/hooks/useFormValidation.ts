import { 
  validateEmail, 
  validateUsername, 
  validatePassword, 
  validatePasswordConfirm, 
  validateLoginInput,
  validateEmailCode 
} from '../utils/validation';

export const useFormValidation = () => {  
  const validateLoginForm = (username: string, password: string) => {
    const errors: { username?: string; password?: string } = {};
        
    const usernameError = validateLoginInput(username);
    if (usernameError) errors.username = usernameError;
        
    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    return { errors, isValid: Object.keys(errors).length === 0 };
  };

  const validateRegisterForm = (formData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    agreedToTerms: boolean;
    email_code: string;
  }) => {
    const errors: {
      username?: string;
      email?: string;
      password?: string;
      password_confirm?: string;
      agreedToTerms?: string;
      email_code?: string;
    } = {};
        
    const usernameError = validateUsername(formData.username);
    if (usernameError) errors.username = usernameError;
        
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
        
    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;
        
    const confirmPasswordError = validatePasswordConfirm(formData.password, formData.password_confirm);
    if (confirmPasswordError) errors.password_confirm = confirmPasswordError;

    const emailCodeError = validateEmailCode(formData.email_code);
    if (emailCodeError) errors.email_code = emailCodeError;
        
    if (!formData.agreedToTerms) {
      errors.agreedToTerms = 'You must agree to the terms and conditions';
    }
        
    return { errors, isValid: Object.keys(errors).length === 0 };
  };

  return { 
    validateLoginForm, 
    validateRegisterForm,
    validateEmail,
    validateEmailCode
  };
};