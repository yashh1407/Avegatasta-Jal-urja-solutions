import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

function getRequiredModule(pathname: string): string | null {
  // Check exact matches or prefixes
  if (pathname.startsWith('/admin/quotations') || pathname.startsWith('/api/admin/quotations')) return 'quotations';
  if (pathname.startsWith('/admin/messages') || pathname.startsWith('/api/admin/messages')) return 'messages';
  
  if (
    pathname.startsWith('/admin/content/pages') || 
    pathname.startsWith('/api/admin/content/pages') || 
    pathname.startsWith('/api/admin/about-content') || 
    pathname.startsWith('/api/admin/content')
  ) return 'pages';
  
  if (pathname.startsWith('/admin/analytics') || pathname.startsWith('/api/admin/analytics')) return 'analytics';
  if (pathname.startsWith('/admin/clients') || pathname.startsWith('/api/admin/clients')) return 'clients';
  if (pathname.startsWith('/admin/products') || pathname.startsWith('/api/admin/products')) return 'products';
  if (pathname.startsWith('/admin/vendors') || pathname.startsWith('/api/admin/vendors')) return 'vendors';
  
  if (
    pathname.startsWith('/admin/sales-team') || 
    pathname.startsWith('/api/admin/sales-team')
  ) return 'sales-team';
  
  if (
    pathname.startsWith('/admin/sales') || 
    pathname.startsWith('/api/admin/sales') || 
    pathname.startsWith('/api/admin/sales-records') || 
    pathname.startsWith('/api/admin/sales-dashboard')
  ) return 'sales';
  
  if (pathname.startsWith('/admin/case-studies') || pathname.startsWith('/api/admin/case-studies')) return 'case-studies';
  if (pathname.startsWith('/admin/testimonials') || pathname.startsWith('/api/admin/testimonials')) return 'testimonials';
  if (pathname.startsWith('/admin/pricing') || pathname.startsWith('/api/admin/pricing')) return 'pricing';
  if (pathname.startsWith('/admin/amc-plans') || pathname.startsWith('/api/admin/amc-plans')) return 'amc-plans';
  if (pathname.startsWith('/admin/amc') || pathname.startsWith('/api/admin/amc')) return 'amc';
  if (pathname.startsWith('/admin/team-members') || pathname.startsWith('/api/admin/team-members')) return 'team-members';
  if (pathname.startsWith('/admin/brands') || pathname.startsWith('/api/admin/brands')) return 'brands';
  if (pathname.startsWith('/admin/orders') || pathname.startsWith('/api/admin/orders')) return 'orders';
  if (pathname.startsWith('/admin/inquiries') || pathname.startsWith('/api/admin/inquiries')) return 'inquiries';
  if (pathname.startsWith('/admin/email-templates') || pathname.startsWith('/api/admin/email-templates')) return 'email-templates';
  if (pathname.startsWith('/admin/smtp-settings') || pathname.startsWith('/api/admin/smtp-settings')) return 'smtp-settings';
  
  if (
    pathname.startsWith('/admin/enterprise') || 
    pathname.startsWith('/api/admin/enterprise') || 
    pathname.startsWith('/api/admin/enterprise-inquiries')
  ) return 'enterprise';
  
  if (
    pathname.startsWith('/admin/employees') || 
    pathname.startsWith('/api/admin/employees') ||
    pathname.startsWith('/admin/roles') ||
    pathname.startsWith('/api/admin/roles')
  ) return 'employees';
  if (pathname.startsWith('/admin/site-settings') || pathname.startsWith('/api/admin/site-settings')) return 'site-settings';
  
  return null;
}

function getModulePath(moduleKey: string): string | null {
  const mapping: Record<string, string> = {
    'quotations': '/admin/quotations',
    'messages': '/admin/messages',
    'pages': '/admin/content/pages',
    'analytics': '/admin/analytics',
    'clients': '/admin/clients',
    'products': '/admin/products',
    'vendors': '/admin/vendors',
    'sales-team': '/admin/sales-team',
    'sales': '/admin/sales',
    'case-studies': '/admin/case-studies',
    'testimonials': '/admin/testimonials',
    'pricing': '/admin/pricing',
    'amc-plans': '/admin/amc-plans',
    'amc': '/admin/amc',
    'team-members': '/admin/team-members',
    'brands': '/admin/brands',
    'orders': '/admin/orders',
    'inquiries': '/admin/inquiries',
    'email-templates': '/admin/email-templates',
    'smtp-settings': '/admin/smtp-settings',
    'enterprise': '/admin/enterprise',
    'employees': '/admin/employees',
    'site-settings': '/admin/site-settings',
  };
  return mapping[moduleKey] || null;
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // If accessing the main admin root (Dashboard) and NOT a superadmin, redirect to first allowed module
    if (pathname === '/admin') {
      const role = token?.role;
      if (role !== 'superadmin') {
        const permissions = token?.permissions as string[] | null;
        if (permissions && permissions.length > 0) {
          const firstModulePath = getModulePath(permissions[0]);
          if (firstModulePath) {
            return NextResponse.redirect(new URL(firstModulePath, req.url));
          }
        }
        // If they have no permissions, redirect to login
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    const requiredModule = getRequiredModule(pathname);
    if (requiredModule) {
      const role = token?.role;
      const permissions = token?.permissions as string[] | null;

      if (role !== 'superadmin') {
        // Allow dev fallback if no permissions are set on the admin user at all
        const isDevFallback = role === 'admin' && permissions === null;
        
        if (!isDevFallback && (!permissions || !permissions.includes(requiredModule))) {
          // If they are calling an API, return a 403 JSON response
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { error: `Forbidden: Missing access to module '${requiredModule}'` },
              { status: 403 }
            );
          }
          // Redirect page requests to admin dashboard with a forbidden error
          return NextResponse.redirect(new URL('/admin?error=forbidden', req.url));
        }
      }
    }

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

// Protect all /admin/* routes except the login page, and protect admin API endpoints
export const config = {
  matcher: [
    '/admin',
    '/admin/((?!login).*)',
    '/api/admin/:path*'
  ],
};
