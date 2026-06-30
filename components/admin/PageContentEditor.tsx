'use client';

import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  GripVertical,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Save,
  Upload,
  X,
} from 'lucide-react';

type ContentTab = 'home' | 'services' | 'projects' | 'enterprise' | 'about' | 'contact';

interface SiteSettingsMap {
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

const INPUT_CLS =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10';

const TEXTAREA_CLS =
  'w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10';

function normalizeSettings(map: Record<string, string | null | undefined>): SiteSettingsMap {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [key, value ?? ''])
  ) as SiteSettingsMap;
}

type ListField = { key: string; label: string; multiline?: boolean };
type EditableObject = Record<string, string>;

function parseJsonArray<T>(value: string | undefined, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-black text-slate-950">{title}</h3>
        {description && <p className="mt-1 text-sm font-medium text-slate-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function ObjectListEditor({
  items,
  fields,
  onChange,
  addLabel = 'Add Item',
}: {
  items: EditableObject[];
  fields: ListField[];
  onChange: (items: EditableObject[]) => void;
  addLabel?: string;
}) {
  const add = () => {
    const item = Object.fromEntries(fields.map((field) => [field.key, ''])) as EditableObject;
    onChange([...items, item]);
  };

  const update = (idx: number, key: string, value: string) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, [key]: value } : item)));
  };

  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));

  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Item {idx + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white hover:text-slate-600 disabled:opacity-30"
                aria-label="Move item up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-white hover:text-slate-600 disabled:opacity-30"
                aria-label="Move item down"
              >
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Remove item"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {fields.map((field) => (
              <Field key={field.key} label={field.label}>
                {field.multiline ? (
                  <textarea
                    rows={3}
                    className={TEXTAREA_CLS}
                    value={item[field.key] ?? ''}
                    onChange={(e) => update(idx, field.key, e.target.value)}
                  />
                ) : (
                  <input
                    className={INPUT_CLS}
                    value={item[field.key] ?? ''}
                    onChange={(e) => update(idx, field.key, e.target.value)}
                  />
                )}
              </Field>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-2 text-xs font-black text-brand-600 transition-colors hover:bg-brand-100"
      >
        <Plus size={14} />
        {addLabel}
      </button>
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const toastId = toast.loading('Uploading image...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data?.url) throw new Error(data?.error || 'Upload failed');
      onChange(data.url);
      toast.success('Image uploaded', { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Field label={label}>
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center">
        <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon size={22} className="text-slate-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            className={INPUT_CLS}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL or uploaded path"
          />
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition-colors ${
              uploading
                ? 'bg-slate-100 text-slate-400'
                : 'bg-white text-brand-600 hover:bg-brand-50'
            }`}
          >
            {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </div>
    </Field>
  );
}

function ListEditor({
  items,
  onChange,
  placeholder = 'Add item...',
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
        <div key={`${idx}-${item}`} className="flex items-center gap-2">
          <GripVertical size={14} className="shrink-0 text-slate-300" />
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[idx] = e.target.value;
              onChange(next);
            }}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
          />
          <button
            type="button"
            onClick={() => move(idx, -1)}
            disabled={idx === 0}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-30"
            aria-label="Move item up"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => move(idx, 1)}
            disabled={idx === items.length - 1}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:opacity-30"
            aria-label="Move item down"
          >
            <ChevronDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => remove(idx)}
            className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Remove item"
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
        />
        <button
          type="button"
          onClick={add}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors hover:bg-brand-100"
          aria-label="Add list item"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

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
    service.categories.map((category) => ({
      ...category,
      description: category.description ?? '',
      lists: category.lists.map((list) => ({ ...list })),
    }))
  );

  const isActive = Boolean(service.is_active);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(service.id, form, categories);
    } finally {
      setSaving(false);
    }
  };

  const updateCategory = (idx: number, patch: Partial<ServiceCategory>) =>
    setCategories((current) =>
      current.map((category, i) => (i === idx ? { ...category, ...patch } : category))
    );

  const addCategory = () =>
    setCategories((current) => [
      ...current,
      { name: '', description: '', display_order: current.length + 1, lists: [] },
    ]);

  const removeCategory = (idx: number) =>
    setCategories((current) => current.filter((_, i) => i !== idx));

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
      lists: categories[catIdx].lists.map((list, i) =>
        i === listIdx ? { ...list, ...patch } : list
      ),
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-black text-brand-700">
            {service.display_order}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900">{service.title}</p>
            <p className="truncate text-xs font-semibold text-slate-400">{service.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle(service.id, !isActive)}
            className={`rounded-xl px-3 py-2 text-xs font-black transition-colors ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </button>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-brand-700 transition-colors hover:border-brand-200 hover:bg-brand-50"
          >
            <Edit2 size={13} />
            Edit
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-6 border-t border-slate-100 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Title">
              <input
                className={INPUT_CLS}
                value={form.title}
                onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
              />
            </Field>
            <Field label="Subtitle">
              <input
                className={INPUT_CLS}
                value={form.subtitle}
                onChange={(e) =>
                  setForm((current) => ({ ...current, subtitle: e.target.value }))
                }
              />
            </Field>
            <Field label="CTA Title">
              <input
                className={INPUT_CLS}
                value={form.cta_title}
                onChange={(e) =>
                  setForm((current) => ({ ...current, cta_title: e.target.value }))
                }
              />
            </Field>
            <Field label="Display Order">
              <input
                type="number"
                className={INPUT_CLS}
                value={form.display_order}
                onChange={(e) =>
                  setForm((current) => ({
                    ...current,
                    display_order: parseInt(e.target.value, 10) || 0,
                  }))
                }
              />
            </Field>
          </div>

          <Field label="Intro">
            <textarea
              rows={4}
              className={TEXTAREA_CLS}
              value={form.intro}
              onChange={(e) => setForm((current) => ({ ...current, intro: e.target.value }))}
            />
          </Field>

          <Field label="CTA Description">
            <textarea
              rows={3}
              className={TEXTAREA_CLS}
              value={form.cta_desc}
              onChange={(e) => setForm((current) => ({ ...current, cta_desc: e.target.value }))}
            />
          </Field>

          <Field label="Why Choose Us">
            <ListEditor
              items={form.why_choose}
              onChange={(items) => setForm((current) => ({ ...current, why_choose: items }))}
              placeholder="Add reason..."
            />
          </Field>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                Service Categories
              </span>
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-xs font-black text-brand-600 transition-colors hover:bg-brand-100"
              >
                <Plus size={13} />
                Add Category
              </button>
            </div>

            {categories.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-sm font-medium text-slate-400">
                No categories added.
              </p>
            ) : (
              categories.map((category, catIdx) => (
                <div key={catIdx} className="space-y-4 rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                      <Field label="Category Name">
                        <input
                          className={INPUT_CLS}
                          value={category.name}
                          onChange={(e) => updateCategory(catIdx, { name: e.target.value })}
                        />
                      </Field>
                      <Field label="Description">
                        <input
                          className={INPUT_CLS}
                          value={category.description}
                          onChange={(e) =>
                            updateCategory(catIdx, { description: e.target.value })
                          }
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCategory(catIdx)}
                      className="mt-7 rounded-xl p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      aria-label="Remove category"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="space-y-3 border-l-2 border-slate-100 pl-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        Sub-lists
                      </span>
                      <button
                        type="button"
                        onClick={() => addList(catIdx)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-black text-slate-600 transition-colors hover:bg-slate-200"
                      >
                        <Plus size={11} />
                        Add List
                      </button>
                    </div>

                    {category.lists.length === 0 ? (
                      <p className="text-xs font-medium text-slate-400">No sub-lists yet.</p>
                    ) : (
                      category.lists.map((list, listIdx) => (
                        <div key={listIdx} className="space-y-3 rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center gap-2">
                            <input
                              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10"
                              value={list.list_title}
                              onChange={(e) =>
                                updateList(catIdx, listIdx, { list_title: e.target.value })
                              }
                              placeholder="List title"
                            />
                            <button
                              type="button"
                              onClick={() => removeList(catIdx, listIdx)}
                              className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                              aria-label="Remove sub-list"
                            >
                              <X size={13} />
                            </button>
                          </div>
                          <ListEditor
                            items={list.items}
                            onChange={(items) => updateList(catIdx, listIdx, { items })}
                            placeholder="Add item..."
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              Save Service
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PageContentEditor({ activeTab }: { activeTab: ContentTab }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettingsMap>({});
  const [aboutContent, setAboutContent] = useState<Record<string, string>>({
    company_intro: '',
    mission: '',
    vision: '',
  });
  const [whyChooseItems, setWhyChooseItems] = useState<string[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsResult, aboutResult, servicesResult] = await Promise.allSettled([
        fetch('/api/admin/site-settings', { cache: 'no-store' }).then((res) => res.json()),
        fetch('/api/admin/about-content', { cache: 'no-store' }).then((res) => res.json()),
        fetch('/api/admin/services', { cache: 'no-store' }).then((res) => res.json()),
      ]);

      if (settingsResult.status === 'fulfilled' && settingsResult.value?.map) {
        const nextSettings = normalizeSettings(settingsResult.value.map);
        setSettings(nextSettings);
        try {
          const parsed = JSON.parse(nextSettings.about_why_choose ?? '[]');
          setWhyChooseItems(Array.isArray(parsed) ? parsed : []);
        } catch {
          setWhyChooseItems([]);
        }
      }

      if (aboutResult.status === 'fulfilled' && Array.isArray(aboutResult.value)) {
        const map: Record<string, string> = {};
        for (const row of aboutResult.value as AboutContent[]) {
          map[row.section] = row.content;
        }
        setAboutContent((current) => ({ ...current, ...map }));
      }

      if (servicesResult.status === 'fulfilled' && Array.isArray(servicesResult.value)) {
        setServices(
          servicesResult.value.map((service: Service) => ({
            ...service,
            why_choose: Array.isArray(service.why_choose) ? service.why_choose : [],
            categories: (service.categories ?? []).map((category: ServiceCategory) => ({
              ...category,
              description: category.description ?? '',
              lists: (category.lists ?? []).map((list: CategoryList) => ({
                ...list,
                items: Array.isArray(list.items) ? list.items : [],
              })),
            })),
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load page content:', error);
      toast.error('Failed to load page content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const setting = (key: string, fallback = '') => settings[key] ?? fallback;

  const setSetting = (key: string, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const setJsonSetting = (key: string, value: unknown) => {
    setSetting(key, JSON.stringify(value));
  };

  const saveSettings = async (keys: string[], successMessage: string, errorMessage: string) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keys.map((key) => ({ key, value: settings[key] ?? '' }))),
      });
      if (!res.ok) throw new Error(errorMessage);
      const data = await res.json();
      if (data?.map) setSettings(normalizeSettings(data.map));
      toast.success(successMessage);
    } catch {
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const saveContact = async () => {
    await saveSettings(
      [
        'company_phone',
        'company_email',
        'company_address',
        'company_address_short',
        'company_working_days',
        'company_working_hours',
        'whatsapp_number',
        'google_maps_url',
        'social_linkedin',
        'social_instagram',
        'social_facebook',
        'contact_hero_background_image',
        'contact_hero_eyebrow',
        'contact_hero_title',
        'contact_hero_highlight',
        'contact_hero_copy',
        'contact_hero_button_label',
        'contact_call_label',
        'contact_form_eyebrow',
        'contact_form_title',
        'contact_form_highlight',
        'contact_form_copy',
        'contact_solutions_title',
        'contact_solutions_copy',
        'contact_solution_items',
        'contact_trusted_title',
        'contact_trusted_copy',
        'contact_success_title',
        'contact_success_copy',
        'contact_success_button_label',
        'contact_faq_eyebrow',
        'contact_faq_title',
        'contact_faqs',
        'contact_map_title',
        'contact_map_copy',
        'contact_map_background_image',
        'contact_map_card_title',
        'contact_map_card_copy',
        'contact_map_button_label',
        'contact_directions_label',
        'footer_logo_image',
        'footer_brand_description',
        'footer_product_links',
        'footer_quick_links',
        'footer_distributor_label',
        'footer_distributor_brands',
        'footer_copyright_name',
        'footer_map_link_label',
        'footer_legal_links',
      ],
      'Contact and footer saved',
      'Failed to save contact and footer'
    );
  };

  const saveHomePage = async () => {
    await saveSettings(
      [
        'home_hero_badge',
        'home_hero_title',
        'home_hero_content',
        'home_hero_image_1',
        'home_hero_image_2',
        'home_hero_image_3',
        'home_hero_image_4',
        'home_hero_image_1_label',
        'home_hero_image_2_label',
        'home_hero_image_3_label',
        'home_hero_image_4_label',
        'home_primary_button_text',
        'home_primary_button_url',
        'home_secondary_button_text',
        'home_secondary_button_url',
        'home_trust_strip_text',
        'home_why_eyebrow',
        'home_why_title',
        'home_why_benefits',
        'home_why_image_1',
        'home_why_image_2',
        'home_enterprise_eyebrow',
        'home_enterprise_title',
        'home_enterprise_highlight',
        'home_enterprise_copy',
        'home_enterprise_image',
        'home_enterprise_button_text',
      ],
      'Home page saved',
      'Failed to save home page'
    );
  };

  const saveProjectsPage = async () => {
    await saveSettings(
      [
        'projects_hero_eyebrow',
        'projects_hero_title',
        'projects_hero_highlight',
        'projects_hero_copy_1',
        'projects_hero_copy_2',
        'projects_installation_types',
        'projects_process_eyebrow',
        'projects_process_title',
        'projects_process_copy',
        'projects_process_steps',
        'projects_trust_eyebrow',
        'projects_trust_title',
        'projects_trust_copy',
        'projects_trust_items',
      ],
      'Projects page saved',
      'Failed to save projects page'
    );
  };

  const saveEnterprisePage = async () => {
    await saveSettings(
      [
        'enterprise_hero_badge',
        'enterprise_hero_title',
        'enterprise_hero_highlight',
        'enterprise_hero_copy',
        'enterprise_hero_image',
        'enterprise_primary_button_text',
        'enterprise_secondary_button_text',
        'enterprise_trust_text',
        'enterprise_stats',
        'enterprise_client_eyebrow',
        'enterprise_client_title',
        'enterprise_client_highlight',
        'enterprise_client_copy',
        'enterprise_client_types',
        'enterprise_deliverables_eyebrow',
        'enterprise_deliverables_title',
        'enterprise_deliverables_copy',
        'enterprise_deliverables',
        'enterprise_why_items',
        'enterprise_why_image',
      ],
      'Enterprise page saved',
      'Failed to save enterprise page'
    );
  };

  const saveAbout = async () => {
    setSaving(true);
    try {
      const sections: AboutContent['section'][] = ['company_intro', 'mission', 'vision'];
      const sectionResults = await Promise.all(
        sections.map((section) =>
          fetch(`/api/admin/about-content/${section}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: aboutContent[section] ?? '' }),
          })
        )
      );

      if (sectionResults.some((res) => !res.ok)) {
        throw new Error('Failed to save about sections');
      }

      const res = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          { key: 'about_why_choose', value: JSON.stringify(whyChooseItems) },
          { key: 'about_hero_eyebrow', value: settings.about_hero_eyebrow ?? '' },
          { key: 'about_hero_title', value: settings.about_hero_title ?? '' },
          { key: 'about_what_eyebrow', value: settings.about_what_eyebrow ?? '' },
          { key: 'about_what_title', value: settings.about_what_title ?? '' },
          { key: 'about_what_description', value: settings.about_what_description ?? '' },
          { key: 'about_service_cards', value: settings.about_service_cards ?? '[]' },
          { key: 'about_mission_title', value: settings.about_mission_title ?? '' },
          { key: 'about_vision_title', value: settings.about_vision_title ?? '' },
          { key: 'about_why_image', value: settings.about_why_image ?? '' },
          { key: 'about_why_image_alt', value: settings.about_why_image_alt ?? '' },
          { key: 'about_why_eyebrow', value: settings.about_why_eyebrow ?? '' },
          { key: 'about_why_title', value: settings.about_why_title ?? '' },
          { key: 'about_quote', value: settings.about_quote ?? '' },
        ]),
      });
      if (!res.ok) throw new Error('Failed to save about bullet points');
      toast.success('About page saved');
    } catch {
      toast.error('Failed to save about page');
    } finally {
      setSaving(false);
    }
  };

  const saveServicesPage = async () => {
    await saveSettings(
      [
        'services_hero_eyebrow',
        'services_hero_title',
        'services_hero_copy',
        'services_installation_hero_eyebrow',
        'services_installation_hero_title',
        'services_installation_hero_copy',
        'services_areas_title',
        'services_areas_copy',
        'services_areas_items',
        'services_why_title',
        'services_contact_button_label',
      ],
      'Services page saved',
      'Failed to save services page'
    );
  };

  const saveService = async (
    id: number,
    data: Partial<Service>,
    categories: ServiceCategory[]
  ) => {
    try {
      const [serviceRes, categoriesRes] = await Promise.all([
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
            categories.map((category, categoryIdx) => ({
              name: category.name,
              description: category.description,
              display_order: category.display_order ?? categoryIdx + 1,
              lists: category.lists.map((list, listIdx) => ({
                list_title: list.list_title,
                items: list.items,
                display_order: list.display_order ?? listIdx + 1,
              })),
            }))
          ),
        }),
      ]);

      if (!serviceRes.ok || !categoriesRes.ok) throw new Error('Failed to save service');
      toast.success('Service saved');
      await fetchContent();
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
      if (!res.ok) throw new Error('Failed to update service status');
      setServices((current) =>
        current.map((service) =>
          service.id === id ? { ...service, is_active: active } : service
        )
      );
      toast.success(`Service ${active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update service status');
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <RefreshCw className="mx-auto mb-3 animate-spin text-brand-600" size={24} />
        <p className="text-sm font-bold text-slate-500">Loading page content...</p>
      </div>
    );
  }

  if (activeTab === 'home') {
    const homeBenefits = parseJsonArray<string>(settings.home_why_benefits, []);

    return (
      <section className="space-y-5">
        <SectionCard title="Home Hero" description="Controls the first visible Home page section and image collage.">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Badge">
              <input className={INPUT_CLS} value={setting('home_hero_badge')} onChange={(e) => setSetting('home_hero_badge', e.target.value)} />
            </Field>
            <Field label="Trust Strip Text">
              <input className={INPUT_CLS} value={setting('home_trust_strip_text')} onChange={(e) => setSetting('home_trust_strip_text', e.target.value)} />
            </Field>
          </div>
          <Field label="Hero Title HTML">
            <textarea rows={4} className={TEXTAREA_CLS} value={setting('home_hero_title')} onChange={(e) => setSetting('home_hero_title', e.target.value)} />
          </Field>
          <Field label="Hero Copy">
            <textarea rows={4} className={TEXTAREA_CLS} value={setting('home_hero_content')} onChange={(e) => setSetting('home_hero_content', e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Primary Button Text">
              <input className={INPUT_CLS} value={setting('home_primary_button_text')} onChange={(e) => setSetting('home_primary_button_text', e.target.value)} />
            </Field>
            <Field label="Primary Button URL">
              <input className={INPUT_CLS} value={setting('home_primary_button_url')} onChange={(e) => setSetting('home_primary_button_url', e.target.value)} />
            </Field>
            <Field label="Secondary Button Text">
              <input className={INPUT_CLS} value={setting('home_secondary_button_text')} onChange={(e) => setSetting('home_secondary_button_text', e.target.value)} />
            </Field>
            <Field label="Secondary Button URL">
              <input className={INPUT_CLS} value={setting('home_secondary_button_url')} onChange={(e) => setSetting('home_secondary_button_url', e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="space-y-3">
                <ImageField
                  label={`Hero Image ${index}`}
                  value={setting(`home_hero_image_${index}`)}
                  onChange={(value) => setSetting(`home_hero_image_${index}`, value)}
                />
                <Field label={`Image ${index} Label`}>
                  <input className={INPUT_CLS} value={setting(`home_hero_image_${index}_label`)} onChange={(e) => setSetting(`home_hero_image_${index}_label`, e.target.value)} />
                </Field>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Home Why Choose Us" description="Controls the dark split section on the Home page.">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow">
              <input className={INPUT_CLS} value={setting('home_why_eyebrow')} onChange={(e) => setSetting('home_why_eyebrow', e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={INPUT_CLS} value={setting('home_why_title')} onChange={(e) => setSetting('home_why_title', e.target.value)} />
            </Field>
          </div>
          <Field label="Benefits">
            <ListEditor items={homeBenefits} onChange={(items) => setJsonSetting('home_why_benefits', items)} placeholder="Add benefit..." />
          </Field>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ImageField label="First Image" value={setting('home_why_image_1')} onChange={(value) => setSetting('home_why_image_1', value)} />
            <ImageField label="Second Image" value={setting('home_why_image_2')} onChange={(value) => setSetting('home_why_image_2', value)} />
          </div>
        </SectionCard>

        <SectionCard title="Home Enterprise Section" description="Controls the enterprise callout on the Home page.">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow">
              <input className={INPUT_CLS} value={setting('home_enterprise_eyebrow')} onChange={(e) => setSetting('home_enterprise_eyebrow', e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={INPUT_CLS} value={setting('home_enterprise_title')} onChange={(e) => setSetting('home_enterprise_title', e.target.value)} />
            </Field>
            <Field label="Highlighted Text">
              <input className={INPUT_CLS} value={setting('home_enterprise_highlight')} onChange={(e) => setSetting('home_enterprise_highlight', e.target.value)} />
            </Field>
            <Field label="Button Text">
              <input className={INPUT_CLS} value={setting('home_enterprise_button_text')} onChange={(e) => setSetting('home_enterprise_button_text', e.target.value)} />
            </Field>
          </div>
          <Field label="Copy">
            <textarea rows={4} className={TEXTAREA_CLS} value={setting('home_enterprise_copy')} onChange={(e) => setSetting('home_enterprise_copy', e.target.value)} />
          </Field>
          <ImageField label="Enterprise Image" value={setting('home_enterprise_image')} onChange={(value) => setSetting('home_enterprise_image', value)} />
        </SectionCard>

        <div className="flex justify-end">
          <button type="button" onClick={saveHomePage} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-700 disabled:opacity-60">
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Home Page
          </button>
        </div>
      </section>
    );
  }

  if (activeTab === 'projects') {
    const projectTypes = parseJsonArray<EditableObject>(settings.projects_installation_types, []);
    const projectSteps = parseJsonArray<string>(settings.projects_process_steps, []);
    const projectTrustItems = parseJsonArray<string>(settings.projects_trust_items, []);

    return (
      <section className="space-y-5">
        <SectionCard title="Projects Hero">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow"><input className={INPUT_CLS} value={setting('projects_hero_eyebrow')} onChange={(e) => setSetting('projects_hero_eyebrow', e.target.value)} /></Field>
            <Field label="Title"><input className={INPUT_CLS} value={setting('projects_hero_title')} onChange={(e) => setSetting('projects_hero_title', e.target.value)} /></Field>
            <Field label="Highlighted Text"><input className={INPUT_CLS} value={setting('projects_hero_highlight')} onChange={(e) => setSetting('projects_hero_highlight', e.target.value)} /></Field>
          </div>
          <Field label="Copy Paragraph 1"><textarea rows={4} className={TEXTAREA_CLS} value={setting('projects_hero_copy_1')} onChange={(e) => setSetting('projects_hero_copy_1', e.target.value)} /></Field>
          <Field label="Copy Paragraph 2"><textarea rows={4} className={TEXTAREA_CLS} value={setting('projects_hero_copy_2')} onChange={(e) => setSetting('projects_hero_copy_2', e.target.value)} /></Field>
        </SectionCard>

        <SectionCard title="Project Installation Types">
          <ObjectListEditor
            items={projectTypes}
            fields={[
              { key: 'id', label: 'ID' },
              { key: 'title', label: 'Title' },
              { key: 'intro', label: 'Intro', multiline: true },
            ]}
            onChange={(items) => setJsonSetting('projects_installation_types', items)}
            addLabel="Add Project Type"
          />
        </SectionCard>

        <SectionCard title="How We Work">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow"><input className={INPUT_CLS} value={setting('projects_process_eyebrow')} onChange={(e) => setSetting('projects_process_eyebrow', e.target.value)} /></Field>
            <Field label="Title"><input className={INPUT_CLS} value={setting('projects_process_title')} onChange={(e) => setSetting('projects_process_title', e.target.value)} /></Field>
          </div>
          <Field label="Copy"><textarea rows={3} className={TEXTAREA_CLS} value={setting('projects_process_copy')} onChange={(e) => setSetting('projects_process_copy', e.target.value)} /></Field>
          <Field label="Process Steps"><ListEditor items={projectSteps} onChange={(items) => setJsonSetting('projects_process_steps', items)} placeholder="Add process step..." /></Field>
        </SectionCard>

        <SectionCard title="Why Customers Trust Us">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow"><input className={INPUT_CLS} value={setting('projects_trust_eyebrow')} onChange={(e) => setSetting('projects_trust_eyebrow', e.target.value)} /></Field>
            <Field label="Title"><input className={INPUT_CLS} value={setting('projects_trust_title')} onChange={(e) => setSetting('projects_trust_title', e.target.value)} /></Field>
          </div>
          <Field label="Copy"><textarea rows={3} className={TEXTAREA_CLS} value={setting('projects_trust_copy')} onChange={(e) => setSetting('projects_trust_copy', e.target.value)} /></Field>
          <Field label="Trust Items"><ListEditor items={projectTrustItems} onChange={(items) => setJsonSetting('projects_trust_items', items)} placeholder="Add trust item..." /></Field>
        </SectionCard>

        <div className="flex justify-end">
          <button type="button" onClick={saveProjectsPage} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-700 disabled:opacity-60">
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Projects Page
          </button>
        </div>
      </section>
    );
  }

  if (activeTab === 'enterprise') {
    const enterpriseStats = parseJsonArray<EditableObject>(settings.enterprise_stats, []);
    const enterpriseClients = parseJsonArray<EditableObject>(settings.enterprise_client_types, []);
    const enterpriseDeliverables = parseJsonArray<EditableObject>(settings.enterprise_deliverables, []);
    const enterpriseWhyItems = parseJsonArray<string>(settings.enterprise_why_items, []);

    return (
      <section className="space-y-5">
        <SectionCard title="Enterprise Hero">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Badge"><input className={INPUT_CLS} value={setting('enterprise_hero_badge')} onChange={(e) => setSetting('enterprise_hero_badge', e.target.value)} /></Field>
            <Field label="Title"><input className={INPUT_CLS} value={setting('enterprise_hero_title')} onChange={(e) => setSetting('enterprise_hero_title', e.target.value)} /></Field>
            <Field label="Highlighted Text"><input className={INPUT_CLS} value={setting('enterprise_hero_highlight')} onChange={(e) => setSetting('enterprise_hero_highlight', e.target.value)} /></Field>
            <Field label="Primary Button Text"><input className={INPUT_CLS} value={setting('enterprise_primary_button_text')} onChange={(e) => setSetting('enterprise_primary_button_text', e.target.value)} /></Field>
            <Field label="Secondary Button Text"><input className={INPUT_CLS} value={setting('enterprise_secondary_button_text')} onChange={(e) => setSetting('enterprise_secondary_button_text', e.target.value)} /></Field>
          </div>
          <Field label="Hero Copy"><textarea rows={4} className={TEXTAREA_CLS} value={setting('enterprise_hero_copy')} onChange={(e) => setSetting('enterprise_hero_copy', e.target.value)} /></Field>
          <Field label="Trust Text"><input className={INPUT_CLS} value={setting('enterprise_trust_text')} onChange={(e) => setSetting('enterprise_trust_text', e.target.value)} /></Field>
          <ImageField label="Hero Image" value={setting('enterprise_hero_image')} onChange={(value) => setSetting('enterprise_hero_image', value)} />
          <ObjectListEditor items={enterpriseStats} fields={[{ key: 'value', label: 'Value' }, { key: 'label', label: 'Label' }]} onChange={(items) => setJsonSetting('enterprise_stats', items)} addLabel="Add Stat" />
        </SectionCard>

        <SectionCard title="Enterprise Client Types">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow"><input className={INPUT_CLS} value={setting('enterprise_client_eyebrow')} onChange={(e) => setSetting('enterprise_client_eyebrow', e.target.value)} /></Field>
            <Field label="Title"><input className={INPUT_CLS} value={setting('enterprise_client_title')} onChange={(e) => setSetting('enterprise_client_title', e.target.value)} /></Field>
            <Field label="Highlighted Text"><input className={INPUT_CLS} value={setting('enterprise_client_highlight')} onChange={(e) => setSetting('enterprise_client_highlight', e.target.value)} /></Field>
          </div>
          <Field label="Copy"><textarea rows={4} className={TEXTAREA_CLS} value={setting('enterprise_client_copy')} onChange={(e) => setSetting('enterprise_client_copy', e.target.value)} /></Field>
          <ObjectListEditor items={enterpriseClients} fields={[{ key: 'label', label: 'Label' }, { key: 'description', label: 'Description', multiline: true }]} onChange={(items) => setJsonSetting('enterprise_client_types', items)} addLabel="Add Client Type" />
        </SectionCard>

        <SectionCard title="Enterprise Deliverables & Why Us">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Deliverables Eyebrow"><input className={INPUT_CLS} value={setting('enterprise_deliverables_eyebrow')} onChange={(e) => setSetting('enterprise_deliverables_eyebrow', e.target.value)} /></Field>
            <Field label="Deliverables Title"><input className={INPUT_CLS} value={setting('enterprise_deliverables_title')} onChange={(e) => setSetting('enterprise_deliverables_title', e.target.value)} /></Field>
          </div>
          <Field label="Deliverables Copy"><textarea rows={4} className={TEXTAREA_CLS} value={setting('enterprise_deliverables_copy')} onChange={(e) => setSetting('enterprise_deliverables_copy', e.target.value)} /></Field>
          <ObjectListEditor items={enterpriseDeliverables} fields={[{ key: 'title', label: 'Title' }, { key: 'body', label: 'Body', multiline: true }]} onChange={(items) => setJsonSetting('enterprise_deliverables', items)} addLabel="Add Deliverable" />
          <Field label="Why Us Items"><ListEditor items={enterpriseWhyItems} onChange={(items) => setJsonSetting('enterprise_why_items', items)} placeholder="Add why-us item..." /></Field>
          <ImageField label="Why Us Image" value={setting('enterprise_why_image')} onChange={(value) => setSetting('enterprise_why_image', value)} />
        </SectionCard>

        <div className="flex justify-end">
          <button type="button" onClick={saveEnterprisePage} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-700 disabled:opacity-60">
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Enterprise Page
          </button>
        </div>
      </section>
    );
  }

  if (activeTab === 'contact') {
    const solutionItems = parseJsonArray<string>(settings.contact_solution_items, []);
    const contactFaqs = parseJsonArray<EditableObject>(settings.contact_faqs, []);
    const productLinks = parseJsonArray<EditableObject>(settings.footer_product_links, []);
    const quickLinks = parseJsonArray<EditableObject>(settings.footer_quick_links, []);
    const legalLinks = parseJsonArray<EditableObject>(settings.footer_legal_links, []);
    const distributorBrands = parseJsonArray<string>(settings.footer_distributor_brands, []);

    return (
      <section className="space-y-5">
        <SectionCard
          title="Contact Page Hero"
          description="Controls the first full-width contact section and its background image."
        >
          <ImageField
            label="Hero Background Image"
            value={setting('contact_hero_background_image')}
            onChange={(value) => setSetting('contact_hero_background_image', value)}
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow">
              <input className={INPUT_CLS} value={setting('contact_hero_eyebrow')} onChange={(e) => setSetting('contact_hero_eyebrow', e.target.value)} />
            </Field>
            <Field label="Button Label">
              <input className={INPUT_CLS} value={setting('contact_hero_button_label')} onChange={(e) => setSetting('contact_hero_button_label', e.target.value)} />
            </Field>
            <Field label="Main Title">
              <input className={INPUT_CLS} value={setting('contact_hero_title')} onChange={(e) => setSetting('contact_hero_title', e.target.value)} />
            </Field>
            <Field label="Highlighted Title Text">
              <input className={INPUT_CLS} value={setting('contact_hero_highlight')} onChange={(e) => setSetting('contact_hero_highlight', e.target.value)} />
            </Field>
          </div>
          <Field label="Hero Copy">
            <textarea rows={4} className={TEXTAREA_CLS} value={setting('contact_hero_copy')} onChange={(e) => setSetting('contact_hero_copy', e.target.value)} />
          </Field>
        </SectionCard>

        <SectionCard title="Contact Details" description="Used by the contact cards, map details, WhatsApp link, and footer.">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Phone Number">
              <input className={INPUT_CLS} value={settings.company_phone ?? ''} onChange={(e) => setSetting('company_phone', e.target.value)} />
            </Field>
            <Field label="WhatsApp Number">
              <input className={INPUT_CLS} value={settings.whatsapp_number ?? ''} onChange={(e) => setSetting('whatsapp_number', e.target.value)} />
            </Field>
            <Field label="Email Address">
              <input type="email" className={INPUT_CLS} value={settings.company_email ?? ''} onChange={(e) => setSetting('company_email', e.target.value)} />
            </Field>
            <Field label="Short Address">
              <input className={INPUT_CLS} value={setting('company_address_short')} onChange={(e) => setSetting('company_address_short', e.target.value)} />
            </Field>
            <Field label="Working Days">
              <input className={INPUT_CLS} value={setting('company_working_days')} onChange={(e) => setSetting('company_working_days', e.target.value)} />
            </Field>
            <Field label="Working Hours">
              <input className={INPUT_CLS} value={setting('company_working_hours')} onChange={(e) => setSetting('company_working_hours', e.target.value)} />
            </Field>
            <Field label="Call Label">
              <input className={INPUT_CLS} value={setting('contact_call_label')} onChange={(e) => setSetting('contact_call_label', e.target.value)} />
            </Field>
            <Field label="Google Maps URL">
              <input className={INPUT_CLS} value={settings.google_maps_url ?? ''} onChange={(e) => setSetting('google_maps_url', e.target.value)} />
            </Field>
          </div>
          <Field label="Physical Address">
            <textarea rows={3} className={TEXTAREA_CLS} value={settings.company_address ?? ''} onChange={(e) => setSetting('company_address', e.target.value)} />
          </Field>
        </SectionCard>

        <SectionCard title="Consultation Section" description="Controls the text beside the contact form.">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow">
              <input className={INPUT_CLS} value={setting('contact_form_eyebrow')} onChange={(e) => setSetting('contact_form_eyebrow', e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={INPUT_CLS} value={setting('contact_form_title')} onChange={(e) => setSetting('contact_form_title', e.target.value)} />
            </Field>
            <Field label="Highlighted Title Text">
              <input className={INPUT_CLS} value={setting('contact_form_highlight')} onChange={(e) => setSetting('contact_form_highlight', e.target.value)} />
            </Field>
            <Field label="Solutions Heading">
              <input className={INPUT_CLS} value={setting('contact_solutions_title')} onChange={(e) => setSetting('contact_solutions_title', e.target.value)} />
            </Field>
          </div>
          <Field label="Section Copy">
            <textarea rows={4} className={TEXTAREA_CLS} value={setting('contact_form_copy')} onChange={(e) => setSetting('contact_form_copy', e.target.value)} />
          </Field>
          <Field label="Solutions Intro">
            <input className={INPUT_CLS} value={setting('contact_solutions_copy')} onChange={(e) => setSetting('contact_solutions_copy', e.target.value)} />
          </Field>
          <Field label="Solution Items">
            <ListEditor items={solutionItems} onChange={(items) => setJsonSetting('contact_solution_items', items)} placeholder="Add solution..." />
          </Field>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Trusted Brands Title">
              <input className={INPUT_CLS} value={setting('contact_trusted_title')} onChange={(e) => setSetting('contact_trusted_title', e.target.value)} />
            </Field>
            <Field label="Success Title">
              <input className={INPUT_CLS} value={setting('contact_success_title')} onChange={(e) => setSetting('contact_success_title', e.target.value)} />
            </Field>
          </div>
          <Field label="Trusted Brands Copy">
            <textarea rows={3} className={TEXTAREA_CLS} value={setting('contact_trusted_copy')} onChange={(e) => setSetting('contact_trusted_copy', e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Success Copy">
              <input className={INPUT_CLS} value={setting('contact_success_copy')} onChange={(e) => setSetting('contact_success_copy', e.target.value)} />
            </Field>
            <Field label="Success Button Label">
              <input className={INPUT_CLS} value={setting('contact_success_button_label')} onChange={(e) => setSetting('contact_success_button_label', e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="FAQ Section">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow">
              <input className={INPUT_CLS} value={setting('contact_faq_eyebrow')} onChange={(e) => setSetting('contact_faq_eyebrow', e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={INPUT_CLS} value={setting('contact_faq_title')} onChange={(e) => setSetting('contact_faq_title', e.target.value)} />
            </Field>
          </div>
          <ObjectListEditor
            items={contactFaqs}
            fields={[
              { key: 'question', label: 'Question' },
              { key: 'answer', label: 'Answer', multiline: true },
            ]}
            onChange={(items) => setJsonSetting('contact_faqs', items)}
            addLabel="Add FAQ"
          />
        </SectionCard>

        <SectionCard title="Map Section" description="Controls the final visitors-area section and map background image.">
          <ImageField
            label="Map Background Image"
            value={setting('contact_map_background_image')}
            onChange={(value) => setSetting('contact_map_background_image', value)}
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Title">
              <input className={INPUT_CLS} value={setting('contact_map_title')} onChange={(e) => setSetting('contact_map_title', e.target.value)} />
            </Field>
            <Field label="Directions Label">
              <input className={INPUT_CLS} value={setting('contact_directions_label')} onChange={(e) => setSetting('contact_directions_label', e.target.value)} />
            </Field>
            <Field label="Map Card Title">
              <input className={INPUT_CLS} value={setting('contact_map_card_title')} onChange={(e) => setSetting('contact_map_card_title', e.target.value)} />
            </Field>
            <Field label="Map Button Label">
              <input className={INPUT_CLS} value={setting('contact_map_button_label')} onChange={(e) => setSetting('contact_map_button_label', e.target.value)} />
            </Field>
          </div>
          <Field label="Section Copy">
            <textarea rows={3} className={TEXTAREA_CLS} value={setting('contact_map_copy')} onChange={(e) => setSetting('contact_map_copy', e.target.value)} />
          </Field>
          <Field label="Map Card Copy">
            <textarea rows={3} className={TEXTAREA_CLS} value={setting('contact_map_card_copy')} onChange={(e) => setSetting('contact_map_card_copy', e.target.value)} />
          </Field>
        </SectionCard>

        <SectionCard title="Footer" description="Controls footer logo, description, links, brands, and legal links.">
          <ImageField label="Footer Logo" value={setting('footer_logo_image')} onChange={(value) => setSetting('footer_logo_image', value)} />
          <Field label="Footer Description">
            <textarea rows={3} className={TEXTAREA_CLS} value={setting('footer_brand_description')} onChange={(e) => setSetting('footer_brand_description', e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Field label="LinkedIn URL">
              <input className={INPUT_CLS} value={settings.social_linkedin ?? ''} onChange={(e) => setSetting('social_linkedin', e.target.value)} />
            </Field>
            <Field label="Instagram URL">
              <input className={INPUT_CLS} value={settings.social_instagram ?? ''} onChange={(e) => setSetting('social_instagram', e.target.value)} />
            </Field>
            <Field label="Facebook URL">
              <input className={INPUT_CLS} value={settings.social_facebook ?? ''} onChange={(e) => setSetting('social_facebook', e.target.value)} />
            </Field>
          </div>
          <Field label="Product Links">
            <ObjectListEditor items={productLinks} fields={[{ key: 'name', label: 'Name' }, { key: 'href', label: 'URL' }]} onChange={(items) => setJsonSetting('footer_product_links', items)} addLabel="Add Product Link" />
          </Field>
          <Field label="Quick Links">
            <ObjectListEditor items={quickLinks} fields={[{ key: 'name', label: 'Name' }, { key: 'href', label: 'URL' }]} onChange={(items) => setJsonSetting('footer_quick_links', items)} addLabel="Add Quick Link" />
          </Field>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Distributor Label">
              <input className={INPUT_CLS} value={setting('footer_distributor_label')} onChange={(e) => setSetting('footer_distributor_label', e.target.value)} />
            </Field>
            <Field label="Copyright Name">
              <input className={INPUT_CLS} value={setting('footer_copyright_name')} onChange={(e) => setSetting('footer_copyright_name', e.target.value)} />
            </Field>
          </div>
          <Field label="Distributor Brands">
            <ListEditor items={distributorBrands} onChange={(items) => setJsonSetting('footer_distributor_brands', items)} placeholder="Add brand..." />
          </Field>
          <Field label="Map Link Label">
            <input className={INPUT_CLS} value={setting('footer_map_link_label')} onChange={(e) => setSetting('footer_map_link_label', e.target.value)} />
          </Field>
          <Field label="Legal Links">
            <ObjectListEditor items={legalLinks} fields={[{ key: 'name', label: 'Name' }, { key: 'href', label: 'URL' }]} onChange={(items) => setJsonSetting('footer_legal_links', items)} addLabel="Add Legal Link" />
          </Field>
        </SectionCard>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveContact}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Contact & Footer
          </button>
        </div>
      </section>
    );
  }

  if (activeTab === 'about') {
    const aboutServiceCards = parseJsonArray<EditableObject>(settings.about_service_cards, []);

    return (
      <section className="space-y-5">
        <SectionCard title="About Page" description="Controls all visible About page sections and the Why Choose image.">
          <h2 className="text-lg font-black text-slate-950">About Page</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Hero Eyebrow">
              <input className={INPUT_CLS} value={setting('about_hero_eyebrow')} onChange={(e) => setSetting('about_hero_eyebrow', e.target.value)} />
            </Field>
            <Field label="Hero Title">
              <input className={INPUT_CLS} value={setting('about_hero_title')} onChange={(e) => setSetting('about_hero_title', e.target.value)} />
            </Field>
          </div>
          <Field label="Company Introduction">
            <textarea
              rows={6}
              className={TEXTAREA_CLS}
              value={aboutContent.company_intro ?? ''}
              onChange={(e) => setAboutContent((current) => ({ ...current, company_intro: e.target.value }))}
            />
          </Field>
        </SectionCard>

        <SectionCard title="What We Do">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Eyebrow">
              <input className={INPUT_CLS} value={setting('about_what_eyebrow')} onChange={(e) => setSetting('about_what_eyebrow', e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={INPUT_CLS} value={setting('about_what_title')} onChange={(e) => setSetting('about_what_title', e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={4} className={TEXTAREA_CLS} value={setting('about_what_description')} onChange={(e) => setSetting('about_what_description', e.target.value)} />
          </Field>
          <ObjectListEditor
            items={aboutServiceCards}
            fields={[
              { key: 'title', label: 'Card Title' },
              { key: 'icon', label: 'Icon Name' },
              { key: 'description', label: 'Card Description', multiline: true },
            ]}
            onChange={(items) => setJsonSetting('about_service_cards', items)}
            addLabel="Add Service Card"
          />
        </SectionCard>

        <SectionCard title="Mission & Vision">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Mission Title">
              <input className={INPUT_CLS} value={setting('about_mission_title')} onChange={(e) => setSetting('about_mission_title', e.target.value)} />
            </Field>
            <Field label="Vision Title">
              <input className={INPUT_CLS} value={setting('about_vision_title')} onChange={(e) => setSetting('about_vision_title', e.target.value)} />
            </Field>
            <Field label="Mission Statement">
              <textarea
                rows={4}
                className={TEXTAREA_CLS}
                value={aboutContent.mission ?? ''}
                onChange={(e) => setAboutContent((current) => ({ ...current, mission: e.target.value }))}
              />
            </Field>
            <Field label="Vision Statement">
              <textarea
                rows={4}
                className={TEXTAREA_CLS}
                value={aboutContent.vision ?? ''}
                onChange={(e) => setAboutContent((current) => ({ ...current, vision: e.target.value }))}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Why Choose Us">
          <ImageField label="Section Image" value={setting('about_why_image')} onChange={(value) => setSetting('about_why_image', value)} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Image Alt Text">
              <input className={INPUT_CLS} value={setting('about_why_image_alt')} onChange={(e) => setSetting('about_why_image_alt', e.target.value)} />
            </Field>
            <Field label="Eyebrow">
              <input className={INPUT_CLS} value={setting('about_why_eyebrow')} onChange={(e) => setSetting('about_why_eyebrow', e.target.value)} />
            </Field>
            <Field label="Title">
              <input className={INPUT_CLS} value={setting('about_why_title')} onChange={(e) => setSetting('about_why_title', e.target.value)} />
            </Field>
          </div>
          <Field label="Bullet Points">
            <ListEditor
              items={whyChooseItems}
              onChange={setWhyChooseItems}
              placeholder="Add a reason..."
            />
          </Field>
          <Field label="Quote">
            <textarea rows={3} className={TEXTAREA_CLS} value={setting('about_quote')} onChange={(e) => setSetting('about_quote', e.target.value)} />
          </Field>
        </SectionCard>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveAbout}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save About Page
          </button>
        </div>
      </section>
    );
  }

  const serviceAreaItems = parseJsonArray<string>(settings.services_areas_items, []);

  return (
    <section className="space-y-4">
      <SectionCard
        title="Services Page"
        description="Controls the public Services page hero, installation-page hero, service area section, and shared CTA labels."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Hero Eyebrow">
            <input className={INPUT_CLS} value={setting('services_hero_eyebrow')} onChange={(e) => setSetting('services_hero_eyebrow', e.target.value)} />
          </Field>
          <Field label="Hero Title">
            <input className={INPUT_CLS} value={setting('services_hero_title')} onChange={(e) => setSetting('services_hero_title', e.target.value)} />
          </Field>
        </div>
        <Field label="Hero Copy">
          <textarea rows={4} className={TEXTAREA_CLS} value={setting('services_hero_copy')} onChange={(e) => setSetting('services_hero_copy', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Installation Hero Eyebrow">
            <input className={INPUT_CLS} value={setting('services_installation_hero_eyebrow')} onChange={(e) => setSetting('services_installation_hero_eyebrow', e.target.value)} />
          </Field>
          <Field label="Installation Hero Title">
            <input className={INPUT_CLS} value={setting('services_installation_hero_title')} onChange={(e) => setSetting('services_installation_hero_title', e.target.value)} />
          </Field>
        </div>
        <Field label="Installation Hero Copy">
          <textarea rows={4} className={TEXTAREA_CLS} value={setting('services_installation_hero_copy')} onChange={(e) => setSetting('services_installation_hero_copy', e.target.value)} />
        </Field>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Service Areas Title">
            <input className={INPUT_CLS} value={setting('services_areas_title')} onChange={(e) => setSetting('services_areas_title', e.target.value)} />
          </Field>
          <Field label="Service Areas Copy">
            <input className={INPUT_CLS} value={setting('services_areas_copy')} onChange={(e) => setSetting('services_areas_copy', e.target.value)} />
          </Field>
          <Field label="Why Choose Title">
            <input className={INPUT_CLS} value={setting('services_why_title')} onChange={(e) => setSetting('services_why_title', e.target.value)} />
          </Field>
          <Field label="Contact Button Label">
            <input className={INPUT_CLS} value={setting('services_contact_button_label')} onChange={(e) => setSetting('services_contact_button_label', e.target.value)} />
          </Field>
        </div>
        <Field label="Service Area Items">
          <ListEditor items={serviceAreaItems} onChange={(items) => setJsonSetting('services_areas_items', items)} placeholder="Add service area..." />
        </Field>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveServicesPage}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-black text-white shadow-sm shadow-brand-200 transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            Save Services Page
          </button>
        </div>
      </SectionCard>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">Services</h2>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Edit service page titles, CTA copy, reasons, categories, and sub-lists.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-400">No services found.</p>
        </div>
      ) : (
        services
          .slice()
          .sort((a, b) => a.display_order - b.display_order)
          .map((service) => (
            <ServiceEditor
              key={service.id}
              service={service}
              onSave={saveService}
              onToggle={toggleService}
            />
          ))
      )}
    </section>
  );
}
