import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * Guard for admin API routes. Call at the top of every /api/admin/* handler.
 * Returns { session, error: null } on success, or { session: null, error } with a 401 response.
 */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, error: null };
}
