/**
 * Admin Middleware
 *
 * Middleware for protecting admin routes and checking permissions.
 *
 * Features:
 * - Authentication verification
 * - Role-based access control
 * - Permission checking
 * - Audit logging
 * - Rate limiting for admin actions
 *
 * @module lib/middleware/admin-middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRoleManager } from '../admin/role-manager';
import { Permission, Role } from '../admin/permissions';

/**
 * Authentication context
 */
export interface AuthContext {
  userId: string;
  email?: string;
  roles: Role[];
  permissions: Permission[];
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Admin middleware options
 */
export interface AdminMiddlewareOptions {
  requiredPermission?: Permission;
  requiredPermissions?: Permission[];
  requiredRole?: Role;
  requiredRoles?: Role[];
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  skipAuth?: boolean;
}

/**
 * Get auth context from request
 *
 * TODO: Implement actual authentication (Clerk, NextAuth, etc.)
 * For now, this is a placeholder that extracts user ID from headers
 *
 * @param request - Next.js request
 * @returns Auth context or null
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  // TODO: Replace with actual auth implementation
  // Example with Clerk:
  // const { userId } = await auth();
  // if (!userId) return null;

  // For now, extract from custom header (development only!)
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return null;
  }

  const roleManager = getRoleManager();
  const roles = roleManager.getUserRoles(userId);
  const permissions = roleManager.getUserPermissions(userId);
  const isAdmin = roleManager.isAdmin(userId);

  return {
    userId,
    email: request.headers.get('x-user-email') || undefined,
    roles,
    permissions,
    isAuthenticated: true,
    isAdmin,
  };
}

/**
 * Admin middleware
 *
 * Protects routes with authentication and authorization checks.
 *
 * @param request - Next.js request
 * @param options - Middleware options
 * @returns Response or null (to continue)
 */
export async function adminMiddleware(
  request: NextRequest,
  options: AdminMiddlewareOptions = {}
): Promise<NextResponse | null> {
  // Skip auth if configured
  if (options.skipAuth) {
    return null;
  }

  // Get auth context
  const auth = await getAuthContext(request);

  // Check authentication
  if (!auth) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Authentication required',
      },
      { status: 401 }
    );
  }

  // Check super admin requirement
  if (options.requireSuperAdmin) {
    const roleManager = getRoleManager();
    if (!roleManager.isSuperAdmin(auth.userId)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Super admin access required',
        },
        { status: 403 }
      );
    }
    return null; // Authorized
  }

  // Check admin requirement
  if (options.requireAdmin) {
    if (!auth.isAdmin) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Admin access required',
        },
        { status: 403 }
      );
    }
    return null; // Authorized
  }

  // Check role requirement
  if (options.requiredRole) {
    if (!auth.roles.includes(options.requiredRole)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `Required role: ${options.requiredRole}`,
        },
        { status: 403 }
      );
    }
  }

  // Check multiple roles (any)
  if (options.requiredRoles && options.requiredRoles.length > 0) {
    const hasAnyRole = options.requiredRoles.some((role) => auth.roles.includes(role));
    if (!hasAnyRole) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `Required one of: ${options.requiredRoles.join(', ')}`,
        },
        { status: 403 }
      );
    }
  }

  // Check permission requirement
  if (options.requiredPermission) {
    const roleManager = getRoleManager();
    if (!roleManager.can(auth.userId, options.requiredPermission)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `Required permission: ${options.requiredPermission}`,
        },
        { status: 403 }
      );
    }
  }

  // Check multiple permissions (all required)
  if (options.requiredPermissions && options.requiredPermissions.length > 0) {
    const roleManager = getRoleManager();
    if (!roleManager.canAll(auth.userId, options.requiredPermissions)) {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: `Required permissions: ${options.requiredPermissions.join(', ')}`,
        },
        { status: 403 }
      );
    }
  }

  // All checks passed
  return null;
}

/**
 * Require authentication (throws if not authenticated)
 *
 * Use this in API routes:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const auth = await requireAuth(request);
 *   // ... use auth.userId
 * }
 * ```
 *
 * @param request - Next.js request
 * @returns Auth context
 * @throws Error if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const auth = await getAuthContext(request);

  if (!auth) {
    throw new Error('Unauthorized: Authentication required');
  }

  return auth;
}

/**
 * Require admin access (throws if not admin)
 *
 * @param request - Next.js request
 * @returns Auth context
 * @throws Error if not admin
 */
export async function requireAdminAuth(request: NextRequest): Promise<AuthContext> {
  const auth = await requireAuth(request);

  if (!auth.isAdmin) {
    throw new Error('Forbidden: Admin access required');
  }

  return auth;
}

/**
 * Require permission (throws if not authorized)
 *
 * @param request - Next.js request
 * @param permission - Required permission
 * @returns Auth context
 * @throws Error if permission denied
 */
export async function requirePermissionAuth(
  request: NextRequest,
  permission: Permission
): Promise<AuthContext> {
  const auth = await requireAuth(request);

  const roleManager = getRoleManager();
  if (!roleManager.can(auth.userId, permission)) {
    throw new Error(`Forbidden: Required permission: ${permission}`);
  }

  return auth;
}

/**
 * Require role (throws if not authorized)
 *
 * @param request - Next.js request
 * @param role - Required role
 * @returns Auth context
 * @throws Error if role not assigned
 */
export async function requireRoleAuth(
  request: NextRequest,
  role: Role
): Promise<AuthContext> {
  const auth = await requireAuth(request);

  if (!auth.roles.includes(role)) {
    throw new Error(`Forbidden: Required role: ${role}`);
  }

  return auth;
}

/**
 * Create protected route handler
 *
 * Wraps an API route handler with authentication and authorization.
 *
 * Usage:
 * ```typescript
 * export const GET = withAuth(
 *   async (request, auth) => {
 *     // auth.userId is available
 *     return NextResponse.json({ userId: auth.userId });
 *   },
 *   { requireAdmin: true }
 * );
 * ```
 *
 * @param handler - Route handler
 * @param options - Middleware options
 * @returns Protected route handler
 */
export function withAuth(
  handler: (request: NextRequest, auth: AuthContext) => Promise<Response>,
  options: AdminMiddlewareOptions = {}
) {
  return async (request: NextRequest): Promise<Response> => {
    // Run middleware
    const middlewareResponse = await adminMiddleware(request, options);

    // If middleware returned a response (error), return it
    if (middlewareResponse) {
      return middlewareResponse;
    }

    // Get auth context (guaranteed to exist after middleware)
    const auth = await getAuthContext(request);

    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      // Call the handler
      return await handler(request, auth);
    } catch (error) {
      console.error('Route handler error:', error);

      // Handle permission errors
      if (error instanceof Error) {
        if (error.message.includes('Unauthorized')) {
          return NextResponse.json(
            { error: 'Unauthorized', message: error.message },
            { status: 401 }
          );
        }

        if (error.message.includes('Forbidden')) {
          return NextResponse.json(
            { error: 'Forbidden', message: error.message },
            { status: 403 }
          );
        }
      }

      // Generic error
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Create admin-only route handler
 *
 * Shorthand for withAuth with requireAdmin: true
 *
 * @param handler - Route handler
 * @param options - Additional options
 * @returns Protected route handler
 */
export function withAdmin(
  handler: (request: NextRequest, auth: AuthContext) => Promise<Response>,
  options: Omit<AdminMiddlewareOptions, 'requireAdmin'> = {}
) {
  return withAuth(handler, { ...options, requireAdmin: true });
}

/**
 * Create permission-protected route handler
 *
 * @param permission - Required permission
 * @param handler - Route handler
 * @param options - Additional options
 * @returns Protected route handler
 */
export function withPermission(
  permission: Permission,
  handler: (request: NextRequest, auth: AuthContext) => Promise<Response>,
  options: Omit<AdminMiddlewareOptions, 'requiredPermission'> = {}
) {
  return withAuth(handler, { ...options, requiredPermission: permission });
}

/**
 * Create role-protected route handler
 *
 * @param role - Required role
 * @param handler - Route handler
 * @param options - Additional options
 * @returns Protected route handler
 */
export function withRole(
  role: Role,
  handler: (request: NextRequest, auth: AuthContext) => Promise<Response>,
  options: Omit<AdminMiddlewareOptions, 'requiredRole'> = {}
) {
  return withAuth(handler, { ...options, requiredRole: role });
}
