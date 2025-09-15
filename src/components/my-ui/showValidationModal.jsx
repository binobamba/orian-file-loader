import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import React from 'react';
import { api } from '../../services/api';
import { Toast } from '../../services/notification';

const MySwal = withReactContent(Swal);

const showValidationModal = (demande, onSuccessCallback = null) => {
  MySwal.fire({
    title: (
      <span className="text-green-900 font-bold text-sm sm:text-base md:text-lg">
        Validation de Demande
      </span>
    ),
    width: '50%',
    customClass: {
      popup: 'max-h-[90vh] overflow-y-auto'
    },
    html: (
      <div className="text-left flex flex-col gap-2 ">
  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 text-center">
    DÉTAILS DE LA DEMANDE
  </h3>
  
  <div className="overflow-hidden rounded-lg shadow-sm border border-gray-200 text-xs sm:text-sm">
   <div className="overflow-x-auto w-full">
  <table className="w-full min-w-[600px]">
    <tbody>
      <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
        <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 w-1/4 text-xs uppercase">ID</td>
        <td className="px-2 py-1 text-center sm:px-3 sm:py-2 text-gray-900 font-mono text-xs truncate max-w-[120px] sm:max-w-[200px]">
          {demande.id || 'N/A'}
        </td>
      </tr>
      
      <tr className="bg-white">
        <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 text-xs uppercase">RÉFÉRENCE</td>
        <td className="px-2 py-1 text-center sm:px-3 sm:py-2 text-blue-600 font-medium text-xs sm:text-sm">
          {demande.reference || 'N/A'}
        </td>
      </tr>

      <tr className="bg-gray-50">
        <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 text-xs uppercase">STATUT INTÉGRATION</td>
        <td className="px-2 py-1 sm:px-3 sm:py-2 text-center">
          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
            demande.integrationStatus === 'EN_TRAITEMENT' ? 'bg-blue-100 text-blue-800' :
            demande.integrationStatus === 'INTEGREE' ? 'bg-green-100 text-green-800' :
            demande.integrationStatus === 'REJETEE' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {demande.integrationStatus || 'N/A'}
          </span>
        </td>
      </tr>

      <tr className="bg-white">
        <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 text-xs uppercase">STATUT OPÉRATION</td>
        <td className="px-2 py-1 sm:px-3 sm:py-2 text-center">
          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${
            demande.operationStatus === 'VALIDE' ? 'bg-green-100 text-green-800' :
            demande.operationStatus === 'NON_VALIDEE' ? 'bg-yellow-100 text-yellow-800' :
            demande.operationStatus === 'REJETEE' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {demande.operationStatus || 'N/A'}
          </span>
        </td>
      </tr>

      <tr className="bg-gray-50">
        <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 text-xs uppercase">DÉBIT</td>
        <td className="px-2 py-1 text-center sm:px-3 sm:py-2 text-red-600 font-semibold text-xs sm:text-sm">
          {demande.debitAmount ? `${new Intl.NumberFormat('fr-FR').format(demande.debitAmount)} FCFA` : 'N/A'}
        </td>
      </tr>

      <tr className="bg-white">
        <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 text-xs uppercase">CRÉDIT</td>
        <td className="px-2 py-1 text-center sm:px-3 sm:py-2 text-green-600 font-semibold text-xs sm:text-sm">
          {demande.creditAmount ? `${new Intl.NumberFormat('fr-FR').format(demande.creditAmount)} FCFA` : 'N/A'}
        </td>
      </tr>

      <tr className="bg-gray-50">
        <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 text-xs uppercase">DATE DEMANDE</td>
        <td className="px-2 py-1 text-center sm:px-3 sm:py-2 text-xs sm:text-sm">
          {demande.createdAt ? new Date(demande.createdAt).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'N/A'}
        </td>
      </tr>

      <tr className="bg-white">
        <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 text-xs uppercase">DATE VALIDATION</td>
        <td className="px-2 py-1 text-center sm:px-3 sm:py-2 text-xs sm:text-sm">
          {demande.validatedAt ? new Date(demande.validatedAt).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'NON VALIDÉE'}
        </td>
      </tr>

      <tr className="bg-gray-50">
        <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 text-xs uppercase">DEMANDER PAR</td>
        <td className="px-2 py-1 text-center sm:px-3 sm:py-2 text-xs sm:text-sm">
          {demande.createdBy ? 
            `${demande.createdBy.firstName} ${demande.createdBy.lastName}` : 
            'N/A'
          }
        </td>
      </tr>

      {demande.validatedBy && (
        <tr className="bg-white">
          <td className="px-2 py-1 sm:px-3 sm:py-2 font-semibold text-gray-700 text-xs uppercase">VALIDÉ PAR</td>
          <td className="px-2 py-1 text-center sm:px-3 sm:py-2 text-xs sm:text-sm">
            {`${demande.validatedBy.firstName} ${demande.validatedBy.lastName}`}
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
  </div>
</div>
    ),
    showCancelButton: true,
    confirmButtonText: 'Valider',
    confirmButtonColor: '#166534',
    cancelButtonText: 'Annuler',
    showCloseButton: true,
    allowOutsideClick: () => false,
    allowEscapeKey: false,
    preConfirm: async () => {
      try {
        Swal.showLoading();
        const result = await api.validIntegrationRequest(demande?.id);
        
        if (result.status === 200 || String(result.data?.code) === "200") {
          Swal.hideLoading();
          Swal.resetValidationMessage();
          return result.data;
        } else {
          Swal.showValidationMessage( `Erreur: ${result.data?.message || 'Impossible de valider la demande.'}`);
          Swal.hideLoading();
          return false;
        }
      } catch (error) {
        Swal.hideLoading();
        Swal.showValidationMessage( `Erreur: ${error.message || 'Une erreur est survenue.'}`);
        return false;
      }
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      Swal.close();
      
      Swal.fire({
        title: "DEMANDE VALIDÉE!",
        text: "La demande a été validée avec succès.",
        icon: "success"
      });

      if (onSuccessCallback && typeof onSuccessCallback === 'function') {
        onSuccessCallback(demande.id);
      }
    } else if (result.dismiss === Swal.DismissReason.cancel || result.dismiss === Swal.DismissReason.close) {
      Swal.close();
    }
  });
};

export  {showValidationModal};