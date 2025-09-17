import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import {
  BeautifulTable,
  usePagination
} from '../components/my-ui/Table';
import { Button } from '../components/my-ui/Button';
import { Card } from '../components/my-ui/Card';
import showModalRoleToUser from '../components/my-ui/showModalRoleToUser';

export default function UserRole() {
  const [usersData, setUsersData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  });
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const navigate = useNavigate();

  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [searchMatricule, setSearchMatricule] = useState('');

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

  const handleEditUserRoles = (user) => {
    if (allRoles.length === 0) {
      fetchAllRoles().then(() => {
        showModalRoleToUser(user, allRoles, () => {
          fetchData(pagination.currentPage, pagination.pageSize, {
            firstName: searchFirstName,
            lastName: searchLastName,
            matricule: searchMatricule
          });
        });
      });
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Chargement des rôles en cours...',
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }
    
    showModalRoleToUser(user, allRoles, () => {
      fetchData(pagination.currentPage, pagination.pageSize, {
        firstName: searchFirstName,
        lastName: searchLastName,
        matricule: searchMatricule
      });
    });
  };

  const fetchData = useCallback(async (page = 1, size = 10, filters = {}) => {
    setLoading(true);
    try {
      const usersResponse = await api.getUsers({
        firstName: filters.firstName || '',
        lastName: filters.lastName || '',
        matricule: filters.matricule || '',
        page: page - 1,
        size: size
      });
      
      if (usersResponse && usersResponse.data) {
        setUsersData(usersResponse.data);
      } else {
        console.error("Format de réponse inattendu:", usersResponse);
        setUsersData({
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size: size
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      setUsersData({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 10
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllRoles = async () => {
    setLoadingRoles(true);
    try {
      let allRolesData = [];
      let currentPage = 0;
      let hasMore = true;

      while (hasMore) {
        const rolesResponse = await api.getRoles({
          page: currentPage,
          size: 100
        });

        if (rolesResponse && rolesResponse.data && rolesResponse.data.content) {
          allRolesData = [...allRolesData, ...rolesResponse.data.content];
          currentPage++;
          hasMore = currentPage < rolesResponse.data.totalPages;
        } else if (rolesResponse && rolesResponse.content) {
          allRolesData = [...allRolesData, ...rolesResponse.content];
          currentPage++;
          hasMore = currentPage < rolesResponse.totalPages;
        } else {
          hasMore = false;
        }
      }

      setAllRoles(allRolesData);
    } catch (error) {
      console.error("Erreur lors du chargement des rôles:", error);
      setAllRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handlePageChange = (page) => {
    pagination.goToPage(page);
    fetchData(page, pagination.pageSize, {
      firstName: searchFirstName,
      lastName: searchLastName,
      matricule: searchMatricule
    });
  };

  const handleClearSearch = () => {
    setSearchFirstName('');
    setSearchLastName('');
    setSearchMatricule('');
    pagination.goToPage(1);
    fetchData(1, pagination.pageSize, {});
  };

  const hasActiveFilters = searchFirstName || searchLastName || searchMatricule;

  // Recherche en temps réel avec debounce
  useEffect(() => {
    const debouncedFetch = debounce(() => {
      fetchData(1, pagination.pageSize, {
        firstName: searchFirstName,
        lastName: searchLastName,
        matricule: searchMatricule
      });
    }, 500);

    debouncedFetch();
  }, [searchFirstName, searchLastName, searchMatricule, fetchData, pagination.pageSize]);

  useEffect(() => {
    fetchAllRoles();
  }, []);

  const displayRoles = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return "Aucun rôle";
    
    const displayedRoles = userRoles.slice(0, 2);
    const remainingCount = userRoles.length - 2;
    
    return (
      <div className="flex flex-wrap gap-1">
        {displayedRoles.map((role, index) => (
          <span
            key={role.role_id || role.id || index}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200"
          >
            {role.name}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300">
            +{remainingCount}...
          </span>
        )}
      </div>
    );
  };

  return (
<div className="min-h-screen bg-gray-100 pr-5">
  <Card
    title="GESTION DES UTILISATEURS"
    buttonText="Ajouter un utilisateur"
    onButtonClick={() => navigate('/ajouter-utilisateur')} 
    icon={<FaPlus className="inline mr-1" />}
  >
    {/* Conteneur avec défilement et en-tête fixe */}
    <div className="h-[70vh] overflow-y-auto">
      
      {/* En-tête fixe */}
      <div className="sticky top-0 bg-white z-10 pt-4 pb-2 border-b shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* Champ recherche Prénom */}
          <div className="flex flex-col">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Prénom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                id="firstName"
                placeholder="Prénom"
                value={searchFirstName}
                onChange={(e) => setSearchFirstName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md 
                           bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                           focus:ring-green-800 focus:border-green-800 
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Champ recherche Nom */}
          <div className="flex flex-col">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nom
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                id="lastName"
                placeholder="Nom"
                value={searchLastName}
                onChange={(e) => setSearchLastName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md 
                           bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                           focus:ring-green-800 focus:border-green-800 
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          {/* Champ recherche Matricule */}
          <div className="flex flex-col">
            <label
              htmlFor="matricule"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Matricule
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                id="matricule"
                placeholder="Matricule"
                value={searchMatricule}
                onChange={(e) => setSearchMatricule(e.target.value)}
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
                <div className="h-full overflow-max">
                  <BeautifulTable
                    headers={[
                      { label: "Nom complet", align: "left" },
                      { label: "Matricule", align: "left" },
                      { label: "Service", align: "left" },
                      { label: "Rôles", align: "left" },
                      { label: "Actions", align: "center" }
                    ]}
                    data={usersData.content}
                    emptyMessage={hasActiveFilters ? "Aucun utilisateur trouvé avec ces critères" : "Aucun utilisateur trouvé"}
                    pagination={{
                      currentPage: usersData.number + 1,
                      totalPages: usersData.totalPages,
                      totalElements: usersData.totalElements,
                      pageSize: usersData.size,
                      onPageChange: handlePageChange
                    }}
                    renderRow={(user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                          <div className="flex flex-col">
                            <span className="font-medium">{user.firstName} {user.lastName}</span>
                            {user.orionSheet?.profile && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {user.orionSheet.profile}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                          {user.matricule || "N/A"}
                        </td>
                        <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                          {user.orionSheet?.service || "N/A"}
                        </td>
                        <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                          {displayRoles(user.roles)}
                        </td>
                        <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                          <div className="flex space-x-1 justify-center text-center">
                            <Button 
                              onClick={() => handleEditUserRoles(user)}
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1"
                              title="Modifier les rôles"
                              disabled={loadingRoles}
                            >
                              <FaEdit className="inline h-4 w-4" />
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