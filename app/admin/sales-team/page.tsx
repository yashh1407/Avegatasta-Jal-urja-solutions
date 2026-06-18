'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Users, RefreshCw, LogOut, Plus, X, Phone, Mail, UserCheck, UserX } from 'lucide-react';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalesMember {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  role: 'sales_person' | 'manager';
  status: 'active' | 'inactive';
  created_at: string;
}

interface MemberFormData {
  name: string;
  phone: string;
  email: string;
  role: string;
}

const EMPTY_FORM: MemberFormData = {
  name: '',
  phone: '',
  email: '',
  role: 'sales_person',
};

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

// ─── Member Form Modal ────────────────────────────────────────────────────────

function MemberFormModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: (MemberFormData & { id?: number }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<MemberFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
      setError('');
    }
  }, [open, initial]);

  const set = (key: keyof MemberFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const isEdit = !!initial?.id;
      const url = isEdit ? `/api/admin/sales-team/${initial!.id}` : '/api/admin/sales-team';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(isEdit ? 'Member updated.' : 'Member added.');
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        const msg = data.error || 'Failed to save member.';
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Failed to save member. Please try again.';
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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-slate-100">
              <h2 className="text-lg font-black text-brand-950">
                {initial?.id ? 'Edit Member' : 'Add Team Member'}
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
                <label htmlFor="member-name" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Full Name *</label>
                <input id="member-name" className={inputClass} value={form.name} onChange={set('name')} required placeholder="e.g. Anita Sharma" />
              </div>

              <div>
                <label htmlFor="member-role" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Role</label>
                <select id="member-role" className={inputClass} value={form.role} onChange={set('role')}>
                  <option value="sales_person">Sales Person</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="member-phone" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Phone</label>
                  <input id="member-phone" className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label htmlFor="member-email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Email</label>
                  <input id="member-email" className={inputClass} type="email" value={form.email} onChange={set('email')} placeholder="team@example.com" />
                </div>
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
                  {saving ? 'Saving…' : initial?.id ? 'Save Changes' : 'Add Member'}
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

export default function AdminSalesTeamPage() {
  const { status } = useSession();
  const router = useRouter();

  const [members, setMembers] = useState<SalesMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<(MemberFormData & { id?: number }) | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchMembers();
  }, [status, router]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sales-team');
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch {
      setMembers([]);
      toast.error('Failed to load team members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleStatus = async (member: SalesMember) => {
    setTogglingId(member.id);
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/admin/sales-team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMembers((prev) =>
          prev.map((m) => (m.id === member.id ? { ...m, status: newStatus } : m))
        );
        toast.success(newStatus === 'active' ? 'Member activated.' : 'Member deactivated.');
      } else {
        toast.error('Failed to update member status.');
      }
    } catch {
      toast.error('Failed to update member status. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  const openAdd = () => { setModalInitial(null); setModalOpen(true); };
  const openEdit = (m: SalesMember) => {
    setModalInitial({
      id: m.id,
      name: m.name,
      phone: m.phone ?? '',
      email: m.email ?? '',
      role: m.role,
    });
    setModalOpen(true);
  };

  if (status === 'loading' || status === 'unauthenticated') return null;

  const activeCount = members.filter((m) => m.status === 'active').length;

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
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">Sales Team</h1>
            </div>
            <p className="text-slate-500 font-medium">
              Manage sales personnel and managers.
              {!loading && (
                <span className="ml-2 text-brand-600 font-black">{activeCount} active</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchMembers}
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
              Add Member
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
              All Members ({members.length})
            </h2>
            <button
              onClick={fetchMembers}
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
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Users size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No team members yet.</p>
                      <button onClick={openAdd} className="mt-4 text-brand-600 text-sm font-black hover:underline">
                        Add the first member →
                      </button>
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`transition-colors group ${member.status === 'inactive' ? 'opacity-60' : 'hover:bg-slate-50/50'}`}
                    >
                      <td className="px-6 py-5">
                        <span className="font-black text-sm text-brand-950">{member.name}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${
                          member.role === 'manager'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-brand-50 text-brand-700'
                        }`}>
                          {member.role === 'manager' ? 'Manager' : 'Sales Person'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {member.phone ? (
                          <div className="flex items-center gap-1.5">
                            <Phone size={11} className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">{member.phone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {member.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail size={11} className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">{member.email}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                          member.status === 'active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`} />
                          {member.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(member)}
                            className="px-3 py-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all text-xs font-black"
                            aria-label={`Edit ${member.name}`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(member)}
                            disabled={togglingId === member.id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all disabled:opacity-60 ${
                              member.status === 'active'
                                ? 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
                                : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={member.status === 'active' ? 'Deactivate' : 'Activate'}
                            aria-label={`${member.status === 'active' ? 'Deactivate' : 'Activate'} ${member.name}`}
                          >
                            {togglingId === member.id ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : member.status === 'active' ? (
                              <UserX size={13} />
                            ) : (
                              <UserCheck size={13} />
                            )}
                            {member.status === 'active' ? 'Deactivate' : 'Activate'}
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

      <MemberFormModal
        open={modalOpen}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onSaved={fetchMembers}
      />
    </div>
  );
}
