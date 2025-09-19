import { createContext, useContext, useState, useEffect } from "react";
import { api, setAuthToken } from '../services/api'; // setAuthToken mettra à jour les headers
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Vérifier l'authentification au montage du composant
  useEffect(() => {
    if (location.pathname !== "/login") {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, [location.pathname]); 


  const checkAuth = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      if (token) {
        setAuthToken(token); // met à jour Axios avec le token
        const userData = await api.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      sessionStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login({ email, password });

      if (response?.data?.token) {
        const token = response.data.token;
        sessionStorage.setItem("token", token);
        setAuthToken(token); // mettre le token dans les headers Axios

        const userData = await api.getCurrentUser();
        setUser(userData);
        setIsAuthenticated(true);

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: response.message || "Connexion réussie avec succès",
          showConfirmButton: false,
          timer: 2000
        });

        return { success: true };
      } else {
        return { success: false , message: response.message};
      }
    } catch (error) {
      return { success: false, message: error?.message || "Erreur de connexion" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      sessionStorage.removeItem("token");
      setAuthToken(null); // supprime le token des headers Axios
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = { isAuthenticated, user, loading, login, logout, checkAuth };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
