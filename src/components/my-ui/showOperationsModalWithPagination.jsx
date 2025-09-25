import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { FaSearch } from 'react-icons/fa';
import withReactContent from 'sweetalert2-react-content';
import { api } from '../../services/api';
import { Table } from 'antd';

const MySwal = withReactContent(Swal);

export const showOperationsModalWithPagination = (requestId) => {
  const OperationsTableWithPagination = () => {

    const [operationsData, setOperationsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState('DESC');
    const [searchAccount, setSearchAccount] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [numberOfElements, setNumberOfElements] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);

    // Fonction de récupération des données
    const fetchOperations = async () => {
      console.log('Fetching operations with:', {
        requestId,
        searchAccount,
        currentPage,
        pageSize,
        sortOrder
      });
      setLoading(true);
      try {
        const response = await api.getOperations(requestId, searchAccount, {
          page_: currentPage,
          size_: pageSize,
          sort_: [sortOrder]
        });
        const data = response?.data || {};
        setOperationsData(data?.content || []);
        setTotalElements(data?.totalElements || 0);
        setNumberOfElements(data?.numberOfElements || 0);
        setPageSize(data?.size || pageSize);
        setTotalPages(data?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching operations data:', error);
        MySwal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les opérations'
        });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if (requestId) {
        fetchOperations();
      }
    }, [currentPage, searchAccount, pageSize, sortOrder, requestId]);

    const formatAmount = (amount) => {
      if (amount === null || amount === undefined) return '-';
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      try {
        return new Date(dateString).toLocaleDateString('fr-FR');
      } catch (error) {
        return '-';
      }
    };

    // Fonction pour afficher les badges booléens
    const renderBooleanBadge = (value) => {
      if (value === true) {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Oui
          </span>
        );
      }

      if (value === false) {
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            Non
          </span>
        );
      }

      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
          N/A
        </span>
      );
    };

    const getPopupContainer = () => {
      return document.querySelector('.swal2-popup') || document.body;
    };

    const columns = [
      { 
        title: 'N° DE COMPTE', 
        dataIndex: 'account', 
        key: 'account', 
        align: 'center',
        width: 200,
        render: (text) => text || '-'
      },
      { 
        title: 'NOM', 
        dataIndex: 'name', 
        key: 'name', 
        align: 'center',
          width: 500,
        render: (text) => text || '-'
      },
      { 
        title: 'LIBELLÉ', 
        dataIndex: 'libelle', 
        key: 'libelle',
        with: 800,
        align: 'center',
        render: (text) => text || '-'
      },
      { 
        title: 'DATE OP', 
        dataIndex: 'operationDate', 
        key: 'operationDate', 
        align: 'center',
        width: 200,
        render: (text) => formatDate(text)
      },
      { 
        title: 'DATE VAL', 
        dataIndex: 'valueDate', 
        key: 'valueDate', 
        align: 'center',
        width: 200,
        render: (text) => formatDate(text)
      },
      { 
        title: 'MONTANT', 
        dataIndex: 'amount', 
        key: 'amount', 
        align: 'center',
          width: 200,
        render: (text) => formatAmount(text)
      },
      // { 
      //   title: 'RÉFÉRENCE', 
      //   dataIndex: 'reference', 
      //   key: 'reference', 
      //   align: 'center',
      //   width: 200,
      //   render: (text) => text || '-'
      // },
      // { 
      //   title: 'NO-OPER', 
      //   dataIndex: 'noOper', 
      //   key: 'noOper', 
      //   align: 'center',
      //   width: 200,
      //   render: (text) => text || '-'
      // },
     
      { 
        title: 'EST VALIDE ?', 
        dataIndex: 'accountIsValid', 
        key: 'accountIsValid', 
        align: 'center',
        width: 200,
        filters: [
          { text: 'Oui', value: true },
          { text: 'Non', value: false },
        ],
        onFilter: (value, record) => record.accountIsValid === value,
        render: (val) => renderBooleanBadge(val)
      },
    ];

    const handleTableChange = (pagination, filters, sorter) => {
      if (pagination.current !== currentPage) {
        setCurrentPage(pagination.current);
      }

      if (pagination.pageSize !== pageSize) {
        setPageSize(pagination.pageSize);
        setCurrentPage(1);
      }

      if (sorter.field && sorter.order) {
        setSortOrder(sorter.order === 'ascend' ? 'ASC' : 'DESC');
      }
    };

    const handleSearch = (e) => {
      setSearchAccount(e.target.value);
      setCurrentPage(1); // Reset à la première page lors d'une nouvelle recherche
    };

    return (
      <div className="w-full">
        <div className="mb-4 flex justify-between items-center">
          <div className="relative w-[50vh]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Numéro de compte"
              value={searchAccount}
              onChange={handleSearch}
              className="block w-[25vh] pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md 
                       bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                       focus:ring-green-800 focus:border-green-800 
                       dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <span className="text-sm text-gray-600">
            Total: {totalElements} opération(s)
          </span>

          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
        </div>

        <div className="h-96 overflow-auto mb-4">
          {/* <Table
            columns={columns}
            dataSource={operationsData}
            rowKey="id"
            scroll={{ x: 2500, y: '60vh' }}
            size="middle"
            bordered
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalElements,
              responsive: true,
              showSizeChanger: true,
              showQuickJumper: true,
              getPopupContainer: {getPopupContainer},
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} sur ${total} opérations`,
            }}
            onChange={handleTableChange}
            locale={{
              emptyText: loading ? "Chargement..." : "Aucune opération disponible"
            }}
          /> */}
          <Table
            columns={columns}
            dataSource={operationsData}
            rowKey="id"
            scroll={{ x: 2500, y: '57vh' }}
            size="middle"
            bordered
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalElements,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} sur ${total} opérations`
            }}
            onChange={handleTableChange}
            getPopupContainer={getPopupContainer} // CRUCIAL pour les modals
            locale={{
              emptyText: loading ? "Chargement..." : "Aucune opération disponible"
            }}
          />
        </div>
      </div>
    );
  };

  MySwal.fire({
    title: '📋 DÉTAIL DES OPÉRATIONS',
    html: <OperationsTableWithPagination />,
    width: '95%',
    showConfirmButton: false,
    showCloseButton: true,
   customClass: {
      popup: 'custom-swal-popup max-h-screen overflow-visible'
    }
  });
};