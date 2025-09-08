// src/App.tsx
import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation
} from 'react-router-dom';

import './css/style.css';
import './charts/ChartjsConfig';

import Dashboard from './pages/Dashboard';
import Demande from './pages/Demande';
import Login from './pages/Login';

import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

import { AuthProvider } from './layouts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]);

  return (
    <AuthProvider>
      <Routes>
        {/* Routes protégées avec layout principal */}
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/demande"
            element={
              <ProtectedRoute>
                <Demande />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Route login sans layout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
