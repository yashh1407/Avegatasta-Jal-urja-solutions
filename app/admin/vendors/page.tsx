'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, RefreshCw, LogOut, Plus, X, Trash2, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Vendor {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  brand: string | null;
  notes: string | null;
  created_at: string;
}

interface VendorFormData {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  brand: string;
  notes: string;
}

const EMPTY_FORM: VendorFormData = {
  name: '',
  contact_person: '',
  phone: '',
  email: '',
  address: '',
  brand: '',
  notes: '',
};

const BRANDS = ['V-Guard', 'Zero B', 'Wilo', 'Bluewave India', 'Other'];

// ─── Skeleton row ─────────────────────────────────────────────────────────────

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

// ─── Vendor Form Modal ────────────────────────────────────────────────────────

function VendorFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: (VendorFormData & { id?: number }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<VendorFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
      setError('');
    }
  }, [open, initial]);

  const set = (key: keyof VendorFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const isEdit = !!initial?.id;
      const url = isEdit ? `/api/admin/vendors/${initial!.id}` : '/api/admin/vendors';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(isEdit ? 'Vendor updated.' : 'Vendor added.');
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        const msg = data.error || 'Failed to save vendor.';
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Failed to save vendor. Please try again.';
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
              <h2 className="text-lg font-black text-brand-950">
                {initial?.id ? 'Edit Vendor' : 'Add Vendor'}
              </h2>
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

              <div>
                <label htmlFor="vendor-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Vendor Name *</label>
                <input id="vendor-name" className={inputClass} value={form.name} onChange={set('name')} required placeholder="e.g. SunPower Distributors" />
              </div>

              <div>
                <label htmlFor="vendor-brand" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Brand</label>
                <select id="vendor-brand" className={inputClass} value={form.brand} onChange={set('brand')}>
                  <option value="">Select brand…</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="vendor-contact" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Contact Person</label>
                <input id="vendor-contact" className={inputClass} value={form.contact_person} onChange={set('contact_person')} placeholder="e.g. Ramesh Iyer" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="vendor-phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Phone</label>
                  <input id="vendor-phone" className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label htmlFor="vendor-email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Email</label>
                  <input id="vendor-email" className={inputClass} type="email" value={form.email} onChange={set('email')} placeholder="vendor@example.com" />
                </div>
              </div>

              <div>
                <label htmlFor="vendor-address" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Address</label>
                <input id="vendor-address" className={inputClass} value={form.address} onChange={set('address')} placeholder="Street address, city" />
              </div>

              <div>
                <label htmlFor="vendor-notes" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Notes</label>
                <textarea
                  id="vendor-notes"
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder="Any additional notes…"
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
                  {saving ? 'Saving…' : initial?.id ? 'Save Changes' : 'Add Vendor'}
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

export default function AdminVendorsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<(VendorFormData & { id?: number }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchVendors();
  }, [status, router]);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/vendors');
      const data = await res.json();
      setVendors(Array.isArray(data) ? data : []);
    } catch {
      setVendors([]);
      toast.error('Failed to load vendors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Vendor deleted.');
        fetchVendors();
      } else {
        toast.error('Failed to delete vendor.');
      }
    } catch {
      toast.error('Failed to delete vendor. Please try again.');
    }
  };

  const openAdd = () => { setModalInitial(null); setModalOpen(true); };
  const openEdit = (v: Vendor) => {
    setModalInitial({
      id: v.id,
      name: v.name,
      contact_person: v.contact_person ?? '',
      phone: v.phone ?? '',
      email: v.email ?? '',
      address: v.address ?? '',
      brand: v.brand ?? '',
      notes: v.notes ?? '',
    });
    setModalOpen(true);
  };

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <Truck size={20} />
              </div>
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">Vendors</h1>
            </div>
            <p className="text-slate-500 font-medium">Manage supplier and vendor relationships.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchVendors}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-brand-200"
            >
              <Plus size={16} />
              Add Vendor
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
              All Vendors ({vendors.length})
            </h2>
            <button
              onClick={fetchVendors}
              className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Person</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Truck size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No vendors yet.</p>
                      <button onClick={openAdd} className="mt-4 text-brand-600 text-sm font-black hover:underline">
                        Add the first vendor →
                      </button>
                    </td>
                  </tr>
                ) : (
                  vendors.map((vendor) => (
                    <motion.tr
                      key={vendor.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <span className="font-black text-sm text-brand-950">{vendor.name}</span>
                        {vendor.address && (
                          <p className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-[180px]">{vendor.address}</p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {vendor.brand ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-black">
                            {vendor.brand}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-600 font-medium">
                          {vendor.contact_person || <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          {vendor.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={11} className="text-slate-400" />
                              <span className="text-xs text-slate-500 font-medium">{vendor.phone}</span>
                            </div>
                          )}
                          {vendor.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail size={11} className="text-slate-400" />
                              <span className="text-xs text-slate-500 font-medium">{vendor.email}</span>
                            </div>
                          )}
                          {!vendor.phone && !vendor.email && <span className="text-xs text-slate-300">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(vendor)}
                            className="px-3 py-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all text-xs font-black"
                            aria-label={`Edit ${vendor.name}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: vendor.id, name: vendor.name })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                            aria-label={`Delete ${vendor.name}`}
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

      
      <VendorFormModal
        open={modalOpen}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onSaved={fetchVendors}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete vendor?"
        message={deleteTarget ? `Delete vendor "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
