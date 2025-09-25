import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import React from 'react';
import { api } from '../../services/api';
import { Table,Tag } from 'antd';

const MySwal = withReactContent(Swal);

const showValidationModal = (demande, onSuccessCallback = null) => {
  

const formatMontant = (montant) =>
    montant ? `${new Intl.NumberFormat('fr-FR').format(montant)} FCFA` : 'N/A';

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';

  const getStatusTag = (status, type) => {
    let color = 'default';
    if (type === 'integration') {
      color = status === 'EN_TRAITEMENT' ? 'blue' :
              status === 'INTEGREE' ? 'green' :
              status === 'REJETEE' ? 'red' : 'gray';
    } else if (type === 'operation') {
      color = status === 'VALIDE' ? 'green' :
              status === 'NON_VALIDEE' ? 'gold' :
              status === 'REJETEE' ? 'red' : 'gray';
    }
    return <Tag color={color}>{status || 'N/A'}</Tag>;
  };


const dataSource = [
    { key: 'id', label: 'ID', value: demande.id || 'N/A' },
    { key: 'reference', label: 'RÉFÉRENCE', value: demande.reference || 'N/A' },
    { key: 'integrationStatus', label: 'STATUT INTÉGRATION', value: getStatusTag(demande.integrationStatus, 'integration') },
    { key: 'operationStatus', label: 'STATUT OPÉRATION', value: getStatusTag(demande.operationStatus, 'operation') },
    { key: 'debitAmount', label: 'DÉBIT', value: formatMontant(demande.debitAmount) },
    { key: 'creditAmount', label: 'CRÉDIT', value: formatMontant(demande.creditAmount) },
    { key: 'createdAt', label: 'DATE DEMANDE', value: formatDate(demande.createdAt) },
    { key: 'validatedAt', label: 'DATE VALIDATION', value: demande.validatedAt ? formatDate(demande.validatedAt) : 'NON VALIDÉE' },
    { key: 'createdBy', label: 'DEMANDÉ PAR', value: demande.createdBy ? `${demande.createdBy.firstName} ${demande.createdBy.lastName}` : 'N/A' },
  ];

  if (demande.validatedBy) {
    dataSource.push({
      key: 'validatedBy',
      label: 'VALIDÉ PAR',
      value: `${demande.validatedBy.firstName} ${demande.validatedBy.lastName}`
    });
  }

  const columns = [
    {
      title: 'CHAMP',
      dataIndex: 'label',
      key: 'label',
      align: 'left',
      width: '50%',
      render: text => <strong>{text}</strong>,
    },
    {
      title: 'VALEUR',
      dataIndex: 'value',
      align: 'left',
      key: 'value',
    }
  ];

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
  
<Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      bordered
      size="middle"
    />


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
        Swal.showValidationMessage( `Erreur: ${error.response.data.message || 'Une erreur est survenue.'}`);
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