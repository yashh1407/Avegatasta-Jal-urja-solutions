'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PagesList() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/content/pages');
      if (res.ok) {
        const data = await res.json();
        setPages(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async () => {
    const title = prompt('Enter page title:');
    if (!title) return;
    
    // Simple slug generator
    const slug = '/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const userSlug = prompt('Enter page slug:', slug);
    if (!userSlug) return;

    try {
      const res = await fetch('/api/admin/content/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug: userSlug })
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/admin/content/pages/${data.id}`);
      } else {
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const deletePage = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      const res = await fetch(`/api/admin/content/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPages(pages.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-gray-50/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-semibold text-[#1B3636] mb-2">Pages</h1>
          <p className="text-gray-500">Build and manage block-based pages. Click a page to open the page builder.</p>
        </div>
        <button 
          onClick={createPage}
          className="bg-[#FFB800] hover:bg-[#F0A800] text-black font-medium py-2 px-6 rounded-md shadow-sm transition-colors whitespace-nowrap"
        >
          + New Page
        </button>
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          placeholder="Search by slug or title..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B3636]/20 focus:border-[#1B3636]/40"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-sm text-gray-500">
                <th className="py-4 px-6 font-medium">Title</th>
                <th className="py-4 px-6 font-medium">Slug</th>
                <th className="py-4 px-6 font-medium">Sections</th>
                <th className="py-4 px-6 font-medium">Status</th>
                <th className="py-4 px-6 font-medium">Menu</th>
                <th className="py-4 px-6 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">Loading pages...</td>
                </tr>
              ) : filteredPages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No pages found.</td>
                </tr>
              ) : (
                filteredPages.map(page => (
                  <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6 text-[#1B3636] font-medium">{page.title}</td>
                    <td className="py-4 px-6">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-mono">{page.slug}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{page.section_count}</td>
                    <td className="py-4 px-6">
                      {page.status === 'published' ? (
                        <span className="bg-emerald-50 text-emerald-600 text-xs px-3 py-1 rounded-full font-medium border border-emerald-100">Published</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium border border-gray-200">Draft</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {page.in_menu ? (
                        <span className="bg-yellow-50 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium border border-yellow-100">In Menu</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/content/pages/${page.id}`}>
                          <button className="bg-[#1B3636] hover:bg-[#122626] text-white text-xs font-medium px-4 py-1.5 rounded transition-colors">Edit</button>
                        </Link>
                        <Link href={`/admin/content/pages/${page.id}/faqs`}>
                          <button className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium px-4 py-1.5 rounded transition-colors">FAQs</button>
                        </Link>
                        <button 
                          onClick={() => deletePage(page.id, page.title)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-medium px-4 py-1.5 rounded transition-colors"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
