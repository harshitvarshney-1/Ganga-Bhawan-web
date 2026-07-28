// Password validation utility - minimal requirements

export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, errors: ['Password is required'] };
  }
  if (password.length < 4) {
    return { valid: false, errors: ['Password must be at least 4 characters long'] };
  }
  return { valid: true, errors: [] };
};
