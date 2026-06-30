'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Tag, RefreshCw, LogOut, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import 'react-quill-new/dist/quill.snow.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingRow {
  product_id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  dp_price: number | null;
  mrp_price: number | null;
  description: string | null;
  hsn_code: string | null;
  sac_code: string | null;
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${40 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminPricingPage() {
  const { status } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<PricingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchPricing();
  }, [status, router]);

  const fetchPricing = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pricing');
      const data: PricingRow[] = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
      toast.error('Failed to load pricing. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const isIncomplete = (p: PricingRow) => p.dp_price == null || p.mrp_price == null;

  const incompleteCount = products.filter(isIncomplete).length;
  const formatPrice = (value: number | null) =>
    value != null ? `₹${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—';

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <Tag size={20} />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Pricing</h1>
            </div>
            <p className="text-slate-500 font-medium">Review dealer and MRP prices for all products.</p>
          </div>

          <div className="flex items-center gap-3">
            {incompleteCount > 0 && !loading && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-sm font-semibold text-amber-700">
                <AlertTriangle size={14} />
                {incompleteCount} incomplete
              </div>
            )}
            <button
              onClick={fetchPricing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-2.5 bg-white border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em]">
              All Products ({products.length})
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-200 inline-block" />
                Incomplete pricing
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px] table-fixed">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em] w-[33%]">Product</th>
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em] w-[12%]">Brand</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em] w-[13%]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.14em] w-[42%]">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <p className="text-slate-500 font-medium">No products found.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const incomplete = isIncomplete(product);
                    const detailItems = [
                      { label: 'DP Price', value: formatPrice(product.dp_price) },
                      { label: 'MRP Price', value: formatPrice(product.mrp_price) },
                      { label: 'HSN Code', value: product.hsn_code || '—' },
                      { label: 'SAC Code', value: product.sac_code || '—' },
                    ];

                    return (
                      <motion.tr
                        key={product.product_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`transition-colors group ${incomplete ? 'bg-amber-50/25 hover:bg-amber-50/45' : 'hover:bg-slate-50/50'}`}
                      >
                        <td className="px-6 py-5 w-[33%] align-middle">
                          <div className="flex items-center gap-4">
                            {product.image ? (
                              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 shadow-sm">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={56}
                                  height={56}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex-shrink-0 shadow-sm" />
                            )}
                            <span className="font-bold text-sm text-slate-900 leading-snug block min-w-0 max-w-full break-words">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-5 w-[12%] align-middle">
                          <span className="inline-flex items-center whitespace-nowrap rounded-xl border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 shadow-sm shadow-brand-100/50">
                            {product.brand}
                          </span>
                        </td>
                        <td className="px-6 py-5 w-[13%] align-middle">
                          <span className="text-xs text-slate-500 font-medium block max-w-full break-words leading-snug">{product.category}</span>
                        </td>
                        <td className="px-6 py-5 w-[42%] align-middle">
                          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                            {detailItems.map((item) => (
                              <div
                                key={item.label}
                                className="min-h-14 rounded-2xl border border-slate-100 bg-white/80 px-3 py-2 shadow-sm shadow-slate-100/70"
                              >
                                <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500 leading-tight">
                                  {item.label}
                                </span>
                                <span className="mt-1 block truncate text-sm font-bold text-slate-800">
                                  {item.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

          </div>
  );
}
