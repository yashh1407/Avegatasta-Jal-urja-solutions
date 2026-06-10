import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

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
      const permissions = (session.user as any).permissions as string[] | null;
      if (!permissions || !permissions.includes(module)) {
        return {
          session: null,
          error: NextResponse.json({ error: `Forbidden: Missing access to module '${module}'` }, { status: 403 }),
        };
      }
    }
  }

  return { session, error: null };
}
