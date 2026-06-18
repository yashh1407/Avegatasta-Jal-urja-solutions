'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Search,
  RefreshCw,
  Trash2,
  Calendar,
  LogOut,
  Phone,
  Mail,
  Building2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  X,
  Eye,
  Package,
} from 'lucide-react';
import Footer from '@/components/Footer';
import Link from 'next/link';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
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
  gstin?: string | null;
  product_count: number;
  created_at: string;
}

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  company_name: string;
  notes: string;
  gstin: string;
}

const EMPTY_FORM: ClientFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  company_name: '',
  notes: '',
  gstin: '',
};

const PAGE_SIZE = 20;

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Client Form Modal ────────────────────────────────────────────────────────

function ClientFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Partial<ClientFormData> | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ClientFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string[]>>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
      setErrors({});
    }
  }, [open, initial]);

  const set = (key: keyof ClientFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const isEdit = !!(initial as Client | null)?.id;
      const id = (initial as Client | null)?.id;
      const url = isEdit ? `/api/admin/clients/${id}` : '/api/admin/clients';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const isEditFlag = isEdit;
      if (res.ok) {
        toast.success(isEditFlag ? 'Client updated.' : 'Client added.');
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        if (data.error && typeof data.error === 'object') {
          setErrors(data.error);
          toast.error('Please fix the highlighted fields.');
        } else {
          toast.error(typeof data.error === 'string' ? data.error : 'Failed to save client.');
        }
      }
    } catch {
      toast.error('Failed to save client. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const fieldError = (key: keyof ClientFormData) =>
    errors[key]?.[0] ? <p className="text-xs text-red-500 mt-0.5 font-medium">{errors[key]![0]}</p> : null;

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
                {(initial as Client | null)?.id ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              <div>
                <label htmlFor="client-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Full Name *</label>
                <input id="client-name" className={inputClass} value={form.name} onChange={set('name')} required placeholder="e.g. Rajesh Kumar" />
                {fieldError('name')}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="client-email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Email</label>
                  <input id="client-email" className={inputClass} type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                  {fieldError('email')}
                </div>
                <div>
                  <label htmlFor="client-phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Phone</label>
                  <input id="client-phone" className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                  {fieldError('phone')}
                </div>
              </div>

              <div>
                <label htmlFor="client-company" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Company Name</label>
                <input id="client-company" className={inputClass} value={form.company_name} onChange={set('company_name')} placeholder="Company / Organisation" />
                {fieldError('company_name')}
              </div>

              <div>
                <label htmlFor="client-gstin" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">GSTIN</label>
                <input id="client-gstin" className={inputClass} value={form.gstin} onChange={set('gstin')} placeholder="15-character GSTIN" />
                {fieldError('gstin')}
              </div>

              <div>
                <label htmlFor="client-address" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Address</label>
                <input id="client-address" className={inputClass} value={form.address} onChange={set('address')} placeholder="Street address" />
                {fieldError('address')}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="client-city" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">City</label>
                  <input id="client-city" className={inputClass} value={form.city} onChange={set('city')} placeholder="City" />
                </div>
                <div>
                  <label htmlFor="client-state" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">State</label>
                  <input id="client-state" className={inputClass} value={form.state} onChange={set('state')} placeholder="State" />
                </div>
                <div>
                  <label htmlFor="client-pincode" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Pincode</label>
                  <input id="client-pincode" className={inputClass} value={form.pincode} onChange={set('pincode')} placeholder="000000" />
                </div>
              </div>

              <div>
                <label htmlFor="client-notes" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Notes</label>
                <textarea
                  id="client-notes"
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder="Any additional notes..."
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
                  {saving ? 'Saving…' : (initial as Client | null)?.id ? 'Save Changes' : 'Add Client'}
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

export default function AdminClientsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<Partial<ClientFormData> | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchClients();
  }, [status, router]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      const res = await fetch(`/api/admin/clients?${params.toString()}`);
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setClients([]);
      toast.error('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
    }
    setPage(1);
  }, [searchQuery, dateFrom, dateTo]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Client deleted.');
        fetchClients();
      } else {
        toast.error('Failed to delete client.');
      }
    } catch {
      toast.error('Failed to delete client. Please try again.');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/clients/export');
      if (!res.ok) {
        toast.error('Failed to export clients.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'clients-export.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Clients exported.');
    } catch {
      toast.error('Failed to export clients. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const openAdd = () => { setModalInitial(null); setModalOpen(true); };
  const openEdit = (c: Client) => {
    setModalInitial({
      ...(c as unknown as ClientFormData),
      id: c.id,
      email: c.email ?? '',
      phone: c.phone ?? '',
      address: c.address ?? '',
      city: c.city ?? '',
      state: c.state ?? '',
      pincode: c.pincode ?? '',
      company_name: c.company_name ?? '',
      notes: c.notes ?? '',
      gstin: c.gstin ?? '',
    } as ClientFormData & { id: number });
    setModalOpen(true);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(clients.length / PAGE_SIZE));
  const paginated = clients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <Users size={20} />
              </div>
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">Clients</h1>
            </div>
            <p className="text-slate-500 font-medium">Manage all client profiles, purchased products and AMC records.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-brand-200 hover:text-brand-600 transition-all disabled:opacity-60"
            >
              {exporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
              Export CSV
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-brand-200"
            >
              <Plus size={16} />
              Add Client
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 bg-white border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-end">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              aria-label="Search clients"
              placeholder="Search clients…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchClients()}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-60 transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              aria-label="Filter from date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
              placeholder="From"
            />
            <span className="text-slate-400 text-sm">–</span>
            <input
              type="date"
              aria-label="Filter to date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
          </div>
          <button
            onClick={fetchClients}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-black transition-all"
          >
            <Search size={14} />
            Search
          </button>
          {(searchQuery || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearchQuery(''); setDateFrom(''); setDateTo(''); }}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 hover:text-red-500 transition-all"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              All Clients ({clients.length})
            </h2>
            <button
              onClick={fetchClients}
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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Products</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Added</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Users size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No clients found.</p>
                      <button onClick={openAdd} className="mt-4 text-brand-600 text-sm font-black hover:underline">
                        Add the first client →
                      </button>
                    </td>
                  </tr>
                ) : (
                  paginated.map((client) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-sm text-brand-950">{client.name}</span>
                          {client.company_name && (
                            <div className="flex items-center gap-1.5">
                              <Building2 size={11} className="text-slate-400" />
                              <span className="text-xs text-slate-500 font-medium">{client.company_name}</span>
                            </div>
                          )}
                          {client.gstin && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 rounded px-1.5 py-0.5 font-mono">
                                GST: {client.gstin}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          {client.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={11} className="text-slate-400" />
                              <span className="text-xs text-slate-500 font-medium">{client.phone}</span>
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail size={11} className="text-slate-400" />
                              <span className="text-xs text-slate-500 font-medium">{client.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {(client.city || client.state) ? (
                          <span className="text-xs text-slate-500 font-medium">
                            {[client.city, client.state].filter(Boolean).join(', ')}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                          <Package size={12} className="text-brand-400" />
                          <span className="text-xs font-black text-brand-950">{client.product_count}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <Calendar size={12} />
                          {new Date(client.created_at).toLocaleDateString('en-IN')}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                            title="View Details"
                            aria-label={`View details for ${client.name}`}
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => openEdit(client)}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all text-xs font-black"
                            title="Edit"
                            aria-label={`Edit ${client.name}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: client.id, name: client.name })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                            aria-label={`Delete ${client.name}`}
                          >
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

          {/* Pagination */}
          {!loading && clients.length > PAGE_SIZE && (
            <div className="px-8 py-5 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
              <span className="text-xs text-slate-400 font-medium">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, clients.length)} of {clients.length}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-black text-brand-950 px-2">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <ClientFormModal
        open={modalOpen}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onSaved={fetchClients}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete client?"
        message={deleteTarget ? `Delete client "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function handleLogout() {
  signOut({ callbackUrl: '/admin/login' });
}
