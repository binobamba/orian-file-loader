/**
 * Permission service for managing user permissions.
 */

class PermissionService {
    constructor() {
        this.permissions = new Map();
    }

    /**
     * Set permissions for a user.
     * @param {string} userId
     * @param {Array<string>} permissions
     */
    setPermissions(userId, permissions) {
        this.permissions.set(userId, new Set(permissions));
    }

    /**
     * Check if a user has a specific permission.
     * @param {string} userId
     * @param {string} permission
     * @returns {boolean}
     */
    hasPermission(userId, permission) {
        const userPermissions = this.permissions.get(userId);
        return userPermissions ? userPermissions.has(permission) : false;
    }

    /**
     * Get all permissions for a user.
     * @param {string} userId
     * @returns {Array<string>}
     */
    getPermissions(userId) {
        const userPermissions = this.permissions.get(userId);
        return userPermissions ? Array.from(userPermissions) : [];
    }
}

module.exports = new PermissionService();