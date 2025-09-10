import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import SidebarLinkGroup from "./SidebarLinkGroup";
import logo from "../../assets/images/favicon.png";
import { api } from "../../services/api";
import { 
  FaHome, FaChartLine, FaCog, FaSignOutAlt, 
  FaChevronDown, FaChevronRight, FaTimes,
  FaUserCog
} from "react-icons/fa";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = 'default' }) {
  const location = useLocation();
  const { pathname } = location;
  const { VITE_ENTREPRISE_NAME } = import.meta.env;
  const navigate = useNavigate();

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await api.logout();
      // Rediriger vers la page de connexion après déconnexion
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Gérer les erreurs éventuelles
    }
  };

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ key }) => {
      if (!sidebarOpen || key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  // Menu items data
const menuItems = [
  {
    name: "Dashboard",
    icon: <FaHome className="w-5 h-5" />,
    path: "/dashboard",
    active: pathname === "/dashboard" || pathname.includes("dashboard"),
  },
  {
    name: "Demandes",
    icon: <FaChartLine className="w-5 h-5" />,
    path: "/demandes",
    active: pathname === "/demandes" || pathname.includes("demandes"),
  },
  {
    name: "Analytics",
    icon: <FaChartLine className="w-5 h-5" />,
    path: "/analytics",
    active: pathname === "/analytics" || pathname.includes("analytics"),
  },
  {
    name: "Gestion des utilisateurs",
    icon: <FaUserCog className="w-5 h-5" />,
    path: "/users",
    active: pathname === "/users" || pathname.includes("users"),
  },
];


  return (
    <div className="min-w-fit">
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-black transition-all duration-200 ease-in-out  ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } ${variant === 'v2' ? 'border-r border-gray-700' : 'shadow-xl shadow-black/50'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between items-center mb-15 bg-green-900 p-3">
          {/* Logo */}
          <div className="flex items-center">
            <NavLink end to="/" className="flex items-center">
              <img src={logo} alt="BNI" className="h-10 w-auto" />
              <h1 className="ml-3 text-xs text-white font-semibold hidden sm:block hidden:md">
                {VITE_ENTREPRISE_NAME}
              </h1>
            </NavLink>
          </div>
          
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-400 hover:text-orange-500 p-1 rounded-full"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>


      <div
      className="xl:px-4 lg:px-2 md:px-1 sm:px-0 py-2"
      > 
      {/* Sidebar links */}
              <div className="space-y-2">
                {menuItems.map((item, index) => (
                  <div key={index}>
                    {item.submenu ? (
                      <SidebarLinkGroup activecondition={item.active}>
                        {(handleClick, open) => {
                          return (
                            <div className="mb-2">
                              <button
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                                  item.active
                                    ? "bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg"
                                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleClick();
                                }}
                              >
                                <div className="flex items-center">
                                  <span className={item.active ? "text-white" : "text-gray-400"}>
                                    {item.icon}
                                  </span>
                                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                                    {item.name}
                                  </span>
                                </div>
                                <div className="flex shrink-0">
                                  {open ? (
                                    <FaChevronDown className="w-3 h-3 fill-current" />
                                  ) : (
                                    <FaChevronRight className="w-3 h-3 fill-current" />
                                  )}
                                </div>
                              </button>
                              
                              {open && (
                                <ul className="mt-1 ml-4 pl-6 border-l-2 border-gray-700">
                                  {item.submenu.map((subItem, subIndex) => (
                                    <li key={subIndex} className="mb-1 last:mb-0">
                                      <NavLink
                                        end
                                        to={subItem.path}
                                        className={({ isActive }) =>
                                          `block p-2 text-sm rounded transition-colors duration-150 ${
                                            isActive
                                              ? "text-orange-400 font-medium"
                                              : "text-gray-400 hover:text-white"
                                          }`
                                        }
                                      >
                                        {subItem.name}
                                      </NavLink>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        }}
                      </SidebarLinkGroup>
                    ) : (
                      <NavLink
                        end
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center p-3 rounded-lg transition-all duration-200 mb-2 ${
                            isActive
                              ? "bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg"
                              : "text-gray-300 hover:text-white hover:bg-green-900"
                          }`
                        }
                      >
                        <span className={item.active ? "text-white" : "text-gray-400"}>
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                          {item.name}
                        </span>
                      </NavLink>
                    )}
                  </div>
                ))}
              </div>

              {/* Additional section for settings and logout */}
              <div className="mt-auto pt-8">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-all duration-200 mb-2 ${
                      isActive
                        ? "bg-gradient-to-r from-orange-500 to-green-500 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`
                  }
                >
                  <FaCog className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Paramètres
                  </span>
                </NavLink>
                
                <button 
                  className="flex items-center w-full p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-200"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium ml-3 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
                    Déconnexion
                  </span>
                </button>
              </div>
      </div>
        

      </div>
    </div>
  );
}

export default Sidebar;