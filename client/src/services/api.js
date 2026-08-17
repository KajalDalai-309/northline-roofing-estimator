const API_BASE_URL = '/api';

export function getAuthToken() {
  return localStorage.getItem('northline_admin_token') || '';
}

export function setAuthToken(token) {
  localStorage.setItem('northline_admin_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('northline_admin_token');
}

/**
 * Public: Fetch dynamic active configuration
 */
export async function fetchPublicConfig() {
  const res = await fetch(`${API_BASE_URL}/config`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load estimator configuration.');
  }
  return res.json();
}

/**
 * Public: Submit customer answers and receive calculated estimate
 */
export async function submitEstimate(payload) {
  const res = await fetch(`${API_BASE_URL}/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to calculate estimate.');
  }
  return data;
}

/**
 * Admin: Authenticate with username and password
 */
export async function loginAdmin(username, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Authentication failed.');
  }
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

/**
 * Admin: Verify current token
 */
export async function verifyAdminAuth() {
  const token = getAuthToken();
  if (!token) return { valid: false };

  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      clearAuthToken();
      return { valid: false };
    }
    return { valid: true };
  } catch (err) {
    clearAuthToken();
    return { valid: false };
  }
}

/**
 * Admin: Fetch full configuration with rates, multipliers, and inactive questions
 */
export async function fetchAdminConfig() {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/config`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    clearAuthToken();
    throw new Error('Session expired. Please log in again.');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch admin config.');
  }
  return data.config;
}

/**
 * Admin: Update configuration (rates, labels, active status, modifiers)
 */
export async function saveAdminConfig(updatedConfig, summary = '') {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/config`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      ...updatedConfig,
      change_summary: summary
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to save configuration updates.');
  }
  return data.config;
}

/**
 * Admin: Fetch all captured leads
 */
export async function fetchAdminLeads() {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/leads`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    clearAuthToken();
    throw new Error('Session expired. Please log in again.');
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch leads.');
  }
  return data.leads || [];
}

/**
 * Admin: Fetch version history log
 */
export async function fetchAdminHistory() {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/admin/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch version history.');
  }
  return data.history || [];
}
