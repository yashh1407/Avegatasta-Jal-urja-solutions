'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Package,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  RefreshCw,
  Phone,
  Building2,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface ClientProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  company_name: string;
  portal_email: string;
  last_login: string;
}

interface ClientProduct {
  id: number;
  product_id: string;
  product_name: string;
  serial_number: string | null;
  purchase_date: string;
  install_date: string | null;
  warranty_end_date: string | null;
  next_service_date: string | null;
  amc_id: number | null;
  amc_start: string | null;
  amc_end: string | null;
  amc_status: string | null;
  amc_plan_name: string | null;
  amc_coverage: string | null;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isExpiringSoon(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}

function AmcBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">
        No AMC
      </span>
    );
  }
  const styles: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    expired: 'bg-red-50 text-red-600 border border-red-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  };
  const icons: Record<string, React.ReactNode> = {
    active: <CheckCircle2 size={10} />,
    expired: <AlertTriangle size={10} />,
    pending: <Clock size={10} />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status] ?? styles.pending}`}
    >
      {icons[status] ?? <Clock size={10} />}
      AMC {status}
    </span>
  );
}

function ProductCard({ product, index }: { product: ClientProduct; index: number }) {
  const router = useRouter();
  const expiringSoon = isExpiringSoon(product.amc_end);

  const logView = useCallback(async () => {
    try {
      await fetch('/api/client/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'view', entity_id: product.product_id }),
      });
    } catch {
      // Non-critical
    }
    router.push(`/product/${product.product_id}`);
  }, [product.product_id, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.06, 0.3) }}
      className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-black text-blue-950 text-base leading-snug truncate">
            {product.product_name}
          </p>
          {product.serial_number && (
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              S/N: {product.serial_number}
            </p>
          )}
        </div>
        <AmcBadge status={product.amc_status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Purchased</p>
          <p className="font-bold text-blue-950">{formatDate(product.purchase_date)}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Service</p>
          <p className="font-bold text-blue-950">{formatDate(product.next_service_date)}</p>
        </div>
        {product.amc_end && (
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">AMC Ends</p>
            <p className={`font-bold ${expiringSoon ? 'text-amber-600' : 'text-blue-950'}`}>
              {formatDate(product.amc_end)}
            </p>
          </div>
        )}
        {product.amc_plan_name && (
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">AMC Plan</p>
            <p className="font-bold text-blue-950 truncate">{product.amc_plan_name}</p>
          </div>
        )}
      </div>

      {expiringSoon && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs font-bold text-amber-700">
            AMC expiring soon. Contact us to renew.
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {expiringSoon && (
          <Link
            href="/contact"
            className="flex-1 text-center py-2.5 rounded-xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors"
          >
            Renew AMC
          </Link>
        )}
        <button
          onClick={logView}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:border-brand-300 hover:text-brand-600 transition-colors ml-auto"
        >
          View Product <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

export default function ClientDashboard() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [products, setProducts] = useState<ClientProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, productsRes] = await Promise.all([
        fetch('/api/client/me'),
        fetch('/api/client/me/products'),
      ]);

      if (profileRes.status === 401 || productsRes.status === 401) {
        router.push('/client/login');
        return;
      }

      const profileData = await profileRes.json();
      const productsData = await productsRes.json();

      setProfile(profileData);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/client/auth/logout', { method: 'POST' });
    router.push('/client/login');
  };

  const expiringSoonCount = products.filter((p) => isExpiringSoon(p.amc_end)).length;

  return (
    <div className="px-6 py-16 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black text-blue-950 tracking-tight"
          >
            {profile ? `Welcome, ${profile.name.split(' ')[0]}` : 'My Dashboard'}
          </motion.h1>
          <p className="text-slate-500 font-medium mt-1">
            Your purchased products and AMC status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:border-brand-300 hover:text-brand-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:border-red-200 hover:text-red-600 transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4 animate-pulse"
            >
              <div className="h-5 bg-slate-100 rounded-xl w-3/4" />
              <div className="h-4 bg-slate-100 rounded-xl w-1/2" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-bold border border-red-100">
          {error}
        </div>
      ) : (
        <>
          {/* Profile Summary */}
          {profile && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <User size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-blue-950 text-lg leading-tight">{profile.name}</p>
                  <p className="text-slate-500 text-sm font-medium">{profile.portal_email}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {profile.phone && (
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Phone size={13} className="text-slate-400" />
                      {profile.phone}
                    </span>
                  )}
                  {profile.company_name && (
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Building2 size={13} className="text-slate-400" />
                      {profile.company_name}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* AMC Renewal Alert */}
          <AnimatePresence>
            {expiringSoonCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-amber-800 text-sm">
                    {expiringSoonCount} AMC contract{expiringSoonCount > 1 ? 's' : ''} expiring within 30 days
                  </p>
                  <p className="text-amber-700 text-xs font-medium mt-0.5">
                    Contact us to ensure uninterrupted service coverage.
                  </p>
                </div>
                <Link
                  href="/contact"
                  className="flex-shrink-0 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors"
                >
                  Contact Us
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Section */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Package size={18} className="text-brand-600" />
              <h2 className="text-lg font-black text-blue-950 uppercase tracking-widest">
                Your Products
              </h2>
              <span className="bg-brand-50 text-brand-700 text-xs font-black px-2.5 py-1 rounded-full">
                {products.length}
              </span>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center space-y-3">
                <Package size={40} className="text-slate-300 mx-auto" />
                <p className="font-bold text-blue-950">No products yet</p>
                <p className="text-slate-500 text-sm">
                  Your purchased products will appear here.
                </p>
                <Link
                  href="/client/products"
                  className="inline-flex items-center gap-2 text-brand-600 font-bold text-sm hover:text-brand-700 transition-colors mt-2"
                >
                  Browse Catalog <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { href: '/client/products', icon: Package, label: 'Browse Products', desc: 'Explore our full catalog' },
              { href: '/contact', icon: Phone, label: 'Contact Us', desc: 'Get support or inquire' },
              { href: '/services', icon: Shield, label: 'Our Services', desc: 'AMC & maintenance plans' },
            ].map(({ href, icon: Icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 hover:border-brand-200 hover:shadow-sm transition-all group"
              >
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors flex-shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-bold text-blue-950 text-sm">{label}</p>
                  <p className="text-slate-500 text-xs">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
