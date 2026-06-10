import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      permissions: string[] | null;
    } & DefaultSession["user"]
  }

  interface User {
    role: string;
    permissions: string[] | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    permissions: string[] | null;
  }
}
