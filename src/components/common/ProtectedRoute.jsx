import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessModule } from '../../services/permission';

const ProtectedRoute = ({ children, moduleName = null }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const [accessGranted, setAccessGranted] = useState(null);

    useEffect(() => {
        const checkAccess = async () => {
            if (!isAuthenticated || loading) return;
            
            // Si pas de module spécifié, accès granted
            if (!moduleName) {
                setAccessGranted(true);
                return;
            }

            try {
                const hasAccess = await canAccessModule(moduleName);
                setAccessGranted(hasAccess);
            } catch (error) {
                console.error('Error checking access:', error);
                setAccessGranted(false);
            }
        };

        checkAccess();
    }, [isAuthenticated, loading, moduleName]);

    // Loading state
    if (loading || (moduleName && accessGranted === null)) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <span className="ml-3">Vérification des permissions...</span>
            </div>
        );
    }

    // Redirection si non authentifié
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Accès refusé si permissions insuffisantes
    if (moduleName && accessGranted === false) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center p-6 bg-red-50 rounded-lg">
                    <h2 className="text-6xl font-semibold text-red-600 mb-2">
                        ⚠️ Accès refusé
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <p className="text-sm text-gray-500">
                        Seuls les administrateurs peuvent accéder à cette fonctionnalité.
                    </p>
                </div>
            </div>
        );
    }

    // Accès autorisé
    return children;
};

export default ProtectedRoute;