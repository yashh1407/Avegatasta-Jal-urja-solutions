'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, Upload, X, MapPin, Image as ImageIcon, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GpsResult {
  filename: string;
  lat: number;
  lng: number;
}

interface FormFields {
  title: string;
  slug: string;
  summary: string;
  description: string;
  category: string;
  client_name: string;
  location_name: string;
  status: 'draft' | 'published' | 'archived';
}

export interface CaseStudyInitialData extends FormFields {
  id: number;
  cover_image: string | null;
  images: string[];
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  mode: 'new' | 'edit';
  initialData?: CaseStudyInitialData;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const EMPTY_FORM: FormFields = {
  title: '',
  slug: '',
  summary: '',
  description: '',
  category: '',
  client_name: '',
  location_name: '',
  status: 'draft',
};

const inputClass =
  'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition-all';

// ─── Component ────────────────────────────────────────────────────────────────

export default function CaseStudyForm({ mode, initialData }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<FormFields>(
    initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          summary: initialData.summary,
          description: initialData.description,
          category: initialData.category,
          client_name: initialData.client_name,
          location_name: initialData.location_name,
          status: initialData.status,
        }
      : EMPTY_FORM
  );

  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.cover_image ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>(initialData?.images ?? []);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [gpsResults, setGpsResults] = useState<GpsResult[]>([]);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title (only when user hasn't manually edited it)
  useEffect(() => {
    if (!slugEdited && form.title) {
      setForm((f) => ({ ...f, slug: slugify(form.title) }));
    }
  }, [form.title, slugEdited]);

  const set =
    (key: keyof FormFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      if (key === 'slug') setSlugEdited(true);
      setForm((f) => ({ ...f, [key]: e.target.value }));
    };

  const onCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
  };

  const onGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeGalleryNew = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeGalleryExisting = (url: string) => {
    setGalleryUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async (submitStatus: 'draft' | 'published') => {
    if (!form.title.trim()) {
      setError('Title is required.');
      toast.error('Title is required.');
      return;
    }
    if (!form.slug.trim()) {
      setError('Slug is required.');
      toast.error('Slug is required.');
      return;
    }

    setSaving(true);
    setError('');
    setGpsResults([]);

    const textPayload = {
      title: form.title,
      slug: form.slug,
      summary: form.summary,
      description: form.description,
      category: form.category,
      client_name: form.client_name,
      location_name: form.location_name,
      status: submitStatus,
    };

    try {
      let csId: number;

      // Step 1: Create (new) or prepare (edit)
      if (mode === 'new') {
        const res = await fetch('/api/admin/case-studies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(textPayload),
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || 'Failed to create case study.');
        }
        const created = await res.json();
        csId = created.id;
      } else {
        csId = initialData!.id;
      }

      // Step 2: Upload images and collect results
      const detectedGps: GpsResult[] = [];
      let finalCoverUrl: string | null = coverFile ? null : coverPreview;

      if (coverFile) {
        const fd = new FormData();
        fd.append('file', coverFile);
        const res = await fetch(`/api/admin/case-studies/${csId}/upload-image`, {
          method: 'POST',
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          finalCoverUrl = data.url;
          if (data.gps) {
            detectedGps.push({ filename: coverFile.name, lat: data.gps.latitude, lng: data.gps.longitude });
          }
        }
      }

      const newGalleryUrls: string[] = [];
      for (const file of galleryFiles) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(`/api/admin/case-studies/${csId}/upload-image`, {
          method: 'POST',
          body: fd,
        });
        if (res.ok) {
          const data = await res.json();
          newGalleryUrls.push(data.url);
          if (data.gps) {
            detectedGps.push({ filename: file.name, lat: data.gps.latitude, lng: data.gps.longitude });
          }
        }
      }

      const finalImages = [...galleryUrls, ...newGalleryUrls];

      // Step 3: Final PUT — update all fields including cover + gallery
      const updatePayload =
        mode === 'edit'
          ? { ...textPayload, cover_image: finalCoverUrl, images: finalImages }
          : { cover_image: finalCoverUrl, images: finalImages };

      await fetch(`/api/admin/case-studies/${csId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      toast.success(
        mode === 'new'
          ? submitStatus === 'published'
            ? 'Case study created and published.'
            : 'Case study saved as draft.'
          : 'Case study updated.'
      );

      // Show GPS results briefly, then navigate
      if (detectedGps.length > 0) {
        setGpsResults(detectedGps);
        setTimeout(() => router.push('/admin/case-studies'), 3000);
      } else {
        router.push('/admin/case-studies');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Back link */}
      <Link
        href="/admin/case-studies"
        className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Case Studies
      </Link>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 font-medium bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
      )}

      {/* GPS confirmation panel */}
      <AnimatePresence>
        {gpsResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 space-y-2"
          >
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} className="text-emerald-600" />
              <p className="text-sm font-black text-emerald-800">GPS Data Detected</p>
            </div>
            {gpsResults.map((g, i) => (
              <p key={i} className="text-xs text-emerald-700 font-medium">
                <span className="font-black">{g.filename}</span>: {g.lat.toFixed(6)}°N,{' '}
                {g.lng.toFixed(6)}°E
              </p>
            ))}
            <p className="text-xs text-emerald-600 font-medium pt-1">
              Coordinates saved. Redirecting to case studies…
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Basic Information ──────────────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm px-8 py-7 space-y-5">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Basic Information
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cs-title" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
              Title *
            </label>
            <input
              id="cs-title"
              className={inputClass}
              value={form.title}
              onChange={set('title')}
              placeholder="e.g. Rooftop Solar Install at Hotel Sunview"
            />
          </div>
          <div>
            <label htmlFor="cs-slug" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
              Slug *
            </label>
            <input
              id="cs-slug"
              className={inputClass}
              value={form.slug}
              onChange={set('slug')}
              placeholder="auto-generated from title"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cs-summary" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
            Summary
          </label>
          <input
            id="cs-summary"
            className={inputClass}
            value={form.summary}
            onChange={set('summary')}
            placeholder="One-line summary shown in listings"
          />
        </div>

        <div>
          <label htmlFor="cs-description" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
            Description
          </label>
          <textarea
            id="cs-description"
            className={`${inputClass} resize-none`}
            rows={7}
            value={form.description}
            onChange={set('description')}
            placeholder="Full case study details, project scope, outcomes, technical specs…"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cs-category" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
              Category
            </label>
            <input
              id="cs-category"
              className={inputClass}
              list="cs-categories"
              value={form.category}
              onChange={set('category')}
              placeholder="e.g. Solar Water Heater"
            />
            <datalist id="cs-categories">
              <option value="Solar Water Heater" />
              <option value="Heat Pump" />
              <option value="Water Softener" />
              <option value="Water Purifier" />
              <option value="Commercial Installation" />
              <option value="Residential Installation" />
            </datalist>
          </div>
          <div>
            <label htmlFor="cs-client-name" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
              Client Name
            </label>
            <input
              id="cs-client-name"
              className={inputClass}
              value={form.client_name}
              onChange={set('client_name')}
              placeholder="e.g. Hotel Sunview"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cs-location" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
            Location
          </label>
          <input
            id="cs-location"
            className={inputClass}
            value={form.location_name}
            onChange={set('location_name')}
            placeholder="e.g. Pune, Maharashtra"
          />
        </div>
      </div>

      {/* ── Images ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm px-8 py-7 space-y-7">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Images</h2>

        {/* Cover Image */}
        <div>
          <label htmlFor="cs-cover-input" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-3">
            Cover Image
          </label>

          {coverPreview ? (
            <div className="relative inline-block">
              <div className="w-52 h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={removeCover}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-sm"
                aria-label="Remove cover image"
              >
                <X size={12} />
              </button>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="mt-2 text-xs font-black text-slate-500 hover:text-brand-600 transition-colors"
              >
                Replace
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-2xl py-10 flex flex-col items-center gap-2 text-slate-400 hover:border-brand-300 hover:text-brand-500 transition-all"
            >
              <Upload size={24} />
              <span className="text-sm font-black">Click to upload cover image</span>
              <span className="text-xs font-medium">JPEG, PNG, or WebP</span>
            </button>
          )}

          <input
            id="cs-cover-input"
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={onCoverSelect}
          />
        </div>

        {/* Gallery Images */}
        <div>
          <label htmlFor="cs-gallery-input" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-3">
            Gallery Images
          </label>

          <div className="grid grid-cols-4 gap-3">
            {/* Existing images */}
            {galleryUrls.map((url) => (
              <div key={url} className="relative">
                <div className="w-full aspect-square rounded-2xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeGalleryExisting(url)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-sm"
                  aria-label="Remove gallery image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* New (unsaved) image previews */}
            {galleryPreviews.map((preview, i) => (
              <div key={`new-${i}`} className="relative">
                <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-brand-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-1 left-1 w-4 h-4 bg-brand-600 rounded-full flex items-center justify-center shadow-sm">
                  <Plus size={8} className="text-white" />
                </div>
                <button
                  type="button"
                  onClick={() => removeGalleryNew(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-sm"
                  aria-label="Remove gallery image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}

            {/* Add more button */}
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-brand-300 hover:text-brand-500 transition-all"
              aria-label="Add gallery images"
            >
              <ImageIcon size={20} />
              <span className="text-xs font-black">Add</span>
            </button>
          </div>

          <input
            id="cs-gallery-input"
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={onGallerySelect}
          />

          <p className="text-xs text-slate-500 font-medium mt-3">
            GPS coordinates are auto-extracted from photo EXIF data upon upload.
          </p>
        </div>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 justify-end pb-4">
        <Link
          href="/admin/case-studies"
          className="px-6 py-2.5 border border-slate-200 rounded-2xl text-sm font-black text-slate-600 hover:bg-slate-50 transition-all"
        >
          Cancel
        </Link>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit('draft')}
          className="px-6 py-2.5 border border-brand-200 rounded-2xl text-sm font-black text-brand-600 hover:bg-brand-50 transition-all disabled:opacity-60 flex items-center gap-2"
        >
          {saving && <RefreshCw size={14} className="animate-spin" />}
          Save as Draft
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSubmit('published')}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-60 flex items-center gap-2 shadow-lg shadow-brand-200"
        >
          {saving && <RefreshCw size={14} className="animate-spin" />}
          Publish
        </button>
      </div>
    </div>
  );
}
