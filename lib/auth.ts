import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool, { initDB } from '@/lib/db';

// Development credentials (fallback if database is unavailable)
const DEV_CREDENTIALS = {
  username: 'admin@hostripples.local',
  email: 'admin@hostripples.local',
  password: 'admin@123',
  role: 'admin'
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        // Try development credentials first (no database required)
        if (credentials.username === DEV_CREDENTIALS.username &&
            credentials.password === DEV_CREDENTIALS.password) {
          return {
            id: '1',
            name: DEV_CREDENTIALS.email,
            email: DEV_CREDENTIALS.email,
            role: DEV_CREDENTIALS.role
          };
        }

        // Try database credentials if available
        try {
          await initDB();

          const [rows] = await pool.query(
            'SELECT id, username, password_hash, role FROM admin_users WHERE username = ? LIMIT 1',
            [credentials.username]
          );

          const user = (rows as Array<{ id: number; username: string; password_hash: string; role: string }>)[0];
          if (!user) return null;

          const valid = await bcrypt.compare(credentials.password, user.password_hash);
          if (!valid) return null;

          await pool.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [user.id]);

          return { id: String(user.id), name: user.username, email: user.role };
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
        token.role = (user as { role?: string } & typeof user).role ?? user.email; // prefer explicit role field; fall back to email (DB-auth convention)
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as typeof session.user & { role: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
