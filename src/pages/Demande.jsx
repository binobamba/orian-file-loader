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
} from 'antd';
import moment from 'moment';
import 'moment/locale/fr';
import { Card } from '../components/my-ui/Card';
import { showValidationModal } from '../components/my-ui/showValidationModal';
import { showDemandeForm } from '../components/my-ui/showDemandeForm';
import {showOperationsModalWithPagination} from '../components/my-ui/showOperationsModalWithPagination';

const { Option } = Select;
const { RangePicker } = DatePicker;

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
  const navigate = useNavigate();

  // États pour les champs de recherche
  const [searchReference, setSearchReference] = useState('');
  const [searchOperationStatus, setSearchOperationStatus] = useState('');
  const [searchCreatedById, setSearchCreatedById] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isClearing, setIsClearing] = useState(false);
  const [hoverStates, setHoverStates] = useState({
    clearButton: false,
    referenceInput: false,
    statusSelect: false,
    demandeurSelect: false,
    startDate: false,
    endDate: false
  });
  const isMounted = useRef(true);

  // Gestionnaires d'états de survol
  const handleMouseEnter = (element) => {
    setHoverStates(prev => ({ ...prev, [element]: true }));
  };

  const handleMouseLeave = (element) => {
    setHoverStates(prev => ({ ...prev, [element]: false }));
  };

  // Charger la liste des demandeurs
  const fetchDemandeurs = useCallback(async (searchQuery = '') => {
    if (!isMounted.current) return;
    console.log("Actualisation de la liste des demandeurs",)
    try {
      setDemandeursLoading(true);
      const response = await api.searchUsers({ text: searchQuery });
      const responseData = response.data || [] ;
      
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
      'EN_TRAITEMENT': { label: 'EN TRAITEMENT', color: 'blue' }
    };
    return statusConfigs[status] || { label: status, color: 'default' };
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
      fetchDemandeData(currentPage, pageSize, {
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
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    
    setTimeout(() => {
      setIsClearing(false);
    }, 500);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
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

  // Effect pour les requêtes
  useEffect(() => {
    if (isMounted.current) {
      fetchDemandeData(currentPage, pageSize, {
        reference: debouncedSearchReference,
        operationStatus: debouncedSearchOperationStatus,
        createdById: debouncedSearchCreatedById,
        startDate: debouncedStartDate,
        endDate: debouncedEndDate
      });
      fetchDemandeurs('');
    }
  }, [
    debouncedSearchReference,
    debouncedSearchOperationStatus,
    debouncedSearchCreatedById,
    debouncedStartDate,
    debouncedEndDate,
    currentPage,
    pageSize,
    fetchDemandeData,
    fetchDemandeurs
  ]);

  // Nettoyage du composant
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const hasActiveFilters = searchReference || searchOperationStatus || searchCreatedById || startDate || endDate;

  // Configuration des colonnes pour le tableau
  const columns = [
    {
      title: 'RÉFÉRENCE',
      dataIndex: 'reference',
      key: 'reference',
      align: 'left',
      render: (text) => (
        <div className="whitespace-nowrap overflow-hidden text-ellipsis w-full" title={text}>
          {text}
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
      render: (date) => <span className="whitespace-nowrap">{date ? formatDate(date) : '-'}</span>
    },
     {
      title: "ACTIONS",
      key: "actions",
      align: "center",
      fixed: "right",
      render: (record) => (
        <div className="flex items-center justify-center gap-1 whitespace-nowrap">
          {/* Bouton Valider */}
          <button
            onClick={() => showModalValidation(record)}
            title="Valider"
            aria-label="Valider"
            className="p-1 rounded-full hover:bg-orange-600 text-green-800 transition hover:text-white"
          >
            <FaEdit className="text-lg" />
          </button>

          {/* Bouton Supprimer */}
          <button
            onClick={() => DeleteDemande(record)}
            title="ANNULER"
            aria-label="ANNULER"
            className="p-1 rounded-full text-orange-600 hover:text-white hover:bg-orange-600 dark:text-green-400 dark:hover:text-green-300 transition-colors"
          >
            <FaRegTrashAlt className="text-lg" />
          </button>

          {/* Bouton Visualiser */}
          <button
            onClick={() => VisualiserDemande(record)}
            title="Visualiser les opérations"
            aria-label="Visualiser les opérations"
            className="p-1 rounded-full hover:bg-orange-600 text-green-800 transition hover:text-white"
          >
            <FaEye className="text-lg" />
          </button>

          
          {/* Bouton Visualiser */}
          <button
            onClick={() => VisualiserDemande(record)}
            title="Télécharger"
            aria-label="Télécharger"
            className="p-1 rounded-full hover:bg-orange-600 text-gray-600 transition hover:text-white"
          >
            <FaDownload className="text-lg" />
          </button>


        </div>
      ),
    }
  ];

  return (
    <div className="w-full no-scrollbar">
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
                {/* Grille des filtres avec Tailwind CSS */}
                <div className="grid grid-cols-6 gap-4 items-end min-w-[1100px]">
                  {/* Bouton de réinitialisation */}
                  <div className="flex flex-col">
                    <label htmlFor="reset" className="block text-xs font-bold text-gray-800 mb-1 justify-center ">
                      EFFACER
                    </label>
                    <Button
                      id="reset"
                      type="default"
                      size="default"
                      onClick={handleClearSearch}
                      onMouseEnter={() => handleMouseEnter("clearButton")}
                      onMouseLeave={() => handleMouseLeave("clearButton")}
                      className="w-full flex items-center justify-center rounded-lg 
                                hover:bg-red-500 hover:text-white transition-all duration-300"
                      title="Réinitialiser tous les filtres"
                      disabled={isClearing}
                      icon={<FaRedo className="text-lg" />}
                    />
                  </div>

                  {/* Champ référence */}
                  <div className="flex flex-col">
                    <label htmlFor="reference" className="block text-xs font-bold text-gray-800 mb-1 text-center">
                      REFERENCE
                    </label>
                    <Input
                      id="reference"
                      placeholder="Référence"
                      size="default"
                      value={searchReference}
                      onChange={(e) => setSearchReference(e.target.value)}
                      prefix={<FaSearch className="text-gray-400" />}
                      className="rounded-lg"
                    />
                  </div>

                  {/* Champ statut opération */}
                  <div className="flex flex-col">
                    <label htmlFor="operationStatus" className="block text-xs font-bold text-gray-800 mb-1 text-center">
                      STATUT OPÉRATION
                    </label>
                    <Select
                      id="operationStatus"
                      value={searchOperationStatus || undefined}
                      onChange={setSearchOperationStatus}
                      placeholder="TOUS LES STATUTS"
                      size="default"
                      className="w-full rounded-lg"
                    >
                      <Option value="">TOUS LES STATUTS</Option>
                      <Option value="VALIDEE">VALIDEE</Option>
                      <Option value="NON_VALIDEE">NON VALIDEE</Option>
                      <Option value="EN_TRAITEMENT">EN TRAITEMENT</Option>
                    </Select>
                  </div>

                  {/* Champ Demandeur */}
                  <div className="flex flex-col">
                    <label htmlFor="demandeur" className="block text-xs font-bold text-gray-800 mb-1 text-center">
                      DEMANDEUR
                    </label>
                    <Select
                      id="demandeur"
                      value={searchCreatedById || undefined}
                      showSearch
                      optionFilterProp="children"
                      onFocus={() => fetchDemandeurs('')}
                      onChange={setSearchCreatedById}
                      placeholder="Sélectionner un demandeur"
                      loading={demandeursLoading}
                      size="default"
                      className="w-full rounded-lg"
                    >
                      <Option value="">Sélectionner un demandeur</Option>
                      {demandeurs?.map((demandeur) => (
                        <Option key={demandeur.id} value={demandeur.id}>
                          {`${demandeur.firstName} ${demandeur.lastName} (${demandeur.matricule})`}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  {/* Champ date de début */}
                  <div className="flex flex-col">
                    <label htmlFor="startDate" className="block text-xs font-bold text-gray-800 mb-1 text-center">
                      DATE DE DÉBUT
                    </label>
                    <DatePicker
                      id="startDate"
                      value={startDate ? moment(startDate) : null}
                      onChange={(date, dateString) => setStartDate(dateString)}
                      size="default"
                      className="w-full rounded-lg"
                    />
                  </div>

                  {/* Champ date de fin */}
                  <div className="flex flex-col">
                    <label htmlFor="endDate" className="block text-xs font-bold text-gray-800 mb-1 text-center">
                      DATE DE FIN
                    </label>
                    <DatePicker
                      id="endDate"
                      value={endDate ? moment(endDate) : null}
                      onChange={(date, dateString) => setEndDate(dateString)}
                      size="default"
                      className="w-full rounded-lg"
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
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-3 border-gray-200 border-t-orange-600 rounded-full mx-auto"></div>
                    <p className="mt-2 text-gray-600">Chargement...</p>
                  </div>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={data.content}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1300, y: '60vh' }}
                  size="small"
                  bordered={true}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: data.totalElements,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} demandes`,
                  }}
                  onChange={handleTableChange}
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