'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
    label: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
    category: 'content'
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    category: 'analytics'
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: Users,
    category: 'management'
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
    category: 'management'
  },
  {
    label: 'Vendors',
    href: '/admin/vendors',
    icon: Truck,
    category: 'management'
  },
  {
    label: 'Sales',
    href: '/admin/sales',
    icon: TrendingUp,
    category: 'sales'
  },
  {
    label: 'Sales Team',
    href: '/admin/sales-team',
    icon: Users,
    category: 'sales'
  },
  {
    label: 'Case Studies',
    href: '/admin/case-studies',
    icon: BookOpen,
    category: 'content'
  },
  {
    label: 'Testimonials',
    href: '/admin/testimonials',
    icon: Star,
    category: 'content'
  },
  {
    label: 'Pricing',
    href: '/admin/pricing',
    icon: DollarSign,
    category: 'content'
  },
  {
    label: 'AMC',
    href: '/admin/amc',
    icon: Shield,
    category: 'management'
  },
  {
    label: 'AMC Plans',
    href: '/admin/amc-plans',
    icon: FileText,
    category: 'management'
  },
  {
    label: 'Team Members',
    href: '/admin/team-members',
    icon: UserCheck,
    category: 'management'
  },
  {
    label: 'Brands',
    href: '/admin/brands',
    icon: Tag,
    category: 'management'
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
    category: 'management'
  },
  {
    label: 'Inquiries',
    href: '/admin/inquiries',
    icon: HelpCircle,
    category: 'sales'
  },
  {
    label: 'Email Templates',
    href: '/admin/email-templates',
    icon: Mail,
    category: 'content'
  },
  {
    label: 'SMTP Settings',
    href: '/admin/smtp-settings',
    icon: Mail,
    category: 'config'
  },
  {
    label: 'Enterprise',
    href: '/admin/enterprise',
    icon: Shield,
    category: 'management'
  },
  {
    label: 'Settings',
    href: '/admin/site-settings',
    icon: Settings,
    category: 'config'
  },
];

const CATEGORIES = {
  main: 'Main',
  analytics: 'Analytics',
  management: 'Management',
  sales: 'Sales',
  content: 'Content',
  config: 'Configuration',
};

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
    await signOut({ callbackUrl: '/admin/login' });
  };

  // Group sections by category
  const groupedSections = ADMIN_SECTIONS.reduce((acc, section) => {
    if (!acc[section.category]) {
      acc[section.category] = [];
    }
    acc[section.category].push(section);
    return acc;
  }, {} as Record<string, typeof ADMIN_SECTIONS>);

  const isActive = (href: string) => pathname === href;

  return (
    <div className="h-full w-full bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Admin Panel</h1>
            <p className="text-xs text-slate-400">Avegatasta</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-6 space-y-1 flex-1 overflow-y-auto">
        {Object.entries(groupedSections).map(([category, sections]) => (
          <div key={category} className="mb-6">
            <button
              onClick={() =>
                setExpandedCategory(
                  expandedCategory === category ? null : category
                )
              }
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
                      <Link key={section.href} href={section.href}>
                        <div
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                            active
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <Icon size={16} />
                          <span className="text-sm font-semibold flex-1">
                            {section.label}
                          </span>
                          {section.href === '/admin/messages' && unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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
        ))}
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
