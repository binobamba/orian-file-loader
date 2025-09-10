import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Transition from '../../utils/Transition';
import { FaUserCircle, FaSignOutAlt, FaUserCog } from 'react-icons/fa';
import { FaAngleDown } from 'react-icons/fa6';
import { api } from '../../services/api';

function DropdownProfile({ align = 'right' }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({});
  const trigger = useRef(null);
  const dropdown = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await api.getLocalProfile();
        console.log(userData);
        setUserData(userData);
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };
  
    fetchData();
  }, []);
  

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!dropdown.current || !trigger.current) return;
      if (!dropdownOpen || 
          dropdown.current.contains(target) || 
          trigger.current.contains(target)) return;
      setDropdownOpen(false);
    };
    
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  }, [dropdownOpen]);

  // Fermer avec la touche Échap
  useEffect(() => {
    const keyHandler = ({ key }) => {
      if (!dropdownOpen || key !== 'Escape') return;
      setDropdownOpen(false);
    };
    
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [dropdownOpen]);

  return (
    <div className="relative inline-flex">
      <button
        ref={trigger}
        className="inline-flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-violet-400 rounded-full px-2 py-1 transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-haspopup="true"
        aria-label="Menu utilisateur"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-expanded={dropdownOpen}
      >
        <div className="flex items-center truncate">
          <FaUserCircle
            className="w-8 h-8 text-gray-700 dark:text-gray-300"
            aria-hidden="true"
          />
          <div className="ml-2 text-left hidden md:block">
            <span className="block text-sm font-medium text-gray-800 dark:text-white truncate max-w-[120px]">
              {userData.nom}
            </span>
            <span className="block text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
              {userData.code}
            </span>
          </div>
          <FaAngleDown
            className={`w-4 h-4 ml-1 text-gray-600 dark:text-gray-300 transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </div>
      </button>

      <Transition
        className={`origin-top-right absolute top-full mt-2 min-w-60 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50 overflow-hidden ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
        show={dropdownOpen}
        enter="transition ease-out duration-200 transform"
        enterStart="opacity-0 -translate-y-2"
        enterEnd="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveStart="opacity-100"
        leaveEnd="opacity-0 -translate-y-1"
      >
        <div
          ref={dropdown}
          className="divide-y divide-gray-100 dark:divide-gray-700"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          {/* En-tête utilisateur */}
          <div className="px-4 py-3">
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
              {userData.nom} {userData.prenoms}
            </p>
            <p className="text-xs mt-1 text-gray-500 dark:text-gray-400 italic">
              {userData.isUser ? "Utilisateur" : "Administrateur"} • {userData.code}
            </p>
          </div>

          {/* Liens de navigation */}
          <div className="py-2">
            <Link
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-150"
              to="/profile"
              onClick={() => setDropdownOpen(false)}
              role="menuitem"
            >
              <FaUserCog className="w-4 h-4 mr-3" aria-hidden="true" />
              Mon profil
            </Link>
            <Link
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300 transition-colors duration-150"
              to="/settings"
              onClick={() => setDropdownOpen(false)}
              role="menuitem"
            >
              <FaUserCog className="w-4 h-4 mr-3" aria-hidden="true" />
              Paramètres
            </Link>
          </div>

          {/* Déconnexion */}
          <div className="py-2">
            <button
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
              onClick={api.logout}
              role="menuitem"
            >
              <FaSignOutAlt className="w-4 h-4 mr-3" aria-hidden="true" />
              Se déconnecter
            </button>
          </div>
        </div>
      </Transition>
    </div>
  );
}

export default DropdownProfile;