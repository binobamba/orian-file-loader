import React, { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const showOperationsModalWithPagination = (operationsData = []) => {
  const OperationsTableWithPagination = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const totalPages = Math.ceil(operationsData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = operationsData.slice(startIndex, startIndex + itemsPerPage);

    const formatAmount = (amount) => {
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('fr-FR');
    };

    return (
      <div className="w-full">
        <div className="mb-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Total: {operationsData.length} opération(s)
          </span>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
        </div>

        <div className="h-96 overflow-auto mb-4">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr className="bg-green-800 text-white">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Compte</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Nom</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Date Op</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Date Val</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase">Montant</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Libellé</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Ref Rel</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">No Oper</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.map((operation, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{operation.compte || '-'}</td>
                  <td className="px-4 py-2 text-sm">{operation.nom || '-'}</td>
                  <td className="px-4 py-2 text-sm">{formatDate(operation.date_operation)}</td>
                  <td className="px-4 py-2 text-sm">{formatDate(operation.date_valeur)}</td>
                  <td className="px-4 py-2 text-sm text-right">{formatAmount(operation.montant)}</td>
                  <td className="px-4 py-2 text-sm max-w-xs truncate">{operation.libelle || '-'}</td>
                  <td className="px-4 py-2 text-sm">{operation.ref_rel || '-'}</td>
                  <td className="px-4 py-2 text-sm">{operation.no_oper || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Précédent
            </button>
            
            <span className="text-sm">
              Page {currentPage} sur {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
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
      popup: 'max-h-screen'
    }
  });
};