import { NextResponse } from 'next/server';
import { getClientSession, type ClientTokenPayload } from '@/lib/client-auth';

/**
 * Guard for client API routes. Call at the top of every /api/client/* handler
 * that requires authentication.
 */
export async function requireClientSession(): Promise<
  | { session: ClientTokenPayload; error: null }
  | { session: null; error: NextResponse }
> {
  const session = await getClientSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, error: null };
}
