import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function checkPermission(
  permissions: any,
  module: string,
  action?: 'view' | 'add' | 'edit' | 'delete'
): boolean {
  if (!permissions) return false;

  // Handle old string array format (backward compatibility)
  if (Array.isArray(permissions)) {
    return permissions.includes(module);
  }

  // Handle new object format: { [module]: { view: boolean, add: boolean, edit: boolean, delete: boolean } }
  if (typeof permissions === 'object') {
    const modulePerms = permissions[module];
    if (!modulePerms || typeof modulePerms !== 'object') {
      return false;
    }

    if (action) {
      return !!modulePerms[action];
    }

    // If no action is specified, check if they have any access
    return !!(modulePerms.view || modulePerms.add || modulePerms.edit || modulePerms.delete);
  }

  return false;
}

function getRequiredModule(pathname: string): string | null {
  // Check exact matches or prefixes
  if (
    pathname.startsWith('/admin/invoices') || 
    pathname.startsWith('/api/admin/invoices') ||
    pathname.startsWith('/admin/quotations') || 
    pathname.startsWith('/api/admin/quotations') ||
    pathname.startsWith('/admin/pricing') || 
    pathname.startsWith('/api/admin/pricing') ||
    pathname.startsWith('/admin/products') || 
    pathname.startsWith('/api/admin/products')
  ) return 'products';
  if (pathname.startsWith('/admin/messages') || pathname.startsWith('/api/admin/messages')) return 'messages';
  
  if (
    pathname.startsWith('/admin/content/pages') || 
    pathname.startsWith('/api/admin/content/pages') || 
    pathname.startsWith('/api/admin/about-content') || 
    pathname.startsWith('/api/admin/content')
  ) return 'pages';
  
  if (pathname.startsWith('/admin/analytics') || pathname.startsWith('/api/admin/analytics')) return 'analytics';
  if (pathname.startsWith('/admin/clients') || pathname.startsWith('/api/admin/clients')) return 'clients';
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
  if (pathname.startsWith('/admin/amc-plans') || pathname.startsWith('/api/admin/amc-plans')) return 'amc-plans';
  if (pathname.startsWith('/admin/amc') || pathname.startsWith('/api/admin/amc')) return 'amc';
  if (pathname.startsWith('/admin/team-members') || pathname.startsWith('/api/admin/team-members')) return 'team-members';
  if (pathname.startsWith('/admin/brands') || pathname.startsWith('/api/admin/brands')) return 'brands';
  if (pathname.startsWith('/admin/orders') || pathname.startsWith('/api/admin/orders')) return 'orders';
  if (
    pathname.startsWith('/admin/inquiries') || 
    pathname.startsWith('/api/admin/inquiries') ||
    pathname.startsWith('/admin/marketing-tracker') ||
    pathname.startsWith('/api/admin/marketing-tracker')
  ) return 'inquiries';
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

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  // 1. Handle Sales Portal Login Path
  if (pathname === '/sales-portal/login') {
    if (token) {
      return NextResponse.redirect(new URL('/sales-portal', req.url));
    }
    return NextResponse.next();
  }

  // 2. Handle General Admin Login Path (Redirect to /admin)
  if (pathname === '/admin/login') {
    if (token) {
      if (token.role === 'sales') {
        return NextResponse.redirect(new URL('/sales-portal', req.url));
      }
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // 3. Require authentication for /admin paths, admin API paths, and /sales-portal paths
  const isSalesPortalPath = pathname === '/sales-portal' || pathname.startsWith('/sales-portal/');
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminApiPath = pathname.startsWith('/api/admin');

  if (isSalesPortalPath || isAdminPath || isAdminApiPath) {
    if (!token) {
      // If unauthenticated: redirect to sales portal login for sales portal paths, else general login
      if (isSalesPortalPath) {
        return NextResponse.redirect(new URL('/sales-portal/login', req.url));
      }
      if (isAdminApiPath) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      // If exactly '/admin', let it pass to render the login page directly
      if (pathname === '/admin') {
        return NextResponse.next();
      }
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    // 4. Authenticated check - enforce sales role restrictions
    if (token.role === 'sales') {
      // Sales users can ONLY access sales portal and its APIs
      const isAllowedSalesPath = pathname === '/sales-portal' || pathname.startsWith('/api/admin/sales-portal/') || pathname === '/api/products' || pathname === '/api/inquiries' || pathname === '/api/product-inquiries' || pathname === '/api/admin/upload';
      
      if (!isAllowedSalesPath) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden: Sales role restricted' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/sales-portal', req.url));
      }
      return NextResponse.next();
    }

    // 5. Non-sales role: prevent sales-only portal navigation or handle dashboard redirects
    // If accessing the main admin root (Dashboard) and NOT a superadmin, redirect to first allowed module
    if (pathname === '/admin') {
      const role = token.role;
      if (role !== 'superadmin') {
        const permissions = token.permissions;
        if (permissions) {
          let firstAllowedModule: string | null = null;
          if (Array.isArray(permissions)) {
            if (permissions.length > 0) {
              firstAllowedModule = permissions[0];
            }
          } else if (typeof permissions === 'object') {
            for (const key of Object.keys(permissions)) {
              const p = (permissions as any)[key];
              if (p && (p.view || p.edit || p.delete)) {
                firstAllowedModule = key;
                break;
              }
            }
          }
          if (firstAllowedModule) {
            const firstModulePath = getModulePath(firstAllowedModule);
            if (firstModulePath) {
              return NextResponse.redirect(new URL(firstModulePath, req.url));
            }
          }
        }
        // If they have no permissions, redirect to login
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    // 6. Enforce module-specific permissions for standard admins
    const requiredModule = getRequiredModule(pathname);
    if (requiredModule) {
      const role = token.role;
      const permissions = token.permissions;

      if (role !== 'superadmin') {
        // Allow dev fallback if no permissions are set on the admin user at all
        const isDevFallback = role === 'admin' && permissions === null;
        
        let hasAccess = false;
        let action: 'view' | 'add' | 'edit' | 'delete' = 'view';

        if (isDevFallback) {
          hasAccess = true;
        } else {
          if (req.method === 'DELETE') {
            action = 'delete';
          } else if (req.method === 'POST') {
            action = 'add';
          } else if (req.method === 'PUT' || req.method === 'PATCH') {
            action = 'edit';
          }
          hasAccess = checkPermission(permissions, requiredModule, action);
        }

        if (!hasAccess) {
          if (pathname.startsWith('/api/')) {
            return NextResponse.json(
              { error: `Forbidden: Missing ${action} access to module '${requiredModule}'` },
              { status: 403 }
            );
          }
          return NextResponse.redirect(new URL('/admin?error=forbidden', req.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/api/admin/:path*',
    '/sales-portal',
    '/sales-portal/:path*'
  ],
};
