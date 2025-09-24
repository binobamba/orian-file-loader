import React from "react";
import { useState } from "react";

export const TableWrapper = ({ children }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
    {children}
  </div>
);

export const Table = ({ children }) => (
  <table className="w-full border-collapse bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
    {children}
  </table>
);

export const TableHead = ({ children }) => (
  <thead className="bg-green-800 dark:bg-gray-800 text-white">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
    {children}
  </tbody>
);

export const TableRow = ({ children, className = "", ...props }) => (
  <tr className={`${className}`} {...props}>
    {children}
  </tr>
);

export const TableHeader = ({ children, align = "left" }) => (
  <th className={`p-2 sm:p-3 text-${align} font-semibold text-xs sm:text-sm uppercase`}>
    {children}
  </th>
);

export const TableData = ({ children, align = "left", className = "" }) => (
  <td className={`p-2 sm:p-3 text-${align} text-xs sm:text-sm ${className}`}>
    {children}
  </td>
);

export const TableCell = TableData;

// Composant de Pagination simplifié
export const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalElements,
  pageSize,
  onPageChange,
  className = "" 
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Informations sur les éléments */}

      <div className="mb-2 sm:mb-0">
        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{Math.min(currentPage * pageSize, totalElements)}</span> /{" "}
          <span className="font-medium">{totalElements}</span>
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center space-x-1">
        {/* Page précédente */}       
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Précédent
        </button>

        {/* Pages numérotées */}
        <span className="px-2 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Page {currentPage} sur {totalPages}
        </span>

        {/* Page suivante */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export const usePagination = (initialPage = 1, initialPageSize = 10) => {
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [pageSize, setPageSize] = useState(initialPageSize);
  
    const goToPage = (page) => {
      setCurrentPage(page);
    };
  
    const nextPage = () => {
      setCurrentPage(prev => prev + 1);
    };
  
    const prevPage = () => {
      setCurrentPage(prev => Math.max(1, prev - 1));
    };
  
    return {
      currentPage,
      pageSize,
      setPageSize,
      goToPage,
      nextPage,
      prevPage
    };
  };

// Composant BeautifulTable avec pagination
export const BeautifulTable = ({ 
  headers, 
  data, 
  renderRow, 
  emptyMessage = "Aucune donnée disponible",
  pagination = null,
  className = "" 
}) => {
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      <TableWrapper>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableHeader key={index} align={header.align || "left"}>
                  {header.label}
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.length === 0 ? (
              <TableRow>
                <TableData colSpan={headers.length} align="center" className="py-8 text-gray-500 dark:text-gray-400 w-ful">
                  {emptyMessage}
                </TableData>
              </TableRow>
            ) : (
              data?.map((item, index) => renderRow(item, index))
            )}
          </TableBody>
        </Table>
      </TableWrapper>

      {/* Pagination */}
      {pagination && data?.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
        />
      )}
    </div>
  );
};