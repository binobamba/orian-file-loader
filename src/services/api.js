import axios from 'axios';
import Swal from 'sweetalert2';
import { Toast } from './notification';
import data from './ExempleData.json' assert { type: 'json' };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9006';


const getAuthToken = () => localStorage.getItem('token');

// Configuration de base d'Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fonction utilitaire pour afficher les erreurs
const showError = (error, defaultMessage = 'Une erreur est survenue') => {
  const errorMessage = error.response?.data?.message || error.message || defaultMessage;
  Toast("error", errorMessage);
  console.error('API Error:', error);
  return error;
};

export const api = {

  /**
   * Méthode générique pour effectuer des requêtes API
   * @param {string} endpoint - L'endpoint de l'API
   * @param {Object} options - Les options de la requête
   * @returns {Promise} La réponse de l'API
   */

  async request(endpoint, options = {}) {
    try {
      const response = await axiosInstance({
        url: endpoint,
        method: options.method || 'GET',
        data: options.data,
        params: options.params,
        ...options,
      });
      return response.data;
    } catch (error) {
      throw showError(error, `Erreur lors de la requête ${endpoint}`);
    }
  },

  // ==================== AUTHENTICATION ====================

  /**
   * Authentifier un utilisateur dans le système
   * @param {AuthenticateUserDto} credentials - Les credentials de connexion
   * @returns {Promise<ApiResponse>} La réponse contenant le token
   */

  async login(credentials) {
    try {
      const response = await this.request('/users/login', {
        method: 'POST',
        data: {
          login: credentials.email,
          password: credentials.password,
        },
      });
      
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        Swal.fire({
          icon: 'success',
          title: 'Connexion réussie',
          text: 'Vous êtes maintenant connecté',
          timer: 2000,
          showConfirmButton: false,
        });
      }
      return response;
    } catch (error) {
      console.log(error);
      return mockData.login; 
    }
  },

  /**
   * Déconnecter un utilisateur
   * @returns {Promise} La réponse de déconnexion
   */

  async logout() {
   if (getAuthToken()) {
    localStorage.removeItem('token');
   }
   window.location.href = '/login';
  },

  /**
   * Récupérer le profil de l'utilisateur connecté
   * @returns {Promise<User>} Le profil utilisateur
   */
  async getProfile() {
    try {
      return await this.request('/auth/profile');
    } catch (error) {
      return data.getProfile;
      throw showError(error, 'Erreur lors du chargement du profil');
    }
  },

  async getLocalProfile() {
    return data?.getprofile;
    // const userData = JSON.parse(localStorage.getItem('userData'));
    // if (!userData) {
    //   return data.getProfile;
    // }
    // return userData;
  },

  // ==================== ROLES MANAGEMENT ====================

  /**
   * Rechercher des rôles avec pagination
   * @param {Object} params - Les paramètres de recherche
   * @param {string} params.name - Le nom du rôle à rechercher
   * @param {number} params.page - Le numéro de page (défaut: 0)
   * @param {number} params.size - La taille de la page (défaut: 10)
   * @returns {Promise<PageRole>} La page de résultats des rôles
   */
  async getRoles(params = {}) {
    try {
      return await this.request('/roles', {
        method: 'GET',
        params: {
          name: params.name || '',
          page: params.page || 0,
          size: params.size || 10,
        }
      });
    } catch (error) {
      throw showError(error, 'Erreur lors de la récupération des rôles');
    }
  },

  /**
   * Créer un rôle dans le système
   * @param {RoleDto} roleData - Les données du rôle à créer
   * @returns {Promise<Role>} Le rôle créé
   */
  async addRole(roleData) {
    try {
      return await this.request('/roles', {
        method: 'POST',
        data: roleData,
      });
    } catch (error) {
      throw showError(error, 'Erreur lors de la création du rôle');
    }
  },

  /**
   * Modifier un rôle dans le système
   * @param {number} id - L'ID du rôle à modifier
   * @param {RoleDto} roleData - Les nouvelles données du rôle
   * @returns {Promise<Role>} Le rôle modifié
   */
  async updateRole(id, roleData) {
    try {
      return await this.request(`/roles/${id}`, {
        method: 'PUT',
        data: roleData,
      });
    } catch (error) {
      throw showError(error, 'Erreur lors de la mise à jour du rôle');
    }
  },

  /**
   * Attribuer des profiles Orion à un rôle dans le système
   * @param {OrionProfileAttributionDto} attributionData - Les données d'attribution
   * @returns {Promise} La réponse de l'opération
   */
  async assignProfilesToRole(attributionData) {
    try {
      return await this.request('/roles/assign-profiles', {
        method: 'POST',
        data: attributionData,
      });
    } catch (error) {
      throw showError(error, 'Erreur lors de l\'attribution des profils');
    }
  },

  /**
   * Retirer des profiles Orion à un rôle dans le système
   * @param {OrionProfileAttributionDto} attributionData - Les données de retrait
   * @returns {Promise} La réponse de l'opération
   */
  async removeProfilesFromRole(attributionData) {
    try {
      return await this.request('/roles/remove-profiles', {
        method: 'DELETE',
        data: attributionData,
      });
    } catch (error) {
      throw showError(error, 'Erreur lors de la suppression des profils');
    }
  },

  // ==================== USERS MANAGEMENT ====================

  async getUsers(params = {}) {
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
      throw showError(error, 'Erreur lors de la récupération des utilisateurs');
    }
  },

  
  
  async attributeRolesToUser(attributionData) {
    try {
      return await this.request('/users/attribute-role', {
        method: 'POST',
        data: attributionData,
      });
    } catch (error) {
      throw showError(error, 'Erreur lors de l\'attribution des rôles');
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
    try {
      return await this.request('/requests', {
        method: 'POST',
        data: searchData,
      });
    } catch (error) {
      return data?.list_demande;
      // throw showError(error, 'Erreur lors de la recherche des demandes');
    }
  },

  
  async validIntegrationRequest(id) {
    try {
      return await this.request(`/requests/valid/${id}`, {
        method: 'PUT',
      });
    } catch (error) {
      throw showError(error, 'Erreur lors de la validation de la demande');
    }
  },

  

  async cancelIntegrationRequest(id) {
    try {
      return await this.request(`/requests/cancel/${id}`, {
        method: 'PUT',
      });
    } catch (error) {
      throw showError(error, 'Erreur lors de l\'annulation de la demande');
    }
  },

  // ==================== FILE OPERATIONS ====================

  
  async processFile(file, fileType) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      return await axiosInstance.post(`/file/process-file?fileType=${fileType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      throw showError(error, 'Erreur lors du traitement du fichier');
    }
  },

  
  async analyzeOperationFile(file, fileType) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      return await axiosInstance.post(`/file/analyze-operation-file?fileType=${fileType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: ' Analyse du fichier',
        text: error.response?.data?.message || 'Erreur lors de l\'analyse du fichier',
        confirmButtonText: 'OK'
      });
    }
  }
};