const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const setApiKey = (key) => localStorage.setItem("openrouter_api_key", key);
export const getApiKey = () => localStorage.getItem("openrouter_api_key");
export const removeApiKey = () => localStorage.removeItem("openrouter_api_key");

/**
 * Centralized API client.
 * Automatically attaches JWT token from localStorage.
 */
const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('minxy_token');
  const openRouterKey = getApiKey();

  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(openRouterKey ? { 'x-openrouter-key': openRouterKey } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };

  // Stringify body if it's an object
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Invalid JSON response from server');
  }

  if (!res.ok) {
    throw new Error(data.error || `API error ${res.status}`);
  }

  return data;
};

// ── Convenience methods ──
api.get = (endpoint) => api(endpoint, { method: 'GET' });
api.post = (endpoint, body) => api(endpoint, { method: 'POST', body });
api.put = (endpoint, body) => api(endpoint, { method: 'PUT', body });
api.delete = (endpoint) => api(endpoint, { method: 'DELETE' });

export default api;