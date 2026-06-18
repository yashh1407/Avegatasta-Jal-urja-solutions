'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Search,
  RefreshCw,
  Trash2,
  Calendar,
  Phone,
  Mail,
  ChevronDown,
  X,
} from 'lucide-react';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

// ─── Types ────────────────────────────────────────────────────────────────────

type PipelineStatus = 'new' | 'contacted' | 'quoted' | 'won' | 'lost';

interface EnterpriseInquiry {
  id: number;
  company: string;
  name: string;
  designation: string | null;
  phone: string;
  email: string;
  project_type: string | null;
  scale: string | null;
  message: string | null;
  status: PipelineStatus;
  created_at: string;
  gstin?: string | null;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<PipelineStatus, { label: string; classes: string; dot: string }> = {
  new:       { label: 'New',       classes: 'bg-brand-50 text-brand-700 border-brand-200',    dot: 'bg-brand-500' },
  contacted: { label: 'Contacted', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  quoted:    { label: 'Quoted',    classes: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  won:       { label: 'Won',       classes: 'bg-green-50 text-green-700 border-green-200',  dot: 'bg-green-500' },
  lost:      { label: 'Lost',      classes: 'bg-red-50 text-red-600 border-red-200',        dot: 'bg-red-400' },
};

const PIPELINE_ORDER: PipelineStatus[] = ['new', 'contacted', 'quoted', 'won', 'lost'];

// ─── Status badge with dropdown ───────────────────────────────────────────────

function StatusBadge({
  inquiryId,
  current,
  onUpdate,
}: {
  inquiryId: number;
  current: PipelineStatus;
  onUpdate: (id: number, status: PipelineStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const cfg = STATUS_CONFIG[current];

  const handleSelect = async (next: PipelineStatus) => {
    if (next === current) { setOpen(false); return; }
    setSaving(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/enterprise-inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        onUpdate(inquiryId, next);
        toast.success(`Marked as ${STATUS_CONFIG[next].label}.`);
      } else {
        toast.error('Failed to update status.');
      }
    } catch (err) {
      console.error('Failed to update status', err);
      toast.error('Failed to update status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={saving}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider cursor-pointer select-none transition-opacity ${cfg.classes} ${saving ? 'opacity-50' : ''}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
        {cfg.label}
        {saving ? <RefreshCw size={10} className="animate-spin ml-0.5" /> : <ChevronDown size={10} className="ml-0.5" />}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute left-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden min-w-[140px]"
            >
              {PIPELINE_ORDER.map((s) => {
                const c = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => handleSelect(s)}
                    className={`flex items-center gap-2 w-full px-4 py-2.5 text-xs font-bold text-left hover:bg-slate-50 transition-colors ${s === current ? 'bg-slate-50' : ''}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    {c.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminEnterprisePage() {
  const [data, setData] = useState<EnterpriseInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | ''>('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnterpriseInquiry | null>(null);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchData();
  }, [status, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/enterprise-inquiries?${params}`);
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error fetching enterprise inquiries:', err);
      setData([]);
      toast.error('Failed to load enterprise inquiries. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    if (status === 'authenticated') fetchData();
  }, [searchQuery, statusFilter, fetchData, status]);

  const handleStatusUpdate = (id: number, newStatus: PipelineStatus) => {
    setData((prev) => prev.map((item) => item.id === id ? { ...item, status: newStatus } : item));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      const res = await fetch(`/api/admin/enterprise-inquiries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.success('Inquiry deleted.');
      } else {
        toast.error('Failed to delete inquiry.');
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      toast.error('Failed to delete inquiry. Please try again.');
    }
  };

  if (status === 'loading' || status === 'unauthenticated') return null;

  const counts = PIPELINE_ORDER.reduce((acc, s) => {
    acc[s] = data.filter((d) => d.status === s).length;
    return acc;
  }, {} as Record<PipelineStatus, number>);

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <Building2 size={20} />
              </div>
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">Enterprise Inquiries</h1>
            </div>
            <p className="text-slate-500 font-medium">Manage B2B project inquiries and track deal pipeline.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                aria-label="Search company or name"
                placeholder="Search company, name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-60 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PipelineStatus | '')}
                className="appearance-none pl-4 pr-8 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
              >
                <option value="">All statuses</option>
                {PIPELINE_ORDER.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            <button
              onClick={fetchData}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-brand-600 hover:border-brand-100 transition-all"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Pipeline summary chips */}
        <div className="flex flex-wrap gap-3 mb-8">
          {PIPELINE_ORDER.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-black uppercase tracking-wider transition-all ${statusFilter === s ? cfg.classes : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black ${statusFilter === s ? 'bg-white/50' : 'bg-slate-100 text-slate-600'}`}>
                  {counts[s]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {loading ? 'Loading…' : `${data.length} inquiries`}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Company / Contact</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} className="px-8 py-5">
                          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${50 + j * 8}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Building2 size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No enterprise inquiries found.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr
                        className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      >
                        {/* Company / Contact */}
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-black text-brand-950">{item.company}</span>
                            <span className="text-xs font-bold text-slate-600">{item.name}
                              {item.designation && <span className="font-normal text-slate-400"> · {item.designation}</span>}
                            </span>
                            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Phone size={11} />
                                {item.phone}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Mail size={11} />
                                {item.email}
                              </div>
                              {item.gstin && (
                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">
                                  GST: {item.gstin}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Project */}
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-1">
                            {item.project_type && (
                              <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg w-fit">
                                {item.project_type.replace('_', ' ')}
                              </span>
                            )}
                            {item.scale && (
                              <span className="text-xs text-slate-500 font-medium">{item.scale}</span>
                            )}
                          </div>
                        </td>

                        {/* Pipeline */}
                        <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                          <StatusBadge
                            inquiryId={item.id}
                            current={item.status}
                            onUpdate={handleStatusUpdate}
                          />
                        </td>

                        {/* Date */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Calendar size={12} />
                            {new Date(item.created_at).toLocaleDateString('en-IN')}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all opacity-60 group-hover:opacity-100 group-focus-within:opacity-100"
                            title="Delete"
                            aria-label={`Delete inquiry from ${item.company}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded message row */}
                      <AnimatePresence>
                        {expanded === item.id && (item.message || item.gstin) && (
                          <tr>
                            <td colSpan={5} className="px-8 pb-6 pt-0">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-slate-50 rounded-2xl p-5 text-sm text-slate-600 leading-relaxed border border-slate-100 space-y-3"
                              >
                                {item.gstin && (
                                  <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">GSTIN</span>
                                    <span className="font-mono text-slate-800 font-bold bg-white px-2.5 py-1 rounded border border-slate-200 w-fit block">{item.gstin}</span>
                                  </div>
                                )}
                                {item.message && (
                                  <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Message</span>
                                    <p className="text-slate-700 whitespace-pre-wrap">{item.message}</p>
                                  </div>
                                )}
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete inquiry?"
        message={deleteTarget ? `Delete the enterprise inquiry from "${deleteTarget.company}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
