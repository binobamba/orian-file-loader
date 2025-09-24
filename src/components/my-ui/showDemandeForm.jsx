import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import React from 'react';
import { Toast } from '../../services/notification';
import { api } from '../../services/api';
import { FaCheckCircle } from "react-icons/fa";

const MySwal = withReactContent(Swal);

export const showDemandeForm = () => {
  let fileType = '';
  let file = null;

  // Fonction pour fermer tous les modals
  const closeAllModals = () => {
    Swal.close();
  };

  const showMainModal = () => {
    MySwal.fire({
      title: (
        <span className="text-green-900 font-bold text-lg sm:text-xl md:text-2xl">
          Nouvelle Demande
        </span>
      ),
      width: '50%',
      html: (
        <div className="flex flex-col gap-4 text-left">
          <label className="text-sm font-semibold text-gray-700">Type de fichier</label>
          <select
            className="p-2 border rounded w-full"
            onChange={(e) => (fileType = e.target.value)}
          >
            <option value="">SELECTIONNER UN TYPE DE FICHIER</option>
            <option value="FICHIER_TRAITEMENT_SALAIRE">FICHIER DE TRAITEMENT DES SALAIRES</option>
            <option value="FICHIER_TRAITEMENT_OPERATION">FICHIER DE TRAITEMENT DES OPERATIONS</option>
          </select>

          <label className="text-sm font-semibold text-gray-700">Fichier à uploader</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="p-2 border rounded w-full"
            onChange={(e) => {
              const selectedFile = e.target.files[0];
              if (selectedFile) {
                const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
                const allowedExtensions = ['xlsx', 'xls', 'csv'];
                
                if (!allowedExtensions.includes(fileExtension)) {
                  Swal.showValidationMessage('Type de fichier non supporté. Veuillez sélectionner un fichier Excel.');
                  e.target.value = '';
                  file = null;
                } else {
                  Swal.resetValidationMessage();
                }
                file = selectedFile;
              }
            }}
          />
        </div>
      ),
      showCancelButton: true,
      confirmButtonText: 'Analyser',
      confirmButtonColor: '#166534',
      showCloseButton: true,
      cancelButtonText: 'Annuler',
      allowOutsideClick: () => false,
      allowEscapeKey: false,
      preConfirm: async () => {
        if (!fileType || !file) {
          Swal.showValidationMessage('Veuillez remplir tous les champs.');
          return false;
        }
        try {
          Swal.showLoading();
          const result = await api.analyzeOperationFile(file, fileType);
          Swal.hideLoading();
          return result.data;
        } catch (error) {
          Swal.hideLoading();
          Swal.showValidationMessage(`Erreur: ${error.message || 'Une erreur est survenue pendant l\'analyse.'}`);
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const data = result.value;
        const isBalanced = data.isBalanced;

        // Afficher le modal de résultat
        showResultModal(data, isBalanced, file, fileType);
      } else if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.close) {
        closeAllModals();
      }
    });
  };

  // Fonction pour afficher le modal de résultat
  const showResultModal = (data, isBalanced, file, fileType) => {
    MySwal.fire({
      title: (
      <span className="text-green-900 font-bold text-lg sm:text-xl md:text-2xl">
        Résultat de l'analyse du fichier
      </span>
      ),
      html: (
      <div className="text-left flex flex-col items-center">
        <table className="table-auto w-full border border-gray-300 mb-4">
        <tbody>
          <tr>
          <td className="border px-2 py-1 font-semibold text-sm">Opération Total</td>
          <td className="border px-2 py-1 font-semibold text-sm">{String(data.totalOperation)}</td>
          </tr>
          <tr>
          <td className="border px-2 py-1 font-semibold text-sm">Taille du fichier</td>
          <td className="border px-2 py-1 font-semibold text-sm">{String(data.fileSize)} MB</td>
          </tr>
          <tr>
          <td className="border px-2 py-1 font-semibold text-sm">Total Débit</td>
          <td className="border px-2 py-1 font-semibold text-sm">{String(data.totalDebit)}</td>
          </tr>
          <tr>
          <td className="border px-2 py-1 font-semibold text-sm">Total Crédit</td>
          <td className="border px-2 py-1 font-semibold text-sm">{String(data.totaCredit)}</td>
          </tr>
        </tbody>
        </table>

        <div className="flex items-center gap-2 mb-2">
        {!isBalanced ? (
          <>
          <span className="text-red-600 text-sm">⚠️ Le fichier n'est pas équilibré.</span>
          </>
        ) : (
          <>
          <FaCheckCircle className="text-green-600" />
          <span className="text-green-600 text-sm">Le Fichier est équilibré</span>
          </>
        )}
        </div>

        <div className="flex justify-center gap-4 mt-4">
        <button
          className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
          onClick={() => closeAllModals()}
        >
          Annuler
        </button>
        <button
          className={`px-4 py-2 rounded text-white bg-green-900 hover:bg-green-700`}
          onClick={async () => {
          Swal.showLoading();
          try {
            const response = await api.processFile(file, fileType);
            if (String(response.data?.code) === "200") {
            closeAllModals();
            Swal.fire({
              title: 'Succès',
              text: response.data?.message || 'La demande a été soumise avec succès.',
              icon: 'success',
              confirmButtonColor: '#166534',
            });
            } else {
            Swal.hideLoading();
            Swal.showValidationMessage(response.data?.message || 'Impossible de soumettre la demande.');
            }
          } catch (error) {
            Swal.hideLoading();
            Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'error',
            title: error.message || 'Impossible de soumettre la demande.',
            showConfirmButton: false,
            timer: 3000
            });
          }
          }}
        >
          Soumettre
        </button>
        </div>
      </div>
      ),
      showConfirmButton: false,
      showCancelButton: false,
      width: '50%',
      allowOutsideClick: () => false,
      allowEscapeKey: false,
      willClose: () => { }
    });
  };
  showMainModal();
};