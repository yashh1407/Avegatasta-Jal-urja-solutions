'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  BarChart3,
  Users,
  Package,
  Truck,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  FileText,
  DollarSign,
  Shield,
  Mail,
  UserCheck,
  Tag,
  ShoppingCart,
  Receipt,
  MapPin,
  Clock,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ADMIN_SECTIONS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    category: 'main'
  },

  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
    category: 'products_cat',
    module: 'products'
  },
  {
    label: 'Pricing',
    href: '/admin/pricing',
    icon: DollarSign,
    category: 'products_cat',
    module: 'products'
  },
  {
    label: 'Invoices',
    href: '/admin/invoices',
    icon: Receipt,
    category: 'products_cat',
    module: 'products'
  },
  {
    label: 'Quotations',
    href: '/admin/quotations',
    icon: FileText,
    category: 'products_cat',
    module: 'products'
  },
  {
    label: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
    category: 'content',
    module: 'messages'
  },
  {
    label: 'Pages',
    href: '/admin/content/pages',
    icon: BookOpen,
    category: 'content',
    module: 'pages'
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    category: 'analytics',
    module: 'analytics'
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: Users,
    category: 'management',
    module: 'clients'
  },
  {
    label: 'Vendors',
    href: '/admin/vendors',
    icon: Truck,
    category: 'management',
    module: 'vendors'
  },
  {
    label: 'Sales',
    href: '/admin/sales',
    icon: TrendingUp,
    category: 'sales',
    module: 'sales'
  },
  {
    label: 'Case Studies',
    href: '/admin/case-studies',
    icon: BookOpen,
    category: 'content',
    module: 'case-studies'
  },
  {
    label: 'Testimonials',
    href: '/admin/testimonials',
    icon: Star,
    category: 'content',
    module: 'testimonials'
  },
  {
    label: 'AMC',
    href: '/admin/amc',
    icon: Shield,
    category: 'management',
    module: 'amc'
  },
  {
    label: 'AMC Plans',
    href: '/admin/amc-plans',
    icon: FileText,
    category: 'management',
    module: 'amc-plans'
  },
  {
    label: 'Brands',
    href: '/admin/brands',
    icon: Tag,
    category: 'management',
    module: 'brands'
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    category: 'management',
    module: 'orders'
  },
  {
    label: 'Inquiries',
    href: '/admin/inquiries',
    icon: HelpCircle,
    category: 'sales',
    module: 'inquiries'
  },
  {
    label: 'Marketing Tracker',
    href: '/admin/marketing-tracker',
    icon: MapPin,
    category: 'sales',
    module: 'inquiries'
  },
  {
    label: 'Email Templates',
    href: '/admin/email-templates',
    icon: Mail,
    category: 'content',
    module: 'email-templates'
  },
  {
    label: 'SMTP Settings',
    href: '/admin/smtp-settings',
    icon: Mail,
    category: 'config',
    module: 'smtp-settings'
  },
  {
    label: 'Employees',
    href: '/admin/employees',
    icon: Users,
    category: 'staff',
    module: 'employees'
  },
  {
    label: 'Roles & Access',
    href: '/admin/roles',
    icon: Shield,
    category: 'staff',
    module: 'employees'
  },
  {
    label: 'Attendance Logs',
    href: '/admin/attendance',
    icon: Clock,
    category: 'staff',
    module: 'employees'
  },
  {
    label: 'Settings',
    href: '/admin/site-settings',
    icon: Settings,
    category: 'config',
    module: 'site-settings'
  },
];

const CATEGORIES = {
  main: 'Main',
  products_cat: 'Products',
  analytics: 'Analytics',
  management: 'Management',
  sales: 'Sales',
  content: 'Content',
  staff: 'Staff Management',
  config: 'Configuration',
};

function hasModuleAccess(permissions: any, module: string): boolean {
  if (!permissions) return false;
  if (Array.isArray(permissions)) {
    return permissions.includes(module);
  }
  if (typeof permissions === 'object') {
    const modulePerms = permissions[module];
    if (!modulePerms || typeof modulePerms !== 'object') {
      return false;
    }
    return !!(modulePerms.view || modulePerms.add || modulePerms.edit || modulePerms.delete);
  }
  return false;
}

// Returns the sidebar category key for the given pathname.
// Sorts by href length descending so more-specific routes (e.g. /admin/messages)
// match before shorter prefixes (e.g. /admin).
function getActiveCategory(path: string | null): string {
  if (!path) return 'main';
  const active = ADMIN_SECTIONS
    .slice()
    .sort((a, b) => b.href.length - a.href.length)
    .find((s) => path === s.href || path.startsWith(s.href + '/'));
  return active?.category ?? 'main';
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(() => getActiveCategory(pathname));
  const [unreadCount, setUnreadCount] = useState(0);

  // Re-expand the correct category when navigating
  useEffect(() => {
    setExpandedCategory((prev) => prev ?? getActiveCategory(pathname));
  }, [pathname]);

  useEffect(() => {
    fetch('/api/contact/unread-count')
      .then((r) => r.json())
      .then((data: { count?: number }) => {
        if (typeof data.count === 'number') setUnreadCount(data.count);
      })
      .catch(() => {});
  }, [pathname]); // re-fetch when navigating back to sidebar routes

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin' });
  };

  // Group sections by category, filtering by permissions
  const filteredSections = ADMIN_SECTIONS.filter((section) => {
    // Dashboard is restricted to superadmin only
    if (section.href === '/admin') {
      if (status === 'loading' || !session?.user) return false;
      const userRole = (session.user as any).role;
      return userRole === 'superadmin';
    }

    // Hide restricted modules while the session is loading to avoid visual flash
    if (status === 'loading' || !session?.user) return false;

    // If it has no module attribute, it is always accessible
    if (!section.module) return true;

    const userRole = (session.user as any).role;
    if (userRole === 'superadmin') return true;
    if (userRole === 'admin' && !(session.user as any).permissions) return true; // dev credentials fallback

    // Normal employee permissions check
    const userPermissions = (session.user as any).permissions;
    return hasModuleAccess(userPermissions, section.module);
  });

  const groupedSections = filteredSections.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, typeof ADMIN_SECTIONS>);

  const isActive = (href: string) => pathname === href;

  return (
    <div className="h-full w-full bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Admin Panel</h1>
            <p className="text-xs text-slate-400">Avegatasta</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-6 space-y-1 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {Object.entries(groupedSections).map(([category, sections]) => {
          if (!sections || sections.length === 0) return null;
          return (
            <div key={category} className="mb-6">
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category ? null : category
                  )
                }
                aria-expanded={expandedCategory === category}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-300 transition-colors"
              >
                {CATEGORIES[category as keyof typeof CATEGORIES]}
                <span className="text-xs">
                  {expandedCategory === category ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence>
                {expandedCategory === category && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 space-y-1 overflow-hidden"
                  >
                    {sections.map((section) => {
                      const Icon = section.icon;
                      const active = isActive(section.href);

                      return (
                        <Link key={section.href} href={section.href} aria-current={active ? 'page' : undefined}>
                          <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                              active
                                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                          >
                            <Icon size={16} />
                            <span className="text-sm font-semibold flex-1">
                              {section.label}
                            </span>
                            {section.href === '/admin/messages' && unreadCount > 0 && (
                              <span className="bg-brand-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800 bg-gradient-to-t from-slate-950 to-transparent flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600/20 border border-red-600/30 rounded-xl text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-all font-semibold"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
