'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Tag, RefreshCw, LogOut, Save, AlertTriangle } from 'lucide-react';
import Footer from '@/components/Footer';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingRow {
  product_id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  dp_price: number | null;
  mrp_price: number | null;
}

interface RowState {
  dp: string;
  mrp: string;
  saving: boolean;
  saved: boolean;
  dirty: boolean;
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${50 + i * 8}%` }} />
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
  const [rowState, setRowState] = useState<Record<string, RowState>>({});
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
      const initial: Record<string, RowState> = {};
      for (const p of (Array.isArray(data) ? data : [])) {
        initial[p.product_id] = {
          dp: p.dp_price != null ? String(p.dp_price) : '',
          mrp: p.mrp_price != null ? String(p.mrp_price) : '',
          saving: false,
          saved: false,
          dirty: false,
        };
      }
      setRowState(initial);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (productId: string, field: 'dp' | 'mrp', value: string) => {
    setRowState((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: value, dirty: true, saved: false },
    }));
  };

  const handleSave = async (productId: string) => {
    const row = rowState[productId];
    if (!row) return;
    setRowState((prev) => ({ ...prev, [productId]: { ...prev[productId], saving: true } }));
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          dp_price: row.dp !== '' ? Number(row.dp) : null,
          mrp_price: row.mrp !== '' ? Number(row.mrp) : null,
        }),
      });
      if (res.ok) {
        setRowState((prev) => ({
          ...prev,
          [productId]: { ...prev[productId], saving: false, saved: true, dirty: false },
        }));
        // Update the product list to reflect saved values
        setProducts((prev) =>
          prev.map((p) =>
            p.product_id === productId
              ? {
                  ...p,
                  dp_price: row.dp !== '' ? Number(row.dp) : null,
                  mrp_price: row.mrp !== '' ? Number(row.mrp) : null,
                }
              : p
          )
        );
        setTimeout(() => {
          setRowState((prev) => ({ ...prev, [productId]: { ...prev[productId], saved: false } }));
        }, 2000);
      } else {
        setRowState((prev) => ({ ...prev, [productId]: { ...prev[productId], saving: false } }));
      }
    } catch {
      setRowState((prev) => ({ ...prev, [productId]: { ...prev[productId], saving: false } }));
    }
  };

  const isIncomplete = (p: PricingRow) => p.dp_price == null || p.mrp_price == null;

  const incompleteCount = products.filter(isIncomplete).length;

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Tag size={20} />
              </div>
              <h1 className="text-4xl font-black text-blue-950 tracking-tight">Pricing</h1>
            </div>
            <p className="text-slate-500 font-medium">Set dealer and MRP prices for all products.</p>
          </div>

          <div className="flex items-center gap-3">
            {incompleteCount > 0 && !loading && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-sm font-black text-amber-700">
                <AlertTriangle size={14} />
                {incompleteCount} incomplete
              </div>
            )}
            <button
              onClick={fetchPricing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-2.5 bg-white border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              All Products ({products.length})
            </h2>
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-amber-200 inline-block" />
                Incomplete pricing
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">DP Price (₹)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">MRP Price (₹)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <p className="text-slate-500 font-medium">No products found.</p>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const rs = rowState[product.product_id];
                    const incomplete = isIncomplete(product);
                    return (
                      <motion.tr
                        key={product.product_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`transition-colors group ${incomplete ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.image ? (
                              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-50">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex-shrink-0" />
                            )}
                            <span className="font-black text-sm text-blue-950 leading-snug max-w-[200px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-black">
                            {product.brand}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-500 font-medium">{product.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            value={rs?.dp ?? ''}
                            onChange={(e) => handleChange(product.product_id, 'dp', e.target.value)}
                            className={`w-32 px-3 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium ${
                              incomplete && (rs?.dp === '') ? 'border-amber-300' : 'border-slate-200'
                            }`}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            value={rs?.mrp ?? ''}
                            onChange={(e) => handleChange(product.product_id, 'mrp', e.target.value)}
                            className={`w-32 px-3 py-2 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all font-medium ${
                              incomplete && (rs?.mrp === '') ? 'border-amber-300' : 'border-slate-200'
                            }`}
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleSave(product.product_id)}
                            disabled={rs?.saving || (!rs?.dirty && !incomplete)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ml-auto ${
                              rs?.saved
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : rs?.dirty
                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-200'
                                : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {rs?.saving ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <Save size={13} />
                            )}
                            {rs?.saved ? 'Saved!' : rs?.saving ? 'Saving…' : 'Save'}
                          </button>
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

      <Footer />
    </div>
  );
}
