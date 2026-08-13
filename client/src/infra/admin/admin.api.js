import { API_URL, getAuthHeaders } from '../config';

export const getPendingTenantsAPI = async (token) => {
  const response = await fetch(`${API_URL}/admin/pending-tenants`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch tenants');
  return data;
};

export const approveTenantAPI = async (tenantId, token) => {
  const response = await fetch(`${API_URL}/admin/approve-tenant/${tenantId}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to approve tenant');
  return data;
};

export const rejectTenantAPI = async (tenantId, token) => {
  const response = await fetch(`${API_URL}/admin/reject-tenant/${tenantId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to reject tenant');
  return data;
};

export const resetPasswordAPI = async (tenantId, newPassword, token) => {
  const response = await fetch(`${API_URL}/admin/reset-password/${tenantId}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ newPassword }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to reset password');
  return data;
};

// Helper to handle JSON response safely
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'API Error');
    return data;
  } else {
    const text = await response.text();
    console.error('Non-JSON response received:', text);
    throw new Error(`Server returned unexpected content. Status: ${response.status}`);
  }
};
export const getApprovedTenantsAPI = async (token) => {
  const response = await fetch(`${API_URL}/admin/approved-tenants`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

export const getDisabledTenantsAPI = async (token) => {
  const response = await fetch(`${API_URL}/admin/disabled-tenants`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

export const deleteTenantAPI = async (tenantId, token) => {
  const response = await fetch(`${API_URL}/admin/delete-tenant/${tenantId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  return handleResponse(response);
};

export const disableTenantAPI = async (tenantId, token) => {
  const response = await fetch(`${API_URL}/admin/disable-tenant/${tenantId}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({}), // Added empty body
  });
  return handleResponse(response);
};

export const enableTenantAPI = async (tenantId, token) => {
  const response = await fetch(`${API_URL}/admin/enable-tenant/${tenantId}`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({}), // Added empty body
  });
  return handleResponse(response);
};

export const updateTenantAPI = async (tenantId, updates, token) => {
  const response = await fetch(`${API_URL}/admin/update-tenant/${tenantId}`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(updates),
  });
  return handleResponse(response);
};


