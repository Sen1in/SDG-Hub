export const validateEmail = (email: string): string | undefined => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return undefined;
};

export const validateUsername = (username: string): string | undefined => {
  if (!username.trim()) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  return undefined;
};

export const validateLoginInput = (loginInput: string): string | undefined => {
  if (!loginInput.trim()) return 'Username or email is required';
  
  if (loginInput.includes('@')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginInput)) return 'Please enter a valid email address';
  } else {
    if (loginInput.length < 3) return 'Username must be at least 3 characters';
  }
  
  return undefined;
};

export const validatePassword = (password: string): string | undefined => {
  if (!password.trim()) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return undefined;
};

export const validatePasswordConfirm = (password: string, password_confirm: string): string | undefined => {
  if (!password_confirm.trim()) return 'Please confirm your password';
  if (password !== password_confirm) return 'Passwords do not match';
  return undefined;
};

export const validateEmailCode = (emailCode: string): string | undefined => {
  if (!emailCode) {
    return 'Email verification code is required';
  }
  if (emailCode.length !== 6) {
    return 'Verification code must be 6 digits';
  }
  if (!/^\d{6}$/.test(emailCode)) {
    return 'Verification code must contain only numbers';
  }
  return undefined;
};