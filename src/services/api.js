import axios from 'axios';
import Swal from 'sweetalert2';
import { Toast } from './notification';
import data from './ExempleData.json' assert { type: 'json' };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const VITE_MODE = import.meta.env.VITE_MODE || 'DEV';

const getAuthToken = () => {
  const token = sessionStorage.getItem("token");
  return token;
};

// Configuration de base d'Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers['Token'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers['Token'];
  }
};

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Token = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Fonction utilitaire pour afficher les erreurs
const showError = (error = "error", defaultMessage = 'Une erreur est survenue') => {
  const errorMessage = error.response?.data?.message || error.message || defaultMessage;
  Toast("error", errorMessage);
  return error;
};

export const api = {
  // Fonction générique pour les requêtes API
  async request(endpoint, options = {}) {
    try {
      return await axiosInstance({
        url: endpoint,
        method: options.method || 'GET',
        data: options.data,
        params: options.params,
        ...options,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userData');
        window.location.href = '/login';
      }
      throw error;
    }
  },

  // ==================== AUTHENTICATION ====================
  async login(credentials) {
    try {
      if (VITE_MODE === 'DEV') {
        return data.login;
      } else {
        const response = await axios.post(`${API_BASE_URL}/users/login`, {
          login: credentials.email,
          password: credentials.password,
        });
        return response.data;
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error.response?.data);
      throw error.response?.data || error;
    }
  },

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userData');
    window.location.href = '/login';
  },

  async getCurrentUser() {
    if (VITE_MODE === 'DEV') {
      return data.getCurrentUser;
    }
    
    const userData = sessionStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }

    try {
      const response = await this.request('/users/current-user', {
        method: 'GET',
      });
     
      if (response.data) {
        sessionStorage.setItem('userData', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  },

  // ==================== PROFILE MANAGEMENT ====================
  async getProfile(data) {

    if (VITE_MODE === 'DEV') {
      return data.getProfiles;
    }
    
    try {
      const response = await this.request('/profiles', {
        method: 'GET',
        params: {
          code: data.code_ || '',
          page: data.page_ || 0,
          size: data.size_ || 10, 
        }
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des profils:", error);
      throw error;
    }
  },

  async getLocalProfile() {
    if (VITE_MODE === 'DEV') {
      return data?.getprofile;
    }
    
    const userData = sessionStorage.getItem('userData');
    if (!userData) {
      window.location.href = '/login';
      return null;
    }
    return JSON.parse(userData);
  },

  // ==================== ROLES MANAGEMENT ====================
  async getRoles(params = {}) {
    if (VITE_MODE === 'DEV') {
      return { data: data.getRols };
    }

    try {
      const response = await this.request('/roles', {
        method: 'GET',
        params: {
          name: params.name || '',
          page: params.page || 0,
          size: params.size || 10,
        }
      });
      return response;
    } catch (error) {
      console.error("Erreur getRoles:", error);
      throw error;
    }
  },

  async addRole(roleData) {
    try {
      return await this.request('/roles', {
        method: 'POST',
        data: roleData,
      });
    } catch (error) {
      console.error("Erreur addRole:", error);
      throw error;
    }
  },

  async updateRole(id, roleData) {
    try {
      return await this.request(`/roles/${id}`, {
        method: 'PUT',
        data: roleData,
      });
    } catch (error) {
      console.error("Erreur updateRole:", error);
      throw error;
    }
  },

  async assignProfilesToRole(attributionData) {
    try {
      return await this.request('/roles/assign-profiles', {
        method: 'POST',
        data: attributionData,
      });
    } catch (error) {
      console.error("Erreur assignProfilesToRole:", error);
      throw error;
    }
  },

  async removeProfilesFromRole(attributionData) {
    try {
      return await this.request('/roles/remove-profiles', {
        method: 'DELETE',
        data: attributionData,
      });
    } catch (error) {
      console.error("Erreur removeProfilesFromRole:", error);
      throw error;
    }
  },

  // ==================== USERS MANAGEMENT ====================
  async getUsers(params = {}) {
    if (VITE_MODE === 'DEV') {
      return { data: data.users };
    }
    
    try {
      return await this.request('/users', {
        method: 'GET',
        params: {
          firstName: params.firstName || '',
          lastName: params.lastName || '',
          matricule: params.matricule || '',
          page: params.page || 0,
          size: params.size || 10,
        }
      });
    } catch (error) {
      console.error("Erreur getUsers:", error);
      throw error;
    }
  },

  async searchUsers(text) {
    if (VITE_MODE === 'DEV') {
      return { data: data.users };
    }
    try {
      return await this.request('/users/search', {
        method: 'GET',
        params: {
          searchText:text
        }
      });
    } catch (error) {
      console.error("Erreur getUsers:", error);
      throw error;
    }
  },



  async attributeRolesToUser(attributionData) {
    try {
      return await this.request('/users/assign-role', {
        method: 'POST',
        data: attributionData,
      });
    } catch (error) {
      console.error("Erreur attributeRolesToUser:", error);
      throw error;
    }
  },

  async removeRolesFromUser(attributionData) {
    try {
      return await this.request('/users/remove-role', {
        method: 'DELETE',
        data: attributionData,
      });
    } catch (error) {
      throw showError(error, 'Erreur lors de la suppression des rôles');
    }
  },

  // ==================== INTEGRATION REQUESTS ====================
  async searchIntegrationRequests(searchData) {
    if (VITE_MODE === 'DEV') {
      return { data: data?.list_demande };
    }
    
    try {
      return await this.request('/requests', {
        method: 'POST',
        data: searchData,
      });
    } catch (error) {
      console.error("Erreur searchIntegrationRequests:", error);
      throw error;
    }
  },

  async validIntegrationRequest(id) {
    try {
      return await this.request(`/requests/${id}`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error("Erreur validIntegrationRequest:", error);
      throw error;
    }
  },

  async cancelIntegrationRequest(id) {
    try {
      const result = await Swal.fire({
        title: "Êtes-vous sûr de vouloir annuler cette demande ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirmer l'annulation",
        confirmButtonColor: "red",
        cancelButtonText: "Annuler",
      });

      if (result.isConfirmed) {
        const response = await this.request(`/requests/cancel/${id}`, {
          method: 'PUT',
        });

        if (response.status === 200) {
          Swal.fire({
            title: "Demande annulée",
            text: "La demande a été annulée avec succès.",
            icon: "success"
          });
          return true;
        } else {
          throw new Error("La demande n'a pas pu être annulée.");
        }
      }
      return false;
    } catch (error) {
      Swal.fire({
        title: "Erreur d'annulation",
        text: error.message || "Une erreur est survenue lors de l'annulation.",
        icon: "error"
      });
      throw error;
    }
  },

  // ==================== FILE OPERATIONS ====================
  async processFile(file, fileType) {
    const formData = new FormData();
    formData.append('file', file);

    if (VITE_MODE === 'DEV') {
      return { data: data.processFile };
    }

    try {
      return await axiosInstance.post(`/file/process-file?fileType=${fileType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error("Erreur processFile:", error);
      throw error;
    }
  },

  async analyzeOperationFile(file, fileType) {
    if (VITE_MODE === 'DEV') {
      return { data: data.analyse };
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      return await axiosInstance.post(`/file/analyze-operation-file?fileType=${fileType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      console.error("Erreur analyzeOperationFile:", error);
      throw error;
    }
  }
};