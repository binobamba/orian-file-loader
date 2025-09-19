import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaPlus, FaSearch, FaTimes, FaRegTrashAlt, FaEye } from 'react-icons/fa';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import {
  BeautifulTable,
  usePagination
} from '../components/my-ui/Table';
import { Button } from '../components/my-ui/Button';
import { Card } from '../components/my-ui/Card';
import { showValidationModal } from '../components/my-ui/showValidationModal';
import { showDemandeForm } from '../components/my-ui/showDemandeForm';
import {showOperationsModalWithPagination} from '../components/my-ui/showOperationsModalWithPagination';
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
  const isMounted = useRef(true);

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

  const fetchDemandeData = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
    if (!isMounted.current) return;
    
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
  }, []);

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

  const showModalValidation = (demandeData) => {
    showValidationModal(demandeData, (demandeId) => {
      console.log(`Demande ${demandeId} validée avec succès`);
      fetchDemandeData(pagination.currentPage, pagination.pageSize, {
        reference: searchReference,
        operationStatus: searchOperationStatus,
        createdById: searchCreatedById,
        startDate: startDate,
        endDate: endDate
      });
    });
  };

  const VisualiserDemande = async (demande) => {
    showOperationsModalWithPagination(demande.operations || []);
  };

  const DeleteDemande = async (demande) => {
    try {
      const result = await Swal.fire({
        title: 'Confirmation',
        text: "Voulez-vous vraiment supprimer cette demande ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#0d480aff',
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        showLoaderOnConfirm: true, 
        allowOutsideClick: () => !Swal.isLoading(),
        preConfirm: async () => {
          try {
            await api.cancelIntegrationRequest(demande?.id);
            fetchDemandeData(pagination.currentPage, pagination.pageSize, {
              reference: searchReference,
              operationStatus: searchOperationStatus,
              createdById: searchCreatedById,
              startDate: startDate,
              endDate: endDate
            });

            return true;
          } catch (error) {
            Swal.showValidationMessage(
              `Erreur lors de la suppression : ${error?.message || "inconnue"}`
            );
            return false;
          }
        }
      });

      if (result.isConfirmed) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Demande supprimée avec succès',
          showConfirmButton: false,
          timer: 2000
        });
      }

    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Erreur critique lors de la suppression',
        showConfirmButton: false,
        timer: 2000
      });
    }
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

  // Fonction de debounce améliorée
  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };

  // Utilisation du debounce pour les champs de recherche
  const debouncedSearchReference = useDebounce(searchReference, 500);
  const debouncedSearchOperationStatus = useDebounce(searchOperationStatus, 500);
  const debouncedSearchCreatedById = useDebounce(searchCreatedById, 500);
  const debouncedStartDate = useDebounce(startDate, 500);
  const debouncedEndDate = useDebounce(endDate, 500);

  // Effet principal pour la recherche
  useEffect(() => {
    if (isMounted.current) {
      fetchDemandeData(1, pagination.pageSize, {
        reference: debouncedSearchReference,
        operationStatus: debouncedSearchOperationStatus,
        createdById: debouncedSearchCreatedById,
        startDate: debouncedStartDate,
        endDate: debouncedEndDate
      });
    }
  }, [
    debouncedSearchReference,
    debouncedSearchOperationStatus,
    debouncedSearchCreatedById,
    debouncedStartDate,
    debouncedEndDate,
    pagination.pageSize,
    fetchDemandeData
  ]);

  // Nettoyage du composant
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const hasActiveFilters = searchReference || searchOperationStatus || searchCreatedById || startDate || endDate;

  return (
    <div className="min-h-screen bg-gray-100 pr-5">
      <Card
        title="GESTION DES DEMANDES"
        buttonText="Nouvelle demande"
        addBouton={true}
        onClickAddButton={showDemandeForm}
        icon={<FaPlus className="inline mr-1" />}
      >
        {/* Conteneur avec défilement et en-tête fixe */}
        <div className="h-[80vh] overflow-y-auto">
          
          {/* En-tête fixe */}
          <div className="sticky top-0 bg-white z-10 pt-4 pb-2 border-b shadow-sm">
         <div className="relative">
        <div className="overflow-x-auto md:overflow-visible">
      <div className="grid grid-cols-5 md:grid-cols-5 gap-4 items-end min-w-[900px] md:min-w-0">
      
      {/* Champ référence */}
      <div className="flex flex-col">
        <label
          htmlFor="reference"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Référence
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            id="reference"
            placeholder="Référence"
            value={searchReference}
            onChange={(e) => setSearchReference(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md 
                      bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                      focus:ring-green-800 focus:border-green-800 
                      dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Champ statut opération */}
      <div className="flex flex-col">
        <label
          htmlFor="operationStatus"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Statut Opération
        </label>
        <select
          id="operationStatus"
          value={searchOperationStatus}
          onChange={(e) => setSearchOperationStatus(e.target.value)}
          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md 
                    bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                    focus:ring-green-800 focus:border-green-800 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="">TOUS LES STATUTS</option>
          <option value="VALIDEE">VALIDEE</option>
          <option value="NON_VALIDEE">NON VALIDE</option>
          <option value="EN_TRAITEMENT">EN TRAITEMENT</option>
        </select>
      </div>

      {/* Champ ID créateur */}
      <div className="flex flex-col">
        <label
          htmlFor="createdById"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          DEMANDEUR
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            id="createdById"
            placeholder="ID du demandeur"
            value={searchCreatedById}
            onChange={(e) => setSearchCreatedById(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md 
                      bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                      focus:ring-green-800 focus:border-green-800 
                      dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>

      {/* Champ date de début */}
      <div className="flex flex-col">
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Date de début
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md 
                    bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                    focus:ring-green-800 focus:border-green-800 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

            {/* Champ date de fin */}
            <div className="flex flex-col">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Date de fin
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md 
                          bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                          focus:ring-green-800 focus:border-green-800 
                          dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

            {/* Bouton Effacer */}
            <div className="flex gap-2 pt-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-3 py-2 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600"
                >
                  <FaTimes className="inline mr-1" />
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="py-4 space-y-6">
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement...</p>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-max">
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
                        <td className="p-2 sm:p-3 text-center text-xs sm:text-sm whitespace-nowrap bg-white sticky right-0 z-2">
                          <div className="flex space-x-1 justify-center">
                            <Button 
                              onClick={() => showModalValidation(record)}
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1 whitespace-nowrap"
                              title="Valider"
                            >
                              <FaEdit className="inline h-4 w-4" /> 
                            </Button>

                            <Button 
                              onClick={() => DeleteDemande(record)}
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1"
                              title="Supprimer"
                            >
                              <FaRegTrashAlt className="inline h-4 w-4" />
                            </Button>

                             <Button 
                              onClick={() => VisualiserDemande(record)}
                              size="sm"
                              variant="outline"
                              className="text-xs px-2 py-1"
                              title="Télécharger"
                            >
                              <FaEye className="inline h-4 w-4" />
                            </Button>

                          </div>
                        </td>
                      </tr>
                    )}
                    stickyHeader={true}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}