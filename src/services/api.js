const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getAuthToken = () => localStorage.getItem('token');

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expirée');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Erreur ${response.status}`);

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
    if (response.token) localStorage.setItem('token', response.token);
    return response;
  },

  async logout() {
    const response = await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    return response;
  },

  async getProfile() {
    return this.request('/auth/profile');
  },

  async getDemandes() {
    return this.request('/demandes');
  },

  async getDemandeById(id) {
    return this.request(`/demandes/${id}`);
  },

  async updateDemande(id, data) {
    return this.request(`/demandes/${id}`, {
      method: 'PUT',
      body: data,
    });
  }
};