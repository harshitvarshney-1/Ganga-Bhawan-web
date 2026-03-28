import { API_URL, getAuthHeaders } from '../config';

export const registerTenantAPI = async (formData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Registration failed');
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
