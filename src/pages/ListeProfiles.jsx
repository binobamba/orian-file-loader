import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { api } from '../services/api';
import Swal from 'sweetalert2';
import {
  BeautifulTable,
  usePagination
} from '../components/my-ui/Table';
import { Card } from '../components/my-ui/Card';

function ListeProfiles() {
  const [profilesData, setProfilesData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  });

  const [loading, setLoading] = useState(false);
  const [searchLibelle, setSearchLibelle] = useState('');
  const pagination = usePagination(1, 10);
  
  // Références pour le debounce et le suivi des requêtes
  const timeoutRef = useRef(null);
  const isMounted = useRef(true);

  const fetchData = async (code = '', page = 1, size = 10) => {
    if (!isMounted.current) return;
    
    setLoading(true);
    try {
      const response = await api.getProfile({
        code_: code || '',
        page_: page - 1, 
        size_: size
      });
      if (isMounted.current) {
        setProfilesData(response);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Erreur lors du chargement des profils:", error);
        Swal.fire('Erreur', 'Impossible de charger les profils', 'error');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchLibelle('');
    pagination.goToPage(1);
  };

  const handlePageChange = (page) => {
    pagination.goToPage(page);
  };

  // SEUL useEffect qui gère tout
  useEffect(() => {
    isMounted.current = true;
    
    // Fonction de debounce
    const debouncedFetch = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        fetchData(searchLibelle, pagination.currentPage, pagination.pageSize);
      }, 500);
    };

    // Exécuter la requête
    debouncedFetch();

    // Nettoyage
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchLibelle, pagination.currentPage, pagination.pageSize]);

  const hasActiveFilters = searchLibelle;

  return (
    <div className="min-h-screen bg-gray-100 pr-5">
      <Card
        title="LISTE DES PROFILS"
        addBouton={false}
      >
        {/* Conteneur avec défilement et en-tête fixe */}
        <div className="h-[80vh] overflow-y-auto">
          
          {/* En-tête fixe */}
          <div className="sticky top-0 bg-white z-10 pt-4 pb-2 border-b shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              
              {/* Champ recherche Libellé du profil */}
              <div className="md:col-span-3 flex flex-col">
                {/* <label
                  htmlFor="profileLibelle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >

                </label> */}

                <div className="flex gap-2 items-center">
                  {/* Champ de recherche réduit */}
                  <div className="relative ">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="profileLibelle"
                      placeholder="Rechercher"
                      value={searchLibelle}
                      onChange={(e) => setSearchLibelle(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md 
                              bg-white placeholder-gray-400 focus:outline-none focus:ring-1 
                              focus:ring-green-800 focus:border-green-800 
                              dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Bouton Effacer */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="px-3 py-2 text-sm rounded-md bg-gray-500 text-white hover:bg-gray-600 flex items-center"
                    >
                      <FaTimes className="inline mr-1" />
                      Effacer
                    </button>
                  )}
                </div>
              </div>
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
                <div className="h-full overflow-auto">
                  <BeautifulTable
                    headers={[
                      { label: "Code", align: "left" },
                      { label: "Libellé", align: "left" }
                    ]}
                    data={profilesData?.content}
                    emptyMessage={hasActiveFilters ? "Aucun profil trouvé avec ce critère" : "Aucun profil trouvé"}
                    pagination={{
                      currentPage: profilesData?.number + 1,
                      totalPages: profilesData?.totalPages,
                      totalElements: profilesData?.totalElements,
                      pageSize: profilesData?.size,
                      onPageChange: handlePageChange
                    }}
                    renderRow={(profile) => (
                      <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                          <div className="font-medium">{profile.code}</div>
                        </td>
                        <td className="p-2 sm:p-3 text-left text-xs sm:text-sm">
                          <div className="font-medium">{profile.libelle}</div>
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

export default ListeProfiles;