import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

function checkPermission(
  permissions: any,
  module: string
): boolean {
  if (!permissions) return false;

  // Handle old string array format (backward compatibility)
  if (Array.isArray(permissions)) {
    return permissions.includes(module);
  }

  // Handle new object format: { [module]: { view: boolean, add: boolean, edit: boolean, delete: boolean } }
  if (typeof permissions === 'object') {
    const modulePerms = permissions[module];
    if (!modulePerms || typeof modulePerms !== 'object') {
      return false;
    }
    // Check if they have any access to the module
    return !!(modulePerms.view || modulePerms.add || modulePerms.edit || modulePerms.delete);
  }

  return false;
}

/**
 * Guard for admin API routes. Call at the top of every /api/admin/* handler.
 * Returns { session, error: null } on success, or { session: null, error } with a 401 response.
 */
export async function requireAdminSession(module?: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // If a specific module permission is required
  if (module) {
    const userRole = (session.user as any).role;
    if (userRole !== 'superadmin') {
      const permissions = (session.user as any).permissions;
      if (!checkPermission(permissions, module)) {
        return {
          session: null,
          error: NextResponse.json({ error: `Forbidden: Missing access to module '${module}'` }, { status: 403 }),
        };
      }
    }
  }

  return { session, error: null };
}
