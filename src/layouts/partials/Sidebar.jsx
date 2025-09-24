import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/images/favicon.png";
import { api } from "../../services/api";
import { canAccessModule, getUserInfo } from "../../services/permission";
import {
  FaHome,
  FaChartLine,
  FaSignOutAlt,
  FaTimes,
  FaUserCog,
  FaLock,
  FaPortrait,
  FaListAlt,
  FaUserTie,
  FaChevronRight,
  FaChevronLeft
} from "react-icons/fa";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;
  const { VITE_ENTREPRISE_NAME } = import.meta.env;
  const navigate = useNavigate();

  const trigger = useRef(null);
  const sidebar = useRef(null);
  const [userInfo, setUserInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // Charger les infos utilisateur et filtrer le menu
  useEffect(() => {
    const loadUserAndMenu = async () => {
      const info = await getUserInfo();
      setUserInfo(info);
      
      // Tous les items du menu
      const allMenuItems = [
        {
          name: "Dashboard",
          icon: <FaHome className="w-5 h-5 flex-shrink-0" />,
          path: "/dashboard",
          module: "dashboard"
        },
        {
          name: "Demandes",
          icon: <FaChartLine className="w-5 h-5 flex-shrink-0" />,
          path: "/demandes",
          module: "demandes"
        },
        {
          name: "Gestion utilisateurs",
          icon: <FaUserCog className="w-5 h-5 flex-shrink-0" />,
          path: "/user-role",
          module: "gestion_utilisateurs",
          adminOnly: true
        },
        {
          name: "Roles & Permissions",
          icon: <FaLock className="w-5 h-5 flex-shrink-0" />,
          path: "/roles-permissions",
          module: "roles_permissions",
          adminOnly: true
        },
        {
          name: "Profils-Orion",
          icon: <FaListAlt className="w-5 h-5 flex-shrink-0" />,
          path: "/tous-profils",
          module: "profils_orion",
          adminOnly: true
        },
      ];

      // Filtrer selon les permissions
      const filteredItems = [];
      for (const item of allMenuItems) {
        if (item.adminOnly && !info.isAdmin) {
          continue;
        }
        
        const hasAccess = await canAccessModule(item.module);
        if (hasAccess) {
          filteredItems.push(item);
        }
      }
      
      setMenuItems(filteredItems);
    };

    loadUserAndMenu();
  }, []);

  // Fermer le sidebar en cliquant à l'extérieur (mobile)
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Fermer avec la touche Échap (mobile)
  useEffect(() => {
    const keyHandler = ({ key }) => {
      if (!sidebarOpen || key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  // Sauvegarder l'état du sidebar
  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  const isActive = (path) => pathname === path || pathname.includes(path);

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <>
      {/* Overlay pour mobile */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        ref={sidebar}
        className={`flex flex-col fixed lg:sticky top-0 z-50 lg:z-auto h-screen overflow-y-auto no-scrollbar w-64 lg:w-[70px] xl:w-64 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          sidebarExpanded ? "lg:w-64" : "lg:w-[70px]"
        }`}
        style={{ 
          height: '100vh',
          top: 0,
          left: 0
        }}
      >
        {/* Header du sidebar */}
        <div className="flex justify-between items-center bg-green-900 p-4 min-h-[64px]">
          <div className="flex items-center min-w-0">
            <NavLink 
              end to="/" 
              className="flex items-center min-w-0"
              onClick={() => setSidebarOpen(false)}
            >
              <img src={logo} alt="Logo" className="h-8 w-8 flex-shrink-0" />
              <h1 className={`ml-3 text-sm text-white font-semibold truncate transition-all duration-300 ${
                sidebarExpanded ? "opacity-100" : "lg:opacity-0 xl:opacity-100"
              }`}>
                {VITE_ENTREPRISE_NAME}
              </h1>
            </NavLink>
          </div>
          
          {/* Bouton fermer (mobile) */}
          <button
            ref={trigger}
            className="lg:hidden text-white hover:text-orange-200 p-1 rounded transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Section informations utilisateur */}
        {userInfo && (
          <div className="px-3 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-full flex-shrink-0">
                <FaUserTie className="w-5 h-5 text-green-600" />
              </div>
              <div className={`ml-3 min-w-0 transition-all duration-300 ${
                sidebarExpanded ? "opacity-100" : "lg:opacity-0 xl:opacity-100"
              }`}>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {userInfo.firstName} {userInfo.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userInfo.matricule}
                </p>
                {userInfo.isAdmin && (
                  <span className="inline-block px-1.5 py-0.5 text-[10px] bg-red-100 text-red-800 rounded-full mt-1">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation principale */}
        <div className="flex-1 flex flex-col py-4">
          <nav className="flex-1 space-y-1 px-2">
            {menuItems.map((item, index) => (
              <NavLink
                key={index}
                end
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-green-800 text-white shadow-md"
                      : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                  }`
                }
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
              >
                <div className={`flex items-center w-full ${
                  isActive(item.path) ? "text-white" : "text-gray-600"
                }`}>
                  {item.icon}
                  <span className={`ml-3 text-sm font-medium truncate transition-all duration-300 ${
                    sidebarExpanded ? "opacity-100" : "lg:opacity-0 xl:opacity-100"
                  }`}>
                    {item.name}
                  </span>
                </div>
              </NavLink>
            ))}
          </nav>

          {/* Section basse */}
          <div className="mt-auto px-2 space-y-1">
            <NavLink
              to="/monprofil"
              className={({ isActive }) =>
                `group flex items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-green-800 text-white"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                }`}
            >
              <FaPortrait className="w-5 h-5 flex-shrink-0" />
              <span className={`ml-3 text-sm font-medium truncate transition-all duration-300 ${
                sidebarExpanded ? "opacity-100" : "lg:opacity-0 xl:opacity-100"
              }`}>
                Mon profil
              </span>
            </NavLink>
            
            <button 
              className="group flex items-center w-full p-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
              <span className={`ml-3 text-sm font-medium truncate transition-all duration-300 ${
                sidebarExpanded ? "opacity-100" : "lg:opacity-0 xl:opacity-100"
              }`}>
                Déconnexion
              </span>
            </button>
          </div>
        </div>

        {/* Bouton expand/collapse (desktop) */}
        <div className="hidden lg:flex items-center justify-center p-3 border-t border-gray-200">
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-green-700 hover:bg-green-50 transition-colors"
            aria-label={sidebarExpanded ? "Réduire le menu" : "Développer le menu"}
          >
            {sidebarExpanded ? (
              <FaChevronLeft className="w-3 h-3" />
            ) : (
              <FaChevronRight className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;