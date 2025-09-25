import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaPlus, FaSearch, FaTimes, FaRegTrashAlt, FaEye, FaRedo, FaDownload } from 'react-icons/fa';
import { api } from '../services/api';
import Swal from 'sweetalert2';

import {
  Table,
  Button,
  Card as AntCard,
  Input,
  Select,
  DatePicker,
  Tag,
  Spin,
} from 'antd';

import moment from 'moment';
import 'moment/locale/fr';
import { Card } from '../components/my-ui/Card';
import { showValidationModal } from '../components/my-ui/showValidationModal';
import { showDemandeForm } from '../components/my-ui/showDemandeForm';
import { showOperationsModalWithPagination } from '../components/my-ui/showOperationsModalWithPagination';

const { Option } = Select;

// Suppression de l'alerte de compatibilité Antd
const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('antd: compatible')) {
    return;
  }
  originalError.call(console, ...args);
};

export default function Demande() {
  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  });
  const [loading, setLoading] = useState(false);
  const [demandeurs, setDemandeurs] = useState([]);
  const [demandeursLoading, setDemandeursLoading] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  const navigate = useNavigate();

  // États pour les champs de recherche
  const [searchReference, setSearchReference] = useState('');
  const [searchOperationStatus, setSearchOperationStatus] = useState('');
  const [searchCreatedById, setSearchCreatedById] = useState('');
  const [searchDemandeurText, setSearchDemandeurText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isClearing, setIsClearing] = useState(false);

  const isMounted = useRef(true);

  // Charger la liste des demandeurs avec recherche
  const fetchDemandeurs = useCallback(async (searchQuery = '') => {
    if (!isMounted.current) return;
    try {
      setDemandeursLoading(true);
      const response = await api.searchUsers({ text: searchQuery });
      const responseData = response.data || [];
      setDemandeurs(responseData?.content || []);
    } catch (error) {
      console.error('Erreur lors du chargement des demandeurs:', error);
      setDemandeurs([]);
    } finally {
      setDemandeursLoading(false);
    }
  }, []);

  // Configuration des statuts
  const getStatusConfig = (status) => {
    const statusConfigs = {
      'VALIDEE': { label: 'VALIDÉE', color: 'green' },
      'NON_VALIDEE': { label: 'NON VALIDÉE', color: 'red' },
      'NON_INTEGRER': { label: 'NON INTÉGRER', color: 'red' },
      'ANNULER': { label: 'ANNULER', color: 'red' },
      'EN_TRAITEMENT': { label: 'EN TRAITEMENT', color: 'blue' }
    };
    return statusConfigs[status] || { label: status, color: 'default' };
  };

  const fetchDemandeData = useCallback(async (page = 1, size = 10, filters = {}) => {
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
        size: size
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
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '-';
    }
  };

  const showModalValidation = (demandeData) => {
    showValidationModal(demandeData, (demandeId) => {
      fetchDemandeData(currentPage, pageSize, {
        reference: searchReference,
        operationStatus: searchOperationStatus,
        createdById: searchCreatedById,
        startDate: startDate,
        endDate: endDate
      });
    });
  };

  const VisualiserDemande = async (demandeId) => {
    showOperationsModalWithPagination(demandeId);
  };

  const TelechargerDemande = async (demande) => {
    if (!demande?.id) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Erreur: ID de demande manquant',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    setDownloadingIds(prev => new Set(prev).add(demande.id));
    
    try {
      const response = await api.downloadDemande(demande.id);
      
      if (response && response.data) {
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'application/pdf' 
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `demande_${demande.reference || demande.id}.pdf`;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Document téléchargé avec succès',
          showConfirmButton: false,
          timer: 2000
        });
      } else {
        throw new Error('Aucune donnée reçue du serveur');
      }
      
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      
      let errorMessage = 'Erreur lors du téléchargement';
      if (error.response?.status === 404) {
        errorMessage = 'Document non trouvé';
      } else if (error.response?.status === 403) {
        errorMessage = 'Accès non autorisé';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: errorMessage,
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(demande.id);
        return newSet;
      });
    }
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
            fetchDemandeData(currentPage, pageSize, {
              reference: searchReference,
              operationStatus: searchOperationStatus,
              createdById: searchCreatedById,
              startDate: startDate,
              endDate: endDate
            });
            return true;
          } catch (error) {
            Swal.showValidationMessage(`Erreur lors de la suppression : ${error?.message || "inconnue"}`);
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
    setIsClearing(true);
    setSearchReference('');
    setSearchOperationStatus('');
    setSearchCreatedById('');
    setSearchDemandeurText('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    
    fetchDemandeData(1, pageSize, {});
    
    setTimeout(() => {
      setIsClearing(false);
    }, 500);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    const newPage = pagination.current;
    const newPageSize = pagination.pageSize;
    
    setCurrentPage(newPage);
    setPageSize(newPageSize);
    
    fetchDemandeData(newPage, newPageSize, {
      reference: searchReference,
      operationStatus: searchOperationStatus,
      createdById: searchCreatedById,
      startDate: startDate,
      endDate: endDate
    });
  };

  // Fonction de debounce
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
  const debouncedSearchDemandeurText = useDebounce(searchDemandeurText, 500);

  // Effect pour le chargement initial
  useEffect(() => {
    if (isMounted.current) {
      fetchDemandeData(1, pageSize, {});
      fetchDemandeurs('');
    }

    return () => {
      isMounted.current = false;
      console.error = originalError;
    };
  }, []);

  // Effect pour les filtres de recherche
  useEffect(() => {
    if (isMounted.current) {
      setCurrentPage(1);
      fetchDemandeData(1, pageSize, {
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
    pageSize
  ]);

  // Effect pour la recherche de demandeurs
  useEffect(() => {
    if (isMounted.current && debouncedSearchDemandeurText !== undefined) {
      fetchDemandeurs(debouncedSearchDemandeurText);
    }
  }, [debouncedSearchDemandeurText, fetchDemandeurs]);

  // Gestionnaire pour la sélection d'un demandeur
  const handleDemandeurSelect = (value) => {
    setSearchCreatedById(value);
    const selectedDemandeur = demandeurs.find(d => d.id === value);
    if (selectedDemandeur) {
      setSearchDemandeurText(`${selectedDemandeur.firstName} ${selectedDemandeur.lastName} (${selectedDemandeur.matricule})`);
    } else if (!value) {
      setSearchDemandeurText('');
    }
  };

  // Gestionnaire pour la recherche de demandeurs
  const handleDemandeurSearch = (value) => {
    setSearchDemandeurText(value);
    if (!value) {
      setSearchCreatedById('');
    }
  };

  const hasActiveFilters = searchReference || searchOperationStatus || searchCreatedById || startDate || endDate;

  // Fonction cruciale pour les filtres dans le modal
  const getPopupContainer = () => {
    return document.querySelector('.swal2-popup') || document.body;
  };

  // Configuration des colonnes pour le tableau
  const columns = [
    {
      title: 'RÉFÉRENCE',
      dataIndex: 'reference',
      key: 'reference',
      align: 'left',
      render: (text) => (
        <div className="whitespace-nowrap overflow-hidden text-ellipsis w-full" title={text}>
          {text || '-'}
        </div>
      ),
    },
    {
      title: 'DÉBIT',
      dataIndex: 'debitAmount',
      key: 'debitAmount',
      align: 'center',
      render: (amount) => <span className="whitespace-nowrap">{formatAmount(amount)}</span>
    },
    {
      title: 'CRÉDIT',
      dataIndex: 'creditAmount',
      key: 'creditAmount',
      align: 'center',
      render: (amount) => <span className="whitespace-nowrap">{formatAmount(amount)}</span>
    },
    {
      title: 'ÉQUILIBRE',
      dataIndex: 'equilibre',
      key: 'isbalanced',
      align: 'center',
      render: (amount) => <span className="whitespace-nowrap">{formatAmount(amount)}</span>
    },
    {
      title: 'INTÉGRATION',
      dataIndex: 'integrationStatus',
      key: 'integrationStatus',
      align: 'center',
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color} className="whitespace-nowrap">{config.label}</Tag>;
      }
    },
    {
      title: 'OPÉRATION',
      dataIndex: 'operationStatus',
      key: 'operationStatus',
      align: 'center',
      render: (status) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color} className="whitespace-nowrap">{config.label}</Tag>;
      }
    },
    {
      title: 'DEMANDEUR',
      key: 'createdBy',
      align: 'center',
      render: (record) => (
        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
          {record.createdBy ? (
            <span title={`${record.createdBy.firstName} ${record.createdBy.lastName} (${record.createdBy.matricule})`}>
              {record.createdBy.firstName} {record.createdBy.lastName} ({record.createdBy.matricule})
            </span>
          ) : 'N/A'}
        </div>
      )
    },
    {
      title: 'VALIDÉ PAR',
      key: 'validatedBy',
      align: 'center',
      render: (record) => (
        <div className="whitespace-nowrap overflow-hidden text-ellipsis">
          {record.validatedBy ? (
            <>
              {record.validatedBy.firstName} {record.validatedBy.lastName} ({record.validatedBy.matricule})
            </>
          ) : 'N/A'}
        </div>
      )
    },
    {
      title: 'DATE DEMANDE',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (date) => <span className="whitespace-nowrap">{formatDate(date)}</span>
    },
    {
      title: "ACTIONS",
      key: "actions",
      align: "center",
      fixed: "right",
      render: (record) => (
        <div className="flex items-center justify-center gap-1 whitespace-nowrap">
          <button
            onClick={() => showModalValidation(record)}
            title="Valider"
            aria-label="Valider"
            className="p-1 rounded-full hover:bg-orange-600 text-green-800 transition hover:text-white"
          >
            <FaEdit className="text-lg" />
          </button>

          <button
            onClick={() => DeleteDemande(record)}
            title="ANNULER"
            aria-label="ANNULER"
            className="p-1 rounded-full text-orange-600 hover:text-white hover:bg-orange-600 transition-colors"
          >
            <FaRegTrashAlt className="text-lg" />
          </button>

          <button
            onClick={() => VisualiserDemande(record.id)}
            title="Visualiser les opérations"
            aria-label="Visualiser les opérations"
            className="p-1 rounded-full hover:bg-orange-600 text-green-800 transition hover:text-white"
          >
            <FaEye className="text-lg" />
          </button>

          <button
            onClick={() => TelechargerDemande(record)}
            title="Télécharger le document"
            aria-label="Télécharger le document"
            disabled={downloadingIds.has(record.id)}
            className={`p-1 rounded-full transition ${
              downloadingIds.has(record.id) 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'hover:bg-orange-600 text-gray-600 hover:text-white'
            }`}
          >
            {downloadingIds.has(record.id) ? (
              <Spin size="small" />
            ) : (
              <FaDownload className="text-lg" />
            )}
          </button>
        </div>
      ),
    }
  ];

  return (
    <div className="w-full no-scrollbar mr-10">
      <Card
        title="GESTION DES DEMANDES"
        buttonText="Nouvelle demande"
        addBouton={true}
        onClickAddButton={showDemandeForm}
        icon={<FaPlus className="inline mr-1" />}
      >
        <div className="h-[85vh] overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 pb-2 border-b border-gray-200 shadow-sm">
            <div className="relative">
              <div className="overflow-x-auto">
                <div className="grid grid-cols-6 gap-4 items-end min-w-[1100px]">
                  
                  {/* Bouton de réinitialisation */}
                  <div className="flex flex-col">
                    <label htmlFor="reset" className="block text-sm font-medium text-gray-700 mb-1">
                      EFFACER
                    </label>
                    <Button
                      onClick={handleClearSearch}
                      className="green-2"
                      disabled={isClearing}
                    >
                      {isClearing ? <Spin size="small" /> : 'Effacer'}
                    </Button>
                  </div>

                  {/* Champ référence */}
                  <div className="flex flex-col">
                    <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                      RÉFÉRENCE
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-gray-400" />
                      </div>
                      <Input
                        id="reference"
                        placeholder="Référence"
                        value={searchReference}
                        onChange={(e) => setSearchReference(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Champ statut opération */}
                  <div className="flex flex-col">
                    <label htmlFor="operationStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      STATUT OPÉRATION
                    </label>
                    <Select
                      id="operationStatus"
                      value={searchOperationStatus}
                      onChange={setSearchOperationStatus}
                      placeholder="TOUS LES STATUTS"
                      allowClear
                    >
                      <Option value="VALIDEE">VALIDEE</Option>
                      <Option value="NON_VALIDEE">NON VALIDEE</Option>
                      <Option value="EN_TRAITEMENT">EN TRAITEMENT</Option>
                    </Select>
                  </div>

                  {/* Champ Demandeur */}
                  <div className="flex flex-col">
                    <label htmlFor="demandeur" className="block text-sm font-medium text-gray-700 mb-1">
                      DEMANDEUR
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                        <FaSearch className="text-gray-400" />
                      </div>
                      <Select
                        id="demandeur"
                        showSearch
                        allowClear
                        placeholder="Rechercher un demandeur"
                        value={searchCreatedById || undefined}
                        onSelect={handleDemandeurSelect}
                        onSearch={handleDemandeurSearch}
                        onClear={() => {
                          setSearchCreatedById('');
                          setSearchDemandeurText('');
                        }}
                        loading={demandeursLoading}
                        filterOption={false}
                        notFoundContent={demandeursLoading ? 'Chargement...' : 'Aucun demandeur trouvé'}
                        className="w-full"
                        style={{ paddingLeft: '2.5rem' }}
                        getPopupContainer={getPopupContainer}
                      >
                        {demandeurs?.map((demandeur) => (
                          <Option key={demandeur.id} value={demandeur.id}>
                            {`${demandeur.firstName} ${demandeur.lastName} (${demandeur.matricule})`}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Champ date de début */}
                  <div className="flex flex-col">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      DATE DE DÉBUT
                    </label>
                    <Input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>

                  {/* Champ date de fin */}
                  <div className="flex flex-col">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      DATE DE FIN
                    </label>
                    <Input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Contenu scrollable */}
          <div className="py-4 flex flex-col gap-6">
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Spin size="large" />
                  <p className="mt-2 text-gray-600">Chargement...</p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={data.content}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1600, y: '57vh' }}
                  size="middle"
                  bordered={true}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: data.totalElements,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} demandes`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                  }}
                  onChange={handleTableChange}
                  getPopupContainer={getPopupContainer}
                  locale={{
                    emptyText: hasActiveFilters 
                      ? "Aucune demande trouvée avec ces critères" 
                      : "Aucune demande disponible"
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}