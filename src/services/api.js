import axios from 'axios';
import Swal from 'sweetalert2';
import { Toast } from './notification';
import data from './ExempleData.json' assert { type: 'json' };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9006';
const VITE_MODE = import.meta.env.VITE_MODE ||'DEV'



const getAuthToken = () => localStorage.getItem('token');

// Configuration de base d'Axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Token': `Bearer ${getAuthToken()}`,
  },
});

// Intercepteur pour ajouter le token d'authentification
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Token = `${token}`;
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


  async request(endpoint, options = {}) {
    return await axiosInstance({
        url: endpoint,
        method: options.method || 'GET',
        data: options.data,
        params: options.params,
        ...options,
      });
  },

  // ==================== AUTHENTICATION ====================

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


  async logout() {
   if (getAuthToken()) {
    localStorage.removeItem('token');
   }
   window.location.href = '/login';
  },


  async getCurrentUser() {
    try {
      return await this.request('/users/current-user', {
        method: 'GET',
      });
    } catch (error) {
      return data.getCurrentUser;
    }
  },

  async getProfile() {
    try {
      if(VITE_MODE === 'DEV'){
           return  data.getprofile; 
      }
      return await this.request('/getProfiles', {
        method: 'GET',
      });
    } catch (error) {
      return  {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: itemsPerPage
      };
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


async getRoles(params = {}) {
  if(VITE_MODE === 'DEV'){
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
    return response.data;
  } catch (error) {
    console.error("Erreur getRoles:", error);
    return {
      totalPages: 0,
      totalElements: 0,
      size: params.size || 10,
      content: [],
      number: params.page || 0,
      empty: true
    };
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
      return { data: [] }; 
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
      return { data: [] }; 
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
      return { data: [] }; 
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
      return { data: [] }; 
    }
  },

  // ==================== USERS MANAGEMENT ====================

  async getUsers(params = {}) {
    if(VITE_MODE === 'DEV'){
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
      return data.users; 
    }
  },

  
  
  async attributeRolesToUser(attributionData) {
  
      return await this.request('/users/attribute-role', {
        method: 'POST',
        data: attributionData,
      });
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
    console.log("searchData", searchData);
    try {
      return await this.request('/requests', {
        method: 'POST',
        data: searchData,
      });
    } catch (error) {
      return {data:data?.list_demande};
      // throw showError(error, 'Erreur lors de la recherche des demandes');
    }
  },

  
  async validIntegrationRequest(id) {
      return await this.request(`/requests/valid/${id}`, {
        method: 'PUT',
      });
  },

  

  async cancelIntegrationRequest(id) {
  Swal.fire({
    title: "Êtes-vous sûr de vouloir annuler cette demande ?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Confirmer l'annulation",
    confirmButtonColor: "red",
    cancelButtonText: "Annuler",
    showLoaderOnConfirm: true,
    preConfirm: async () => {
      try {
        const response = await this.request(`/requests/cancel/${id}`, {
          method: 'PUT',
        });

        // Vérifie si le code de retour est 200
        if (response.status === 200) {
          return true;
        } else {
          throw new Error("La demande n'a pas pu être annulée.");
        }
      } catch (error) {
        Swal.fire({
          title: "Erreur de suppression",
          text: error.message || "Une erreur est survenue lors de l'annulation.",
          icon: "error"
        });
        return false;
      }
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed && result.value === true) {
      Swal.fire({
        title: "Demande annulée",
        text: "La demande a été annulée avec succès.",
        icon: "success"
      });
    }
  });
},


  // ==================== FILE OPERATIONS ====================

  
  async processFile(file, fileType) {
      const formData = new FormData();
      formData.append('file', file);

       if(VITE_MODE === 'DEV'){
      return {data:data.processFile}
      }

      return await axiosInstance.post(`/file/process-file?fileType=${fileType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
  },

  
  async analyzeOperationFile(file, fileType) {
     if(VITE_MODE === 'DEV'){
          return {data:data.analyse}
      }

    
      const formData = new FormData();
      formData.append('file', file);

      return await axiosInstance.post(`/file/analyze-operation-file?fileType=${fileType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
  }
};