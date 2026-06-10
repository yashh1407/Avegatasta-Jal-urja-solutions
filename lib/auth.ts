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
            'SELECT id, name, email, password_hash, role, permissions FROM admin_users WHERE email = ? LIMIT 1',
            [credentials.email]
          );

          const user = (rows as Array<{ id: number; name: string; email: string; password_hash: string; role: string; permissions: any }>)[0];
          if (!user) return null;

          const valid = await bcrypt.compare(credentials.password, user.password_hash);
          if (!valid) return null;

          await pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);

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
        } catch (error) {
          // Database unavailable, fall through to dev credentials check above
          console.error('Database auth failed:', error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).permissions = token.permissions as any;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
