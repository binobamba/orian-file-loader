import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { api } from '../../services/api';

const MySwal = withReactContent(Swal);

const showModalRoleToUser = (user, allRoles, onSuccessCallback = null) => {
  let selectedRoles = user.roles?.map(role => role.role_id || role.id) || [];
  let currentAssignedPage = 1;
  let currentAvailablePage = 1;
  const itemsPerPage = 10;
  
  // Variables pour la recherche
  let assignedSearchTerm = '';
  let availableSearchTerm = '';

  const handleRoleToggle = (roleId) => {
    if (selectedRoles.includes(roleId)) {
      selectedRoles = selectedRoles.filter(id => id !== roleId);
    } else {
      selectedRoles = [...selectedRoles, roleId];
    }
    
    updateRoleTables();
  };

  const handleRemoveRole = (roleId) => {
    selectedRoles = selectedRoles.filter(id => id !== roleId);
    updateRoleTables();
  };

  const getFilteredRoles = (roles, searchTerm) => {
    if (!searchTerm) return roles;
    return roles.filter(role => 
      role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getPaginatedRoles = (roles, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return roles.slice(startIndex, endIndex);
  };

  const getTotalPages = (roles) => {
    return Math.ceil(roles.length / itemsPerPage);
  };

  const generateAssignedRolesHTML = () => {
    const assignedRoles = allRoles.filter(role => selectedRoles.includes(role.role_id || role.id));
    const filteredRoles = getFilteredRoles(assignedRoles, assignedSearchTerm);
    const paginatedRoles = getPaginatedRoles(filteredRoles, currentAssignedPage);
    const totalPages = getTotalPages(filteredRoles);
    
    if (filteredRoles.length === 0) {
      return `
        <tr>
          <td colSpan="2" class="p-3 text-center text-gray-500 text-sm dark:text-gray-400">
            ${assignedSearchTerm ? 'Aucun résultat trouvé' : 'Aucun rôle attribué'}
          </td>
        </tr>
      `;
    }

    let html = paginatedRoles.map(role => `
      <tr class="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
        <td class="p-2 text-sm dark:text-gray-200">${role.name}</td>
        <td class="p-2 text-center">
          <button
            data-role-id="${role.role_id || role.id}"
            data-action="remove"
            class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 remove-role-btn"
            title="Supprimer ce rôle"
          >
            <svg class="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');

    // Ajouter la pagination si nécessaire
    if (totalPages > 1) {
      html += `
        <tr>
          <td colspan="2" class="p-2 text-center">
            <div class="flex justify-center items-center space-x-2 text-sm">
              <button 
                class="pagination-btn px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-800 dark:text-gray-200" 
                data-table="assigned" 
                data-direction="prev"
                ${currentAssignedPage === 1 ? 'disabled' : ''}
              >
                Précédent
              </button>
              <span class="text-xs dark:text-gray-300">Page ${currentAssignedPage} / ${totalPages}</span>
              <button 
                class="pagination-btn px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-800 dark:text-gray-200" 
                data-table="assigned" 
                data-direction="next"
                ${currentAssignedPage === totalPages ? 'disabled' : ''}
              >
                Suivant
              </button>
            </div>
          </td>
        </tr>
      `;
    }

    return html;
  };

  const generateAvailableRolesHTML = () => {
    const availableRoles = allRoles.filter(role => !selectedRoles.includes(role.role_id || role.id));
    const filteredRoles = getFilteredRoles(availableRoles, availableSearchTerm);
    const paginatedRoles = getPaginatedRoles(filteredRoles, currentAvailablePage);
    const totalPages = getTotalPages(filteredRoles);
    
    if (filteredRoles.length === 0) {
      return `
        <tr>
          <td colSpan="2" class="p-3 text-center text-gray-500 text-sm dark:text-gray-400">
            ${availableSearchTerm ? 'Aucun résultat trouvé' : 'Aucun rôle disponible'}
          </td>
        </tr>
      `;
    }

    let html = paginatedRoles.map(role => `
      <tr class="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
        <td class="p-2 text-sm dark:text-gray-200">${role.name}</td>
        <td class="p-2 text-center">
          <button
            data-role-id="${role.role_id || role.id}"
            data-action="add"
            class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 add-role-btn"
            title="Ajouter ce rôle"
          >
            <svg class="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');

    // Ajouter la pagination si nécessaire
    if (totalPages > 1) {
      html += `
        <tr>
          <td colspan="2" class="p-2 text-center">
            <div class="flex justify-center items-center space-x-2 text-sm">
              <button 
                class="pagination-btn px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-800 dark:text-gray-200" 
                data-table="available" 
                data-direction="prev"
                ${currentAvailablePage === 1 ? 'disabled' : ''}
              >
                Précédent
              </button>
              <span class="text-xs dark:text-gray-300">Page ${currentAvailablePage} / ${totalPages}</span>
              <button 
                class="pagination-btn px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-800 dark:text-gray-200" 
                data-table="available" 
                data-direction="next"
                ${currentAvailablePage === totalPages ? 'disabled' : ''}
              >
                Suivant
              </button>
            </div>
          </td>
        </tr>
      `;
    }

    return html;
  };

  const handlePagination = (table, direction) => {
    if (table === 'assigned') {
      if (direction === 'next') {
        currentAssignedPage++;
      } else if (direction === 'prev') {
        currentAssignedPage--;
      }
    } else if (table === 'available') {
      if (direction === 'next') {
        currentAvailablePage++;
      } else if (direction === 'prev') {
        currentAvailablePage--;
      }
    }
    
    updateRoleTables();
  };

  const handleSearch = (table, searchTerm) => {
    if (table === 'assigned') {
      assignedSearchTerm = searchTerm;
      currentAssignedPage = 1;
    } else if (table === 'available') {
      availableSearchTerm = searchTerm;
      currentAvailablePage = 1;
    }
    
    updateRoleTables();
  };

  const attachEventListeners = () => {
    document.querySelectorAll('.remove-role-btn').forEach(btn => {
      btn.onclick = (e) => {
        const roleId = parseInt(e.currentTarget.getAttribute('data-role-id'));
        handleRemoveRole(roleId);
      };
    });

    document.querySelectorAll('.add-role-btn').forEach(btn => {
      btn.onclick = (e) => {
        const roleId = parseInt(e.currentTarget.getAttribute('data-role-id'));
        handleRoleToggle(roleId);
      };
    });

    document.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.onclick = (e) => {
        const table = e.currentTarget.getAttribute('data-table');
        const direction = e.currentTarget.getAttribute('data-direction');
        handlePagination(table, direction);
      };
    });

    // Écouteurs pour les champs de recherche
    const assignedSearchInput = document.getElementById('assigned-search');
    const availableSearchInput = document.getElementById('available-search');

    if (assignedSearchInput) {
      assignedSearchInput.oninput = (e) => {
        handleSearch('assigned', e.target.value);
      };
    }

    if (availableSearchInput) {
      availableSearchInput.oninput = (e) => {
        handleSearch('available', e.target.value);
      };
    }
  };

  const updateRoleTables = () => {
    const assignedRolesTable = document.getElementById('assigned-roles-table');
    const availableRolesTable = document.getElementById('available-roles-table');
    
    if (assignedRolesTable && availableRolesTable) {
      assignedRolesTable.innerHTML = generateAssignedRolesHTML();
      availableRolesTable.innerHTML = generateAvailableRolesHTML();
      attachEventListeners();
    }
  };

  const handleSubmit = async () => {
    try {
      // Afficher le chargement sans fermer le modal
      Swal.showLoading();
      
      const data = {
        matricule: user.matricule,
        roleIds: selectedRoles
      };

      // Appel API pour attribuer les rôles
      await api.attributeRolesToUser(data);
      
      // Cacher le chargement
      Swal.hideLoading();
      
      // Fermer le modal d'édition
      Swal.close();
      
      // Afficher le modal de succès avec bouton OK
      Swal.fire({
        title: 'Succès',
        text: 'Les rôles ont été modifiés avec succès',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });

      if (onSuccessCallback && typeof onSuccessCallback === 'function') {
        onSuccessCallback();
      }
      
      return true;
    } catch (error) {
      // Cacher le chargement en cas d'erreur mais garder le modal ouvert
      Swal.hideLoading();
      
      // Afficher l'erreur dans le modal sans le fermer
      Swal.showValidationMessage(
        error.message || 'Une erreur est survenue lors de la modification'
      );
      
      return false;
    }
  };

 MySwal.fire({
    title: `<span class="text-green-900 dark:text-gray-200 text-lg md:text-xl">Modification des rôles - ${user.firstName} ${user.lastName}</span>`,
    width: '70%',
    heightAuto: false,
    customClass: {
      popup: 'max-h-[90vh] h-auto overflow-hidden dark:bg-gray-800',
      htmlContainer: 'overflow-y-auto max-h-[calc(90vh-180px)]',
      validationMessage: 'mt-4 p-3 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg sticky bottom-16 z-10',
      actions: 'sticky bottom-0 bg-white dark:bg-gray-800 pt-3 border-t border-gray-200 dark:border-gray-700 z-20'
    },
    html: `
      <div class="text-left">
        <div class="bg-gray-50 dark:bg-gray-700 p-3 md:p-4 rounded-lg mb-3 md:mb-4">
          <h3 class="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base mb-2">INFORMATIONS DE L'UTILISATEUR</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
            <div class="text-gray-700 dark:text-gray-300"><span class="font-bold uppercase">Nom complet:</span> ${user.firstName.toUpperCase()} ${user.lastName.toUpperCase()}</div>
            <div class="text-gray-700 dark:text-gray-300"><span class="font-bold uppercase">Matricule:</span> ${(user.matricule || 'N/A').toUpperCase()}</div>
            <div class="text-gray-700 dark:text-gray-300"><span class="font-bold uppercase">Service:</span> ${(user.orionSheet?.service || 'N/A').toUpperCase()}</div>
            <div class="text-gray-700 dark:text-gray-300"><span class="font-bold uppercase">Profil:</span> ${(user.orionSheet?.profile || 'N/A').toUpperCase()}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <h4 class="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base mb-2 md:mb-3">Rôles attribués (${allRoles.filter(role => selectedRoles.includes(role.role_id || role.id)).length})</h4>
            <div class="mb-2">
              <input 
                type="text" 
                id="assigned-search" 
                placeholder="Rechercher dans les rôles attribués..." 
                class="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div class="border rounded-lg overflow-hidden max-h-[180px] md:max-h-[200px] overflow-y-auto">
              <table class="w-full">
                <thead class="bg-gray-100 dark:bg-gray-600 sticky top-0">
                  <tr>
                    <th class="p-2 text-left text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">Rôle</th>
                    <th class="p-2 text-center text-xs md:text-sm font-semibold w-12 md:w-16 text-gray-800 dark:text-gray-200">Action</th>
                  </tr>
                </thead>
                <tbody id="assigned-roles-table">
                  ${generateAssignedRolesHTML()}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base mb-2 md:mb-3">Rôles disponibles (${allRoles.filter(role => !selectedRoles.includes(role.role_id || role.id)).length})</h4>
            <div class="mb-2">
              <input 
                type="text" 
                id="available-search" 
                placeholder="Rechercher dans les rôles disponibles..." 
                class="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div class="border rounded-lg overflow-hidden max-h-[180px] md:max-h-[200px] overflow-y-auto">
              <table class="w-full">
                <thead class="bg-gray-100 dark:bg-gray-600 sticky top-0">
                  <tr>
                    <th class="p-2 text-left text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200">Rôle</th>
                    <th class="p-2 text-center text-xs md:text-sm font-semibold w-12 md:w-16 text-gray-800 dark:text-gray-200">Action</th>
                  </tr>
                </thead>
                <tbody id="available-roles-table">
                  ${generateAvailableRolesHTML()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Valider les modifications',
    confirmButtonColor: '#085120ff',
    cancelButtonText: 'Annuler',
    showCloseButton: true,
    allowOutsideClick: () => !Swal.isLoading(),
    allowEscapeKey: false,
    backdrop: true,
    didOpen: () => {
      attachEventListeners();
    },
    preConfirm: handleSubmit
  });
};

export default showModalRoleToUser;