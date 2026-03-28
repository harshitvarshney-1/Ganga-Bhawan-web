import { API_URL, getAuthHeaders } from '../config';

export const getTenantProfileAPI = async (token) => {
  const response = await fetch(`${API_URL}/tenant/profile`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch profile');
  return data;
};
