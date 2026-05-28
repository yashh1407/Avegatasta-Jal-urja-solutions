'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tag,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  X,
  Globe,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type BrandStatus = 'active' | 'inactive';

interface Brand {
  id: number;
  name: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  status: BrandStatus;
  created_at: string;
}

interface BrandForm {
  name: string;
  logo_url: string;
  description: string;
  website: string;
  status: BrandStatus;
}

const EMPTY_FORM: BrandForm = {
  name: '',
  logo_url: '',
  description: '',
  website: '',
  status: 'active',
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1, 2, 3, 4].map((i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${50 + i * 12}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Brand Logo ───────────────────────────────────────────────────────────────

function BrandLogo({ name, url }: { name: string; url: string | null }) {
  if (url) return <img src={url} alt={name} className="w-9 h-9 rounded-xl object-contain border border-slate-100 bg-white p-1" />;
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black border border-slate-200">
      {initials}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function BrandModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: (BrandForm & { id?: number }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<BrandForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) { setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM); setErr(''); }
  }, [open, initial]);

  const set = (key: keyof BrandForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const isEdit = !!initial?.id;
      const url = isEdit ? `/api/admin/brands/${initial!.id}` : '/api/admin/brands';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { onSaved(); onClose(); }
      else { const d = await res.json(); setErr(d.error?.name?.[0] ?? 'Failed to save'); }
    } finally { setSaving(false); }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-blue-950">
                {initial?.id ? 'Edit Brand' : 'Add Brand'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {err && <p className="text-sm text-red-600 font-medium">{err}</p>}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Brand Name *</label>
                <input className={inputClass} value={form.name} onChange={set('name')} required placeholder="e.g. V-Guard" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Logo URL</label>
                <input className={inputClass} value={form.logo_url} onChange={set('logo_url')} placeholder="https://..." />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Description</label>
                <textarea
                  className={`${inputClass} resize-none`} rows={3}
                  value={form.description} onChange={set('description')}
                  placeholder="Short description of the brand…"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Website</label>
                <input className={inputClass} value={form.website} onChange={set('website')} placeholder="https://brand.com" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Status</label>
                <select className={inputClass} value={form.status} onChange={set('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving && <RefreshCw size={14} className="animate-spin" />}
                  {saving ? 'Saving…' : initial?.id ? 'Save Changes' : 'Add Brand'}
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

export default function BrandsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<(BrandForm & { id?: number }) | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchBrands();
  }, [status, router]);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (statusFilter) p.set('status', statusFilter);
      const res = await fetch(`/api/admin/brands?${p}`);
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : []);
    } catch { setBrands([]); }
    finally { setLoading(false); }
  }, [statusFilter]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete brand "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
    fetchBrands();
  };

  const openAdd = () => { setModalInitial(null); setModalOpen(true); };
  const openEdit = (b: Brand) => {
    setModalInitial({
      id: b.id,
      name: b.name,
      logo_url: b.logo_url ?? '',
      description: b.description ?? '',
      website: b.website ?? '',
      status: b.status,
    });
    setModalOpen(true);
  };

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50 p-8 lg:p-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
              <Tag size={20} />
            </div>
            <h1 className="text-4xl font-black text-blue-950 tracking-tight">Brands</h1>
          </div>
          <p className="text-slate-500 font-medium">Manage product brands and associate them with your catalogue.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-blue-200">
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={fetchBrands}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all">
          <Search size={14} /> Refresh
        </button>
        {statusFilter && (
          <button onClick={() => setStatusFilter('')}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 hover:text-red-500 transition-all">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Brands ({brands.length})
          </h2>
          <button onClick={fetchBrands} className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Brand</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Website</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              ) : brands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <Tag size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No brands found.</p>
                    <button onClick={openAdd} className="mt-4 text-blue-600 text-sm font-black hover:underline">
                      Add the first brand →
                    </button>
                  </td>
                </tr>
              ) : (
                brands.map((b) => (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <BrandLogo name={b.name} url={b.logo_url} />
                        <span className="font-black text-sm text-blue-950">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs text-slate-500 font-medium line-clamp-2 max-w-xs">
                        {b.description ?? <span className="text-slate-300">—</span>}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {b.website ? (
                        <a href={b.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline font-medium">
                          <Globe size={11} /> Visit
                        </a>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${
                        b.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(b)}
                          className="px-3 py-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-xs font-black">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(b.id, b.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                          <Trash2 size={16} />
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

      <BrandModal
        open={modalOpen}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onSaved={fetchBrands}
      />
    </div>
  );
}
