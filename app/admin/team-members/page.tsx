'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck,
  Search,
  RefreshCw,
  Trash2,
  Plus,
  X,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberRole = 'Sales' | 'Support' | 'Technical' | 'Management' | 'Other';
type MemberStatus = 'active' | 'inactive';

interface TeamMember {
  id: number;
  name: string;
  role: MemberRole;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: MemberStatus;
  joined_date: string | null;
  created_at: string;
}

interface MemberForm {
  name: string;
  role: MemberRole;
  email: string;
  phone: string;
  status: MemberStatus;
  joined_date: string;
}

const EMPTY_FORM: MemberForm = {
  name: '',
  role: 'Other',
  email: '',
  phone: '',
  status: 'active',
  joined_date: '',
};

const ROLES: MemberRole[] = ['Sales', 'Support', 'Technical', 'Management', 'Other'];

const ROLE_COLORS: Record<MemberRole, string> = {
  Sales: 'bg-green-100 text-green-700',
  Support: 'bg-blue-100 text-blue-700',
  Technical: 'bg-purple-100 text-purple-700',
  Management: 'bg-orange-100 text-orange-700',
  Other: 'bg-slate-100 text-slate-600',
};

// ─── Initials Avatar ──────────────────────────────────────────────────────────

function Avatar({ name, url }: { name: string; url: string | null }) {
  if (url) return <img src={url} alt={name} className="w-9 h-9 rounded-xl object-cover" />;
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
      {initials}
    </div>
  );
}

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

// ─── Modal ────────────────────────────────────────────────────────────────────

function MemberModal({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: (MemberForm & { id?: number }) | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<MemberForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (open) { setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM); setErr(''); }
  }, [open, initial]);

  const set = (key: keyof MemberForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setErr('');
    try {
      const isEdit = !!initial?.id;
      const url = isEdit ? `/api/admin/team-members/${initial!.id}` : '/api/admin/team-members';
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
                {initial?.id ? 'Edit Member' : 'Add Team Member'}
              </h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              {err && <p className="text-sm text-red-600 font-medium">{err}</p>}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Full Name *</label>
                <input className={inputClass} value={form.name} onChange={set('name')} required placeholder="e.g. Rahul Sharma" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Role *</label>
                  <select className={inputClass} value={form.role} onChange={set('role')}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Status</label>
                  <select className={inputClass} value={form.status} onChange={set('status')}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Email</label>
                  <input className={inputClass} type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Phone</label>
                  <input className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Joined Date</label>
                <input className={inputClass} type="date" value={form.joined_date} onChange={set('joined_date')} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2">
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TeamMembersPage() {
  const { status } = useSession();
  const router = useRouter();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<(MemberForm & { id?: number }) | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchMembers();
  }, [status, router]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (search.trim()) p.set('q', search.trim());
      if (roleFilter) p.set('role', roleFilter);
      if (statusFilter) p.set('status', statusFilter);
      const res = await fetch(`/api/admin/team-members?${p}`);
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch { setMembers([]); }
    finally { setLoading(false); }
  }, [search, roleFilter, statusFilter]);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/team-members/${id}`, { method: 'DELETE' });
    fetchMembers();
  };

  const openAdd = () => { setModalInitial(null); setModalOpen(true); };
  const openEdit = (m: TeamMember) => {
    setModalInitial({
      id: m.id,
      name: m.name,
      role: m.role,
      email: m.email ?? '',
      phone: m.phone ?? '',
      status: m.status,
      joined_date: m.joined_date ? m.joined_date.slice(0, 10) : '',
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
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <UserCheck size={20} />
            </div>
            <h1 className="text-4xl font-black text-blue-950 tracking-tight">Team Members</h1>
          </div>
          <p className="text-slate-500 font-medium">Manage your team — roles, contact details and status.</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-blue-200">
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-end">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text" placeholder="Search members…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMembers()}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56 transition-all"
          />
        </div>
        <select
          value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={fetchMembers}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-black transition-all">
          <Search size={14} /> Search
        </button>
        {(search || roleFilter || statusFilter) && (
          <button onClick={() => { setSearch(''); setRoleFilter(''); setStatusFilter(''); }}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-500 hover:text-red-500 transition-all">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Team ({members.length})
          </h2>
          <button onClick={fetchMembers} className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Member</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</th>
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
                      <UserCheck size={32} />
                    </div>
                    <p className="text-slate-500 font-medium">No team members found.</p>
                    <button onClick={openAdd} className="mt-4 text-blue-600 text-sm font-black hover:underline">
                      Add the first member →
                    </button>
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} url={m.avatar_url} />
                        <span className="font-black text-sm text-blue-950">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${ROLE_COLORS[m.role]}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        {m.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone size={11} className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">{m.phone}</span>
                          </div>
                        )}
                        {m.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail size={11} className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">{m.email}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${
                        m.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {m.joined_date ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                          <Calendar size={12} />
                          {new Date(m.joined_date).toLocaleDateString('en-IN')}
                        </div>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(m)}
                          className="px-3 py-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-xs font-black">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(m.id, m.name)}
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

      <MemberModal
        open={modalOpen}
        initial={modalInitial}
        onClose={() => setModalOpen(false)}
        onSaved={fetchMembers}
      />
    </div>
  );
}
