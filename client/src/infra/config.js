export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ganga-bhawan-backend.vercel.app';
export const API_URL = `${BASE_URL}/api`;

export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
});
  