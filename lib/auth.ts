import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool, { initDB } from '@/lib/db';

// Development credentials (fallback if database is unavailable)
const DEV_CREDENTIALS = {
  username: 'admin@hostripples.local',
  email: 'admin@hostripples.local',
  password: 'admin@123',
  role: 'superadmin'
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Try development credentials first (no database required)
        if (credentials.email === DEV_CREDENTIALS.username &&
            credentials.password === DEV_CREDENTIALS.password) {
          return {
            id: '1',
            name: 'Superadmin',
            email: DEV_CREDENTIALS.email,
            role: DEV_CREDENTIALS.role,
            permissions: null
          };
        }

        // Try database credentials if available
        try {
          await initDB();

          const [rows] = await pool.query(
            'SELECT id, name, email, password_hash, role, permissions, failed_login_attempts, lockout_until FROM admin_users WHERE email = ? LIMIT 1',
            [credentials.email]
          );

          const user = (rows as Array<{ id: number; name: string; email: string; password_hash: string; role: string; permissions: any; failed_login_attempts: number; lockout_until: string | null }>)[0];
          if (!user) return null;

          // Check if account is locked out
          if (user.role !== 'superadmin' && user.lockout_until) {
            const lockoutTime = new Date(user.lockout_until);
            if (lockoutTime > new Date()) {
              const isPermanent = lockoutTime.getFullYear() > 2050;
              if (isPermanent) {
                throw new Error('Account has been locked by an administrator.');
              } else {
                throw new Error('Account is temporarily locked. Please try again in 15 minutes.');
              }
            }
          }

          const valid = await bcrypt.compare(credentials.password, user.password_hash);
          if (!valid) {
            if (user.role !== 'superadmin') {
              const attempts = (user.failed_login_attempts || 0) + 1;
              if (attempts >= 5) {
                await pool.query(
                  'UPDATE admin_users SET failed_login_attempts = ?, lockout_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE) WHERE id = ?',
                  [attempts, user.id]
                );
                throw new Error('Account is temporarily locked. Please try again in 15 minutes.');
              } else {
                await pool.query(
                  'UPDATE admin_users SET failed_login_attempts = ? WHERE id = ?',
                  [attempts, user.id]
                );
              }
            }
            return null;
          }

          // Reset attempts on successful login
          await pool.query(
            'UPDATE admin_users SET failed_login_attempts = 0, lockout_until = NULL, last_login = NOW() WHERE id = ?',
            [user.id]
          );

          let parsedPermissions = null;
          if (user.permissions) {
            try {
              parsedPermissions = typeof user.permissions === 'string'
                ? JSON.parse(user.permissions)
                : user.permissions;
            } catch (e) {
              console.error('Failed to parse permissions:', e);
            }
          }

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: parsedPermissions
          };
        } catch (error: any) {
          if (error.message && error.message.includes('locked')) {
            throw error;
          }
          // Database unavailable, fall through to dev credentials check above
          console.error('Database auth failed:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours (security limit for token verification on server side)
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production' &&
        process.env.NEXTAUTH_URL?.startsWith('https')
          ? `__Secure-next-auth.session-token`
          : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure:
          process.env.NODE_ENV === 'production' &&
          process.env.NEXTAUTH_URL?.startsWith('https'),
      },
    },
  },
  pages: {
    signIn: '/admin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).permissions = token.permissions as any;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
