import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSave, FaSearch } from 'react-icons/fa';
import { api } from './../services/api';
import {
  BeautifulTable,
  usePagination
} from '../components/my-ui/Table';
import { Button } from '../components/my-ui/Button';
import { Card } from '../components/my-ui/Card';
import { Row, Col } from 'antd';

export default function UserRole() {
  const [usersData, setUsersData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  });
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // États pour les champs de recherche
  const [searchFirstName, setSearchFirstName] = useState('');
  const [searchLastName, setSearchLastName] = useState('');
  const [searchMatricule, setSearchMatricule] = useState('');

  const pagination = usePagination(1, 10);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles.map((role) => role.role_id || role.id));
  };

  const handleRoleChange = (event) => {
    const { name, checked } = event.target;
    const roleId = parseInt(name);
    const updatedRoles = checked
      ? [...selectedRoles, roleId]
      : selectedRoles.filter((id) => id !== roleId);
    setSelectedRoles(updatedRoles);
  };

  const handleSave = async () => {
    const data = {
      userId: selectedUser.id,
      roles: selectedRoles,
    };
    await api.attributeRolesToUser(data);
    await fetchData();
    setSelectedUser(null);
    setSelectedRoles([]);
  };

  const fetchData = async (page = 1, size = 10, filters = {}) => {
    setLoading(true);
    try {
      const usersResponse = await api.getUsers({
        firstName: filters.firstName || '',
        lastName: filters.lastName || '',
        matricule: filters.matricule || '',
        page: page - 1,
        size: size
      });
      
      const rolesResponse = await api.getRoles();
      
      console.log("usersResponse", usersResponse);
      console.log("rolesResponse", rolesResponse);
      
      setUsersData(usersResponse.data);
      setRoles(rolesResponse.data.content || rolesResponse.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
    } finally {
      setLoading(false);
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

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
    fetchData(1, pagination.pageSize, {
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

  useEffect(() => {
    fetchData(pagination.currentPage, pagination.pageSize, {
      firstName: searchFirstName,
      lastName: searchLastName,
      matricule: searchMatricule
    });
  }, [pagination.currentPage, pagination.pageSize]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await api.deleteUser(userId);
        await fetchData(pagination.currentPage, pagination.pageSize, {
          firstName: searchFirstName,
          lastName: searchLastName,
          matricule: searchMatricule
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  return (
    <>
      <Card
        title="GESTION DES UTILISATEURS"
        // addBouton={true}
        buttonText="Ajouter un utilisateur"
        onButtonClick={() => navigate('/ajouter-utilisateur')} 
        icon={<FaPlus className="inline mr-1" />}
      >
        {/* Barre de recherche avancée */}
        <div className=" bg-gray-100 dark:bg-gray-800  pt-4 pb-2 px-4 ">
                <form onSubmit={handleSearch} className="space-y-3 md:space-y-0">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    {/* Champ prénom */}
                    <div>
                        <label
                        htmlFor="firstName"
                        className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                        Prénom
                        </label>
                        <input
                        type="text"
                        id="firstName"
                        placeholder="Prénom"
                        value={searchFirstName}
                        onChange={(e) => setSearchFirstName(e.target.value)}
                        className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Champ nom */}
                    <div>
                        <label
                        htmlFor="lastName"
                        className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                        Nom
                        </label>
                        <input
                        type="text"
                        id="lastName"
                        placeholder="Nom"
                        value={searchLastName}
                        onChange={(e) => setSearchLastName(e.target.value)}
                        className="block w-full px-2 py-1 text-md border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Champ matricule */}
                    <div>
                        <label
                        htmlFor="matricule"
                        className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                        Matricule
                        </label>
                        <input
                        type="text"
                        id="matricule"
                        placeholder="Matricule"
                        value={searchMatricule}
                        onChange={(e) => setSearchMatricule(e.target.value)}
                        className="block w-full px-2 py-1 text-md border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    </div>

                    {/* Boutons */}
                    <div className="flex gap-2">
                        <button
                        type="submit"
                        className="px-3 py-1 text-md rounded-md bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        >
                        <FaSearch className="inline mr-1" />
                        Rechercher
                        </button>

                        {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={handleClearSearch}
                            className="px-3 py-1 text-md rounded-md bg-gray-500 text-white hover:bg-gray-600"
                        >
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
                  <div className="flex flex-wrap gap-1">
                    {user.roles?.map((role, index) => (
                      <span
                        key={role.role_id || role.id || index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200"
                      >
                        {role.name}
                      </span>
                    )) || "Aucun rôle"}
                  </div>
                </td>
                <td className="p-2 sm:p-3 text-center text-xs sm:text-sm">
                  <div className="flex space-x-1 justify-center text-center">
                    <Button 
                      onClick={() => handleUserSelect(user)}
                      size="sm"
                      variant="outline"
                      className="text-xs px-2 py-1"
                      title="Modifier les rôles"
                    >
                      <FaEdit className="inline h-4 w-4" />
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