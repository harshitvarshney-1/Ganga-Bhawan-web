// Password validation utility with security best practices

export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true
};

export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const getPasswordRequirementsText = () => {
  const reqs = [];
  reqs.push(`At least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  if (PASSWORD_REQUIREMENTS.requireUppercase) reqs.push('One uppercase letter (A-Z)');
  if (PASSWORD_REQUIREMENTS.requireLowercase) reqs.push('One lowercase letter (a-z)');
  if (PASSWORD_REQUIREMENTS.requireNumbers) reqs.push('One number (0-9)');
  if (PASSWORD_REQUIREMENTS.requireSpecialChars) reqs.push('One special character (!@#$%^&* etc)');
  return reqs.join(', ');
};
