const API_BASE_URL = 'http://localhost/macropace-api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('macropace_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error! status: ${res.status}`);
  }
  return data;
}

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  post: async (endpoint, body) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  put: async (endpoint, body) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

export default api;
