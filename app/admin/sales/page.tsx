'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  RefreshCw,
  LogOut,
  Plus,
  X,
  Award,
  Users,
  IndianRupee,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import Footer from '@/components/Footer';
import { products } from '@/lib/data';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  today: { count: number; revenue: number };
  this_month: { count: number; revenue: number; cost: number; margin: number };
  top_performer: { name: string; count: number; revenue: number };
  by_member: Array<{ id: number; name: string; count: number; revenue: number }>;
}

interface SalesRecord {
  id: string;
  sale_date: string;
  member_name: string;
  product_name: string;
  client_name: string | null;
  quantity: number;
  unit_price_sold: number;
  dp_price_at_sale: number | null;
  mrp_price_at_sale: number | null;
  margin: number;
}

interface TeamMember {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

interface Client {
  id: number;
  name: string;
  company_name: string | null;
}

interface ProductPricing {
  product_id: string;
  dp_price: number | null;
  mrp_price: number | null;
}

interface LogSaleForm {
  sales_team_id: string;
  product_id: string;
  client_id: string;
  quantity: string;
  unit_price_sold: string;
  sale_date: string;
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const monthStart = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
};

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 animate-pulse">
      <div className="h-3 bg-slate-100 rounded-lg w-1/2 mb-4" />
      <div className="h-7 bg-slate-100 rounded-lg w-3/4 mb-2" />
      <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
    </div>
  );
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-slate-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${50 + (i % 3) * 15}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Log Sale Modal ────────────────────────────────────────────────────────────

function LogSaleModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const EMPTY: LogSaleForm = {
    sales_team_id: '',
    product_id: '',
    client_id: '',
    quantity: '1',
    unit_price_sold: '',
    sale_date: today(),
    notes: '',
  };

  const [form, setForm] = useState<LogSaleForm>(EMPTY);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pricing, setPricing] = useState<ProductPricing[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setError('');
    // Fetch team, clients, pricing, and products in parallel
    Promise.all([
      fetch('/api/admin/sales-team').then((r) => r.json()),
      fetch('/api/admin/clients').then((r) => r.json()),
      fetch('/api/admin/pricing').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ]).then(([team, clientList, pricingList, productsList]) => {
      setTeamMembers(Array.isArray(team) ? team.filter((m: TeamMember) => m.status === 'active') : []);
      setClients(Array.isArray(clientList) ? clientList : (clientList.clients ?? []));
      setPricing(Array.isArray(pricingList) ? pricingList : []);
      setDbProducts(Array.isArray(productsList) ? productsList : []);
    }).catch(() => {
      toast.error('Failed to load form data. Please try again.');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (key: keyof LogSaleForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const selectedPricing = useMemo(
    () => pricing.find((p) => p.product_id === form.product_id) ?? null,
    [pricing, form.product_id]
  );

  const selectedProduct = useMemo(
    () => dbProducts.find((p) => p.id === form.product_id) ?? products.find((p) => p.id === form.product_id) ?? null,
    [dbProducts, form.product_id]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        sales_team_id: Number(form.sales_team_id),
        product_id: form.product_id,
        product_name: selectedProduct?.name ?? form.product_id,
        client_id: form.client_id ? Number(form.client_id) : null,
        quantity: Number(form.quantity) || 1,
        unit_price_sold: Number(form.unit_price_sold),
        dp_price_at_sale: selectedPricing?.dp_price ?? null,
        mrp_price_at_sale: selectedPricing?.mrp_price ?? null,
        notes: form.notes || null,
        sale_date: form.sale_date,
      };
      const res = await fetch('/api/admin/sales-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success('Sale logged.');
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        const msg = data.error || 'Failed to log sale.';
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Failed to log sale. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-brand-950">Log Sale</h2>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {error && (
                <p className="text-sm text-red-600 font-medium bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
              )}

              {/* Team Member */}
              <div>
                <label htmlFor="sale-member" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Team Member *
                </label>
                <select id="sale-member" className={inputClass} value={form.sales_team_id} onChange={set('sales_team_id')} required>
                  <option value="">Select team member…</option>
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div>
                <label htmlFor="sale-product" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Product *
                </label>
                <select id="sale-product" className={inputClass} value={form.product_id} onChange={set('product_id')} required>
                  <option value="">Select product…</option>
                  {(dbProducts.length > 0 ? dbProducts : products).map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.brand}</option>
                  ))}
                </select>
                {selectedPricing && (
                  <p className="text-xs text-slate-500 font-medium mt-1.5 px-1">
                    DP: {selectedPricing.dp_price != null ? fmt(selectedPricing.dp_price) : '—'}
                    &nbsp;·&nbsp;
                    MRP: {selectedPricing.mrp_price != null ? fmt(selectedPricing.mrp_price) : '—'}
                    &nbsp;(auto-filled on submit)
                  </p>
                )}
              </div>

              {/* Client (optional) */}
              <div>
                <label htmlFor="sale-client" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Client <span className="font-medium normal-case tracking-normal text-slate-400">(optional)</span>
                </label>
                <select id="sale-client" className={inputClass} value={form.client_id} onChange={set('client_id')}>
                  <option value="">No client / walk-in</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.company_name ? ` — ${c.company_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quantity */}
                <div>
                  <label htmlFor="sale-quantity" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Quantity *
                  </label>
                  <input
                    id="sale-quantity"
                    className={inputClass}
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={set('quantity')}
                    required
                  />
                </div>

                {/* Unit Price Sold */}
                <div>
                  <label htmlFor="sale-price" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Unit Price Sold (INR) *
                  </label>
                  <input
                    id="sale-price"
                    className={inputClass}
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="e.g. 15000"
                    value={form.unit_price_sold}
                    onChange={set('unit_price_sold')}
                    required
                  />
                </div>
              </div>

              {/* Sale Date */}
              <div>
                <label htmlFor="sale-date" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Sale Date *
                </label>
                <input id="sale-date" className={inputClass} type="date" value={form.sale_date} onChange={set('sale_date')} required />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="sale-notes" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Notes <span className="font-medium normal-case tracking-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="sale-notes"
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder="Any notes about the sale…"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  {saving ? 'Saving…' : 'Log Sale'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminSalesPage() {
  const { status } = useSession();
  const router = useRouter();

  // Filters
  const [startDate, setStartDate] = useState(monthStart());
  const [endDate, setEndDate] = useState(today());
  const [memberId, setMemberId] = useState('');

  // Data
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [records, setRecords] = useState<SalesRecord[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingDash, setLoadingDash] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') {
      fetchDashboard();
      fetchTeamMembers();
      fetchRecords();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router]);

  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    try {
      const res = await fetch('/api/admin/sales-dashboard', { cache: 'no-store' });
      const data = await res.json();
      setDashboard(data);
    } catch {
      setDashboard(null);
      toast.error('Failed to load sales dashboard.');
    } finally {
      setLoadingDash(false);
    }
  }, []);

  const fetchTeamMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/sales-team');
      const data = await res.json();
      setTeamMembers(Array.isArray(data) ? data : []);
    } catch {
      setTeamMembers([]);
      toast.error('Failed to load team members.');
    }
  }, []);

  const fetchRecords = useCallback(async (overrides?: { startDate?: string; endDate?: string; memberId?: string }) => {
    setLoadingRecords(true);
    try {
      const sd = overrides?.startDate ?? startDate;
      const ed = overrides?.endDate ?? endDate;
      const mid = overrides?.memberId ?? memberId;
      const params = new URLSearchParams();
      if (sd) params.set('startDate', sd);
      if (ed) params.set('endDate', ed);
      if (mid) params.set('memberId', mid);
      params.set('limit', '100');
      const res = await fetch(`/api/admin/sales-records?${params}`, { cache: 'no-store' });
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
      toast.error('Failed to load sales records.');
    } finally {
      setLoadingRecords(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, memberId]);

  // Per-member breakdown computed from filtered records
  const memberBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; count: number; revenue: number }>();
    for (const r of records) {
      const key = r.member_name;
      const existing = map.get(key) ?? { name: key, count: 0, revenue: 0 };
      map.set(key, {
        name: key,
        count: existing.count + 1,
        revenue: existing.revenue + r.unit_price_sold * r.quantity,
      });
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [records]);

  const refreshAll = useCallback(() => {
    fetchDashboard();
    fetchRecords();
  }, [fetchDashboard, fetchRecords]);

  const handleApplyFilters = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  }, [fetchRecords]);

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <TrendingUp size={20} />
              </div>
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">Sales Dashboard</h1>
            </div>
            <p className="text-slate-500 font-medium">Track team sales performance and log new transactions.</p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={refreshAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all"
            >
              <RefreshCw size={16} className={loadingDash || loadingRecords ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-brand-200"
            >
              <Plus size={16} />
              Log Sale
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

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <form
          onSubmit={handleApplyFilters}
          className="bg-white rounded-[2rem] border border-slate-100 shadow-sm px-6 py-4 mb-8 flex flex-wrap items-end gap-4"
        >
          <div>
            <label htmlFor="filter-from" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
              From
            </label>
            <input
              id="filter-from"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
            />
          </div>
          <div>
            <label htmlFor="filter-to" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
              To
            </label>
            <input
              id="filter-to"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all"
            />
          </div>
          <div>
            <label htmlFor="filter-member" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
              Team Member
            </label>
            <select
              id="filter-member"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all min-w-[160px]"
            >
              <option value="">All members</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-black rounded-xl transition-all"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => {
              const sd = monthStart();
              const ed = today();
              setStartDate(sd);
              setEndDate(ed);
              setMemberId('');
              fetchRecords({ startDate: sd, endDate: ed, memberId: '' });
            }}
            className="px-4 py-2 border border-slate-200 text-slate-500 text-sm font-black rounded-xl hover:bg-slate-50 transition-all"
          >
            Reset
          </button>
        </form>

        {/* ── Summary Cards ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {loadingDash ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              {/* Sales Today */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-xl flex items-center justify-center">
                    <TrendingUp size={16} className="text-brand-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sales Today</span>
                </div>
                <p className="text-2xl font-black text-brand-950 mb-1">
                  {dashboard?.today.count ?? 0}
                  <span className="text-sm font-medium text-slate-400 ml-1">sales</span>
                </p>
                <p className="text-sm font-black text-slate-500">{fmt(dashboard?.today.revenue ?? 0)}</p>
              </motion.div>

              {/* This Month */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <BarChart3 size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">This Month</span>
                </div>
                <p className="text-2xl font-black text-brand-950 mb-1">
                  {dashboard?.this_month.count ?? 0}
                  <span className="text-sm font-medium text-slate-400 ml-1">sales</span>
                </p>
                <p className="text-sm font-black text-slate-500">{fmt(dashboard?.this_month.revenue ?? 0)}</p>
              </motion.div>

              {/* Gross Margin */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
                    <IndianRupee size={16} className="text-violet-600" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gross Margin</span>
                </div>
                <p className={`text-2xl font-black mb-1 ${(dashboard?.this_month.margin ?? 0) >= 0 ? 'text-brand-950' : 'text-red-600'}`}>
                  {fmt(dashboard?.this_month.margin ?? 0)}
                </p>
                <p className="text-sm font-black text-slate-400">Revenue − DP cost</p>
              </motion.div>

              {/* Top Performer */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Award size={16} className="text-amber-500" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top Performer</span>
                </div>
                {dashboard?.top_performer.name ? (
                  <>
                    <p className="text-lg font-black text-brand-950 mb-1 truncate">{dashboard.top_performer.name}</p>
                    <p className="text-sm font-black text-slate-500">{fmt(dashboard.top_performer.revenue)}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 font-medium mt-2">No sales this month</p>
                )}
              </motion.div>
            </>
          )}
        </div>

        {/* ── Per-member Breakdown ─────────────────────────────────────── */}
        {memberBreakdown.length > 0 && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-8">
            <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
              <Users size={14} className="text-slate-400" />
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Team Breakdown — Filtered Period
              </h2>
            </div>
            <div className="flex flex-wrap gap-4 p-6">
              {memberBreakdown.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-slate-50 rounded-2xl px-5 py-4 min-w-[160px]"
                >
                  <p className="text-sm font-black text-brand-950 mb-1">{m.name}</p>
                  <p className="text-xs text-slate-500 font-medium">{m.count} sale{m.count !== 1 ? 's' : ''}</p>
                  <p className="text-sm font-black text-emerald-600 mt-1">{fmt(m.revenue)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Sales Records Table ──────────────────────────────────────── */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Sales Records ({records.length})
            </h2>
            <button
              onClick={() => fetchRecords()}
              className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} className={loadingRecords ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Team Member</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Qty</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">DP</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Sold</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">MRP</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingRecords ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={9} />)
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <TrendingUp size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No sales records found.</p>
                      <button
                        onClick={() => setModalOpen(true)}
                        className="mt-4 text-brand-600 text-sm font-black hover:underline"
                      >
                        Log the first sale →
                      </button>
                    </td>
                  </tr>
                ) : (
                  records.map((r) => {
                    const belowDP =
                      r.dp_price_at_sale != null && r.unit_price_sold < r.dp_price_at_sale;
                    const marginPositive = r.margin > 0;
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                          {new Date(r.sale_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-black text-brand-950">{r.member_name}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-600 font-medium max-w-[200px] block truncate">
                            {r.product_name}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-500 font-medium">
                            {r.client_name ?? <span className="text-slate-300">—</span>}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-black text-brand-950">{r.quantity}</span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-xs text-slate-400 font-medium">
                            {r.dp_price_at_sale != null ? fmt(r.dp_price_at_sale) : <span className="text-slate-300">—</span>}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className={`text-sm font-black ${belowDP ? 'text-red-600' : 'text-brand-950'}`}>
                            {fmt(r.unit_price_sold)}
                          </span>
                          {belowDP && (
                            <span title="Sold below DP price!">
                              <AlertTriangle size={12} className="inline ml-1 text-red-500" />
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-xs text-slate-400 font-medium">
                            {r.mrp_price_at_sale != null ? fmt(r.mrp_price_at_sale) : <span className="text-slate-300">—</span>}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`text-sm font-black ${marginPositive ? 'text-emerald-600' : 'text-red-600'}`}
                          >
                            {fmt(r.margin * r.quantity)}
                          </span>
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

      <LogSaleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refreshAll}
      />
    </div>
  );
}
