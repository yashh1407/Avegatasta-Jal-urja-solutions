'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  X,
  Clock,
  Wrench,
  DollarSign,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AmcPlan {
  id: number;
  name: string;
  duration_months: number;
  coverage_description: string | null;
  price: number;
  service_interval_days: number;
  created_at: string;
}

interface PlanFormData {
  name: string;
  duration_months: string;
  coverage_description: string;
  price: string;
  service_interval_days: string;
}

const EMPTY_FORM: PlanFormData = {
  name: '',
  duration_months: '12',
  coverage_description: '',
  price: '',
  service_interval_days: '90',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${50 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Plan Form Modal ──────────────────────────────────────────────────────────

function PlanFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: AmcPlan | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PlanFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name,
              duration_months: String(initial.duration_months),
              coverage_description: initial.coverage_description ?? '',
              price: String(initial.price),
              service_interval_days: String(initial.service_interval_days),
            }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [open, initial]);

  const set = (key: keyof PlanFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const url = initial ? `/api/admin/amc-plans/${initial.id}` : '/api/admin/amc-plans';
      const method = initial ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          duration_months: Number(form.duration_months),
          coverage_description: form.coverage_description.trim() || null,
          price: Number(form.price),
          service_interval_days: Number(form.service_interval_days),
        }),
      });
      if (res.ok) {
        toast.success(initial ? 'Plan updated.' : 'Plan created.');
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        if (data.error && typeof data.error === 'object') {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(data.error)) {
            flat[k] = Array.isArray(v) ? v[0] : String(v);
          }
          setErrors(flat);
          toast.error('Please fix the highlighted fields.');
        } else {
          toast.error(typeof data.error === 'string' ? data.error : 'Failed to save plan.');
        }
      }
    } catch {
      toast.error('Network error while saving plan.');
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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-brand-950">
                {initial ? 'Edit Plan' : 'New AMC Plan'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              <div>
                <label htmlFor="amc-plan-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Plan Name *
                </label>
                <input
                  id="amc-plan-name"
                  className={inputClass}
                  value={form.name}
                  onChange={set('name')}
                  required
                  placeholder="e.g. Annual Comprehensive"
                />
                {errors.name && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="amc-plan-duration" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Duration (months) *
                  </label>
                  <input
                    id="amc-plan-duration"
                    className={inputClass}
                    type="number"
                    min={1}
                    value={form.duration_months}
                    onChange={set('duration_months')}
                    required
                    placeholder="12"
                  />
                  {errors.duration_months && (
                    <p className="text-[10px] text-red-500 mt-0.5 font-medium">{errors.duration_months}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="amc-plan-price" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Price (₹) *
                  </label>
                  <input
                    id="amc-plan-price"
                    className={inputClass}
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={set('price')}
                    required
                    placeholder="5000"
                  />
                  {errors.price && <p className="text-[10px] text-red-500 mt-0.5 font-medium">{errors.price}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="amc-plan-interval" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Service Interval (days) *
                </label>
                <input
                  id="amc-plan-interval"
                  className={inputClass}
                  type="number"
                  min={1}
                  value={form.service_interval_days}
                  onChange={set('service_interval_days')}
                  required
                  placeholder="90"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">How often service visits occur (e.g. 90 = quarterly)</p>
                {errors.service_interval_days && (
                  <p className="text-[10px] text-red-500 mt-0.5 font-medium">{errors.service_interval_days}</p>
                )}
              </div>

              <div>
                <label htmlFor="amc-plan-coverage" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                  Coverage Description
                </label>
                <textarea
                  id="amc-plan-coverage"
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={form.coverage_description}
                  onChange={set('coverage_description')}
                  placeholder="What is included in this plan…"
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
                  {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AmcPlansPage() {
  const { status } = useSession();
  const router = useRouter();

  const [plans, setPlans] = useState<AmcPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AmcPlan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AmcPlan | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchPlans();
  }, [status, router]);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/amc-plans');
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setPlans([]);
      toast.error('Failed to load AMC plans.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteConfirmed = async () => {
    const plan = deleteTarget;
    if (!plan) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/amc-plans/${plan.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Plan "${plan.name}" deleted.`);
        fetchPlans();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete plan.');
      }
    } catch {
      toast.error('Failed to delete plan.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (plan: AmcPlan) => {
    setEditTarget(plan);
    setModalOpen(true);
  };

  const filtered = plans.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Back */}
        <Link
          href="/admin/amc"
          className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-600 mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          AMC Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <ShieldCheck size={20} />
              </div>
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">AMC Plans</h1>
            </div>
            <p className="text-slate-500 font-medium">Define plan types that can be assigned to client products.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                aria-label="Search plans"
                placeholder="Search plans…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-52 transition-all"
              />
            </div>
            <button
              onClick={fetchPlans}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-brand-600 hover:border-brand-200 transition-all"
              title="Refresh"
              aria-label="Refresh plans"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-brand-200"
            >
              <Plus size={16} />
              New Plan
            </button>
          </div>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <ShieldCheck size={14} className="text-brand-500" />
            <span className="text-sm font-black text-brand-950">{plans.length}</span>
            <span className="text-xs text-slate-500 font-medium">Total Plans</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              All Plans ({filtered.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Interval</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <ShieldCheck size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No AMC plans found.</p>
                      <button onClick={openAdd} className="mt-4 text-brand-600 text-sm font-black hover:underline">
                        Create the first plan →
                      </button>
                    </td>
                  </tr>
                ) : (
                  filtered.map((plan) => (
                    <motion.tr
                      key={plan.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                            <ShieldCheck size={15} className="text-brand-500" />
                          </div>
                          <span className="font-black text-sm text-brand-950">{plan.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-700">{plan.duration_months} months</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={13} className="text-emerald-500" />
                          <span className="text-sm font-black text-brand-950">
                            ₹{plan.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                          <Wrench size={13} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-600">Every {plan.service_interval_days} days</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 max-w-xs">
                        {plan.coverage_description ? (
                          <div className="flex items-start gap-1.5">
                            <FileText size={13} className="text-slate-400 shrink-0 mt-0.5" />
                            <span className="text-xs text-slate-500 font-medium line-clamp-2">
                              {plan.coverage_description}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(plan)}
                            className="px-3 py-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all text-xs font-black"
                            aria-label={`Edit ${plan.name}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(plan)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Plan"
                            aria-label={`Delete ${plan.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      <PlanFormModal
        open={modalOpen}
        initial={editTarget}
        onClose={() => setModalOpen(false)}
        onSaved={fetchPlans}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete plan"
        message={deleteTarget ? `Delete plan "${deleteTarget.name}"? This cannot be undone.` : undefined}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => { if (!deleting) setDeleteTarget(null); }}
      />
    </div>
  );
}
