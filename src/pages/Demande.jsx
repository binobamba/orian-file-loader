import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaPlus, FaSearch, FaTimes, FaSync, FaRegTrashAlt} from 'react-icons/fa';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import {
  BeautifulTable,
  usePagination
} from '../components/my-ui/Table';
import { Button } from '../components/my-ui/Button';
import { Card } from '../components/my-ui/Card';
import ModalDemande from './partial-demande/ModalDemande';
import showDemandeForm from '../components/my-ui/showDemandeForm';
import { showValidationModal } from '../components/my-ui/showValidationModal';
import { message } from 'antd';

export default function Demande() {
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // États pour les champs de recherche
  const [searchReference, setSearchReference] = useState('');
  const [searchOperationStatus, setSearchOperationStatus] = useState('');
  const [searchCreatedById, setSearchCreatedById] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const pagination = usePagination(1, 10);

  // États pour les modales
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    mode: 'create',
    demandeId: null
  });


const showModalValidation = (demandeData) => {
  showValidationModal(demandeData, (demandeId) => {
    console.log(`Demande ${demandeId} validée avec succès`);
    fetchDemandeData(pagination.currentPage, pagination.pageSize);
  });
};

  // Configuration des statuts
  const getStatusConfig = (status) => {
    const statusConfigs = {
      'VALIDEE': {
        label: 'VALIDÉE',
        color: 'green'
      },
      'NON_VALIDEE': {
        label: 'NON VALIDÉE',
        color: 'red'
      },
      'EN_TRAITEMENT': {
        label: 'EN TRAITEMENT',
        color: 'blue'
      }
    };

    const config = statusConfigs[status];
    if (config) {
      return config;
    }
    
    return {
      label: status,
      color: 'gray'
    };
  };

  const fetchDemandeData = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      setLoading(true);
      const searchData = {
        reference: filters.reference || '',
        operationStatus: filters.operationStatus || '',
        createdById: filters.createdById || null,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
        page: page - 1,
        size: pageSize
      };

      const response = await api.searchIntegrationRequests(searchData);
      const responseData = response.data || response;

      setData({
        content: responseData.content || [],
        totalPages: responseData.totalPages || 0,
        totalElements: responseData.totalElements || 0,
        number: responseData.number || 0,
        size: responseData.size || 10
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setData({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 10
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    pagination.goToPage(1);
    fetchDemandeData(1, pagination.pageSize, {
      reference: searchReference,
      operationStatus: searchOperationStatus,
      createdById: searchCreatedById,
      startDate: startDate,
      endDate: endDate
    });
  };

  const handleClearSearch = () => {
    setSearchReference('');
    setSearchOperationStatus('');
    setSearchCreatedById('');
    setStartDate('');
    setEndDate('');
    pagination.goToPage(1);
    fetchDemandeData(1, pagination.pageSize, {});
  };

  const handlePageChange = (page) => {
    pagination.goToPage(page);
    fetchDemandeData(page, pagination.pageSize, {
      reference: searchReference,
      operationStatus: searchOperationStatus,
      createdById: searchCreatedById,
      startDate: startDate,
      endDate: endDate
    });
  };



const DeleteDemande = (demande) => {
 api.cancelIntegrationRequest(demande?.id)
};


  const hideModal = () => {
    setModalConfig({
      visible: false,
      mode: 'create',
      demandeId: null
    });
  };


  const handleModalSuccess = () => {
    hideModal();
    fetchDemandeData(pagination.currentPage, pagination.pageSize, {
      reference: searchReference,
      operationStatus: searchOperationStatus,
      createdById: searchCreatedById,
      startDate: startDate,
      endDate: endDate
    });
  };

  useEffect(() => {
    fetchDemandeData(pagination.currentPage, pagination.pageSize, {});
  }, [pagination.currentPage, pagination.pageSize]);

  const hasActiveFilters = searchReference || searchOperationStatus || searchCreatedById || startDate || endDate;

  return (
    <>
      <Card
        title="GESTION DES DEMANDES"
        addBouton={true}
        buttonText="Nouvelle demande"
        onClickAddButton={showDemandeForm}
        icon={<FaPlus className="inline mr-1" />}
      >
        {/* Barre de recherche avancée */}
        <div className="bg-gray-50 dark:bg-gray-800 pt-4 pb-2 px-4">
          <form onSubmit={handleSearch} className="space-y-3 md:space-y-0">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              {/* Champ référence */}
              <div>
                <label
                  htmlFor="reference"
                  className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Référence
                </label>
                <input
                  type="text"
                  id="reference"
                  placeholder="Référence"
                  value={searchReference}
                  onChange={(e) => setSearchReference(e.target.value)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Champ statut opération */}
              <div>
                <label
                  htmlFor="operationStatus"
                  className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Statut Opération
                </label>
                <select
                  id="operationStatus"
                  value={searchOperationStatus}
                  onChange={(e) => setSearchOperationStatus(e.target.value)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">TOUS LES STATUTS</option>
                  <option value="VALIDEE">VALIDEE</option>
                  <option value="NON_VALIDEE">NON VALIDE</option>
                  <option value="EN_TRAITEMENT">EN TRAITEMENT</option>
                </select>
              </div>

              {/* Champ ID créateur */}
              <div>
                <label
                  htmlFor="createdById"
                  className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  DEMANDEUR
                </label>
                <input
                  type="text"
                  id="createdById"
                  placeholder="ID du demandeur"
                  value={searchCreatedById}
                  onChange={(e) => setSearchCreatedById(e.target.value)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              

              {/* Champ date de début */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Date de début
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              {/* Champ date de fin */}
              <div>
                <label
                  htmlFor="endDate"
                  className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Date de fin
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {/* Boutons de recherche */}
            <div className="flex gap-2 pt-2">
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
                  <FaTimes className="inline mr-1" />
                  Effacer
                </button>
              )}
            </div>
          </form>
        </div>

       {loading ? (
  <div className="text-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
    <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
  </div>
) : (
  <div className="overflow-x-auto relative">
    <div className="min-w-full" style={{ minWidth: '1000px' }}>
      <BeautifulTable
        headers={[
          { label: "RÉFÉRENCE", align: "center", className: "text-center whitespace-nowrap bg-gray-100" },
          { label: "DÉBIT", align: "center", className: "text-center whitespace-nowrap" },
          { label: "CRÉDIT", align: "center", className: "text-center whitespace-nowrap" },
          { label: "INTÉGRATION", align: "center", className: "text-center whitespace-nowrap" },
          { label: "OPÉRATION", align: "center", className: "text-center whitespace-nowrap" },
          { label: "DEMANDEUR", align: "center", className: "text-center whitespace-nowrap" },
          { label: "VALIDÉ PAR", align: "center", className: "text-center whitespace-nowrap" },
          { label: "DATE DEMANDE", align: "center", className: "text-center whitespace-nowrap" },
          { label: "ACTIONS", align: "center", className: "text-center whitespace-nowrap bg-gray-100 sticky right-0 z-10" }
        ]}
        data={data.content}
        emptyMessage={hasActiveFilters ? "Aucune demande trouvée avec ces critères" : "Aucune demande disponible"}
        pagination={{
          currentPage: data.number + 1,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          pageSize: data.size,
          onPageChange: handlePageChange
        }}
        renderRow={(record) => (
          <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap">
              {record.reference}
            </td>
            <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap">
              {formatAmount(record.debitAmount)}
            </td>
            <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap">
              {formatAmount(record.creditAmount)}
            </td>
            <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  getStatusConfig(record.integrationStatus).color === 'green' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : getStatusConfig(record.integrationStatus).color === 'red'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : getStatusConfig(record.integrationStatus).color === 'blue'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                {getStatusConfig(record.integrationStatus).label}
              </span>
            </td>
            <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  getStatusConfig(record.operationStatus).color === 'green' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : getStatusConfig(record.operationStatus).color === 'red'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : getStatusConfig(record.operationStatus).color === 'blue'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                }`}
              >
                {getStatusConfig(record.operationStatus).label}
              </span>
            </td>
            <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap">
              <div className="flex flex-col items-center">
                <span className="font-medium whitespace-nowrap">
                  {record.createdBy ? (
                    <>
                      {record.createdBy.firstName} {record.createdBy.lastName} ({record.createdBy.matricule})
                    </>
                  ) : 'N/A'}
                </span>
              </div>
            </td>
            <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap">
              <div className="flex flex-col items-center">
                <span className="font-medium whitespace-nowrap">
                  {record.validatedBy ? (
                    <>
                      {record.validatedBy.firstName} {record.validatedBy.lastName} ({record.validatedBy.matricule})
                    </>
                  ) : 'N/A'}
                </span>
              </div>
            </td>
            <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap">
              {record.createdAt ? formatDate(record.createdAt) : '-'}
            </td>
            <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap bg-white sticky right-0 z-10">
              <div className="flex space-x-1 justify-center">
                <Button 
                  onClick={() => showModalValidation(record, record.id)}
                  size="lg"
                  variant="outline"
                  className="text-xs px-2 py-1 whitespace-nowrap"
                  title="Modifier"
                >
                  <FaEdit className="inline h-4 w-4" /> VALIDER
                </Button>

                <Button 
                  onClick={() => DeleteDemande(record)}
                  size="lg"
                  variant="outline"
                  className="text-xs px-2 py-1"
                  title="supprimer"
                >
                  <FaRegTrashAlt className="inline h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        )}
      />
    </div>
  </div>
)}


      </Card>

    </>
  );
}