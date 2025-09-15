import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { api } from '../../services/api';
import { FaPlus, FaTrash, FaSearch, FaTimes } from 'react-icons/fa';

const MySwal = withReactContent(Swal);

const showModalRoleProfiles = (role, onSuccessCallback = null) => {
  let selectedProfiles = role.profiles ? [...role.profiles] : [];
  let currentAssignedPage = 1;
  let currentAvailablePage = 1;
  let assignedSearchTerm = '';
  let availableSearchTerm = '';
  const itemsPerPage = 10;

  // Variables pour la pagination des profils disponibles
  let availableProfilesData = {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  };

  const handleProfileToggle = (profile) => {
    if (selectedProfiles.some(p => p.id === profile.id)) {
      selectedProfiles = selectedProfiles.filter(p => p.id !== profile.id);
    } else {
      selectedProfiles = [...selectedProfiles, profile];
    }
    
    updateProfileTables();
  };

  const handleRemoveProfile = (profileId) => {
    selectedProfiles = selectedProfiles.filter(p => p.id !== profileId);
    updateProfileTables();
  };

  const getFilteredProfiles = (profiles, searchTerm) => {
    if (!searchTerm) return profiles;
    return profiles.filter(profile => 
      profile.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getPaginatedProfiles = (profiles, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return profiles.slice(startIndex, endIndex);
  };

  const getTotalPages = (profiles) => {
    return Math.ceil(profiles.length / itemsPerPage);
  };

  const generateAssignedProfilesHTML = () => {
    const filteredProfiles = getFilteredProfiles(selectedProfiles, assignedSearchTerm);
    const paginatedProfiles = getPaginatedProfiles(filteredProfiles, currentAssignedPage);
    const totalPages = getTotalPages(filteredProfiles);
    
    if (filteredProfiles.length === 0) {
      return `
        <tr>
          <td colSpan="2" class="p-3 text-center text-gray-500 text-sm dark:text-gray-400">
            ${assignedSearchTerm ? 'Aucun résultat trouvé' : 'Aucun profil attribué'}
          </td>
        </tr>
      `;
    }

    let html = paginatedProfiles.map(profile => `
      <tr class="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
        <td class="p-2 text-sm dark:text-gray-200">
          <div class="font-medium">${profile.libelle}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${profile.code}</div>
        </td>
        <td class="p-2 text-center">
          <button
            data-profile-id="${profile.id}"
            data-action="remove"
            class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 remove-profile-btn"
            title="Retirer ce profil"
          >
            <svg class="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');

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

  const generateAvailableProfilesHTML = () => {
    const availableProfiles = availableProfilesData.content.filter(profile => 
      !selectedProfiles.some(p => p.id === profile.id)
    );
    const filteredProfiles = getFilteredProfiles(availableProfiles, availableSearchTerm);
    const paginatedProfiles = getPaginatedProfiles(filteredProfiles, currentAvailablePage);
    const totalPages = getTotalPages(filteredProfiles);
    
    if (filteredProfiles.length === 0) {
      return `
        <tr>
          <td colSpan="2" class="p-3 text-center text-gray-500 text-sm dark:text-gray-400">
            ${availableSearchTerm ? 'Aucun résultat trouvé' : 'Aucun profil disponible'}
          </td>
        </tr>
      `;
    }

    let html = paginatedProfiles.map(profile => `
      <tr class="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
        <td class="p-2 text-sm dark:text-gray-200">
          <div class="font-medium">${profile.libelle}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${profile.code}</div>
        </td>
        <td class="p-2 text-center">
          <button
            data-profile-id="${profile.id}"
            data-action="add"
            class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1 add-profile-btn"
            title="Ajouter ce profil"
          >
            <svg class="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');

    if (availableProfilesData.totalPages > 1) {
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
              <span class="text-xs dark:text-gray-300">Page ${currentAvailablePage} / ${availableProfilesData.totalPages}</span>
              <button 
                class="pagination-btn px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:opacity-50 text-gray-800 dark:text-gray-200" 
                data-table="available" 
                data-direction="next"
                ${currentAvailablePage === availableProfilesData.totalPages ? 'disabled' : ''}
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

  const handlePagination = async (table, direction) => {
    if (table === 'assigned') {
      if (direction === 'next') {
        currentAssignedPage++;
      } else if (direction === 'prev') {
        currentAssignedPage--;
      }
      updateProfileTables();
    } else if (table === 'available') {
      if (direction === 'next') {
        currentAvailablePage++;
      } else if (direction === 'prev') {
        currentAvailablePage--;
      }
      // Pour les profils disponibles, on doit refaire une requête API
      await fetchAvailableProfiles(currentAvailablePage, availableSearchTerm);
    }
  };

  const handleSearch = async (table, searchTerm) => {
    if (table === 'assigned') {
      assignedSearchTerm = searchTerm;
      currentAssignedPage = 1;
      updateProfileTables();
    } else if (table === 'available') {
      availableSearchTerm = searchTerm;
      currentAvailablePage = 1;
      // Pour les profils disponibles, on doit refaire une requête API
      await fetchAvailableProfiles(currentAvailablePage, searchTerm);
    }
  };

  const fetchAvailableProfiles = async (page = 1, codeSearch = '') => {
      availableProfilesData = await api.getProfile({
        code: codeSearch,
        page: page - 1,
        size: itemsPerPage
      });
     updateProfileTables();
  };

  const updateProfileTables = () => {
    const assignedProfilesTable = document.getElementById('assigned-profiles-table');
    const availableProfilesTable = document.getElementById('available-profiles-table');
    
    if (assignedProfilesTable) {
      assignedProfilesTable.innerHTML = generateAssignedProfilesHTML();
    }
    
    if (availableProfilesTable) {
      availableProfilesTable.innerHTML = generateAvailableProfilesHTML();
    }
    
    attachEventListeners();
  };

  const attachEventListeners = () => {
    document.querySelectorAll('.remove-profile-btn').forEach(btn => {
      btn.onclick = (e) => {
        const profileId = parseInt(e.currentTarget.getAttribute('data-profile-id'));
        handleRemoveProfile(profileId);
      };
    });

    document.querySelectorAll('.add-profile-btn').forEach(btn => {
      btn.onclick = async (e) => {
        const profileId = parseInt(e.currentTarget.getAttribute('data-profile-id'));
        const profile = availableProfilesData.content.find(p => p.id === profileId);
        if (profile) {
          handleProfileToggle(profile);
        }
      };
    });

    document.querySelectorAll('.pagination-btn').forEach(btn => {
      btn.onclick = async (e) => {
        const table = e.currentTarget.getAttribute('data-table');
        const direction = e.currentTarget.getAttribute('data-direction');
        await handlePagination(table, direction);
      };
    });

    const assignedSearchInput = document.getElementById('assigned-search');
    const availableSearchInput = document.getElementById('available-search');

    if (assignedSearchInput) {
      assignedSearchInput.oninput = (e) => {
        handleSearch('assigned', e.target.value);
      };
    }

    if (availableSearchInput) {
      // Utiliser un debounce pour éviter de faire une requête à chaque frappe
      let timeout;
      availableSearchInput.oninput = (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          handleSearch('available', e.target.value);
        }, 500);
      };
    }
  };

  const handleSubmit = async () => {
    try {
      Swal.showLoading();
      
      const profileIds = selectedProfiles.map(profile => profile.id);
      const data = {
        roleId: role.role_id,
        profileIds: profileIds
      };

      await api.assignProfilesToRole(data);
      
      Swal.hideLoading();
      Swal.close();
      
      Swal.fire({
        title: 'Succès',
        text: 'Les profils ont été modifiés avec succès',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });

      if (onSuccessCallback && typeof onSuccessCallback === 'function') {
        onSuccessCallback();
      }
      
      return true;
    } catch (error) {
      Swal.hideLoading();
      Swal.showValidationMessage(
        error.message || 'Une erreur est survenue lors de la modification'
      );
      
      return false;
    }
  };

  const openModal = async () => {
    // Charger les premiers profils disponibles
    await fetchAvailableProfiles(currentAvailablePage, availableSearchTerm);
    
    MySwal.fire({
      title: `<span class="text-xl font-bold dark:text-gray-200">Gestion des profils - ${role.name}</span>`,
      width: '80%',
      heightAuto: false,
      customClass: {
        popup: 'max-h-[90vh] h-auto overflow-hidden dark:bg-gray-800',
        htmlContainer: 'overflow-y-auto max-h-[calc(90vh-180px)]',
        validationMessage: 'mt-4 p-3 bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200 rounded-lg sticky bottom-16 z-10',
        actions: 'sticky bottom-0 bg-white dark:bg-gray-800 pt-3 border-t border-gray-200 dark:border-gray-700 z-20'
      },
      html: `
        <div class="text-left">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-gray-800 dark:text-gray-200 text-base mb-3">Profils attribués (${selectedProfiles.length})</h4>
              <div class="mb-2">
                <input 
                  type="text" 
                  id="assigned-search" 
                  placeholder="Rechercher dans les profils attribués..." 
                  class="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div class="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <table class="w-full">
                  <thead class="bg-gray-100 dark:bg-gray-600 sticky top-0">
                    <tr>
                      <th class="p-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">Profil</th>
                      <th class="p-2 text-center text-sm font-semibold w-16 text-gray-800 dark:text-gray-200">Action</th>
                    </tr>
                  </thead>
                  <tbody id="assigned-profiles-table">
                    ${generateAssignedProfilesHTML()}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 class="font-semibold text-gray-800 dark:text-gray-200 text-base mb-3">Profils disponibles (${availableProfilesData.totalElements})</h4>
              <div class="mb-2">
                <input 
                  type="text" 
                  id="available-search" 
                  placeholder="Rechercher par code de profil..." 
                  class="w-full p-2 text-sm border border-gray-300 rounded-md dark:bg-gray-600 dark:text-white dark:border-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div class="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <table class="w-full">
                  <thead class="bg-gray-100 dark:bg-gray-600 sticky top-0">
                    <tr>
                      <th class="p-2 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">Profil</th>
                      <th class="p-2 text-center text-sm font-semibold w-16 text-gray-800 dark:text-gray-200">Action</th>
                    </tr>
                  </thead>
                  <tbody id="available-profiles-table">
                    ${generateAvailableProfilesHTML()}
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

  openModal();
};

export default showModalRoleProfiles;