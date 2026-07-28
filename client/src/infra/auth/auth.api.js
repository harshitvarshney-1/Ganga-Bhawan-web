import { API_URL, getAuthHeaders } from '../config';

export const registerTenantAPI = async (userData) => {
  let response;
  try {
    response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  } catch (networkErr) {
    throw new Error('Cannot connect to server. Please check your internet connection.');
  }

  // Try to parse JSON — if backend returned HTML (crash/404), handle gracefully
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server error (HTTP ${response.status}). Please try again later.`);
  }

  if (!response.ok) {
    const err = new Error(data.error || 'Registration failed');
    if (data.details) err.details = data.details;
    throw err;
  }
  return data;
};

export const loginAPI = async (email, password, loginType) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password, loginType }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');
  return data;
};
