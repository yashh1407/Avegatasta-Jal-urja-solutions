import { z } from 'zod';

const envSchema = z.object({
  // Database
  MYSQL_HOST: z.string().min(1),
  MYSQL_USER: z.string().min(1),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string().min(1),
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  // Optional
  ADMIN_INITIAL_USERNAME: z.string().min(1).optional(),
  ADMIN_INITIAL_PASSWORD: z.string().min(8).optional(),
});

const _env = envSchema.safeParse(process.env);

// Skip validation during Next.js build (page collection runs without .env.local)
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuild && !_env.success) {
  console.error('❌ Missing or invalid environment variables:');
  console.error(JSON.stringify(_env.error.flatten().fieldErrors, null, 2));
  throw new Error('Invalid environment configuration — check .env.local');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const env = (_env.data ?? {}) as NonNullable<typeof _env.data>;
