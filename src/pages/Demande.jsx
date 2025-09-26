import React, { useState, useEffect, useCallback, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaPlus, FaSearch, FaTimes, FaRegTrashAlt, FaEye, FaRedo, FaDownload } from 'react-icons/fa';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import { isAdmin,isValidator } from '../services/permission.js';
import {
  Table,
  Button,
  Card as AntCard,
  Input,
  Select,
  Tag,
  DatePicker,
  Spin,
} from 'antd';
    import { ExclamationCircleOutlined } from '@ant-design/icons';
import 'moment/locale/fr';
import { Card } from '../components/my-ui/Card';
import { showValidationModal } from '../components/my-ui/showValidationModal';
import { showDemandeForm } from '../components/my-ui/showDemandeForm';
import { showOperationsModalWithPagination } from '../components/my-ui/showOperationsModalWithPagination';
import { formatAmount, formatDate } from '../utils/Utils.js';
const { Option } = Select;

const originalError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('antd: compatible')) {
    return;
  }
  originalError.call(console, ...args);
};

export default function Demande() {

  // Etats pour le chargement
  const [loading, setLoading] = useState(false);
  const [demandeursLoading, setDemandeursLoading] = useState(false);
  const [downloadingIds, setDownloadingIds] = useState(new Set());
  const [isClearing, setIsClearing] = useState(false);


  // États pour les champs de recherche
  const [searchOperationStatus, setSearchOperationStatus] = useState('');
  const [searchCreatedById, setSearchCreatedById] = useState('');
  const [searchDemandeurFirstName, setSearchDemandeurFirstName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // États pour la pagination 
    const [currentPage, setCurrentPage] = useState(1);
    const [numberOfElements, setNumberOfElements] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // État pour les données
    const [DemandeData, setDemandeData] = useState([]);
    const [demandeursData, setDemandeursData] = useState([]);

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

  const operationStatusOptions = [
  { value: "VALIDEE", label: "VALIDEE" },
  { value: "NON_VALIDEE", label: "NON VALIDEE" },
  { value: "EN_TRAITEMENT", label: "EN TRAITEMENT" },
];
  // Fonction pour récupérer les demandes

  const fetchDemandeData = async () => {
    console.log('récupération des données de la demande ?')
    setLoading(true);
    try {
      const response = await api.searchIntegrationRequests({
        operationStatus: searchOperationStatus || '',
        createdById: searchCreatedById || '',
        startDate: startDate || '',
        endDate: endDate || '',
        page: currentPage,
        size: pageSize
      });

      const responseData = response?.data || [];
      setNumberOfElements(responseData.numberOfElements || 0);
      setTotalElements(responseData.totalElements || 0);
      setTotalPages(responseData.totalPages || 1);
      setDemandeData(responseData.content)

    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      setDemandeData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les demandeurs
  const fetchDemandeurs = async () => {
    console.log('chargement des demandeurs')
    setDemandeursLoading(true);
    try {
      const response = await api.getUsers({
        firstName: searchDemandeurFirstName || '',
        page: 0,
        size: 50
      });
      const demandeursData = response?.data.content || [];
      setDemandeursData(demandeursData);
    } catch (error) {
      console.error('Erreur lors du chargement des demandeurs:', error);
      setDemandeursData([]);
    } finally {
      setDemandeursLoading(false);
    }
  };

  const showModalValidation = (demandeData) => {
    showValidationModal(demandeData, (demandeId) => {
      fetchDemandeData();
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
    setSearchOperationStatus('');
    setSearchCreatedById('');
    setSearchDemandeurFirstName('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    setPageSize(10);
    fetchDemandeData();
    setTimeout(() => {
      setIsClearing(false);
    }, 500);
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    fetchDemandeData();
  };

  useEffect(() => {
    fetchDemandeData();
  }, [currentPage, pageSize,searchOperationStatus, searchCreatedById, startDate, endDate]);
 
  useEffect(()=>{
    fetchDemandeurs();
  }, [searchDemandeurFirstName])

  // Gestionnaire pour la recherche de demandeurs
  const handleDemandeurSearch = (value) => {
    setSearchDemandeurFirstName(value);
    fetchDemandeurs();
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
    dataIndex: 'isBalanced',
    key: 'isBalanced',
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
      const colorMap = {
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        blue: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800'
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colorMap[config.color]}`}
        >
          {config.label}
        </span>
      );
    }
  },
  {
    title: 'OPÉRATION',
    dataIndex: 'operationStatus',
    key: 'operationStatus',
    align: 'center',
    render: (status) => {
      const config = getStatusConfig(status);
      const colorMap = {
        green: 'bg-green-100 text-green-800',
        red: 'bg-red-100 text-red-800',
        blue: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800'
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${colorMap[config.color]}`}
        >
          {config.label}
        </span>
      );
    }
  },
  {
    title: 'ERREURS',
    dataIndex: 'errors',
    key: 'errors',
    align: 'center',
    render: (errors) => {
      const count = Array.isArray(errors) ? errors.length : errors || 0;
      return (
        <button
          className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 active:scale-95 transition"
          title="Cliquez pour voir les erreurs"
          onClick={() => alert(`Il y a ${count} erreur(s)`)} // remplacer par ton handler
        >
          <ExclamationCircleOutlined className="text-white text-base" />
          <span>{count} erreur{count > 1 ? 's' : ''}</span>
        </button>
      );
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
              <div className="overflow-x-auto pb-1">
  <div className="grid grid-cols-6 gap-4 items-end min-w-[1100px]">
      
      {/* Bouton de réinitialisation */}
      <div className="flex flex-col">
        <label
          htmlFor="reset"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          EFFACER
        </label>
        <Button
          onClick={handleClearSearch}
          size='large'
          className="w-full green-2"
          disabled={isClearing} 
        >
          {isClearing ? <Spin size="small" /> : "Effacer"}
        </Button>
      </div>

      {/* Champ statut opération */}
      <div className="flex flex-col">
        <label
          htmlFor="operationStatus"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          STATUT OPÉRATION
        </label>
        <Select
          id="operationStatus"
          size='large'
          value={searchOperationStatus}
          onChange={setSearchOperationStatus}
          placeholder="Tous les statuts"
          allowClear
          className="w-full"
        >
          <Option value="">Tous les statuts</Option>
          {operationStatusOptions.map((opt) => (
            <Option key={opt.value} value={opt.value}>
              {opt.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* Champ Demandeur */}
      <div className="flex flex-col">
        <label
          htmlFor="demandeur"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          DEMANDEUR
        </label>
        <Select
          id="demandeur"
          size='large'
          showSearch
          allowClear
          placeholder="Rechercher un demandeur"
          value={searchCreatedById || undefined}
          onSearch={handleDemandeurSearch}
          onSelect={setSearchCreatedById}
          className="w-full"
          filterOption={(input, option) =>
            option?.children.toLowerCase().includes(input.toLowerCase())
          }
        >
          {demandeursData?.map((demandeur) => (
            <Option key={demandeur.id} value={demandeur.id}>
              {`${demandeur.firstName} ${demandeur.lastName} (${demandeur.matricule})`}
            </Option>
          ))}
        </Select>
      </div>

      {/* Champ date de début */}
      <div className="flex flex-col">
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          DATE DE DÉBUT
        </label>
        <DatePicker
          id="startDate"
          size='large'
          value={startDate}
          onChange={(date) => setStartDate(date)}
          className="w-full"
          format="YYYY-MM-DD"
        />
      </div>

      {/* Champ date de fin */}
      <div className="flex flex-col">
        <label
          htmlFor="endDate"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          DATE DE FIN
        </label>
        <DatePicker
          id="endDate"
          size='large'
          value={endDate}
          onChange={(date) => setEndDate(date)}
          className="w-full"
          format="YYYY-MM-DD"
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
                  dataSource={DemandeData}
                  rowKey="id"
                  loading={loading}
                  scroll={{ x: 1600, y: '57vh' }}
                  size="middle"
                  bordered={true}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total:totalElements,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} demandes`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                  }}
                  onChange={handleTableChange}
                  locale={{
                    emptyText:demandeursData.length === 0
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