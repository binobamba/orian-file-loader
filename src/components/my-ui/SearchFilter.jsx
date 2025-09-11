// src/components/SearchFilter.jsx
import React from 'react';
import { FaSearch } from 'react-icons/fa';

const SearchFilter = ({
  searchFirstName,
  setSearchFirstName,
  searchLastName,
  setSearchLastName,
  searchMatricule,
  setSearchMatricule,
  handleSearch,
  handleClearSearch,
  hasActiveFilters
}) => {
  return (
    <div className="mb-0 bg-gray-200 dark:bg-gray-800 rounded-md pt-4 pb-2 px-1">
      <form onSubmit={handleSearch} className="space-y-3 md:space-y-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          {/* Champ prénom */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="Prénom"
              value={searchFirstName}
              onChange={(e) => setSearchFirstName(e.target.value)}
              className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Champ nom */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              placeholder="Nom"
              value={searchLastName}
              onChange={(e) => setSearchLastName(e.target.value)}
              className="block w-full px-2 py-1 text-md border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Champ matricule */}
          <div>
            <label
              htmlFor="matricule"
              className="block text-md font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Matricule
            </label>
            <input
              type="text"
              id="matricule"
              placeholder="Matricule"
              value={searchMatricule}
              onChange={(e) => setSearchMatricule(e.target.value)}
              className="block w-full px-2 py-1 text-md border border-gray-300 rounded-md bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1 text-md rounded-md bg-green-600 text-white hover:bg-green-700"
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
                Effacer
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchFilter;