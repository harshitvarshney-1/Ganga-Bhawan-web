export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api`;

// Register Tenant
export const registerTenant = async (formData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      body: formData, // FormData object (files ke liye)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Login (Tenant or Admin)
export const login = async (email, password, loginType) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, loginType }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Save token to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    throw error;
  }
};

// Get Tenant Profile
export const getTenantProfile = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/tenant/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch profile');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Admin: Get Pending Tenants
export const getPendingTenants = async () => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/admin/pending-tenants`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch tenants');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Admin: Approve Tenant
export const approveTenant = async (tenantId) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/admin/approve-tenant/${tenantId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to approve tenant');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Admin: Reject Tenant
export const rejectTenant = async (tenantId) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/admin/reject-tenant/${tenantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reject tenant');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};