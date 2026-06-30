'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Copy,
  Save,
  X,
  ArrowLeft,
  AlertCircle,
  GripVertical,
  Smartphone,
  Tablet,
  Monitor,
  Plus,
  RefreshCw,
  Upload,
  Sparkles
} from 'lucide-react';

interface PageData {
  id: number;
  title: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  status: 'published' | 'draft';
  show_in_menu: boolean;
  menu_label?: string;
  menu_order: number;
}

interface SectionData {
  id: number;
  page_id: number;
  section_type: string;
  section_key: string;
  category?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  data_json: Record<string, any> | string;
  sort_order: number;
  is_active: boolean;
}

// Helper to safely parse JSON or return default
const parseJson = (val: any): Record<string, any> => {
  if (typeof val === 'object' && val !== null) return val;
  try {
    return JSON.parse(val || '{}');
  } catch {
    return {};
  }
};

// ─── Dynamic JSON Editor Sub-component ─────────────────────────────────────────
function DynamicJsonEditor({
  jsonString,
  onChange,
  onImageUpload
}: {
  jsonString: string;
  onChange: (val: string) => void;
  onImageUpload: (file: File, path: (string | number)[]) => Promise<string | null>;
}) {
  let data: any = {};
  let isArrayRoot = false;
  try {
    data = JSON.parse(jsonString);
    if (Array.isArray(data)) isArrayRoot = true;
  } catch (e) {
    return <div className="text-xs text-red-500 font-semibold p-2 bg-red-50 rounded-xl border border-red-150">Invalid JSON data payload.</div>;
  }

  const handleChange = (path: (string | number)[], value: any) => {
    const newData = Array.isArray(data) ? [...data] : { ...data };
    let curr: any = newData;
    for (let i = 0; i < path.length - 1; i++) {
      curr = curr[path[i]];
    }
    curr[path[path.length - 1]] = value;
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleAddItem = (path: (string | number)[], templateItem: any) => {
    const newData = Array.isArray(data) ? [...data] : { ...data };
    if (path.length === 0 && Array.isArray(newData)) {
      newData.push(templateItem);
    } else {
      let curr: any = newData;
      for (let i = 0; i < path.length; i++) {
        curr = curr[path[i]];
      }
      if (Array.isArray(curr)) {
        curr.push(templateItem);
      }
    }
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleRemoveItem = (path: (string | number)[], index: number) => {
    const newData = Array.isArray(data) ? [...data] : { ...data };
    if (path.length === 0 && Array.isArray(newData)) {
      newData.splice(index, 1);
    } else {
      let curr: any = newData;
      for (let i = 0; i < path.length; i++) {
        curr = curr[path[i]];
      }
      if (Array.isArray(curr)) {
        curr.splice(index, 1);
      }
    }
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: (string | number)[]) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onImageUpload(file, path);
    if (url) {
      handleChange(path, url);
    }
  };

  const renderField = (val: any, path: (string | number)[], name: string): React.ReactNode => {
    // Avoid rendering the internal UI visibility keys in the JSON editor
    if (name === 'visibility') return null;

    if (typeof val === 'string' || typeof val === 'number') {
      const label = name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const isImage = typeof val === 'string' && name.toLowerCase().includes('image');

      return (
        <div key={path.join('.')} className="space-y-1.5 mb-4">
          <label className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500 block">{label}</label>
          
          {isImage && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-slate-150 rounded-2xl bg-white mb-2 shadow-sm">
              <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex shrink-0 items-center justify-center">
                {val ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={val as string} alt="preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <span className="text-[9px] font-black text-slate-400">No Image</span>
                )}
              </div>
              <div className="flex-1 relative space-y-2 min-w-0">
                <input
                  type="text"
                  value={val}
                  onChange={e => handleChange(path, e.target.value)}
                  placeholder="Paste image URL here..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-brand-300"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-100 hover:bg-brand-100 rounded-xl text-xs font-bold text-brand-700 transition-colors shadow-sm cursor-pointer">
                  <Upload size={13} />
                  Upload Image
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, path)} className="hidden" />
                </label>
              </div>
            </div>
          )}

          {!isImage && (
            typeof val === 'string' && val.length > 70 ? (
              <textarea
                value={val}
                onChange={e => handleChange(path, e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                rows={3}
              />
            ) : (
              <input
                type="text"
                value={val}
                onChange={e => handleChange(path, e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
              />
            )
          )}
        </div>
      );
    }
    
    if (Array.isArray(val)) {
      const templateItem = val.length > 0 ? (typeof val[0] === 'object' ? Object.fromEntries(Object.keys(val[0]).map(k => [k, ''])) : '') : '';
      return (
        <div key={path.join('.')} className="mb-5 p-5 border border-slate-200 rounded-[1.75rem] bg-slate-50/40">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-700 block capitalize">
              {name.replace(/_/g, ' ')} ({val.length})
            </label>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleAddItem(path, templateItem); }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-650 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={12} /> Add Item
            </button>
          </div>
          <div className="space-y-4">
            {val.map((item, idx) => (
              <div key={idx} className="relative p-4 border border-slate-100 rounded-2xl bg-white shadow-sm">
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleRemoveItem(path, idx); }}
                  className="absolute top-3 right-3 p-1.5 text-slate-350 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Remove item"
                >
                  <Trash2 size={13} />
                </button>
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-3">Item {idx + 1}</div>
                {renderField(item, [...path, idx], 'Item')}
              </div>
            ))}
            {val.length === 0 && <div className="text-xs text-slate-400 font-medium italic pl-1">No items added yet.</div>}
          </div>
        </div>
      );
    }

    if (typeof val === 'object' && val !== null) {
      return (
        <div key={path.join('.')} className="mb-4 space-y-4">
          {Object.keys(val).map(k => renderField(val[k], [...path, k], k))}
        </div>
      );
    }
    return null;
  };

  const isEmpty = Object.keys(data).filter(k => k !== 'visibility').length === 0;

  if (isEmpty) return <div className="text-xs text-slate-400 italic pl-1 py-1 font-semibold">No custom settings properties for this section type.</div>;

  return (
    <div className="space-y-4 pt-2">
      {renderField(data, [], isArrayRoot ? 'Items' : 'Properties')}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PageBuilder() {
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;

  const [page, setPage] = useState<PageData | null>(null);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSaving, setPageSaving] = useState(false);
  const [sectionSavingId, setSectionSavingId] = useState<number | null>(null);
  
  // Track which section is expanded inline for editing
  const [expandedSectionId, setExpandedSectionId] = useState<number | null>(null);
  const [editingSectionState, setEditingSectionState] = useState<any>(null);

  // Modal states for creating a new section
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [newSection, setNewSection] = useState({
    section_type: 'HeroSection',
    section_key: 'custom-section',
    category: 'General',
    title: '',
    subtitle: '',
    content: '',
    data_json: '{}'
  });

  const fetchPageData = useCallback(async () => {
    try {
      const [pageRes, sectionsRes] = await Promise.all([
        fetch(`/api/admin/content/pages/${pageId}`),
        fetch(`/api/admin/content/pages/${pageId}/sections`)
      ]);
      
      if (pageRes.ok) setPage(await pageRes.json());
      if (sectionsRes.ok) {
        const data = await sectionsRes.json();
        setSections(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load page details.');
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  // Page Property Handlers
  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setPage((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const savePageSettings = async () => {
    if (!page) return;
    setPageSaving(true);
    try {
      const res = await fetch(`/api/admin/content/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page)
      });
      if (res.ok) toast.success('SEO & Page settings saved successfully.');
      else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save page settings.');
      }
    } catch (e: any) {
      toast.error(e.message || 'An error occurred.');
    } finally {
      setPageSaving(false);
    }
  };

  // Section Handlers
  const toggleSection = async (section: SectionData) => {
    try {
      const parsedJson = parseJson(section.data_json);
      await fetch(`/api/admin/content/pages/${pageId}/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...section,
          data_json: parsedJson,
          is_active: !section.is_active
        })
      });
      toast.success(section.is_active ? 'Section deactivated.' : 'Section activated.');
      fetchPageData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to toggle visibility.');
    }
  };

  const toggleVisibilityDevice = async (section: SectionData, device: 'mobile' | 'tablet' | 'desktop') => {
    try {
      const parsedJson = parseJson(section.data_json);
      const currentVisibility = parsedJson.visibility || { mobile: true, tablet: true, desktop: true };
      const updatedVisibility = {
        ...currentVisibility,
        [device]: !currentVisibility[device]
      };
      const updatedJson = {
        ...parsedJson,
        visibility: updatedVisibility
      };

      await fetch(`/api/admin/content/pages/${pageId}/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...section,
          data_json: updatedJson
        })
      });
      fetchPageData();
    } catch (e: any) {
      toast.error('Failed to update device visibility.');
    }
  };

  const moveSection = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === sections.length - 1)
    ) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setSections(newSections);

    const order = newSections.map(s => s.id);
    try {
      await fetch(`/api/admin/content/pages/${pageId}/sections/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      });
    } catch (e) {
      console.error(e);
      toast.error('Failed to save layout order.');
    }
  };

  const handleEditClick = (section: SectionData) => {
    if (expandedSectionId === section.id) {
      // Close
      setExpandedSectionId(null);
      setEditingSectionState(null);
    } else {
      // Expand and load form state
      setExpandedSectionId(section.id);
      setEditingSectionState({
        title: section.title || '',
        subtitle: section.subtitle || '',
        content: section.content || '',
        data_json: typeof section.data_json === 'string' 
          ? section.data_json 
          : JSON.stringify(section.data_json || {}, null, 2)
      });
    }
  };

  const uploadImage = async (file: File, path: (string | number)[]): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        return data.url;
      } else {
        toast.error(data?.error || 'Upload failed');
        return null;
      }
    } catch (err: any) {
      toast.error('Image upload failed');
      return null;
    }
  };

  const handleInlineSave = async (section: SectionData) => {
    setSectionSavingId(section.id);
    try {
      const parsedJson = JSON.parse(editingSectionState.data_json);
      const res = await fetch(`/api/admin/content/pages/${pageId}/sections/${section.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...section,
          title: editingSectionState.title,
          subtitle: editingSectionState.subtitle,
          content: editingSectionState.content,
          data_json: parsedJson
        })
      });
      if (res.ok) {
        toast.success('Section saved successfully.');
        setExpandedSectionId(null);
        setEditingSectionState(null);
        fetchPageData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save section.');
      }
    } catch (e) {
      toast.error('Invalid JSON properties format.');
    } finally {
      setSectionSavingId(null);
    }
  };

  const handleDuplicateSection = async (section: SectionData) => {
    try {
      const copy = {
        ...section,
        section_key: `${section.section_key}-copy`,
        data_json: parseJson(section.data_json)
      };
      delete (copy as any).id;
      delete (copy as any).sort_order;

      const res = await fetch(`/api/admin/content/pages/${pageId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copy)
      });
      if (res.ok) {
        toast.success('Section duplicated.');
        fetchPageData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to duplicate section.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Duplication error.');
    }
  };

  const handleDeleteSection = async (id: number) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      const res = await fetch(`/api/admin/content/pages/${pageId}/sections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Section deleted successfully.');
        if (expandedSectionId === id) {
          setExpandedSectionId(null);
          setEditingSectionState(null);
        }
        fetchPageData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete section.');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete section.');
    }
  };

  // Create new section logic
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedJson = JSON.parse(newSection.data_json);
      const res = await fetch(`/api/admin/content/pages/${pageId}/sections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSection, data_json: parsedJson })
      });
      if (res.ok) {
        toast.success('New section added successfully.');
        setIsAddSectionOpen(false);
        setNewSection({
          section_type: 'HeroSection',
          section_key: 'custom-section',
          category: 'General',
          title: '',
          subtitle: '',
          content: '',
          data_json: '{}'
        });
        fetchPageData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add section.');
      }
    } catch (e) {
      toast.error('Invalid JSON properties format.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          Loading page builder...
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <AlertCircle size={32} className="text-slate-400 mb-2 animate-bounce" />
        <p className="text-slate-500 font-bold text-lg">Page not found.</p>
        <Link href="/admin/content/pages" className="mt-4 text-xs font-black uppercase text-brand-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const titleLength = page.meta_title?.length || 0;
  const descLength = page.meta_description?.length || 0;

  return (
    <div className="w-full bg-slate-50/70 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center gap-3">
          <Link href="/admin/content/pages" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors shadow-sm">
            <ArrowLeft size={16} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <Link href="/admin/content/pages" className="hover:underline">Pages</Link>
              <span>/</span>
              <span className="text-slate-500 truncate">{page.title}</span>
            </div>
          </div>
        </div>

        {/* Page title header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-2 leading-none">
              {page.title}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="font-mono bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] text-slate-600">{page.slug}</span>
              <span>•</span>
              <span>{sections.length} section(s)</span>
            </div>
          </div>
          <button
            onClick={() => setIsAddSectionOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-black text-sm transition-all shadow-sm shadow-brand-200 self-start sm:self-auto"
          >
            <Plus size={16} />
            Add Section
          </button>
        </div>

        {/* Main Grid: Left = Sections list, Right = SEO settings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column: Sections list & Inline Editors */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Page Layout Blocks</h2>
            </div>

            {sections.length === 0 ? (
              <div className="bg-white py-16 px-8 text-center rounded-[2rem] border border-slate-200 border-dashed text-slate-400">
                <Sparkles size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="font-medium text-sm">No layout blocks added to this page yet.</p>
                <button
                  onClick={() => setIsAddSectionOpen(true)}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase text-brand-600 hover:underline"
                >
                  Create first section
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {sections.map((section, idx) => {
                  const isExpanded = expandedSectionId === section.id;
                  const dataJsonObj = parseJson(section.data_json);
                  const visibility = dataJsonObj.visibility || { mobile: true, tablet: true, desktop: true };

                  return (
                    <div
                      key={section.id}
                      className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'ring-2 ring-brand-500/20 border-brand-300' : 'hover:border-slate-300'
                      }`}
                    >
                      {/* Section Card Header */}
                      <div className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Reordering */}
                          <div className="flex items-center gap-0.5 text-slate-350">
                            <button
                              onClick={() => moveSection(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 hover:text-slate-700 hover:bg-slate-50 rounded-lg disabled:opacity-20 transition-colors"
                              title="Move up"
                              aria-label="Move section up"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => moveSection(idx, 'down')}
                              disabled={idx === sections.length - 1}
                              className="p-1 hover:text-slate-700 hover:bg-slate-50 rounded-lg disabled:opacity-20 transition-colors"
                              title="Move down"
                              aria-label="Move section down"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                          
                          {/* Grip */}
                          <GripVertical size={16} className="text-slate-300 shrink-0 cursor-grab active:cursor-grabbing" />

                          {/* Section Title & Type */}
                          <div className="min-w-0">
                            <h3 className="text-slate-900 font-bold text-sm leading-snug truncate pr-2">
                              {section.title || section.section_type}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-[9px] font-mono font-black tracking-tight shrink-0">
                                {section.section_key}
                              </span>
                              {section.category && (
                                <span className="text-[10px] font-semibold text-slate-400 truncate hidden sm:inline">
                                  {section.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Controls & Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0">
                          
                          {/* Active Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={section.is_active}
                              onChange={() => toggleSection(section)}
                              className="sr-only peer"
                              aria-label={`Toggle visibility of ${section.title || section.section_type}`}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600" />
                          </label>

                          {/* Visibility Device checkmarks (mock checkboxes) */}
                          <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-150 p-1 rounded-xl text-slate-400">
                            <button
                              onClick={() => toggleVisibilityDevice(section, 'mobile')}
                              className={`p-1.5 rounded-lg transition-colors ${visibility.mobile ? 'bg-white text-brand-600 shadow-sm border border-slate-150' : 'hover:text-slate-600'}`}
                              title="Mobile Visibility"
                            >
                              <Smartphone size={12} />
                            </button>
                            <button
                              onClick={() => toggleVisibilityDevice(section, 'tablet')}
                              className={`p-1.5 rounded-lg transition-colors ${visibility.tablet ? 'bg-white text-brand-600 shadow-sm border border-slate-150' : 'hover:text-slate-600'}`}
                              title="Tablet Visibility"
                            >
                              <Tablet size={12} />
                            </button>
                            <button
                              onClick={() => toggleVisibilityDevice(section, 'desktop')}
                              className={`p-1.5 rounded-lg transition-colors ${visibility.desktop ? 'bg-white text-brand-600 shadow-sm border border-slate-150' : 'hover:text-slate-600'}`}
                              title="Desktop Visibility"
                            >
                              <Monitor size={12} />
                            </button>
                          </div>

                          {/* Quick buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditClick(section)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-sm ${
                                isExpanded
                                  ? 'bg-slate-150 text-slate-700 hover:bg-slate-200'
                                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-100/50'
                              }`}
                            >
                              {isExpanded ? 'Close' : 'Edit'}
                            </button>
                            <button
                              onClick={() => handleDuplicateSection(section)}
                              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-all shadow-sm"
                              title="Duplicate Section"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(section.id)}
                              className="p-1.5 bg-red-50 border border-red-100 hover:bg-red-150 text-red-650 rounded-xl transition-colors"
                              title="Delete Section"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                        </div>
                      </div>

                      {/* Expandable Inline Editing Form */}
                      {isExpanded && editingSectionState && (
                        <div className="border-t border-slate-100 bg-slate-50/20 p-5 sm:p-6 space-y-4">
                          
                          {section.section_type && (
                            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 p-3 rounded-2xl text-xs text-blue-800 font-semibold leading-relaxed">
                              <AlertCircle size={14} className="shrink-0 mt-0.5 text-blue-500" />
                              <div>
                                <span className="font-bold">Properties schema details: </span>
                                Currently editing content layout for the <span className="font-bold font-mono">{section.section_type}</span> layout block type. Changes apply instantly after saving.
                              </div>
                            </div>
                          )}

                          {/* Title Field with Char count */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                              <span>Headline / Title</span>
                              <span className={editingSectionState.title.length > 60 ? 'text-red-500' : 'text-slate-400'}>
                                {editingSectionState.title.length} chars (ideal under 60)
                              </span>
                            </div>
                            <input
                              type="text"
                              value={editingSectionState.title}
                              onChange={(e) => setEditingSectionState({ ...editingSectionState, title: e.target.value })}
                              placeholder="Add section title headline..."
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                            />
                          </div>

                          {/* Subtitle Field with Char count */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                              <span>Subtitle / Supporting Copy</span>
                              <span className={editingSectionState.subtitle.length > 160 ? 'text-red-500' : 'text-slate-400'}>
                                {editingSectionState.subtitle.length} chars (ideal 40-160)
                              </span>
                            </div>
                            <textarea
                              rows={3}
                              value={editingSectionState.subtitle}
                              onChange={(e) => setEditingSectionState({ ...editingSectionState, subtitle: e.target.value })}
                              placeholder="1-2 sentences of supporting copy description..."
                              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                            />
                          </div>

                          {/* Optional Body/Markdown Field */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                              Block Content
                            </label>
                            <textarea
                              rows={4}
                              value={editingSectionState.content}
                              onChange={(e) => setEditingSectionState({ ...editingSectionState, content: e.target.value })}
                              placeholder="Write Markdown or body block content here..."
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                            />
                          </div>

                          {/* Dynamic JSON Sub-fields Editor */}
                          <div className="border-t border-slate-100 pt-4 mt-2">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Custom Schema Properties (JSON)</div>
                            <DynamicJsonEditor
                              jsonString={editingSectionState.data_json}
                              onChange={(val) => setEditingSectionState({ ...editingSectionState, data_json: val })}
                              onImageUpload={uploadImage}
                            />
                          </div>

                          {/* Save & Close Actions */}
                          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => handleEditClick(section)}
                              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all"
                            >
                              Close
                            </button>
                            <button
                              type="button"
                              disabled={sectionSavingId === section.id}
                              onClick={() => handleInlineSave(section)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-brand-100"
                            >
                              {sectionSavingId === section.id ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                              {sectionSavingId === section.id ? 'Saving...' : 'Save Section'}
                            </button>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: SEO & Page settings panel */}
          <div className="w-full">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col sticky top-6">
              <div className="px-6 py-4 border-b border-slate-150 bg-slate-50/50">
                <h2 className="font-extrabold text-slate-900 text-sm tracking-tight">SEO & Page settings</h2>
              </div>
              
              <div className="p-6 space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="page-title" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Title</label>
                  <input id="page-title" name="title" value={page.title || ''} onChange={handlePageChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="page-slug" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Slug URL</label>
                  <input id="page-slug" name="slug" value={page.slug || ''} onChange={handlePageChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10" />
                </div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    <span>Meta Title</span>
                    <span className={titleLength > 60 ? 'text-red-500' : 'text-slate-400'}>{titleLength} chars</span>
                  </div>
                  <input id="page-meta-title" name="meta_title" value={page.meta_title || ''} onChange={handlePageChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                    <span>Meta Description</span>
                    <span className={descLength > 160 ? 'text-red-500' : 'text-slate-400'}>{descLength} chars</span>
                  </div>
                  <textarea id="page-meta-description" name="meta_description" value={page.meta_description || ''} onChange={handlePageChange} rows={3} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 resize-none" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="page-meta-keywords" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Meta Keywords</label>
                  <input id="page-meta-keywords" name="meta_keywords" value={page.meta_keywords || ''} onChange={handlePageChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="page-canonical-url" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Canonical URL</label>
                  <input id="page-canonical-url" name="canonical_url" value={page.canonical_url || ''} onChange={handlePageChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10" />
                </div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                  <label htmlFor="page-og-title" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">OG Title</label>
                  <input id="page-og-title" name="og_title" value={page.og_title || ''} onChange={handlePageChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="page-og-description" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">OG Description</label>
                  <textarea id="page-og-description" name="og_description" value={page.og_description || ''} onChange={handlePageChange} rows={2} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 resize-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="page-og-image" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">OG Image URL</label>
                  <input id="page-og-image" name="og_image" value={page.og_image || ''} onChange={handlePageChange} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-mono font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10" />
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label htmlFor="page-status" className="text-xs font-bold text-slate-700">Publication Status</label>
                    <select id="page-status" name="status" value={page.status} onChange={handlePageChange} className="border border-slate-200 bg-white text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:border-brand-300">
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label htmlFor="page-show-in-menu" className="text-xs font-bold text-slate-700">Display in Navigation Menu</label>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input id="page-show-in-menu" type="checkbox" name="show_in_menu" checked={page.show_in_menu} onChange={handlePageChange} className="sr-only peer" />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600" />
                    </label>
                  </div>

                  {page.show_in_menu && (
                    <div className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="flex flex-col gap-1">
                        <label htmlFor="page-menu-label" className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Menu Label</label>
                        <input id="page-menu-label" name="menu_label" value={page.menu_label || ''} onChange={handlePageChange} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-800 outline-none" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label htmlFor="page-menu-order" className="text-[9px] font-black tracking-wider text-slate-400 uppercase">Menu Sort Position</label>
                        <input id="page-menu-order" type="number" name="menu_order" value={page.menu_order || 0} onChange={handlePageChange} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 outline-none" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <button 
                  onClick={savePageSettings}
                  disabled={pageSaving}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-black py-3 rounded-2xl transition-all shadow-sm text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  {pageSaving ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
                  Save Page settings
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Creation Modal for Adding New Section */}
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl w-full max-w-lg flex flex-col p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsAddSectionOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Add Layout Block Section</h3>
              <p className="text-slate-500 text-xs font-medium mt-1">Insert a new section type to the current page flow.</p>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="section-type" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Section Template Type</label>
                <select
                  id="section-type"
                  value={newSection.section_type}
                  onChange={(e) => setNewSection({ ...newSection, section_type: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-brand-300"
                >
                  <optgroup label="General / Home Templates">
                    <option value="HeroSection">Hero Section (Home-like)</option>
                    <option value="BrandMarquee">Brand Marquee</option>
                    <option value="BrandsSection">Brands Section Grid</option>
                    <option value="CategorySection">Category Grid</option>
                    <option value="FeaturedProducts">Featured Products</option>
                    <option value="WhyUsSection">Why Choose Us Benefits</option>
                    <option value="EnterpriseSection">Enterprise Callout</option>
                    <option value="TestimonialsSectionClient">Testimonials Section</option>
                    <option value="FAQAccordion">FAQ Accordion Section</option>
                    <option value="GenericHero">Generic Page Hero</option>
                    <option value="TextSection">Text & Body Content</option>
                    <option value="StaticSection">Custom Static Block</option>
                  </optgroup>
                  <optgroup label="About Page Templates">
                    <option value="AboutWhatWeDo">About: What We Do</option>
                    <option value="AboutMissionVision">About: Mission & Vision</option>
                    <option value="AboutWhyChooseUs">About: Why Choose Us</option>
                  </optgroup>
                  <optgroup label="Services Page Templates">
                    <option value="ServicesServiceAreas">Services: Core Sectors / Areas</option>
                    <option value="ServicesList">Services: Tabbed Services List</option>
                  </optgroup>
                  <optgroup label="Projects Page Templates">
                    <option value="ProjectsInstallations">Projects: Installations Showcase</option>
                    <option value="CaseStudiesSection">Projects: Case Studies</option>
                    <option value="ProjectsProcess">Projects: How We Work (Process)</option>
                    <option value="ProjectsWhyTrustUs">Projects: Why Trust Us</option>
                  </optgroup>
                  <optgroup label="Enterprise Page Templates">
                    <option value="EnterpriseHero">Enterprise: Large-scale Hero</option>
                    <option value="EnterpriseSections">Enterprise: Deliverables & Specs Grid</option>
                    <option value="EnterpriseForm">Enterprise: B2B Enquiry Form</option>
                  </optgroup>
                  <optgroup label="Contact Page Templates">
                    <option value="ContactHero">Contact: Hero Banner</option>
                    <option value="ContactInfo">Contact: Office / Phone Info Cards</option>
                    <option value="ContactForm">Contact: Consultation Request Form</option>
                    <option value="ContactMap">Contact: Visitor Area & Google Map</option>
                  </optgroup>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="section-key" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Section Identifier Key</label>
                <input
                  id="section-key"
                  type="text"
                  placeholder="e.g. custom-about-features"
                  value={newSection.section_key}
                  onChange={(e) => setNewSection({ ...newSection, section_key: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-mono font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="section-category" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Display Category Group</label>
                <input
                  id="section-category"
                  type="text"
                  placeholder="e.g. Homepage, Services Page"
                  value={newSection.category}
                  onChange={(e) => setNewSection({ ...newSection, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="section-json" className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Custom Schema Fields (JSON)</label>
                <textarea
                  id="section-json"
                  rows={4}
                  placeholder='e.g. { "badge": "New Badge", "button_label": "Click Here" }'
                  value={newSection.data_json}
                  onChange={(e) => setNewSection({ ...newSection, data_json: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-mono font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsAddSectionOpen(false)}
                  className="px-5 py-3 border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 rounded-xl text-xs font-black text-white transition-all shadow-lg shadow-brand-200"
                >
                  Add Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
