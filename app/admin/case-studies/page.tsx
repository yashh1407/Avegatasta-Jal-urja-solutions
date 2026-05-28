'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { BookOpen, RefreshCw, LogOut, Plus, Trash2, MapPin, Eye, Edit2 } from 'lucide-react';
import Footer from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CaseStudy {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  category: string | null;
  client_name: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image: string | null;
  images: string[] | null;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <td key={i} className="px-6 py-5">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${40 + i * 7}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CaseStudy['status'] }) {
  const map = {
    published: 'bg-emerald-50 text-emerald-700',
    draft: 'bg-amber-50 text-amber-700',
    archived: 'bg-slate-100 text-slate-500',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black ${map[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminCaseStudiesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchCaseStudies();
  }, [status, router]);

  const fetchCaseStudies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/case-studies');
      const data = await res.json();
      setCaseStudies(Array.isArray(data) ? data : []);
    } catch {
      setCaseStudies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/case-studies/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCaseStudies();
    } catch {
      // silently ignore
    }
  };

  const togglePublish = async (cs: CaseStudy) => {
    const newStatus = cs.status === 'published' ? 'draft' : 'published';
    try {
      await fetch(`/api/admin/case-studies/${cs.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchCaseStudies();
    } catch {
      // silently ignore
    }
  };

  const categories = [...new Set(caseStudies.map((cs) => cs.category).filter(Boolean))] as string[];

  const filtered = caseStudies.filter((cs) => {
    if (statusFilter && cs.status !== statusFilter) return false;
    if (categoryFilter && cs.category !== categoryFilter) return false;
    return true;
  });

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <BookOpen size={20} />
              </div>
              <h1 className="text-4xl font-black text-blue-950 tracking-tight">Case Studies</h1>
            </div>
            <p className="text-slate-500 font-medium">Manage project case studies and site installations.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchCaseStudies}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:border-blue-200 hover:text-blue-600 transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link
              href="/admin/case-studies/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-2xl text-sm font-black text-white transition-all shadow-lg shadow-blue-200"
            >
              <Plus size={16} />
              New Case Study
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-2.5 bg-white border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        {!loading && caseStudies.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            {categories.length > 0 && (
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {statusFilter || categoryFilter
                ? `Filtered (${filtered.length} of ${caseStudies.length})`
                : `All Case Studies (${caseStudies.length})`}
            </h2>
            <button
              onClick={fetchCaseStudies}
              className="p-2 text-slate-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">GPS</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <BookOpen size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">
                        {statusFilter || categoryFilter ? 'No results match the current filters.' : 'No case studies yet.'}
                      </p>
                      {!statusFilter && !categoryFilter && (
                        <Link
                          href="/admin/case-studies/new"
                          className="mt-4 inline-block text-blue-600 text-sm font-black hover:underline"
                        >
                          Create the first case study →
                        </Link>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map((cs) => (
                    <motion.tr
                      key={cs.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-5 max-w-[220px]">
                        <span className="font-black text-sm text-blue-950 block truncate">{cs.title}</span>
                        {cs.summary && (
                          <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">{cs.summary}</p>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {cs.category ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-black">
                            {cs.category}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-slate-600 font-medium">
                          {cs.client_name || <span className="text-slate-300">—</span>}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {cs.location_name ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin size={11} className="text-slate-400" />
                            <span className="text-xs text-slate-500 font-medium">{cs.location_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge status={cs.status} />
                      </td>
                      <td className="px-6 py-5">
                        {cs.latitude != null && cs.longitude != null ? (
                          <div className="flex items-center gap-1.5" title={`${cs.latitude.toFixed(4)}°N, ${cs.longitude.toFixed(4)}°E`}>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-xs text-emerald-700 font-black">GPS</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{fmt(cs.created_at)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <a
                            href={`/case-studies/${cs.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                            title="Preview"
                          >
                            <Eye size={15} />
                          </a>
                          <Link
                            href={`/admin/case-studies/${cs.id}/edit`}
                            className="px-3 py-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all text-xs font-black"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => togglePublish(cs)}
                            className="px-3 py-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all text-xs font-black whitespace-nowrap"
                          >
                            {cs.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(cs.id, cs.title)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
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
    </div>
  );
}
