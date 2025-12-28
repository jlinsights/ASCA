/**
 * Role Manager
 *
 * Manages user roles and permissions.
 *
 * Features:
 * - Role assignment and revocation
 * - Permission checking
 * - Role hierarchy
 * - Custom permissions per user
 * - Caching for performance
 *
 * @module lib/admin/role-manager
 */

import {
  Role,
  Permission,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissionsForRole,
  getEffectivePermissions,
  type PermissionCheckResult,
} from './permissions';

/**
 * User role info
 */
export interface UserRole {
  userId: string;
  roles: Role[];
  customPermissions: Permission[];
  effectivePermissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Role assignment
 */
export interface RoleAssignment {
  userId: string;
  role: Role;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

/**
 * Role Manager
 *
 * Manages roles and permissions for users.
 */
export class RoleManager {
  private userRoles: Map<string, UserRole>;
  private roleCache: Map<string, Permission[]>;

  constructor() {
    this.userRoles = new Map();
    this.roleCache = new Map();
  }

  /**
   * Assign role to user
   *
   * @param userId - User ID
   * @param role - Role to assign
   * @param assignedBy - ID of user assigning the role
   * @returns Updated user role info
   */
  assignRole(userId: string, role: Role, assignedBy: string): UserRole {
    const userRole = this.getUserRole(userId);

    // Add role if not already assigned
    if (!userRole.roles.includes(role)) {
      userRole.roles.push(role);
      userRole.updatedAt = new Date();

      // Recalculate effective permissions
      userRole.effectivePermissions = this.calculateEffectivePermissions(userRole);

      // Clear cache for this user
      this.roleCache.delete(userId);
    }

    return userRole;
  }

  /**
   * Revoke role from user
   *
   * @param userId - User ID
   * @param role - Role to revoke
   * @returns Updated user role info
   */
  revokeRole(userId: string, role: Role): UserRole {
    const userRole = this.getUserRole(userId);

    // Remove role
    userRole.roles = userRole.roles.filter((r) => r !== role);
    userRole.updatedAt = new Date();

    // Recalculate effective permissions
    userRole.effectivePermissions = this.calculateEffectivePermissions(userRole);

    // Clear cache
    this.roleCache.delete(userId);

    return userRole;
  }

  /**
   * Add custom permission to user
   *
   * @param userId - User ID
   * @param permission - Permission to add
   * @returns Updated user role info
   */
  addPermission(userId: string, permission: Permission): UserRole {
    const userRole = this.getUserRole(userId);

    // Add permission if not already assigned
    if (!userRole.customPermissions.includes(permission)) {
      userRole.customPermissions.push(permission);
      userRole.updatedAt = new Date();

      // Recalculate effective permissions
      userRole.effectivePermissions = this.calculateEffectivePermissions(userRole);

      // Clear cache
      this.roleCache.delete(userId);
    }

    return userRole;
  }

  /**
   * Remove custom permission from user
   *
   * @param userId - User ID
   * @param permission - Permission to remove
   * @returns Updated user role info
   */
  revokePermission(userId: string, permission: Permission): UserRole {
    const userRole = this.getUserRole(userId);

    // Remove permission
    userRole.customPermissions = userRole.customPermissions.filter(
      (p) => p !== permission
    );
    userRole.updatedAt = new Date();

    // Recalculate effective permissions
    userRole.effectivePermissions = this.calculateEffectivePermissions(userRole);

    // Clear cache
    this.roleCache.delete(userId);

    return userRole;
  }

  /**
   * Get user role info
   *
   * @param userId - User ID
   * @returns User role info
   */
  getUserRole(userId: string): UserRole {
    let userRole = this.userRoles.get(userId);

    if (!userRole) {
      // Create default user role
      userRole = {
        userId,
        roles: [Role.VIEWER], // Default role
        customPermissions: [],
        effectivePermissions: getPermissionsForRole(Role.VIEWER),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.userRoles.set(userId, userRole);
    }

    return userRole;
  }

  /**
   * Get user's roles
   *
   * @param userId - User ID
   * @returns Array of roles
   */
  getUserRoles(userId: string): Role[] {
    return this.getUserRole(userId).roles;
  }

  /**
   * Get user's effective permissions (cached)
   *
   * @param userId - User ID
   * @returns Array of permissions
   */
  getUserPermissions(userId: string): Permission[] {
    // Check cache
    const cached = this.roleCache.get(userId);
    if (cached) {
      return cached;
    }

    // Calculate and cache
    const userRole = this.getUserRole(userId);
    const permissions = userRole.effectivePermissions;

    this.roleCache.set(userId, permissions);

    return permissions;
  }

  /**
   * Calculate effective permissions for user
   *
   * @param userRole - User role info
   * @returns Effective permissions
   */
  private calculateEffectivePermissions(userRole: UserRole): Permission[] {
    const permissions = new Set<Permission>();

    // Add permissions from roles
    for (const role of userRole.roles) {
      const rolePerms = getPermissionsForRole(role);
      for (const perm of rolePerms) {
        permissions.add(perm);
      }
    }

    // Add custom permissions
    for (const perm of userRole.customPermissions) {
      permissions.add(perm);
    }

    // Expand wildcards
    return getEffectivePermissions(Array.from(permissions));
  }

  /**
   * Check if user has permission
   *
   * @param userId - User ID
   * @param permission - Required permission
   * @returns True if user has permission
   */
  can(userId: string, permission: Permission): boolean {
    const userPermissions = this.getUserPermissions(userId);
    return hasPermission(userPermissions, permission);
  }

  /**
   * Check if user has all permissions
   *
   * @param userId - User ID
   * @param permissions - Required permissions
   * @returns True if user has all permissions
   */
  canAll(userId: string, permissions: Permission[]): boolean {
    const userPermissions = this.getUserPermissions(userId);
    return hasAllPermissions(userPermissions, permissions);
  }

  /**
   * Check if user has any permission
   *
   * @param userId - User ID
   * @param permissions - Required permissions
   * @returns True if user has any permission
   */
  canAny(userId: string, permissions: Permission[]): boolean {
    const userPermissions = this.getUserPermissions(userId);
    return hasAnyPermission(userPermissions, permissions);
  }

  /**
   * Check if user has role
   *
   * @param userId - User ID
   * @param role - Role to check
   * @returns True if user has role
   */
  hasRole(userId: string, role: Role): boolean {
    return this.getUserRoles(userId).includes(role);
  }

  /**
   * Check if user has any of the roles
   *
   * @param userId - User ID
   * @param roles - Roles to check
   * @returns True if user has any role
   */
  hasAnyRole(userId: string, roles: Role[]): boolean {
    const userRoles = this.getUserRoles(userId);
    return roles.some((role) => userRoles.includes(role));
  }

  /**
   * Check if user is admin
   *
   * @param userId - User ID
   * @returns True if user is admin or super admin
   */
  isAdmin(userId: string): boolean {
    return this.hasAnyRole(userId, [Role.ADMIN, Role.SUPER_ADMIN]);
  }

  /**
   * Check if user is super admin
   *
   * @param userId - User ID
   * @returns True if user is super admin
   */
  isSuperAdmin(userId: string): boolean {
    return this.hasRole(userId, Role.SUPER_ADMIN);
  }

  /**
   * Get highest role for user
   *
   * Priority: SUPER_ADMIN > ADMIN > MODERATOR > ARTIST > MEMBER > VIEWER
   *
   * @param userId - User ID
   * @returns Highest role
   */
  getHighestRole(userId: string): Role {
    const roles = this.getUserRoles(userId);

    const rolePriority: Role[] = [
      Role.SUPER_ADMIN,
      Role.ADMIN,
      Role.MODERATOR,
      Role.ARTIST,
      Role.MEMBER,
      Role.VIEWER,
    ];

    for (const role of rolePriority) {
      if (roles.includes(role)) {
        return role;
      }
    }

    return Role.VIEWER;
  }

  /**
   * Set user roles (replaces existing roles)
   *
   * @param userId - User ID
   * @param roles - New roles
   * @returns Updated user role info
   */
  setRoles(userId: string, roles: Role[]): UserRole {
    const userRole = this.getUserRole(userId);

    userRole.roles = [...roles];
    userRole.updatedAt = new Date();

    // Recalculate effective permissions
    userRole.effectivePermissions = this.calculateEffectivePermissions(userRole);

    // Clear cache
    this.roleCache.delete(userId);

    return userRole;
  }

  /**
   * Clear all roles and permissions for user
   *
   * @param userId - User ID
   */
  clearUser(userId: string): void {
    this.userRoles.delete(userId);
    this.roleCache.delete(userId);
  }

  /**
   * Get all users with a specific role
   *
   * @param role - Role to search for
   * @returns Array of user IDs
   */
  getUsersWithRole(role: Role): string[] {
    const users: string[] = [];

    for (const [userId, userRole] of this.userRoles) {
      if (userRole.roles.includes(role)) {
        users.push(userId);
      }
    }

    return users;
  }

  /**
   * Get all users with a specific permission
   *
   * @param permission - Permission to search for
   * @returns Array of user IDs
   */
  getUsersWithPermission(permission: Permission): string[] {
    const users: string[] = [];

    for (const [userId] of this.userRoles) {
      if (this.can(userId, permission)) {
        users.push(userId);
      }
    }

    return users;
  }

  /**
   * Get statistics
   *
   * @returns Role manager statistics
   */
  getStats() {
    const roleCount: Record<Role, number> = {
      [Role.SUPER_ADMIN]: 0,
      [Role.ADMIN]: 0,
      [Role.MODERATOR]: 0,
      [Role.MEMBER]: 0,
      [Role.ARTIST]: 0,
      [Role.VIEWER]: 0,
    };

    for (const userRole of this.userRoles.values()) {
      for (const role of userRole.roles) {
        roleCount[role]++;
      }
    }

    return {
      totalUsers: this.userRoles.size,
      cacheSize: this.roleCache.size,
      roleCount,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.roleCache.clear();
  }

  /**
   * Export user roles (for backup/migration)
   *
   * @returns Serialized user roles
   */
  exportRoles(): string {
    const data = Array.from(this.userRoles.values());
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import user roles (from backup/migration)
   *
   * @param data - Serialized user roles
   */
  importRoles(data: string): void {
    const roles = JSON.parse(data) as UserRole[];

    for (const userRole of roles) {
      // Convert date strings back to Date objects
      userRole.createdAt = new Date(userRole.createdAt);
      userRole.updatedAt = new Date(userRole.updatedAt);

      this.userRoles.set(userRole.userId, userRole);
    }

    // Clear cache after import
    this.clearCache();
  }
}

/**
 * Global role manager instance (singleton)
 */
let globalRoleManager: RoleManager | null = null;

/**
 * Get or create global role manager instance
 *
 * @returns Global role manager instance
 */
export function getRoleManager(): RoleManager {
  if (!globalRoleManager) {
    globalRoleManager = new RoleManager();
  }
  return globalRoleManager;
}

/**
 * Create a new role manager instance
 *
 * @returns New role manager instance
 */
export function createRoleManager(): RoleManager {
  return new RoleManager();
}

/**
 * Helper: Check if user can perform action
 *
 * @param userId - User ID
 * @param permission - Required permission
 * @returns Permission check result
 */
export async function checkUserPermission(
  userId: string,
  permission: Permission
): Promise<PermissionCheckResult> {
  const roleManager = getRoleManager();
  const allowed = roleManager.can(userId, permission);

  if (allowed) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `User ${userId} does not have permission: ${permission}`,
    missingPermissions: [permission],
  };
}

/**
 * Helper: Require permission (throws if not authorized)
 *
 * @param userId - User ID
 * @param permission - Required permission
 * @throws Error if user doesn't have permission
 */
export function requirePermission(userId: string, permission: Permission): void {
  const roleManager = getRoleManager();

  if (!roleManager.can(userId, permission)) {
    throw new Error(
      `Unauthorized: User ${userId} does not have permission: ${permission}`
    );
  }
}

/**
 * Helper: Require role (throws if not authorized)
 *
 * @param userId - User ID
 * @param role - Required role
 * @throws Error if user doesn't have role
 */
export function requireRole(userId: string, role: Role): void {
  const roleManager = getRoleManager();

  if (!roleManager.hasRole(userId, role)) {
    throw new Error(`Unauthorized: User ${userId} does not have role: ${role}`);
  }
}

/**
 * Helper: Require admin (throws if not admin)
 *
 * @param userId - User ID
 * @throws Error if user is not admin
 */
export function requireAdmin(userId: string): void {
  const roleManager = getRoleManager();

  if (!roleManager.isAdmin(userId)) {
    throw new Error(`Unauthorized: User ${userId} is not an admin`);
  }
}
