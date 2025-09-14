import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaTrash, FaPlus } from 'react-icons/fa';
import { api } from '../../services/api';

const MySwal = withReactContent(Swal);

const showModalRoleToUser = (user, allRoles, onSuccessCallback = null) => {
  let selectedRoles = user.roles?.map(role => role.role_id || role.id) || [];

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

  const updateRoleTables = () => {
    const assignedRolesTable = document.getElementById('assigned-roles-table');
    const availableRolesTable = document.getElementById('available-roles-table');
    
    if (assignedRolesTable && availableRolesTable) {
      assignedRolesTable.innerHTML = generateAssignedRolesHTML();
      availableRolesTable.innerHTML = generateAvailableRolesHTML();
      attachEventListeners();
    }
  };

  const generateAssignedRolesHTML = () => {
    const assignedRoles = allRoles.filter(role => selectedRoles.includes(role.role_id || role.id));
    
    if (assignedRoles.length === 0) {
      return `
        <tr>
          <td colSpan="2" class="p-3 text-center text-gray-500 text-sm">
            Aucun rôle attribué
          </td>
        </tr>
      `;
    }

    return assignedRoles.map(role => `
      <tr class="border-t hover:bg-gray-50">
        <td class="p-2 text-sm">${role.name}</td>
        <td class="p-2 text-center">
          <button
            data-role-id="${role.role_id || role.id}"
            data-action="remove"
            class="text-red-600 hover:text-red-800 p-1 remove-role-btn"
            title="Supprimer ce rôle"
          >
            <svg class="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');
  };

  const generateAvailableRolesHTML = () => {
    const availableRoles = allRoles.filter(role => !selectedRoles.includes(role.role_id || role.id));
    
    return availableRoles.map(role => `
      <tr class="border-t hover:bg-gray-50">
        <td class="p-2 text-sm">${role.name}</td>
        <td class="p-2 text-center">
          <button
            data-role-id="${role.role_id || role.id}"
            data-action="add"
            class="text-green-600 hover:text-green-800 p-1 add-role-btn"
            title="Ajouter ce rôle"
          >
            <svg class="inline h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </td>
      </tr>
    `).join('');
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
  };

  const handleSubmit = async () => {
    try {
      const result = await MySwal.fire({
        title: 'Confirmer la modification',
        text: 'Êtes-vous sûr de vouloir modifier les rôles de cet utilisateur ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, modifier',
        cancelButtonText: 'Annuler'
      });

      if (result.isConfirmed) {
        Swal.showLoading();
        
        const data = {
          matricule: user.matricule,
          roleIds: selectedRoles
        };

        await api.attributeRolesToUser(data);
        
        Swal.hideLoading();
        
        Swal.fire({
          title: 'Succès',
          text: 'Les rôles ont été modifiés avec succès',
          icon: 'success',
          confirmButtonColor: '#3085d6'
        });

        if (onSuccessCallback) {
          onSuccessCallback();
        }
        
        return true;
      }
      return false;
    } catch (error) {
      Swal.hideLoading();
      Swal.fire({
        title: 'Erreur',
        text: error.message || 'Une erreur est survenue lors de la modification',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
      return false;
    }
  };

  MySwal.fire({
    title: `Modification des rôles - ${user.firstName} ${user.lastName}`,
    width: '80%',
    html: `
      <div class="text-left">
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 class="font-semibold text-gray-800 mb-2">Informations de l'utilisateur</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div><span class="font-medium">Nom complet:</span> ${user.firstName} ${user.lastName}</div>
            <div><span class="font-medium">Matricule:</span> ${user.matricule || 'N/A'}</div>
            <div><span class="font-medium">Service:</span> ${user.orionSheet?.service || 'N/A'}</div>
            <div><span class="font-medium">Profil:</span> ${user.orionSheet?.profile || 'N/A'}</div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Rôles attribués</h4>
            <div class="border rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="p-2 text-left text-sm font-semibold">Rôle</th>
                    <th class="p-2 text-center text-sm font-semibold w-16">Action</th>
                  </tr>
                </thead>
                <tbody id="assigned-roles-table">
                  ${generateAssignedRolesHTML()}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 class="font-semibold text-gray-800 mb-3">Rôles disponibles</h4>
            <div class="border rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-100">
                  <tr>
                    <th class="p-2 text-left text-sm font-semibold">Rôle</th>
                    <th class="p-2 text-center text-sm font-semibold w-16">Action</th>
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
    confirmButtonColor: '#3085d6',
    cancelButtonText: 'Annuler',
    showCloseButton: true,
    allowOutsideClick: () => !Swal.isLoading(),
    didOpen: () => {
      attachEventListeners();
    },
    preConfirm: handleSubmit
  });
};

export default showModalRoleToUser;