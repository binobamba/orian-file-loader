import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import React from 'react';
import { Toast } from '../../services/notification';
import { api } from '../../services/api';

const MySwal = withReactContent(Swal);

const showDemandeForm = () => {
  let fileType = '';
  let file = null;

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

            {!isBalanced && (
              <div className="text-red-600 text-sm mb-2">
                ⚠️ Le fichier n'est pas équilibré. Vous ne pouvez pas soumettre cette demande.
              </div>
            )}

            <div className="flex justify-center gap-4 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-500 text-white hover:bg-gray-600"
                onClick={() => Swal.close()}
              >
                Annuler
              </button>
              <button
                className={`px-4 py-2 rounded text-white ${
                  isBalanced ? 'bg-green-900 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!isBalanced}
                onClick={async () => {
                  if (!isBalanced) return;

                  Swal.showLoading();
                  try {
                    const response = await api.processFile(file, fileType);
                    if (String(response.data?.code) === "200") {
                      // Fermer tous les modals et afficher un message de succès
                      Swal.close();
                      Swal.fire({
                        title: 'Succès',
                        text: response.data?.message || 'La demande a été soumise avec succès.',
                        icon: 'success',
                        confirmButtonColor: '#166534',
                      });
                    } else {
                      Swal.hideLoading();
                      // Afficher un toast d'erreur sans fermer le modal
                      Swal.showValidationMessage(response.data?.message || 'Impossible de soumettre la demande.');
                    }
                  } catch (error) {
                    Swal.hideLoading();
                    // Afficher un toast d'erreur sans fermer le modal
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
    } else if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.close) {
      Swal.close();
    }
  });
};

export default showDemandeForm;