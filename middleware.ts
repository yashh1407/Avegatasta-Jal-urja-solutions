import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/admin/login',
    },
  }
);

// Protect all /admin/* routes except the login page
export const config = {
  matcher: ['/admin', '/admin/((?!login).*)'],
};
