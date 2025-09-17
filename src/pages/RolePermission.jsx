import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaTrash, FaUserPlus, FaEdit } from 'react-icons/fa';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import {
  BeautifulTable,
  usePagination
} from '../components/my-ui/Table';
import { Button } from '../components/my-ui/Button';
import { Card } from '../components/my-ui/Card';
// import showModalRoleProfiles from '../components/my-ui/showModalRoleProfiles';
import ShowModalRoleProfiles from "../components/my-ui/ShowModalRoleProfiles";

function RolePermission() {
  const [rolesData, setRolesData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  });
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const pagination = usePagination(1, 10);

  // Fonction de recherche avec debounce
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  const fetchData = async (page = 1, size = 10, name = '') => {
    setLoading(true);
    try {
      const response = await api.getRoles({
        name: name,
        page: page - 1, // L'API attend une page 0-based
        size: size
      });
      
      if (response && response.data) {
        setRolesData(response.data);
      } else {
        console.error("Format de réponse inattendu:", response);
        setRolesData({
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size: size
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des rôles:", error);
      Swal.fire('Erreur', 'Impossible de charger les rôles', 'error');
      setRolesData({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 10
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchName('');
    pagination.goToPage(1);
    fetchData(1, pagination.pageSize, '');
  };

  const handlePageChange = (page) => {
    pagination.goToPage(page);
    fetchData(page, pagination.pageSize, searchName);
  };




const handleAddRole = async () => {
  Swal.fire({
    title: 'Ajouter un nouveau rôle',
    input: 'text',
    inputLabel: 'Nom du rôle',
    inputPlaceholder: 'Entrez le nom du rôle',
    showCancelButton: true,
    confirmButtonColor: 'rgba(9, 68, 29, 1)',
    confirmButtonText: 'Enregistrer',
    cancelButtonText: 'Annuler',
    showLoaderOnConfirm: true,
    preConfirm: async (roleName) => {
      if (!roleName) {
        Swal.showValidationMessage("Le nom du rôle est requis !");
        return false;
      }
      try {
        await api.addRole({ name: roleName });
        return true;
      } catch (error) {
        Swal.showValidationMessage(
          `Erreur : ${error.message || "Impossible d'ajouter le rôle."}`
        );
        return false;
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Succès!', 'Le rôle a été ajouté avec succès.', 'success');
      fetchData(pagination.currentPage, pagination.pageSize, searchName);
    }
  });
};


const handleEditRole = async (role) => {
  Swal.fire({
    title: 'Modifier le rôle',
    input: 'text',
    inputValue: role.name,
    inputLabel: 'Nom du rôle',
    showCancelButton: true,
    confirmButtonColor: '#045318ff',
    confirmButtonText: 'Mettre à jour',
    cancelButtonText: 'Annuler',
    showLoaderOnConfirm: true,
    preConfirm: async (newName) => {
      if (!newName) {
        Swal.showValidationMessage("Le nom du rôle est requis !");
        return false;
      }
      try {
        await api.updateRole(role.role_id, { name: newName });
        return true;
      } catch (error) {
        Swal.showValidationMessage(
          `Erreur : ${error.message || "Impossible de modifier le rôle."}`
        );
        return false;
      }
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire('Mis à jour!', 'Le rôle a été modifié avec succès.', 'success');
      fetchData(pagination.currentPage, pagination.pageSize, searchName);
    }
  });
};




  // Recherche en temps réel avec debounce
  useEffect(() => {
    const debouncedFetch = debounce(() => {
      fetchData(1, pagination.pageSize, searchName);
    }, 500);

    debouncedFetch();
  }, [searchName, pagination.pageSize]);

  // Charger les données initiales
  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize, searchName);
  }, []);

  const hasActiveFilters = searchName;

  return (
    <div className="min-h-screen bg-gray-100 pr-5">
      <Card
        title="GESTION DES ROLES"
        addBouton={true}
        buttonText="Ajouter un rôle"
        onClickAddButton={() => {
            console.log('Bouton cliqué');
            handleAddRole();
          }}        
          icon={<FaPlus className="inline mr-1" />}
      >
        {/* Conteneur avec défilement et en-tête fixe */}
        <div className="h-[70vh] overflow-y-auto">
          
          {/* En-tête fixe */}
          <div className="sticky top-0 bg-white z-10 pt-4 pb-2 border-b shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              
              {/* Champ recherche Nom du rôle */}
              <div className="md:col-span-3 flex flex-col w-100">
                <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du rôle
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="roleName"
                    placeholder="Rechercher par nom de rôle"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md 
                              bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                              focus:ring-green-800 focus:border-green-800 
                              dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              {/* Bouton Effacer */}
              <div className="flex gap-2 items-end">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-3 py-2 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600"
                  >
                    <FaTimes className="inline mr-1" />
                    Effacer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="py-4 space-y-6">
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-auto">
                  <BeautifulTable
                    headers={[
                      { label: "Nom du rôle", align: "left" },
                      { label: "Nombre de profils associés", align: "center" },
                      { label: "Actions", align: "center" }
                    ]}
                    data={rolesData.content}
                    emptyMessage={hasActiveFilters ? "Aucun rôle trouvé avec ce critère" : "Aucun rôle trouvé"}
                    pagination={{
                      currentPage: rolesData.number + 1,
                      totalPages: rolesData.totalPages,
                      totalElements: rolesData.totalElements,
                      pageSize: rolesData.size,
                      onPageChange: handlePageChange
                    }}
                    renderRow={(role) => (
                      <tr key={role.role_id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                          <div className="font-medium">{role.name}</div>
                        </td>
                        <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                            {role.profiles ? role.profiles.length : 0}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                          <div className="flex space-x-2 justify-center">
                            <Button 
                              onClick={() => ShowModalRoleProfiles(role, () => {
                                fetchData(pagination.currentPage, pagination.pageSize, searchName);
                              })}
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              title="Associer des profils au rôle"
                            >
                              <FaUserPlus className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              onClick={() => handleEditRole(role)}
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Modifier le rôle"
                            >
                              <FaEdit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                    stickyHeader={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RolePermission;