import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './assets/css/style.css';
import './assets/antStyle.css';
import './components/charts/ChartjsConfig';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ErrorLayout from './layouts/ErrorLayout';
import Dashboard from './pages/Dashboard';
import Demande from './pages/Demande';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import UserRole from './pages/User-Role';
import ListeProfiles from  './pages/ListeProfiles';

import RolePermission from './pages/RolePermission'
import Monprofil from './pages/Monprofil'


function App() {
  const location = useLocation();

  // Remonter en haut à chaque changement de route
  useEffect(() => {
    const html = document.querySelector('html');
    html.style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    html.style.scrollBehavior = '';
  }, [location.pathname]);

  return (
    <AuthProvider>
      <Routes>
        {/* Layout principal (après connexion) */}
        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* ==================== USERS MANAGEMENT and ROLES ==================== */}
          <Route
            path="/user-role"
            element={
              <ProtectedRoute>
                <UserRole />
              </ProtectedRoute>
            }
          />

          {/* ==================== DEMANDES MANAGERS ==================== */}

          <Route
            path="/demandes"
            element={
              <ProtectedRoute>
                <Demande />
              </ProtectedRoute>
            }
          />

           <Route
            path="/roles-permissions"
            element={
              <ProtectedRoute>
                <RolePermission />
              </ProtectedRoute>
            }
          />

          <Route
          path="/tous-profils"
          element={
            <ProtectedRoute>
              <ListeProfiles />
            </ProtectedRoute>
          }
          >


          </Route>


          <Route
            path="/monprofil"
            element={
              <ProtectedRoute>
                <Monprofil />
              </ProtectedRoute>
            }
          />
        
        
        </Route>

          

        {/* Layout d’authentification */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Layout des erreurs */}
        <Route element={<ErrorLayout />}>
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
