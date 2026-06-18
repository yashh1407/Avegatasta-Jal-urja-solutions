'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import {
  Settings,
  LogOut,
  Save,
  RefreshCw,
  Plus,
  X,
  ChevronUp,
  ChevronDown,
  Edit2,
  BarChart3,
  Phone,
  Info,
  Wrench,
  GripVertical,
  LineChart,
} from 'lucide-react';
import Footer from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SiteSettingsMap {
  established_year?: string;
  total_clients?: string;
  units_installed?: string;
  industry_sectors?: string;
  company_phone?: string;
  company_email?: string;
  company_address?: string;
  whatsapp_number?: string;
  google_maps_url?: string;
  social_linkedin?: string;
  social_instagram?: string;
  social_facebook?: string;
  about_why_choose?: string;
  [key: string]: string | undefined;
}

interface AboutContent {
  id: number;
  section: 'mission' | 'vision' | 'company_intro';
  content: string;
}

interface CategoryList {
  id?: number;
  list_title: string;
  items: string[];
  display_order: number;
}

interface ServiceCategory {
  id?: number;
  name: string;
  description: string;
  display_order: number;
  lists: CategoryList[];
}

interface Service {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  intro: string;
  why_choose: string[];
  cta_title: string;
  cta_desc: string;
  display_order: number;
  is_active: boolean | number;
  categories: ServiceCategory[];
}

// ─── List Editor ──────────────────────────────────────────────────────────────

function ListEditor({
  items,
  onChange,
  placeholder = 'Add item…',
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const [newItem, setNewItem] = useState('');

  const add = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setNewItem('');
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 group">
          <GripVertical size={14} className="text-slate-300 shrink-0" />
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[idx] = e.target.value;
              onChange(next);
            }}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <button
            type="button"
            onClick={() => move(idx, -1)}
            disabled={idx === 0}
            className="p-1 text-slate-300 hover:text-slate-500 disabled:opacity-30"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => move(idx, 1)}
            disabled={idx === items.length - 1}
            className="p-1 text-slate-300 hover:text-slate-500 disabled:opacity-30"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => remove(idx)}
            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 py-2 bg-brand-50 text-brand-600 rounded-xl hover:bg-brand-100 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  // Wrap the control inside the <label> so the text label is implicitly
  // associated with the form control for screen readers (no id wiring needed).
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      {children}
    </label>
  );
}

const INPUT_CLS =
  'px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all w-full';

const TEXTAREA_CLS =
  'px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all w-full resize-none';

// ─── Service Editor ───────────────────────────────────────────────────────────

function ServiceEditor({
  service,
  onSave,
  onToggle,
}: {
  service: Service;
  onSave: (id: number, data: Partial<Service>, categories: ServiceCategory[]) => Promise<void>;
  onToggle: (id: number, active: boolean) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: service.title,
    subtitle: service.subtitle ?? '',
    intro: service.intro ?? '',
    why_choose: service.why_choose ?? [],
    cta_title: service.cta_title ?? '',
    cta_desc: service.cta_desc ?? '',
    display_order: service.display_order,
  });
  const [categories, setCategories] = useState<ServiceCategory[]>(
    service.categories.map((c) => ({
      ...c,
      description: c.description ?? '',
      lists: c.lists.map((l) => ({ ...l })),
    }))
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(service.id, form, categories);
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () =>
    setCategories([
      ...categories,
      { name: '', description: '', display_order: categories.length + 1, lists: [] },
    ]);

  const removeCategory = (idx: number) =>
    setCategories(categories.filter((_, i) => i !== idx));

  const updateCategory = (idx: number, patch: Partial<ServiceCategory>) =>
    setCategories(categories.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  const addList = (catIdx: number) =>
    updateCategory(catIdx, {
      lists: [
        ...categories[catIdx].lists,
        { list_title: '', items: [], display_order: categories[catIdx].lists.length + 1 },
      ],
    });

  const removeList = (catIdx: number, listIdx: number) =>
    updateCategory(catIdx, {
      lists: categories[catIdx].lists.filter((_, i) => i !== listIdx),
    });

  const updateList = (catIdx: number, listIdx: number, patch: Partial<CategoryList>) =>
    updateCategory(catIdx, {
      lists: categories[catIdx].lists.map((l, i) => (i === listIdx ? { ...l, ...patch } : l)),
    });

  const isActive = Boolean(service.is_active);

  return (
    <div className="border border-slate-100 rounded-3xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center text-xs font-black">
            {service.display_order}
          </span>
          <div>
            <p className="text-sm font-black text-brand-950">{service.title}</p>
            <p className="text-xs text-slate-400 font-medium">{service.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggle(service.id, !isActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-brand-700 hover:border-brand-200 hover:bg-brand-50 transition-all"
          >
            <Edit2 size={12} />
            Edit
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6 border-t border-slate-100">
              {/* Basic fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Title">
                  <input
                    className={INPUT_CLS}
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </Field>
                <Field label="Subtitle">
                  <input
                    className={INPUT_CLS}
                    value={form.subtitle}
                    onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="CTA Title">
                  <input
                    className={INPUT_CLS}
                    value={form.cta_title}
                    onChange={(e) => setForm((f) => ({ ...f, cta_title: e.target.value }))}
                  />
                </Field>
                <Field label="Display Order">
                  <input
                    type="number"
                    className={INPUT_CLS}
                    value={form.display_order}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))
                    }
                  />
                </Field>
              </div>
              <Field label="Intro">
                <textarea
                  rows={4}
                  className={TEXTAREA_CLS}
                  value={form.intro}
                  onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))}
                />
              </Field>
              <Field label="CTA Description">
                <textarea
                  rows={3}
                  className={TEXTAREA_CLS}
                  value={form.cta_desc}
                  onChange={(e) => setForm((f) => ({ ...f, cta_desc: e.target.value }))}
                />
              </Field>
              <Field label="Why Choose Us">
                <ListEditor
                  items={form.why_choose}
                  onChange={(items) => setForm((f) => ({ ...f, why_choose: items }))}
                  placeholder="Add reason…"
                />
              </Field>

              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Service Categories
                  </span>
                  <button
                    type="button"
                    onClick={addCategory}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-xl text-xs font-black hover:bg-brand-100 transition-colors"
                  >
                    <Plus size={12} /> Add Category
                  </button>
                </div>
                <div className="space-y-4">
                  {categories.map((cat, catIdx) => (
                    <div
                      key={catIdx}
                      className="border border-slate-200 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Field label="Category Name">
                            <input
                              className={INPUT_CLS}
                              value={cat.name}
                              onChange={(e) =>
                                updateCategory(catIdx, { name: e.target.value })
                              }
                              placeholder="e.g. Heat Pump Water Heaters"
                            />
                          </Field>
                          <Field label="Description">
                            <input
                              className={INPUT_CLS}
                              value={cat.description}
                              onChange={(e) =>
                                updateCategory(catIdx, { description: e.target.value })
                              }
                            />
                          </Field>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCategory(catIdx)}
                          className="mt-6 p-2 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Lists within category */}
                      <div className="pl-4 border-l-2 border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Sub-lists
                          </span>
                          <button
                            type="button"
                            onClick={() => addList(catIdx)}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black hover:bg-slate-100 transition-colors"
                          >
                            <Plus size={10} /> Add List
                          </button>
                        </div>
                        {cat.lists.map((lst, listIdx) => (
                          <div
                            key={listIdx}
                            className="bg-slate-50 rounded-xl p-3 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
                                value={lst.list_title}
                                onChange={(e) =>
                                  updateList(catIdx, listIdx, { list_title: e.target.value })
                                }
                                placeholder="List title (e.g. Applications)"
                              />
                              <button
                                type="button"
                                onClick={() => removeList(catIdx, listIdx)}
                                className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <X size={13} />
                              </button>
                            </div>
                            <ListEditor
                              items={lst.items}
                              onChange={(items) => updateList(catIdx, listIdx, { items })}
                              placeholder="Add item…"
                            />
                          </div>
                        ))}
                        {cat.lists.length === 0 && (
                          <p className="text-xs text-slate-500 font-medium">No sub-lists yet.</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-slate-400 font-medium py-2">
                      No categories. Click &quot;Add Category&quot; to add one.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white text-sm font-black rounded-2xl hover:bg-brand-700 disabled:opacity-60 transition-all shadow-sm shadow-brand-200"
                >
                  {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Service
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'stats' | 'contact' | 'about' | 'services' | 'integrations';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'stats', label: 'Homepage Stats', icon: <BarChart3 size={15} /> },
  { id: 'contact', label: 'Contact & Footer', icon: <Phone size={15} /> },
  { id: 'about', label: 'About Page', icon: <Info size={15} /> },
  { id: 'services', label: 'Services', icon: <Wrench size={15} /> },
  { id: 'integrations', label: 'Integrations', icon: <LineChart size={15} /> },
];

export default function SiteSettingsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Site settings
  const [settings, setSettings] = useState<SiteSettingsMap>({});

  // About content
  const [aboutContent, setAboutContent] = useState<Record<string, string>>({
    company_intro: '',
    mission: '',
    vision: '',
  });
  const [whyChooseItems, setWhyChooseItems] = useState<string[]>([]);

  // Services
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchAll();
  }, [status, router]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsResult, aboutResult, servicesResult] = await Promise.allSettled([
        fetch('/api/admin/site-settings', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/admin/about-content', { cache: 'no-store' }).then((r) => r.json()),
        fetch('/api/admin/services', { cache: 'no-store' }).then((r) => r.json()),
      ]);

      if (settingsResult.status === 'fulfilled' && settingsResult.value?.map) {
        setSettings(settingsResult.value.map);
        try {
          const parsed = JSON.parse(settingsResult.value.map.about_why_choose ?? '[]');
          setWhyChooseItems(Array.isArray(parsed) ? parsed : []);
        } catch {
          setWhyChooseItems([]);
        }
      } else {
        console.error('Failed to fetch admin site settings:', settingsResult);
      }

      if (aboutResult.status === 'fulfilled' && Array.isArray(aboutResult.value)) {
        const map: Record<string, string> = {};
        for (const row of aboutResult.value as AboutContent[]) map[row.section] = row.content;
        setAboutContent(map);
      } else {
        console.error('Failed to fetch admin about content:', aboutResult);
      }

      if (servicesResult.status === 'fulfilled' && Array.isArray(servicesResult.value)) {
        setServices(
          servicesResult.value.map((s: Service) => ({
            ...s,
            why_choose: Array.isArray(s.why_choose) ? s.why_choose : [],
            categories: (s.categories ?? []).map((c: ServiceCategory) => ({
              ...c,
              description: c.description ?? '',
              lists: (c.lists ?? []).map((l: CategoryList) => ({
                ...l,
                items: Array.isArray(l.items) ? l.items : [],
              })),
            })),
          }))
        );
      } else {
        console.error('Failed to fetch admin services:', servicesResult);
      }
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
      toast.error('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─ Tab: Integrations ────────────────────────────────────────────────────────

  const saveIntegrations = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { key: 'analytics_enabled', value: settings.analytics_enabled === 'true' ? 'true' : 'false' },
          { key: 'gtm_id', value: settings.gtm_id ?? '' },
          { key: 'meta_pixel_id', value: settings.meta_pixel_id ?? '' },
          { key: 'google_maps_api_key', value: settings.google_maps_api_key ?? '' },
        ]),
      });
      if (!res.ok) throw new Error('save failed');
      const data = await res.json();
      if (data?.map) setSettings(data.map);
      toast.success('Integration settings saved');
    } catch {
      toast.error('Failed to save integration settings');
    } finally {
      setSaving(false);
    }
  };

  // ─ Tab 1: Stats ─────────────────────────────────────────────────────────────

  const saveStats = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { key: 'established_year', value: settings.established_year ?? '' },
          { key: 'total_clients', value: settings.total_clients ?? '' },
          { key: 'units_installed', value: settings.units_installed ?? '' },
          { key: 'industry_sectors', value: settings.industry_sectors ?? '' },
        ]),
      });
      if (!res.ok) throw new Error();
      toast.success('Homepage stats saved');
    } catch {
      toast.error('Failed to save stats');
    } finally {
      setSaving(false);
    }
  };

  // ─ Tab 2: Contact ────────────────────────────────────────────────────────────

  const saveContact = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { key: 'company_phone', value: settings.company_phone ?? '' },
          { key: 'company_email', value: settings.company_email ?? '' },
          { key: 'company_address', value: settings.company_address ?? '' },
          { key: 'whatsapp_number', value: settings.whatsapp_number ?? '' },
          { key: 'google_maps_url', value: settings.google_maps_url ?? '' },
          { key: 'social_linkedin', value: settings.social_linkedin ?? '' },
          { key: 'social_instagram', value: settings.social_instagram ?? '' },
          { key: 'social_facebook', value: settings.social_facebook ?? '' },
        ]),
      });
      if (!res.ok) throw new Error();
      toast.success('Contact info saved');
    } catch {
      toast.error('Failed to save contact info');
    } finally {
      setSaving(false);
    }
  };

  // ─ Tab 3: About ─────────────────────────────────────────────────────────────

  const saveAbout = async () => {
    setSaving(true);
    try {
      const sections: ('company_intro' | 'mission' | 'vision')[] = [
        'company_intro',
        'mission',
        'vision',
      ];
      const aboutResults = await Promise.all(
        sections.map((section) =>
          fetch(`/api/admin/about-content/${section}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: aboutContent[section] ?? '' }),
          })
        )
      );
      if (aboutResults.some((r) => !r.ok)) throw new Error();
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { key: 'about_why_choose', value: JSON.stringify(whyChooseItems) },
        ]),
      });
      if (!res.ok) throw new Error();
      toast.success('About page saved');
    } catch {
      toast.error('Failed to save about page');
    } finally {
      setSaving(false);
    }
  };

  // ─ Tab 4: Services ───────────────────────────────────────────────────────────

  const saveService = async (
    id: number,
    data: Partial<Service>,
    categories: ServiceCategory[]
  ) => {
    try {
      const [svcRes, catRes] = await Promise.all([
        fetch(`/api/admin/services/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.title,
            subtitle: data.subtitle,
            intro: data.intro,
            why_choose: data.why_choose,
            cta_title: data.cta_title,
            cta_desc: data.cta_desc,
            display_order: data.display_order,
          }),
        }),
        fetch(`/api/admin/services/${id}/categories`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            categories.map((c, ci) => ({
              name: c.name,
              description: c.description,
              display_order: c.display_order ?? ci + 1,
              lists: c.lists.map((l, li) => ({
                list_title: l.list_title,
                items: l.items,
                display_order: l.display_order ?? li + 1,
              })),
            }))
          ),
        }),
      ]);
      if (!svcRes.ok || !catRes.ok) throw new Error();
      toast.success('Service saved');
      await fetchAll();
    } catch {
      toast.error('Failed to save service');
    }
  };

  const toggleService = async (id: number, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: active }),
      });
      if (!res.ok) throw new Error();
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: active } : s))
      );
      toast.success(`Service ${active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to toggle service');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  const handleLogout = () => signOut({ callbackUrl: '/admin/login' });

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <Settings size={20} />
              </div>
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">
                Site Settings
              </h1>
            </div>
            <p className="text-slate-500 font-medium">
              Manage site-wide content, contact info, and service listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-brand-600 hover:border-brand-100 transition-all"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="p-3 bg-white border border-red-200 rounded-2xl text-red-600 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-black transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-sm shadow-brand-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-100 hover:text-brand-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center gap-4 text-slate-400">
            <RefreshCw size={32} className="animate-spin" />
            <p className="font-medium text-sm">Loading settings…</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* ── Tab 1: Stats ─────────────────────────────────────────────── */}
            {activeTab === 'stats' && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6"
              >
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Homepage Hero Stats
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Established Year">
                    <input
                      className={INPUT_CLS}
                      value={settings.established_year ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, established_year: e.target.value }))
                      }
                      placeholder="e.g. 2015"
                    />
                  </Field>
                  <Field label="Total Clients">
                    <input
                      className={INPUT_CLS}
                      value={settings.total_clients ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, total_clients: e.target.value }))
                      }
                      placeholder="e.g. 1000+"
                    />
                  </Field>
                  <Field label="Units Installed">
                    <input
                      className={INPUT_CLS}
                      value={settings.units_installed ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, units_installed: e.target.value }))
                      }
                      placeholder="e.g. 5000+"
                    />
                  </Field>
                  <Field label="Industry Sectors">
                    <input
                      className={INPUT_CLS}
                      value={settings.industry_sectors ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, industry_sectors: e.target.value }))
                      }
                      placeholder="e.g. 10+"
                    />
                  </Field>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={saveStats}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white text-sm font-black rounded-2xl hover:bg-brand-700 disabled:opacity-60 transition-all shadow-sm shadow-brand-200"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Stats
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Tab 2: Contact ──────────────────────────────────────────── */}
            {activeTab === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6"
              >
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Contact &amp; Footer Info
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Phone Number">
                    <input
                      className={INPUT_CLS}
                      value={settings.company_phone ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, company_phone: e.target.value }))
                      }
                      placeholder="+91 96898 81369"
                    />
                  </Field>
                  <Field label="WhatsApp Number">
                    <input
                      className={INPUT_CLS}
                      value={settings.whatsapp_number ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, whatsapp_number: e.target.value }))
                      }
                      placeholder="+91 96898 81369"
                    />
                  </Field>
                  <Field label="Email Address">
                    <input
                      type="email"
                      className={INPUT_CLS}
                      value={settings.company_email ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, company_email: e.target.value }))
                      }
                      placeholder="sales@avegatasta.com"
                    />
                  </Field>
                  <Field label="LinkedIn URL">
                    <input
                      className={INPUT_CLS}
                      value={settings.social_linkedin ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, social_linkedin: e.target.value }))
                      }
                      placeholder="https://linkedin.com/company/…"
                    />
                  </Field>
                  <Field label="Instagram URL">
                    <input
                      className={INPUT_CLS}
                      value={settings.social_instagram ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, social_instagram: e.target.value }))
                      }
                      placeholder="https://instagram.com/…"
                    />
                  </Field>
                  <Field label="Facebook URL">
                    <input
                      className={INPUT_CLS}
                      value={settings.social_facebook ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, social_facebook: e.target.value }))
                      }
                      placeholder="https://facebook.com/…"
                    />
                  </Field>
                </div>
                <Field label="Physical Address">
                  <textarea
                    rows={2}
                    className={TEXTAREA_CLS}
                    value={settings.company_address ?? ''}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, company_address: e.target.value }))
                    }
                    placeholder="Avegatasta Solution, Nashik, Maharashtra"
                  />
                </Field>
                <Field label="Google Maps Embed URL">
                  <textarea
                    rows={3}
                    className={TEXTAREA_CLS}
                    value={settings.google_maps_url ?? ''}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, google_maps_url: e.target.value }))
                    }
                    placeholder="Paste the Google Maps embed src URL here…"
                  />
                </Field>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={saveContact}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white text-sm font-black rounded-2xl hover:bg-brand-700 disabled:opacity-60 transition-all shadow-sm shadow-brand-200"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Contact Info
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Tab 3: About ────────────────────────────────────────────── */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6"
              >
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  About Page Content
                </h2>
                <Field label="Company Introduction">
                  <textarea
                    rows={5}
                    className={TEXTAREA_CLS}
                    value={aboutContent.company_intro ?? ''}
                    onChange={(e) =>
                      setAboutContent((a) => ({ ...a, company_intro: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Mission Statement">
                  <textarea
                    rows={3}
                    className={TEXTAREA_CLS}
                    value={aboutContent.mission ?? ''}
                    onChange={(e) =>
                      setAboutContent((a) => ({ ...a, mission: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Vision Statement">
                  <textarea
                    rows={3}
                    className={TEXTAREA_CLS}
                    value={aboutContent.vision ?? ''}
                    onChange={(e) =>
                      setAboutContent((a) => ({ ...a, vision: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Why Choose Us Bullet Points">
                  <ListEditor
                    items={whyChooseItems}
                    onChange={setWhyChooseItems}
                    placeholder="Add a reason…"
                  />
                </Field>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={saveAbout}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white text-sm font-black rounded-2xl hover:bg-brand-700 disabled:opacity-60 transition-all shadow-sm shadow-brand-200"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Save About Page
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── Tab 4: Services ─────────────────────────────────────────── */}
            {activeTab === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4"
              >
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6">
                  <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                    Services Management
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Click &quot;Edit&quot; on any service to expand the full detail editor.
                  </p>
                </div>
                {services.length === 0 ? (
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-16 text-center">
                    <p className="text-slate-400 font-medium">No services found.</p>
                  </div>
                ) : (
                  services
                    .slice()
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((svc) => (
                      <ServiceEditor
                        key={svc.id}
                        service={svc}
                        onSave={saveService}
                        onToggle={toggleService}
                      />
                    ))
                )}
              </motion.div>
            )}

            {/* ── Tab: Integrations ───────────────────────────────────────── */}
            {activeTab === 'integrations' && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6"
              >
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Integrations &amp; Tracking
                </h2>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    checked={settings.analytics_enabled === 'true'}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        analytics_enabled: e.target.checked ? 'true' : 'false',
                      }))
                    }
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Enable analytics (Google Tag Manager &amp; Meta Pixel)
                  </span>
                </label>
                <p className="text-xs text-slate-400 -mt-3">
                  Leave OFF on staging/UAT. When off, no tracking scripts load on the public site.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Google Tag Manager ID">
                    <input
                      className={INPUT_CLS}
                      value={settings.gtm_id ?? ''}
                      onChange={(e) => setSettings((s) => ({ ...s, gtm_id: e.target.value }))}
                      placeholder="GTM-XXXXXXX"
                    />
                  </Field>
                  <Field label="Meta Pixel ID">
                    <input
                      className={INPUT_CLS}
                      value={settings.meta_pixel_id ?? ''}
                      onChange={(e) => setSettings((s) => ({ ...s, meta_pixel_id: e.target.value }))}
                      placeholder="123456789012345"
                    />
                  </Field>
                  <Field label="Google Maps API Key (server-side, reverse geocoding)">
                    <input
                      className={INPUT_CLS}
                      value={settings.google_maps_api_key ?? ''}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, google_maps_api_key: e.target.value }))
                      }
                      placeholder="AIza…"
                    />
                  </Field>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={saveIntegrations}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white text-sm font-black rounded-2xl hover:bg-brand-700 disabled:opacity-60 transition-all shadow-sm shadow-brand-200"
                  >
                    {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Integrations
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
}
