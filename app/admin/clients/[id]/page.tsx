'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Package,
  RefreshCw,
  Plus,
  X,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Pencil,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { products as catalogProducts } from '@/lib/data';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ClientDetail {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  company_name: string | null;
  notes: string | null;
  created_at: string;
  products: ClientProduct[];
}

interface ClientProduct {
  id: number;
  client_id: number;
  product_id: string | null;
  product_name: string;
  serial_number: string | null;
  batch_number: string | null;
  purchase_date: string | null;
  install_date: string | null;
  warranty_end_date: string | null;
  next_service_date: string | null;
  notes: string | null;
  created_at: string;
}

interface AmcRecord {
  id: number;
  client_product_id: number;
  amc_plan_id: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'renewed';
  notes: string | null;
  product_name: string;
  serial_number: string | null;
  plan_name: string;
  duration_months: number;
  price: number;
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
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dateInputValue(dateStr: string | null) {
  if (!dateStr) return '';
  return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.slice(0, 10);
}

function todayInputValue() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function addMonthsInputValue(dateStr: string, months: number) {
  if (!dateStr || !Number.isFinite(months)) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function isExpired(dateStr: string | null) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

function isExpiringSoon(dateStr: string | null, days = 30) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d >= now && d <= new Date(now.getTime() + days * 86400000);
}

// ─── AMC Status Badge ─────────────────────────────────────────────────────────

function AmcBadge({ endDate, status }: { endDate: string; status: string }) {
  if (status === 'expired' || isExpired(endDate)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-red-50 text-red-600 border border-red-100">
        <ShieldAlert size={10} /> Expired
      </span>
    );
  }
  if (status === 'renewed' || isExpiringSoon(endDate)) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100">
        <Shield size={10} /> {status === 'renewed' ? 'Renewed' : 'Expiring Soon'}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
      <ShieldCheck size={10} /> Active
    </span>
  );
}

// ─── Warranty Badge ───────────────────────────────────────────────────────────

function WarrantyBadge({ endDate }: { endDate: string | null }) {
  if (!endDate) return <span className="text-xs text-slate-300">No warranty</span>;
  if (isExpired(endDate)) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500">Expired {fmt(endDate)}</span>;
  }
  if (isExpiringSoon(endDate, 60)) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100">Expires {fmt(endDate)}</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">Valid till {fmt(endDate)}</span>;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-slate-100 rounded-xl animate-pulse ${className}`} />;
}

// ─── Add/Edit Product Purchase Modal ──────────────────────────────────────────

interface ProductFormData {
  product_id: string;
  product_name: string;
  serial_number: string;
  batch_number: string;
  purchase_date: string;
  install_date: string;
  warranty_end_date: string;
  next_service_date: string;
  notes: string;
}

const EMPTY_PRODUCT_FORM: ProductFormData = {
  product_id: '',
  product_name: '',
  serial_number: '',
  batch_number: '',
  purchase_date: '',
  install_date: '',
  warranty_end_date: '',
  next_service_date: '',
  notes: '',
};

function ProductPurchaseModal({
  open,
  clientId,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  clientId: number;
  initial?: ClientProduct | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_PRODUCT_FORM);
  const [saving, setSaving] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (initial) {
      setForm({
        product_id: initial.product_id ?? '',
        product_name: initial.product_name ?? '',
        serial_number: initial.serial_number ?? '',
        batch_number: initial.batch_number ?? '',
        purchase_date: dateInputValue(initial.purchase_date),
        install_date: dateInputValue(initial.install_date),
        warranty_end_date: dateInputValue(initial.warranty_end_date),
        next_service_date: dateInputValue(initial.next_service_date),
        notes: initial.notes ?? '',
      });
    } else {
      setForm(EMPTY_PRODUCT_FORM);
    }

    setCatalogOpen(false);
  }, [open, initial]);

  const set = (key: keyof ProductFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const pickFromCatalog = (p: { id: string; name: string }) => {
    setForm((f) => ({ ...f, product_id: p.id, product_name: p.name }));
    setCatalogOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const endpoint = initial
        ? `/api/admin/clients/${clientId}/products/${initial.id}`
        : `/api/admin/clients/${clientId}/products`;

      const res = await fetch(endpoint, {
        method: initial ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { onSaved(); onClose(); }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';

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
              <h2 className="text-lg font-black text-blue-950">{initial ? 'Edit Product Purchase' : 'Add Product Purchase'}</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {/* Product picker */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Product Name *</label>
                <div className="flex gap-2">
                  <input
                    className={`${inputClass} flex-1`}
                    value={form.product_name}
                    onChange={set('product_name')}
                    required
                    placeholder="Type product name or pick from catalog"
                  />
                  <button
                    type="button"
                    onClick={() => setCatalogOpen((o) => !o)}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:text-blue-600 transition-all flex items-center gap-1"
                  >
                    Catalog {catalogOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
                <AnimatePresence>
                  {catalogOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 border border-slate-200 rounded-2xl overflow-auto max-h-52 bg-white shadow-lg">
                        {catalogProducts.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => pickFromCatalog(p)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-xs font-medium text-slate-700 hover:text-blue-700 border-b border-slate-50 last:border-0 transition-colors"
                          >
                            <span className="font-black">{p.name}</span>
                            <span className="text-slate-400 ml-2">{p.brand} · {p.category}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Serial Number</label>
                  <input className={inputClass} value={form.serial_number} onChange={set('serial_number')} placeholder="SN-XXXXXX" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Batch Number</label>
                  <input className={inputClass} value={form.batch_number} onChange={set('batch_number')} placeholder="BT-XXXXXX" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Purchase Date</label>
                  <input className={inputClass} type="date" value={form.purchase_date} onChange={set('purchase_date')} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Install Date</label>
                  <input className={inputClass} type="date" value={form.install_date} onChange={set('install_date')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Warranty End</label>
                  <input className={inputClass} type="date" value={form.warranty_end_date} onChange={set('warranty_end_date')} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Next Service</label>
                  <input className={inputClass} type="date" value={form.next_service_date} onChange={set('next_service_date')} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Notes</label>
                <textarea className={`${inputClass} resize-none`} rows={2} value={form.notes} onChange={set('notes')} placeholder="Optional notes…" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  {saving ? 'Saving…' : initial ? 'Save Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Assign AMC Modal ───────────────────────────────────────────────────────

interface AssignAmcFormData {
  amc_plan_id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'renewed';
  notes: string;
}

function AssignAmcModal({
  open,
  clientId,
  product,
  plans,
  onClose,
  onSaved,
}: {
  open: boolean;
  clientId: number;
  product: ClientProduct | null;
  plans: AmcPlan[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState<AssignAmcFormData>({
    amc_plan_id: '',
    start_date: todayInputValue(),
    end_date: '',
    status: 'active',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedPlan = plans.find((plan) => String(plan.id) === form.amc_plan_id) ?? null;

  useEffect(() => {
    if (!open) return;
    const start = todayInputValue();
    const firstPlan = plans[0];
    setForm({
      amc_plan_id: firstPlan ? String(firstPlan.id) : '',
      start_date: start,
      end_date: firstPlan ? addMonthsInputValue(start, firstPlan.duration_months) : '',
      status: 'active',
      notes: '',
    });
    setError('');
    setSaving(false);
  }, [open, product?.id, plans]);

  useEffect(() => {
    if (!open || !selectedPlan || !form.start_date) return;
    setForm((current) => ({
      ...current,
      end_date: addMonthsInputValue(current.start_date, selectedPlan.duration_months),
    }));
  }, [open, selectedPlan?.id, selectedPlan?.duration_months, form.start_date]);

  const set = (key: keyof AssignAmcFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setError('');
    setForm((current) => ({ ...current, [key]: e.target.value } as AssignAmcFormData));
  };

  const formatApiError = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return 'Failed to assign AMC';
    const maybeError = (payload as { error?: unknown }).error;
    if (typeof maybeError === 'string') return maybeError;
    if (maybeError && typeof maybeError === 'object') {
      return Object.entries(maybeError as Record<string, unknown>)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`)
        .join(' | ') || 'Failed to assign AMC';
    }
    return 'Failed to assign AMC';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!form.amc_plan_id) {
      setError('Please select an AMC plan first.');
      return;
    }
    if (!form.start_date || !form.end_date) {
      setError('Please add both start date and end date.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/amc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_product_id: product.id,
          amc_plan_id: Number(form.amc_plan_id),
          start_date: form.start_date,
          end_date: form.end_date,
          status: form.status,
          notes: form.notes.trim() || undefined,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(formatApiError(payload));
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign AMC');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all';

  return (
    <AnimatePresence>
      {open && product && (
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
              <div>
                <h2 className="text-lg font-black text-blue-950">Assign AMC</h2>
                <p className="text-xs text-slate-400 font-medium mt-1">{product.product_name}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {plans.length === 0 ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-black text-amber-700">No AMC plans available</p>
                  <p className="text-xs text-amber-600 mt-1">Create an AMC plan first from the AMC Plans page, then assign it to this product.</p>
                  <Link href="/admin/amc-plans" className="inline-flex mt-3 text-xs font-black text-blue-600 hover:underline">
                    Go to AMC Plans →
                  </Link>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">AMC Plan *</label>
                    <select className={inputClass} value={form.amc_plan_id} onChange={set('amc_plan_id')} required>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} · {plan.duration_months} months · ₹{Number(plan.price || 0).toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                    {selectedPlan && (
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Duration: {selectedPlan.duration_months} months · Price: ₹{Number(selectedPlan.price || 0).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Start Date *</label>
                      <input className={inputClass} type="date" value={form.start_date} onChange={set('start_date')} required />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">End Date *</label>
                      <input className={inputClass} type="date" value={form.end_date} onChange={set('end_date')} required />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Status</label>
                    <select className={inputClass} value={form.status} onChange={set('status')}>
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="renewed">Renewed</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Notes</label>
                    <textarea className={`${inputClass} resize-none`} rows={3} value={form.notes} onChange={set('notes')} placeholder="Optional AMC notes…" />
                  </div>
                </>
              )}

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || plans.length === 0}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  {saving ? 'Assigning…' : 'Assign AMC'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Edit Client Modal (inline, light) ───────────────────────────────────────

function EditClientModal({
  open,
  client,
  onClose,
  onSaved,
}: {
  open: boolean;
  client: ClientDetail | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '', company_name: '', notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && client) {
      setForm({
        name: client.name,
        email: client.email ?? '',
        phone: client.phone ?? '',
        address: client.address ?? '',
        city: client.city ?? '',
        state: client.state ?? '',
        pincode: client.pincode ?? '',
        company_name: client.company_name ?? '',
        notes: client.notes ?? '',
      });
    }
  }, [open, client]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { onSaved(); onClose(); }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';

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
              <h2 className="text-lg font-black text-blue-950">Edit Client</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Full Name *</label>
                <input className={inputClass} value={form.name} onChange={set('name')} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Email</label>
                  <input className={inputClass} type="email" value={form.email} onChange={set('email')} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Phone</label>
                  <input className={inputClass} value={form.phone} onChange={set('phone')} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Company</label>
                <input className={inputClass} value={form.company_name} onChange={set('company_name')} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Address</label>
                <input className={inputClass} value={form.address} onChange={set('address')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">City</label>
                  <input className={inputClass} value={form.city} onChange={set('city')} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">State</label>
                  <input className={inputClass} value={form.state} onChange={set('state')} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Pincode</label>
                  <input className={inputClass} value={form.pincode} onChange={set('pincode')} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Notes</label>
                <textarea className={`${inputClass} resize-none`} rows={3} value={form.notes} onChange={set('notes')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Detail Page ─────────────────────────────────────────────────────────

export default function ClientDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const clientId = Number(params?.id);

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [amcs, setAmcs] = useState<AmcRecord[]>([]);
  const [amcPlans, setAmcPlans] = useState<AmcPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const [addProductOpen, setAddProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ClientProduct | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [assignAmcProduct, setAssignAmcProduct] = useState<ClientProduct | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchAll();
  }, [status, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [clientRes, amcRes, plansRes] = await Promise.all([
        fetch(`/api/admin/clients/${clientId}`),
        fetch(`/api/admin/clients/${clientId}/amc`),
        fetch('/api/admin/amc-plans'),
      ]);
      const [clientData, amcData, plansData] = await Promise.all([
        clientRes.json(),
        amcRes.json(),
        plansRes.json(),
      ]);
      if (clientRes.ok) setClient(clientData);
      if (amcRes.ok) setAmcs(Array.isArray(amcData) ? amcData : []);
      if (plansRes.ok) setAmcPlans(Array.isArray(plansData) ? plansData : []);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // AMC lookup by client_product_id
  const amcForProduct = (cpId: number) => amcs.filter((a) => a.client_product_id === cpId);

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Back */}
        <Link
          href="/admin/clients"
          className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-blue-600 mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          All Clients
        </Link>

        {loading ? (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-4">
              <SkeletonBlock className="h-7 w-48" />
              <SkeletonBlock className="h-4 w-72" />
              <SkeletonBlock className="h-4 w-60" />
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        ) : !client ? (
          <div className="text-center py-32">
            <p className="text-slate-500 font-medium">Client not found.</p>
            <Link href="/admin/clients" className="mt-4 inline-block text-blue-600 font-black hover:underline">
              ← Back to clients
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shrink-0 shadow-lg shadow-blue-200">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-blue-950 tracking-tight">{client.name}</h1>
                    {client.company_name && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Building2 size={13} className="text-slate-400" />
                        <span className="text-sm text-slate-500 font-medium">{client.company_name}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3">
                      {client.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone size={13} className="text-blue-400" />
                          {client.phone}
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail size={13} className="text-blue-400" />
                          {client.email}
                        </div>
                      )}
                      {(client.city || client.state) && (
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <MapPin size={13} className="text-blue-400" />
                          {[client.address, client.city, client.state, client.pincode].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                    {client.notes && (
                      <p className="mt-3 text-sm text-slate-500 font-medium bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-100 max-w-lg">
                        {client.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => setEditOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl text-sm font-black text-slate-600 hover:text-blue-600 transition-all"
                  >
                    <Pencil size={14} />
                    Edit Profile
                  </button>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <User size={11} />
                    Client since {new Date(client.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center gap-3">
                  <Package size={16} className="text-blue-600" />
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Purchased Products ({client.products.length})
                  </h2>
                </div>
                <button
                  onClick={() => setAddProductOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-black text-white transition-all shadow-sm shadow-blue-200"
                >
                  <Plus size={13} />
                  Add Product
                </button>
              </div>

              {client.products.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-200">
                    <Package size={28} />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No products linked yet.</p>
                  <button
                    onClick={() => setAddProductOpen(true)}
                    className="mt-3 text-blue-600 text-sm font-black hover:underline"
                  >
                    Add first product →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {client.products.map((cp) => {
                    const cpAmcs = amcForProduct(cp.id);
                    const latestAmc = cpAmcs[0];
                    const isExpanded = expandedProduct === cp.id;

                    return (
                      <div key={cp.id}>
                        <div
                          className="px-8 py-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors group"
                          onClick={() => setExpandedProduct(isExpanded ? null : cp.id)}
                        >
                          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                            <Package size={16} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm text-blue-950 truncate">{cp.product_name}</p>
                            <div className="flex flex-wrap gap-3 mt-1">
                              {cp.serial_number && (
                                <span className="text-[10px] font-medium text-slate-400">S/N: {cp.serial_number}</span>
                              )}
                              {cp.purchase_date && (
                                <span className="text-[10px] font-medium text-slate-400">
                                  Purchased: {fmt(cp.purchase_date)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <WarrantyBadge endDate={cp.warranty_end_date} />
                            {latestAmc && (
                              <AmcBadge endDate={latestAmc.end_date} status={latestAmc.status} />
                            )}
                            {isExpanded ? (
                              <ChevronUp size={14} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={14} className="text-slate-400" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-8 pb-6 pt-2 bg-slate-50/40 border-t border-slate-50">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Purchase Details</p>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignAmcProduct(cp);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 hover:border-emerald-300 rounded-xl text-[11px] font-black text-emerald-700 hover:bg-emerald-100 transition-all shadow-sm"
                                    >
                                      <ShieldCheck size={12} />
                                      Assign AMC
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditProduct(cp);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-blue-300 rounded-xl text-[11px] font-black text-slate-600 hover:text-blue-600 transition-all shadow-sm"
                                    >
                                      <Pencil size={12} />
                                      Edit Product
                                    </button>
                                  </div>
                                </div>

                                {/* Product details */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                                  {[
                                    { label: 'Serial No', value: cp.serial_number },
                                    { label: 'Batch No', value: cp.batch_number },
                                    { label: 'Purchase Date', value: fmt(cp.purchase_date) },
                                    { label: 'Install Date', value: fmt(cp.install_date) },
                                    { label: 'Warranty End', value: fmt(cp.warranty_end_date) },
                                    { label: 'Next Service', value: fmt(cp.next_service_date) },
                                  ].map(({ label, value }) => (
                                    <div key={label}>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                                      <p className="text-sm font-bold text-blue-950">{value ?? '—'}</p>
                                    </div>
                                  ))}
                                </div>
                                {cp.notes && (
                                  <p className="text-xs text-slate-500 font-medium bg-white rounded-xl px-3 py-2 border border-slate-100 mb-4">
                                    {cp.notes}
                                  </p>
                                )}

                                {/* AMC records */}
                                {cpAmcs.length > 0 ? (
                                  <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AMC Records</p>
                                    <div className="space-y-2">
                                      {cpAmcs.map((amc) => (
                                        <div key={amc.id} className="bg-white rounded-2xl border border-slate-100 px-5 py-3 flex items-center gap-4">
                                          <AmcBadge endDate={amc.end_date} status={amc.status} />
                                          <div className="flex-1">
                                            <p className="text-xs font-black text-blue-950">{amc.plan_name}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                              {fmt(amc.start_date)} → {fmt(amc.end_date)} · ₹{amc.price.toLocaleString('en-IN')}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-2xl border border-dashed border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                      <p className="text-xs font-black text-blue-950">No AMC assigned yet</p>
                                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Assign an AMC plan to track renewals and service coverage.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAssignAmcProduct(cp);
                                      }}
                                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-100 hover:border-emerald-300 rounded-xl text-[11px] font-black text-emerald-700 hover:bg-emerald-100 transition-all"
                                    >
                                      <ShieldCheck size={12} />
                                      Assign AMC
                                    </button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AMC Summary */}
            {amcs.length > 0 && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30">
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    AMC Overview ({amcs.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        {['Product', 'Plan', 'Period', 'Status', 'Price'].map((h) => (
                          <th key={h} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {amcs.map((amc) => (
                        <tr key={amc.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-xs font-black text-blue-950">{amc.product_name}</p>
                            {amc.serial_number && <p className="text-[10px] text-slate-400">{amc.serial_number}</p>}
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-600">{amc.plan_name}</td>
                          <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                            {fmt(amc.start_date)} → {fmt(amc.end_date)}
                          </td>
                          <td className="px-6 py-4">
                            <AmcBadge endDate={amc.end_date} status={amc.status} />
                          </td>
                          <td className="px-6 py-4 text-xs font-black text-blue-950">₹{amc.price.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />

      <ProductPurchaseModal
        open={addProductOpen}
        clientId={clientId}
        onClose={() => setAddProductOpen(false)}
        onSaved={fetchAll}
      />

      <ProductPurchaseModal
        open={Boolean(editProduct)}
        clientId={clientId}
        initial={editProduct}
        onClose={() => setEditProduct(null)}
        onSaved={fetchAll}
      />

      <AssignAmcModal
        open={Boolean(assignAmcProduct)}
        clientId={clientId}
        product={assignAmcProduct}
        plans={amcPlans}
        onClose={() => setAssignAmcProduct(null)}
        onSaved={fetchAll}
      />

      <EditClientModal
        open={editOpen}
        client={client}
        onClose={() => setEditOpen(false)}
        onSaved={fetchAll}
      />
    </div>
  );
}
