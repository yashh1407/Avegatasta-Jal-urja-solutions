import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'client-token';
const TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

export interface ClientTokenPayload {
  sub: string;      // client_users.id (string)
  clientId: number;
  email: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.CLIENT_JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('CLIENT_JWT_SECRET must be set and at least 32 characters');
  }
  return new TextEncoder().encode(secret);
}

export async function signClientToken(payload: ClientTokenPayload): Promise<string> {
  return new SignJWT({ clientId: payload.clientId, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyClientToken(token: string): Promise<ClientTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      sub: payload.sub as string,
      clientId: payload['clientId'] as number,
      email: payload['email'] as string,
    };
  } catch {
    return null;
  }
}

export async function getClientSession(): Promise<ClientTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyClientToken(token);
}

export function buildClientCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${TOKEN_TTL_SECONDS}${secure}`;
}

export function clearClientCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
