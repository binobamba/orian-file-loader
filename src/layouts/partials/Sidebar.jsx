import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import SidebarLinkGroup from "./SidebarLinkGroup";
import logo from "../../assets/images/favicon.png";
import { 
  FaHome, FaChartLine, FaCog, FaSignOutAlt, 
  FaChevronDown, FaChevronRight, FaTimes,
  FaUserCog
} from "react-icons/fa";

function Sidebar({ sidebarOpen, setSidebarOpen, variant = 'default' }) {
  const location = useLocation();
  const { pathname } = location;
  const { VITE_ENTREPRISE_NAME } = import.meta.env;

  const trigger = useRef(null);
  const sidebar = useRef(null);

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

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
      path: "/",
      active: pathname === "/" || pathname.includes("dashboard")
    },
    {
      name: "Analytics",
      icon: <FaChartLine className="w-5 h-5" />,
      path: "/analytics",
      active: pathname.includes("analytics")
    },
   // gestion des utilisateurs
   {
    name: "Gestion des utilisateurs",
    icon: <FaUserCog className="w-5 h-5" />,
    path: "/users",
    active: pathname.includes("users")
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
        className={`flex flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:!w-64 shrink-0 bg-gradient-to-b from-green-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 p-4 transition-all duration-200 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-64"
        } ${variant === 'v2' ? 'border-r border-gray-200 dark:border-gray-700/60' : 'shadow-lg'}`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between items-center mb-8">
  {/* Logo */}
            <div className="flex items-center">
              <NavLink end to="/" className="flex items-center">
                <img src={logo} alt="BNI" className="h-10 w-auto" />
                <h1 className="ml-3 text-xs text-gray-600 font-semibold dark:text-white hidden sm:block hidden:md">
                  {VITE_ENTREPRISE_NAME}
                </h1>
              </NavLink>
            </div>
            
            {/* Close button */}
            <button
              ref={trigger}
              className="lg:hidden text-gray-600 hover:text-orange-500 dark:text-gray-300 dark:hover:text-orange-400 p-1 rounded-full"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

        {/* Links */}
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
                              ? "bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-md"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r from-green-400/20 to-orange-400/20 hover:text-gray-900 dark:hover:text-white"
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick();
                          }}
                        >
                          <div className="flex items-center">
                            <span className={`${item.active ? "text-white" : "text-green-500"}`}>
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
                          <ul className="mt-1 ml-4 pl-6 border-l-2 border-green-200 dark:border-green-700/40">
                            {item.submenu.map((subItem, subIndex) => (
                              <li key={subIndex} className="mb-1 last:mb-0">
                                <NavLink
                                  end
                                  to={subItem.path}
                                  className={({ isActive }) =>
                                    `block p-2 text-sm rounded transition-colors duration-150 ${
                                      isActive
                                        ? "text-orange-600 dark:text-orange-400 font-medium"
                                        : "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
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
                        ? "bg-gradient-to-r from-green-500 to-orange-500 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r from-green-400/20 to-orange-400/20 hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                >
                  <span className={item.active ? "text-white" : "text-green-500"}>
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

      </div>
    </div>
  );
}

export default Sidebar;