import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import React from 'react';
import { api } from '../../services/api';

const MySwal = withReactContent(Swal);

const ShowAddModalRole = () => {
  let roleName = '';

  MySwal.fire({
    title: (
      <span className="text-green-900 font-bold text-lg sm:text-xl md:text-2xl">
        Ajouter un nouveau rôle
      </span>
    ),
    width: '50%',
    html: (
      <div className="flex flex-col gap-4 text-left">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Nom du rôle
        </label>
        <input
          type="text"
          placeholder="Entrez le nom du rôle"
          className="p-2 border border-gray-300 rounded w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          onChange={(e) => {
            roleName = e.target.value;
            if (roleName.trim()) {
              Swal.resetValidationMessage();
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && roleName.trim()) {
              Swal.clickConfirm();
            }
          }}
        />
      </div>
    ),
    showCancelButton: true,
    confirmButtonText: 'Enregistrer',
    confirmButtonColor: 'rgba(9, 68, 29, 1)',
    cancelButtonText: 'Annuler',
    showCloseButton: true,
    allowOutsideClick: () => false,
    allowEscapeKey: false,
    preConfirm: async () => {
      if (!roleName || !roleName.trim()) {
        Swal.showValidationMessage('Le nom du rôle est requis !');
        return false;
      }

      try {
        Swal.showLoading();
        await api.addRole({ name: roleName.trim() });
        Swal.hideLoading();
        return true;
      } catch (error) {
        Swal.hideLoading();
        Swal.showValidationMessage(
          error.message || 'Une erreur est survenue lors de l\'ajout du rôle.'
        );
        return false;
      }
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      // Succès - afficher un message de confirmation
      Swal.fire({
        title: 'Succès !',
        text: 'Le rôle a été ajouté avec succès.',
        icon: 'success',
        confirmButtonColor: 'rgba(9, 68, 29, 1)',
        confirmButtonText: 'OK'
      }).then(() => {
        // Recharger la page ou rafraîchir les données si nécessaire
        window.location.reload(); // Ou une autre logique de rafraîchissement
      });
    } else if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.close) {
      // L'utilisateur a annulé ou fermé le modal
      Swal.close();
    }
  });
};

export default ShowAddModalRole;