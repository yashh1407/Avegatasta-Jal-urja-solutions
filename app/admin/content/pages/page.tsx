'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Search, Edit, HelpCircle, FileText, Settings2 } from 'lucide-react';
import PageContentEditor from '@/components/admin/PageContentEditor';

interface PageItem {
  id: number;
  title: string;
  slug: string;
  status: 'published' | 'draft';
  in_menu: boolean;
  section_count: number;
}

const CORE_SLUGS = new Set([
  '/',
  'home',
  '/home',
  'services',
  '/services',
  'projects',
  '/projects',
  'enterprise',
  '/enterprise',
  'about',
  '/about',
  'contact',
  '/contact',
]);

const CORE_ORDER: Record<string, number> = {
  '/': 1,
  'home': 1,
  '/home': 1,
  'services': 2,
  '/services': 2,
  'projects': 3,
  '/projects': 3,
  'enterprise': 4,
  '/enterprise': 4,
  'about': 5,
  '/about': 5,
  'contact': 6,
  '/contact': 6,
};

type DashboardTab = 'pages' | 'contact-footer';

export default function PagesDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('pages');
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content/pages', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Filter to show only the 6 core pages and sort by navbar order
        const filtered = (Array.isArray(data) ? data : [])
          .filter((page) => CORE_SLUGS.has(page.slug))
          .sort((a, b) => {
            const orderA = CORE_ORDER[a.slug] || 999;
            const orderB = CORE_ORDER[b.slug] || 999;
            return orderA - orderB;
          });
        setPages(filtered);
      } else {
        toast.error('Failed to load pages.');
      }
    } catch (e) {
      console.error(e);
      toast.error('An error occurred while fetching pages.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-50">
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-8 pb-20">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
              <FileText size={20} />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Pages &amp; Content</h1>
          </div>
          <p className="text-slate-500 font-medium">Manage block-based layout sections for core pages, contact details, and footer settings.</p>
        </div>

        {/* Tab switcher */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveTab('pages')}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'pages'
                ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-200'
                : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            <FileText size={16} />
            Page Sections
          </button>
          <button
            onClick={() => setActiveTab('contact-footer')}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === 'contact-footer'
                ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-200'
                : 'border-slate-200 bg-white text-slate-600 hover:border-brand-200 hover:text-brand-700'
            }`}
          >
            <Settings2 size={16} />
            Contact &amp; Footer
          </button>
        </div>

        {activeTab === 'pages' ? (
          <>
            {/* Search */}
            <div className="relative mb-6 max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search by slug or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                aria-label="Search pages"
              />
            </div>

            {/* Dashboard table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Core Dynamic Pages ({filteredPages.length})
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.1em] w-[24%]">Title</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.1em] w-[15%]">Slug</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.1em] w-[11%] text-center">Sections</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.1em] w-[13%] text-center">Status</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.1em] w-[11%] text-center">Menu</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.1em] w-[26%] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                            Loading pages...
                          </div>
                        </td>
                      </tr>
                    ) : filteredPages.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center text-slate-500 font-medium">
                          No core pages found.
                        </td>
                      </tr>
                    ) : (
                      filteredPages.map((page) => {
                        const displaySlug = page.slug === 'home' ? '/' : (page.slug.startsWith('/') ? page.slug : '/' + page.slug);
                        return (
                          <tr
                            key={page.id}
                            className="hover:bg-slate-50/40 transition-colors"
                          >
                            <td className="px-6 py-5 w-[24%] align-middle font-bold text-sm text-slate-900 leading-snug">
                              <Link
                                href={`/admin/content/pages/${page.id}`}
                                className="hover:text-brand-600 transition-colors"
                              >
                                {page.title}
                              </Link>
                            </td>
                            <td className="px-6 py-5 w-[15%] align-middle">
                              <span className="inline-flex rounded-xl bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-mono font-bold text-slate-600">
                                {displaySlug}
                              </span>
                            </td>
                            <td className="px-6 py-5 w-[11%] align-middle text-center">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 shadow-sm">
                                {page.section_count}
                              </span>
                            </td>
                            <td className="px-6 py-5 w-[13%] align-middle text-center">
                              {page.status === 'published' ? (
                                <span className="inline-flex items-center gap-1.5 justify-center rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 justify-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500 whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                  Draft
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-5 w-[11%] align-middle text-center">
                              {page.in_menu ? (
                                <span className="inline-flex items-center gap-1.5 justify-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-semibold text-amber-700 whitespace-nowrap">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  In Menu
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-slate-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-5 w-[26%] align-middle text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Link href={`/admin/content/pages/${page.id}`}>
                                  <button
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-brand-100/50 cursor-pointer"
                                    title="Edit Sections"
                                    aria-label={`Edit ${page.title}`}
                                  >
                                    <Edit size={12} />
                                    Edit
                                  </button>
                                </Link>
                                <Link href={`/admin/content/pages/${page.id}/faqs`}>
                                  <button
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                    title="Edit FAQs"
                                    aria-label={`Faqs for ${page.title}`}
                                  >
                                    <HelpCircle size={12} />
                                    FAQs
                                  </button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <PageContentEditor activeTab="contact" />
        )}
      </main>
    </div>
  );
}
