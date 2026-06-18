'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SectionEditorModal from '@/components/admin/SectionEditorModal';
import toast from 'react-hot-toast';

export default function PageBuilder() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;

  const [page, setPage] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingSection, setEditingSection] = useState<any | null>(null);

  useEffect(() => {
    fetchPageData();
  }, [pageId]);

  const fetchPageData = async () => {
    try {
      const [pageRes, sectionsRes] = await Promise.all([
        fetch(`/api/admin/content/pages/${pageId}`),
        fetch(`/api/admin/content/pages/${pageId}/sections`)
      ]);
      
      if (pageRes.ok) setPage(await pageRes.json());
      if (sectionsRes.ok) setSections(await sectionsRes.json());
    } catch (e) {
      console.error(e);
      toast.error('Failed to load page data.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setPage((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const savePageSettings = async () => {
    try {
      const res = await fetch(`/api/admin/content/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page)
      });
      if (res.ok) toast.success('Page settings saved successfully.');
      else toast.error((await res.json()).error);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const saveSection = async (sectionData: any) => {
    try {
      if (sectionData.id) {
        // Update existing
        await fetch(`/api/admin/content/pages/${pageId}/sections/${sectionData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sectionData)
        });
        toast.success('Section updated successfully!');
      } else {
        // Create new
        await fetch(`/api/admin/content/pages/${pageId}/sections`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sectionData)
        });
        toast.success('New section added successfully!');
      }
      setEditingSection(null);
      fetchPageData(); // Refresh list
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const deleteSection = async (id: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      await fetch(`/api/admin/content/pages/${pageId}/sections/${id}`, { method: 'DELETE' });
      toast.success('Section deleted.');
      fetchPageData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete section.');
    }
  };

  const toggleSection = async (section: any) => {
    try {
      await fetch(`/api/admin/content/pages/${pageId}/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...section, is_active: !section.is_active })
      });
      toast.success(section.is_active ? 'Section hidden.' : 'Section activated.');
      fetchPageData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to update section.');
    }
  };

  const moveSection = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === sections.length - 1)
    ) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    setSections(newSections);

    // Save order
    const order = newSections.map(s => s.id);
    try {
      await fetch(`/api/admin/content/pages/${pageId}/sections/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to reorder sections.');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!page) return <div className="p-8">Page not found.</div>;

  const titleLength = page.meta_title?.length || 0;
  const descLength = page.meta_description?.length || 0;

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column - Sections */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-semibold text-[#1B3636]">SECTIONS</h1>
            <button 
              onClick={() => setEditingSection({})}
              className="bg-[#FFB800] hover:bg-[#F0A800] text-black font-medium py-2 px-6 rounded-md shadow-sm transition-colors"
            >
              + Add Section
            </button>
          </div>

          <div className="space-y-4">
            {sections.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-xl border border-gray-100 text-gray-400">
                No sections added yet. Click "+ Add Section" to start building your page.
              </div>
            ) : (
              sections.map((section, idx) => (
                <div key={section.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
                  <div className="flex flex-col gap-1 text-gray-400">
                    <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="hover:text-gray-600 disabled:opacity-30" aria-label="Move section up">▲</button>
                    <button onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1} className="hover:text-gray-600 disabled:opacity-30" aria-label="Move section down">▼</button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-[#1B3636] font-medium truncate text-lg">{section.title || section.section_type}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{section.section_key}</span>
                      {section.category && (
                        <span className="text-gray-400">{section.category}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer mr-2">
                      <input type="checkbox" checked={section.is_active} onChange={() => toggleSection(section)} className="sr-only peer" aria-label={`Toggle visibility of ${section.title || section.section_type}`} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B3636]"></div>
                    </label>

                    <button onClick={() => setEditingSection(section)} className="bg-[#1B3636] hover:bg-[#122626] text-white text-xs font-medium px-4 py-1.5 rounded transition-colors">Edit</button>
                    <button onClick={() => {
                      const copy = { ...section };
                      delete copy.id;
                      copy.section_key = copy.section_key + '-copy';
                      saveSection(copy);
                    }} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium px-4 py-1.5 rounded transition-colors">Duplicate</button>
                    <button onClick={() => deleteSection(section.id)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 text-xs font-medium px-4 py-1.5 rounded transition-colors">Del</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - SEO & PAGE SETTINGS */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 sticky top-6 overflow-hidden flex flex-col max-h-[calc(100vh-3rem)]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-semibold text-[#1B3636] text-sm tracking-wide">SEO & PAGE SETTINGS</h2>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <label htmlFor="page-title" className="text-xs font-medium text-gray-700">Title</label>
                <input id="page-title" name="title" value={page.title || ''} onChange={handlePageChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1B3636]" />
              </div>

              <div className="space-y-1">
                <label htmlFor="page-slug" className="text-xs font-medium text-gray-700">Slug</label>
                <input id="page-slug" name="slug" value={page.slug || ''} onChange={handlePageChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1B3636] font-mono" />
                <p className="text-xs text-gray-500">Changing the slug changes the public URL.</p>
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-100">
                <label htmlFor="page-meta-title" className="text-xs font-medium text-gray-700">Meta Title</label>
                <input id="page-meta-title" name="meta_title" value={page.meta_title || ''} onChange={handlePageChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1B3636]" />
                <p className={`text-xs ${titleLength > 60 ? 'text-red-500' : 'text-gray-500'}`}>{titleLength} chars (ideal {"<"} 60)</p>
              </div>

              <div className="space-y-1">
                <label htmlFor="page-meta-description" className="text-xs font-medium text-gray-700">Meta Description</label>
                <textarea id="page-meta-description" name="meta_description" value={page.meta_description || ''} onChange={handlePageChange} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1B3636] resize-none" />
                <p className={`text-xs ${descLength > 160 ? 'text-red-500' : 'text-gray-500'}`}>{descLength} chars (ideal {"<"} 160)</p>
              </div>

              <div className="space-y-1">
                <label htmlFor="page-meta-keywords" className="text-xs font-medium text-gray-700">Meta Keywords</label>
                <input id="page-meta-keywords" name="meta_keywords" value={page.meta_keywords || ''} onChange={handlePageChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1B3636]" />
              </div>

              <div className="space-y-1">
                <label htmlFor="page-canonical-url" className="text-xs font-medium text-gray-700">Canonical URL</label>
                <input id="page-canonical-url" name="canonical_url" value={page.canonical_url || ''} onChange={handlePageChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1B3636] font-mono" />
              </div>

              <div className="space-y-1 pt-2 border-t border-gray-100">
                <label htmlFor="page-og-title" className="text-xs font-medium text-gray-700">OG Title</label>
                <input id="page-og-title" name="og_title" value={page.og_title || ''} onChange={handlePageChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1B3636]" />
              </div>
              <div className="space-y-1">
                <label htmlFor="page-og-description" className="text-xs font-medium text-gray-700">OG Description</label>
                <textarea id="page-og-description" name="og_description" value={page.og_description || ''} onChange={handlePageChange} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1B3636] resize-none" />
              </div>
              <div className="space-y-1">
                <label htmlFor="page-og-image" className="text-xs font-medium text-gray-700">OG Image URL</label>
                <input id="page-og-image" name="og_image" value={page.og_image || ''} onChange={handlePageChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#1B3636] font-mono" />
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <label htmlFor="page-status" className="text-xs font-medium text-gray-700">Status</label>
                  <select id="page-status" name="status" value={page.status} onChange={handlePageChange} className="border border-gray-200 rounded text-xs px-2 py-1 outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label htmlFor="page-show-in-menu" className="text-xs font-medium text-gray-700">Show in Menu</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input id="page-show-in-menu" type="checkbox" name="show_in_menu" checked={page.show_in_menu} onChange={handlePageChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1B3636]"></div>
                  </label>
                </div>

                {page.show_in_menu && (
                  <>
                    <div className="space-y-1">
                      <label htmlFor="page-menu-label" className="text-xs text-gray-500 uppercase">Menu Label</label>
                      <input id="page-menu-label" name="menu_label" value={page.menu_label || ''} onChange={handlePageChange} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="page-menu-order" className="text-xs text-gray-500 uppercase">Menu Order</label>
                      <input id="page-menu-order" type="number" name="menu_order" value={page.menu_order || 0} onChange={handlePageChange} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none" />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <button 
                onClick={savePageSettings}
                className="w-full bg-[#1B3636] hover:bg-[#122626] text-white font-medium py-2 rounded-lg transition-colors shadow-sm text-sm"
              >
                Save Page Settings
              </button>
            </div>
          </div>
        </div>

      </div>

      {editingSection && (
        <SectionEditorModal 
          section={editingSection} 
          onSave={saveSection} 
          onClose={() => setEditingSection(null)} 
        />
      )}
    </div>
  );
}
