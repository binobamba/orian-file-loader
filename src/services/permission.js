import { api } from "./api";

// Cache pour les permissions
let userPermissionsCache = null;

// Fonction asynchrone pour récupérer les données utilisateur
async function getUserData() {
    if (userPermissionsCache) {
        return userPermissionsCache;
    }
    
    try {
        const userData = await api.getCurrentUser();
        userPermissionsCache = userData;
        return userData;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

export async function isAdmin() {
    const userData = await getUserData();
    
    if (!userData || !userData.roles) {
        return false;
    }

    // Vérifier si l'utilisateur a le rôle administrateur
    return userData.roles.some(role => {
        const roleName = role.name?.toLowerCase() || '';
        return roleName.includes('admin') || 
               roleName.includes('administrateur') ||
               roleName === 'super admin';
    });
}

export async function canAccessModule(moduleName) {
    console.log(`=== Checking access for module: ${moduleName} ===`);
    
    // Si l'utilisateur est admin, il a accès à tout
    if (await isAdmin()) {
        console.log('User is admin - granting access to everything');
        return true;
    }

    // Pour les non-administrateurs : uniquement dashboard et demandes
    const allowedModulesForNonAdmin = ['dashboard', 'demandes'];
    
    const hasAccess = allowedModulesForNonAdmin.includes(moduleName);
    console.log(`Non-admin access to ${moduleName}:`, hasAccess);
    
    return hasAccess;
}

export function clearPermissionCache() {
    userPermissionsCache = null;
}

// Fonctions utilitaires pour afficher les infos utilisateur
export async function getUserInfo() {
    const userData = await getUserData();
    return {
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        email: userData?.email,
        matricule: userData?.matricule,
        roles: userData?.roles?.map(role => role.name) || [],
        isAdmin: await isAdmin()
    };
}