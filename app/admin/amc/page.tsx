'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  RefreshCw,
  AlertTriangle,
  IndianRupee,
  Phone,
  Package,
  Calendar,
  X,
  Search,
  RotateCcw,
  Settings,
  Users,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardData {
  counts: {
    total: number;
    active: number;
    expired: number;
    renewed: number;
    expiring_soon: number;
  };
  revenue: {
    total: number;
    active: number;
  };
}

interface ExpiringAmc {
  id: number;
  client_id: number;
  client_product_id: number;
  client_name: string;
  client_phone: string | null;
  product_name: string;
  serial_number: string | null;
  plan_name: string;
  price: number;
  start_date: string;
  end_date: string;
  status: string;
}

interface ClientAmc {
  id: number;
  client_id: number;
  client_name: string;
  client_phone: string | null;
  client_product_id: number;
  product_name: string;
  serial_number: string | null;
  plan_name: string;
  price: number;
  duration_months: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'renewed';
  created_at: string;
}

interface AmcPlan {
  id: number;
  name: string;
  duration_months: number;
  price: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function AmcStatusBadge({ status, endDate }: { status: string; endDate: string }) {
  const days = daysUntil(endDate);
  const isExpired = status === 'expired' || days < 0;
  const isExpiringSoon = !isExpired && status === 'active' && days <= 30;
  const isRenewed = status === 'renewed';

  if (isRenewed) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest">
        <RotateCcw size={10} />
        Renewed
      </span>
    );
  }
  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest">
        <Shield size={10} />
        Expired
      </span>
    );
  }
  if (isExpiringSoon) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest">
        <ShieldAlert size={10} />
        Expiring {days}d
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
      <ShieldCheck size={10} />
      Active
    </span>
  );
}

// ─── Renew Modal ──────────────────────────────────────────────────────────────

function RenewModal({
  open,
  amc,
  plans,
  onClose,
  onRenewed,
}: {
  open: boolean;
  amc: ExpiringAmc | ClientAmc | null;
  plans: AmcPlan[];
  onClose: () => void;
  onRenewed: () => void;
}) {
  const [planId, setPlanId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && amc) {
      // Default start date = day after current end date (or today if already expired)
      const end = new Date(amc.end_date);
      const now = new Date();
      const s = end > now ? new Date(end.getTime() + 86400000) : now;
      setStartDate(s.toISOString().split('T')[0]);
      setPlanId(plans.length > 0 ? String(plans[0].id) : '');
    }
  }, [open, amc, plans]);

  const selectedPlan = plans.find((p) => p.id === Number(planId));

  const endDate = selectedPlan && startDate
    ? (() => {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + selectedPlan.duration_months);
        return d.toISOString().split('T')[0];
      })()
    : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amc || !planId || !startDate || !endDate) return;
    setSaving(true);
    try {
      // 1. Mark old AMC as renewed — only proceed to create the new record if
      //    this succeeds, otherwise we'd leave two 'active' AMCs for the product.
      const renewRes = await fetch(`/api/admin/clients/${amc.client_id}/amc/${amc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'renewed' }),
      });
      if (!renewRes.ok) {
        toast.error('Could not mark the existing AMC as renewed. Please try again.');
        return;
      }

      // 2. Create new AMC record
      const createRes = await fetch(`/api/admin/clients/${amc.client_id}/amc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_product_id: amc.client_product_id,
          amc_plan_id: Number(planId),
          start_date: startDate,
          end_date: endDate,
          status: 'active',
        }),
      });

      if (!createRes.ok) {
        toast.error('AMC marked renewed, but creating the new contract failed. Please review.');
        return;
      }

      toast.success('AMC renewed.');
      onRenewed();
      onClose();
    } catch {
      toast.error('Network error while renewing AMC.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all';

  return (
    <AnimatePresence>
      {open && amc && (
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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
          >
            <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-brand-950">Renew AMC</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{amc.client_name} · {amc.product_name}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all" aria-label="Close renew dialog">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              <div>
                <label htmlFor="amc-renew-plan" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Select Plan *
                </label>
                <select
                  id="amc-renew-plan"
                  className={inputClass}
                  value={planId}
                  onChange={(e) => setPlanId(e.target.value)}
                  required
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.duration_months}m · ₹{p.price.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amc-renew-start" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Start Date *
                </label>
                <input
                  id="amc-renew-start"
                  className={inputClass}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              {endDate && (
                <div className="bg-brand-50 rounded-2xl px-5 py-3 flex items-center justify-between">
                  <span className="text-xs text-brand-600 font-black">New end date</span>
                  <span className="text-sm font-black text-brand-950">{fmt(endDate)}</span>
                </div>
              )}

              {selectedPlan && (
                <div className="bg-emerald-50 rounded-2xl px-5 py-3 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-black">Plan price</span>
                  <span className="text-sm font-black text-emerald-800">₹{selectedPlan.price.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  {saving ? 'Renewing…' : 'Renew AMC'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-2xl font-black text-brand-950">{value}</p>
        {sub && <p className="text-xs text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'expiring' | 'all';

export default function AmcDashboardPage() {
  const { status } = useSession();
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [expiring, setExpiring] = useState<ExpiringAmc[]>([]);
  const [allAmcs, setAllAmcs] = useState<ClientAmc[]>([]);
  const [plans, setPlans] = useState<AmcPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('expiring');
  const [searchQuery, setSearchQuery] = useState('');
  const [expiryDays, setExpiryDays] = useState(30);

  const [renewTarget, setRenewTarget] = useState<ExpiringAmc | ClientAmc | null>(null);
  const [renewOpen, setRenewOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchAll();
  }, [status, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, expRes, allRes, plansRes] = await Promise.all([
        fetch('/api/admin/amc/dashboard'),
        fetch(`/api/admin/amc/expiring?days=${expiryDays}`),
        fetch('/api/admin/amc'),
        fetch('/api/admin/amc-plans'),
      ]);
      const [dashData, expData, allData, plansData] = await Promise.all([
        dashRes.json(),
        expRes.json(),
        allRes.json(),
        plansRes.json(),
      ]);
      if (dashRes.ok) setDashboard(dashData);
      setExpiring(Array.isArray(expData) ? expData : []);
      setAllAmcs(Array.isArray(allData) ? allData : []);
      setPlans(Array.isArray(plansData) ? plansData : []);
    } catch {
      toast.error('Failed to load AMC data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [expiryDays]);

  const openRenew = (amc: ExpiringAmc | ClientAmc) => {
    setRenewTarget(amc);
    setRenewOpen(true);
  };

  const filteredAllAmcs = searchQuery
    ? allAmcs.filter(
        (a) =>
          a.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allAmcs;

  const filteredExpiringAmcs = expiring.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.client_name.toLowerCase().includes(q) || a.product_name.toLowerCase().includes(q);
  });

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <ShieldCheck size={20} />
              </div>
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">AMC Management</h1>
            </div>
            <p className="text-slate-500 font-medium">Monitor and manage Annual Maintenance Contracts across all clients.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-all"
              title="Refresh"
              aria-label="Refresh AMC data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link
              href="/admin/amc-plans"
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-brand-200 rounded-2xl text-sm font-black text-slate-600 hover:text-brand-600 transition-all"
            >
              <Settings size={16} />
              Manage Plans
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard
            icon={<ShieldCheck size={22} className="text-emerald-600" />}
            label="Active AMCs"
            value={loading ? '…' : (dashboard?.counts.active ?? 0)}
            color="bg-emerald-50"
          />
          <StatCard
            icon={<ShieldAlert size={22} className="text-orange-500" />}
            label="Expiring (30d)"
            value={loading ? '…' : (dashboard?.counts.expiring_soon ?? 0)}
            sub="Need renewal"
            color="bg-orange-50"
          />
          <StatCard
            icon={<Shield size={22} className="text-red-500" />}
            label="Expired"
            value={loading ? '…' : (dashboard?.counts.expired ?? 0)}
            color="bg-red-50"
          />
          <StatCard
            icon={<IndianRupee size={22} className="text-brand-600" />}
            label="Total AMC Revenue"
            value={loading ? '…' : `₹${(dashboard?.revenue.total ?? 0).toLocaleString('en-IN')}`}
            sub={`₹${(dashboard?.revenue.active ?? 0).toLocaleString('en-IN')} from active`}
            color="bg-brand-50"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white border border-slate-100 rounded-2xl p-1.5 w-fit shadow-sm">
          {([
            { key: 'expiring', label: 'Expiring AMCs', icon: <AlertTriangle size={14} /> },
            { key: 'all', label: 'All Client AMCs', icon: <Users size={14} /> },
          ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
                tab === key
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-brand-600 hover:bg-slate-50'
              }`}
            >
              {icon}
              {label}
              {key === 'expiring' && !loading && expiring.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${tab === 'expiring' ? 'bg-white/20' : 'bg-orange-100 text-orange-600'}`}>
                  {expiring.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              aria-label="Search AMCs"
              placeholder={tab === 'expiring' ? 'Search client or product…' : 'Search client, product, plan…'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-64 transition-all"
            />
          </div>
          {tab === 'expiring' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-black">Expiring within</span>
              {[15, 30, 60, 90].map((d) => (
                <button
                  key={d}
                  onClick={() => { setExpiryDays(d); }}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                    expiryDays === d
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 hover:text-red-500 transition-all"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* ── Tab: Expiring AMCs ── */}
        {tab === 'expiring' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-orange-500" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Expiring within {expiryDays} days ({filteredExpiringAmcs.length})
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expires</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-16 text-center">
                        <RefreshCw className="animate-spin text-brand-500 mx-auto mb-3" size={28} />
                        <p className="text-slate-400 font-medium text-sm">Loading…</p>
                      </td>
                    </tr>
                  ) : filteredExpiringAmcs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ShieldCheck size={28} className="text-emerald-400" />
                        </div>
                        <p className="text-slate-500 font-black">No AMCs expiring in {expiryDays} days</p>
                        <p className="text-slate-400 text-sm font-medium mt-1">All active AMCs are healthy.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredExpiringAmcs.map((amc) => {
                      const days = daysUntil(amc.end_date);
                      return (
                        <motion.tr
                          key={amc.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-orange-50/30 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-1">
                              <Link
                                href={`/admin/clients/${amc.client_id}`}
                                className="font-black text-sm text-brand-950 hover:text-brand-600 transition-colors"
                              >
                                {amc.client_name}
                              </Link>
                              {amc.client_phone && (
                                <div className="flex items-center gap-1.5">
                                  <Phone size={11} className="text-slate-400" />
                                  <span className="text-xs text-slate-500 font-medium">{amc.client_phone}</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <Package size={12} className="text-slate-400" />
                                <span className="text-xs font-bold text-slate-700">{amc.product_name}</span>
                              </div>
                              {amc.serial_number && (
                                <span className="text-xs text-slate-500 font-medium pl-4">S/N: {amc.serial_number}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-xs font-bold text-slate-700">{amc.plan_name}</span>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">₹{amc.price.toLocaleString('en-IN')}</p>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} className="text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">{fmt(amc.end_date)}</span>
                            </div>
                            <p className={`text-[10px] font-black mt-0.5 ${days <= 7 ? 'text-red-500' : 'text-orange-500'}`}>
                              {days <= 0 ? 'Expired' : `${days} days left`}
                            </p>
                          </td>
                          <td className="px-6 py-5">
                            <AmcStatusBadge status={amc.status} endDate={amc.end_date} />
                          </td>
                          <td className="px-6 py-5 text-right">
                            <button
                              onClick={() => openRenew(amc)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black transition-all shadow-sm shadow-brand-200 ml-auto"
                            >
                              <RotateCcw size={12} />
                              Renew
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
        )}

        {/* ── Tab: All Client AMCs ── */}
        {tab === 'all' && (
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-brand-500" />
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  All Client AMCs ({filteredAllAmcs.length})
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-16 text-center">
                        <RefreshCw className="animate-spin text-brand-500 mx-auto mb-3" size={28} />
                        <p className="text-slate-400 font-medium text-sm">Loading…</p>
                      </td>
                    </tr>
                  ) : filteredAllAmcs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <ShieldCheck size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">No AMC records found.</p>
                        <p className="text-slate-400 text-sm mt-1">
                          Assign AMCs to clients from their{' '}
                          <Link href="/admin/clients" className="text-brand-600 font-black hover:underline">
                            profile page
                          </Link>
                          .
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAllAmcs.map((amc) => (
                      <motion.tr
                        key={amc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/clients/${amc.client_id}`}
                            className="font-black text-sm text-brand-950 hover:text-brand-600 transition-colors block"
                          >
                            {amc.client_name}
                          </Link>
                          {amc.client_phone && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone size={10} className="text-slate-400" />
                              <span className="text-xs text-slate-500 font-medium">{amc.client_phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Package size={12} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700">{amc.product_name}</span>
                          </div>
                          {amc.serial_number && (
                            <span className="text-xs text-slate-500 font-medium block mt-0.5 pl-4">
                              S/N: {amc.serial_number}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-700">{amc.plan_name}</span>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">₹{amc.price.toLocaleString('en-IN')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs text-slate-500 font-medium">
                            {fmt(amc.start_date)} → {fmt(amc.end_date)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <AmcStatusBadge status={amc.status} endDate={amc.end_date} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            <button
                              onClick={() => openRenew(amc)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black transition-all"
                            >
                              <RotateCcw size={11} />
                              Renew
                            </button>
                            <Link
                              href={`/admin/clients/${amc.client_id}`}
                              className="px-3 py-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl text-xs font-black transition-all"
                            >
                              View Client
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      
      <RenewModal
        open={renewOpen}
        amc={renewTarget}
        plans={plans}
        onClose={() => setRenewOpen(false)}
        onRenewed={fetchAll}
      />
    </div>
  );
}
