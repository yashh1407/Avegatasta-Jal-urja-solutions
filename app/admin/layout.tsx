'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import NotificationBell from '@/components/NotificationBell';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Login page gets no sidebar chrome — just render children directly
  if (pathname === '/admin/login') {
    return <SessionProvider>{children}</SessionProvider>;
  }

  return (
    <SessionProvider>
    <div data-admin-shell className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:flex w-80 fixed left-0 top-0 h-screen z-40 flex-col">
        <AdminSidebar />
      </div>

      {/* Global Notification Bell */}
      <div className="fixed top-6 right-6 lg:right-12 z-50">
        <NotificationBell />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-6 left-6 z-50 p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-all"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar - Mobile Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-30"
            />
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-[min(20rem,86vw)] z-40"
            >
              <AdminSidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col lg:ml-80">
        {/* Content Area */}
        <div className="flex-1 min-w-0 overflow-auto">
          {children}
        </div>
      </div>
    </div>
    </SessionProvider>
  );
}
