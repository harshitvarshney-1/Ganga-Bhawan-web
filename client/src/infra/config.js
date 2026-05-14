// Fallback logic to support different env variable names (VITE_API_URL or VITE_API_BASE_URL)
const rawBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

// Clean the URL: Remove trailing '/api' if user added it in env, 
// because we append it below. This prevents double '/api/api'
export const BASE_URL = rawBaseUrl.endsWith('/api') 
  ? rawBaseUrl.replace(/\/api$/, '') 
  : rawBaseUrl;

export const API_URL = `${BASE_URL}/api`;

export const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
});