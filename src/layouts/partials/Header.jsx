import React, { useState, useEffect } from 'react';
import UserMenu from '../../components/ui/DropdownProfile';
import ThemeToggle from '../../components/ui/ThemeToggle';
import { FaAlignJustify, FaSearch } from 'react-icons/fa';

const APP_NAME = import.meta.env.VITE_APP_NAME;

function Header({
  sidebarOpen,
  setSidebarOpen,
  variant = 'default',
}) {
  const [isScrolled, setIsScrolled] = useState(false);


  // Détecter le défilement pour ajouter un effet d'ombre
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-30 transition-all duration-300 ${
      isScrolled 
        ? 'shadow-lg dark:shadow-gray-800/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm' 
        : 'bg-white dark:bg-gray-800'
    }`}>
      <div className="px-4 sm:px-6 lg:px-8 py-2 shadow-lg dark:shadow-gray-800/30">
        <div className="flex items-center justify-between">
          {/* Header: Left side */}
          <div className="flex items-center">
            {/* Hamburger button */}
            <button
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={(e) => { 
                e.stopPropagation(); 
                setSidebarOpen(!sidebarOpen); 
              }}
            >
              <span className="sr-only">Open sidebar</span>
              <FaAlignJustify className="w-5 h-5" />
            </button>

            {/* Logo ou titre de l'application - optionnel */}
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-semibold text-center text-gray-800 dark:text-white hidden sm:block">
                {APP_NAME}
              </h1>
            </div>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-4">
            {/* Barre de recherche simplifiée */}
            <button 
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Rechercher"
            >
              <FaSearch className="w-4 h-4" />
            </button>
            
            <ThemeToggle />
            
            <div className="border-l border-gray-200 dark:border-gray-700 h-6 mx-2"></div>
            
            <UserMenu align="right" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;