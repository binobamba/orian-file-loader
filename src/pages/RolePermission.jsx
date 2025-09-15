import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTimes, FaTrash, FaUserPlus } from 'react-icons/fa';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import {
  BeautifulTable,
  usePagination
} from '../components/my-ui/Table';
import { Button } from '../components/my-ui/Button';
import { Card } from '../components/my-ui/Card';
import showModalRoleProfiles from '../components/my-ui/showModalRoleProfiles';

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

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
    fetchData(1, pagination.pageSize, searchName);
  };

  const handleClearSearch = () => {
    setSearchName('');
    pagination.goToPage(1);
    fetchData(1, pagination.pageSize, '');
  };

  const handlePageChange = (page) => {
    // Cette fonction sera appelée lorsque l'utilisateur change de page
    fetchData(page, pagination.pageSize, searchName);
  };

  const handleDeleteRole = async (role) => {
    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      text: `Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteRole(role.role_id);
        Swal.fire('Supprimé!', 'Le rôle a été supprimé avec succès.', 'success');
        // Recharger les données après suppression
        fetchData(pagination.currentPage, pagination.pageSize, searchName);
      } catch (error) {
        Swal.fire('Erreur!', 'Une erreur est survenue lors de la suppression.', 'error');
      }
    }
  };

  const handleAddRole = async () => {
    const { value: roleName } = await Swal.fire({
      title: 'Ajouter un nouveau rôle',
      input: 'text',
      inputLabel: 'Nom du rôle',
      inputPlaceholder: 'Entrez le nom du rôle',
      showCancelButton: true,
      confirmButtonText: 'Enregistrer',
      cancelButtonText: 'Annuler',
      inputValidator: (value) => {
        if (!value) {
          return 'Le nom du rôle est requis!';
        }
      }
    });

    if (roleName) {
      try {
        await api.addRole({ name: roleName });
        Swal.fire('Succès!', 'Le rôle a été ajouté avec succès.', 'success');
        // Recharger les données après ajout
        fetchData(pagination.currentPage, pagination.pageSize, searchName);
      } catch (error) {
        Swal.fire('Erreur!', 'Une erreur est survenue lors de l\'ajout.', 'error');
      }
    }
  };

  // Charger les données initiales
  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize, searchName);
  }, []);

  return (
    <>
      <Card
        title="GESTION DES ROLES"
        addBouton={true}
        buttonText="Ajouter un rôle"
        onButtonClick={handleAddRole}
        icon={<FaPlus className="inline mr-1" />}
      >
        <div className="bg-gray-100 dark:bg-gray-800 pt-4 pb-2 px-4">
          <form onSubmit={handleSearch} className="space-y-3 md:space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-3">
                <label htmlFor="roleName" className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nom du rôle
                </label>
                <input
                  type="text"
                  id="roleName"
                  placeholder="Rechercher par nom de rôle"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 text-sm rounded-md bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                >
                  <FaSearch className="inline mr-1" />
                  Rechercher
                </button>

                {searchName && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-3 py-1 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600"
                  >
                    <FaTimes className="inline mr-1" />
                    Effacer
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
          </div>
        ) : (
          <BeautifulTable
            headers={[
              { label: "Nom du rôle", align: "left" },
              { label: "Nombre de profils associés", align: "center" },
              { label: "Actions", align: "center" }
            ]}
            data={rolesData.content}
            emptyMessage={searchName ? "Aucun rôle trouvé avec ce critère" : "Aucun rôle trouvé"}
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
                      onClick={() => showModalRoleProfiles(role, () => {
                        fetchData(pagination.currentPage, pagination.pageSize, searchName);
                      })}
                      size="sm"
                      variant="outline"
                      className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      title="Gérer les profils"
                    >
                      <FaUserPlus className="h-4 w-4" />
                    </Button>
                    <Button 
                      onClick={() => handleDeleteRole(role)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      title="Supprimer le rôle"
                    >
                      <FaTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            )}
          />
        )}
      </Card>
    </>
  );
}

export default RolePermission;