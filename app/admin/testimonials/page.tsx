'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  RefreshCw,
  LogOut,
  Plus,
  X,
  Trash2,
  Star,
  ChevronUp,
  ChevronDown,
  Eye,
  Quote,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '@/components/Footer';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  location: string | null;
  rating: number;
  text: string;
  image_url: string | null;
  is_active: boolean | number;
  display_order: number;
  created_at?: string;
}

interface TestimonialFormData {
  name: string;
  role: string;
  location: string;
  rating: number;
  text: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
}

const EMPTY_FORM: TestimonialFormData = {
  name: '',
  role: '',
  location: '',
  rating: 5,
  text: '',
  image_url: '',
  is_active: true,
  display_order: 0,
};

// ─── Star selector ─────────────────────────────────────────────────────────────

function StarSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
          aria-label={`${n} star${n !== 1 ? 's' : ''}`}
        >
          <Star
            size={22}
            className={
              n <= (hovered || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-slate-200 fill-slate-200'
            }
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-black text-slate-600 self-center">
        {value}/5
      </span>
    </div>
  );
}

// ─── Star display ──────────────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < count ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
        />
      ))}
    </div>
  );
}

// ─── Live preview card ─────────────────────────────────────────────────────────

function TestimonialPreviewCard({ form }: { form: TestimonialFormData }) {
  const imageUrl = form.image_url?.trim();

  return (
    <div className="bg-white border border-brand-100/70 rounded-3xl px-6 py-7 text-center max-w-sm mx-auto shadow-sm">
      <div className="flex justify-center mb-4">
        {imageUrl ? (
          <div className="relative w-20 h-20 rounded-2xl p-1 bg-gradient-to-br from-brand-50 to-emerald-50 border border-slate-100 shadow-sm">
            <img
              src={imageUrl}
              alt={form.name ? `${form.name} testimonial photo` : 'Customer testimonial photo'}
              className="w-full h-full rounded-[1rem] object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center">
            <Quote size={22} className="text-brand-500" />
          </div>
        )}
      </div>
      <div className="flex justify-center mb-4">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < form.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}
            />
          ))}
        </div>
      </div>
      <blockquote className="text-sm font-medium text-slate-700 leading-relaxed mb-5">
        &ldquo;{form.text || 'Testimonial text will appear here…'}&rdquo;
      </blockquote>
      <p className="font-black text-brand-950 text-sm">{form.name || 'Customer Name'}</p>
      <p className="text-xs text-slate-400 mt-0.5">
        {[form.role, form.location].filter(Boolean).join(' · ') || 'Role · Location'}
      </p>
    </div>
  );
}

// ─── Switch UI ────────────────────────────────────────────────────────────────

function ActiveSwitch({
  checked,
  disabled,
  onChange,
  label,
  compact = false,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
  label?: string;
  compact?: boolean;
}) {
  const statusLabel = label || (checked ? 'Active' : 'Hidden');

  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-full border transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200
        disabled:opacity-60 disabled:cursor-wait whitespace-nowrap shadow-sm
        ${compact ? 'px-2 py-1 min-w-[112px]' : 'px-2.5 py-1.5 min-w-[125px]'}
        ${
          checked
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
        }`}
      title={checked ? 'Active — click to deactivate' : 'Hidden — click to activate'}
      aria-pressed={checked}
    >
      <span
        className={`relative shrink-0 rounded-full transition-colors duration-200 ${
          compact ? 'w-9 h-5' : 'w-10 h-6'
        } ${checked ? 'bg-emerald-500' : 'bg-slate-300'}`}
      >
        <span
          className={`absolute top-0.5 rounded-full bg-white shadow transition-all duration-200 ${
            compact ? 'w-4 h-4' : 'w-5 h-5'
          } ${checked ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>

      <span className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.16em]">
        <span
          className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
            checked ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
        {statusLabel}
      </span>
    </button>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-5 py-5">
          <div className="h-3 bg-slate-100 rounded-lg animate-pulse" style={{ width: `${40 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Testimonial Form Modal ────────────────────────────────────────────────────

function TestimonialFormModal({
  open,
  initial,
  nextOrder,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: (TestimonialFormData & { id?: number }) | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<TestimonialFormData>({ ...EMPTY_FORM, display_order: nextOrder });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...EMPTY_FORM, ...initial } : { ...EMPTY_FORM, display_order: nextOrder });
      setImageFile(null);
      setError('');
      setShowPreview(false);
    }
  }, [open, initial, nextOrder]);

  const set =
    (key: keyof TestimonialFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be below 5 MB.');
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImageFile(file);
    setForm((f) => ({ ...f, image_url: previewUrl }));
    setError('');
    e.target.value = '';
  };

  const removeImage = () => {
    setImageFile(null);
    setForm((f) => ({ ...f, image_url: '' }));
  };

  const uploadImageIfNeeded = async () => {
    if (!imageFile) return form.image_url.trim() || null;

    const fd = new FormData();
    fd.append('file', imageFile);

    const res = await fetch('/api/admin/testimonials/upload-image', {
      method: 'POST',
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Failed to upload testimonial image.');
    }

    return data.url as string;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const finalImageUrl = await uploadImageIfNeeded();
      const isEdit = !!initial?.id;
      const url = isEdit ? `/api/admin/testimonials/${initial!.id}` : '/api/admin/testimonials';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          image_url: finalImageUrl,
          role: form.role.trim() || null,
          location: form.location.trim() || null,
        }),
      });
      if (res.ok) {
        toast.success(isEdit ? 'Testimonial updated.' : 'Testimonial added.');
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        const message = data.error || 'Failed to save testimonial.';
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save testimonial.';
      setError(message);
      toast.error(message);
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
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-5 sm:px-8 pt-6 sm:pt-7 pb-5 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-3xl">
              <h2 className="text-lg font-black text-brand-950">
                {initial?.id ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    showPreview
                      ? 'bg-brand-600 text-white'
                      : 'border border-slate-200 text-slate-600 hover:border-brand-200 hover:text-brand-600'
                  }`}
                >
                  <Eye size={13} />
                  Preview
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-5 sm:px-8 py-6">
              {/* Live Preview */}
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-6"
                  >
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                      Live Preview
                    </p>
                    <TestimonialPreviewCard form={form} />
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-sm text-red-600 font-medium bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="testimonial-name" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
                      Name *
                    </label>
                    <input
                      id="testimonial-name"
                      className={inputClass}
                      value={form.name}
                      onChange={set('name')}
                      required
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div>
                    <label htmlFor="testimonial-role" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
                      Role
                    </label>
                    <input
                      id="testimonial-role"
                      className={inputClass}
                      value={form.role}
                      onChange={set('role')}
                      placeholder="e.g. Hotel Owner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="testimonial-location" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
                      Location
                    </label>
                    <input
                      id="testimonial-location"
                      className={inputClass}
                      value={form.location}
                      onChange={set('location')}
                      placeholder="e.g. Nashik"
                    />
                  </div>
                  <div>
                    <label htmlFor="testimonial-display-order" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
                      Display Order
                    </label>
                    <input
                      id="testimonial-display-order"
                      className={inputClass}
                      type="number"
                      value={form.display_order}
                      onChange={(e) => setForm((f) => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                      min={0}
                    />
                  </div>
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">
                    Rating *
                  </span>
                  <StarSelector value={form.rating} onChange={(v) => setForm((f) => ({ ...f, rating: v }))} />
                </div>

                <div>
                  <label htmlFor="testimonial-text" className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-1">
                    Testimonial Text *
                  </label>
                  <textarea
                    id="testimonial-text"
                    className={`${inputClass} resize-none`}
                    rows={4}
                    value={form.text}
                    onChange={set('text')}
                    required
                    placeholder="What did the customer say about Avegatasta?"
                  />
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 block mb-2">
                    Customer Image <span className="text-slate-400 normal-case font-medium">(optional)</span>
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-[112px_1fr] gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-center justify-center">
                      {form.image_url ? (
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white shadow-sm bg-white">
                          <img
                            src={form.image_url}
                            alt="Testimonial image preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon size={24} />
                          <span className="text-[10px] font-black uppercase mt-1">Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-black uppercase tracking-wider hover:bg-brand-700 transition-all shadow-sm shadow-brand-100"
                        >
                          <Upload size={15} />
                          Upload Image
                        </button>
                        {form.image_url && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-red-100 text-red-500 text-xs font-black uppercase tracking-wider hover:bg-red-50 transition-all"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        Upload JPG, PNG, or WebP. Recommended square image, below 5 MB.
                      </p>
                      <label htmlFor="testimonial-image-url" className="sr-only">
                        Image URL or path
                      </label>
                      <input
                        id="testimonial-image-url"
                        className={inputClass}
                        value={imageFile ? '' : form.image_url}
                        onChange={(e) => {
                          setImageFile(null);
                          setForm((f) => ({ ...f, image_url: e.target.value }));
                        }}
                        placeholder="Optional image URL or uploaded image path"
                        type="text"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-black text-slate-700">Homepage Visibility</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {form.is_active ? 'This testimonial will be shown on the homepage.' : 'This testimonial is saved but hidden from the homepage.'}
                    </p>
                  </div>
                  <ActiveSwitch
                    checked={form.is_active}
                    onChange={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                    label={form.is_active ? 'Active' : 'Inactive'}
                  />
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
                    {saving ? 'Saving…' : initial?.id ? 'Save Changes' : 'Add Testimonial'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AdminTestimonialsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<(TestimonialFormData & { id?: number }) | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [reorderingId, setReorderingId] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
    else if (status === 'authenticated') fetchTestimonials();
  }, [status, router]);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      const data = await res.json();
      setTestimonials(Array.isArray(data) ? data : []);
    } catch {
      setTestimonials([]);
      toast.error('Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`Deleted testimonial from "${name}".`);
        fetchTestimonials();
      } else {
        toast.error('Failed to delete testimonial.');
      }
    } catch {
      toast.error('Failed to delete testimonial.');
    }
  };

  const handleToggleActive = async (t: Testimonial) => {
    setTogglingId(t.id);
    try {
      const res = await fetch(`/api/admin/testimonials/${t.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !t.is_active }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((x) => (x.id === t.id ? { ...x, is_active: !x.is_active } : x))
        );
        toast.success(t.is_active ? 'Testimonial hidden.' : 'Testimonial activated.');
      } else {
        toast.error('Failed to update visibility.');
      }
    } catch {
      toast.error('Failed to update visibility.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const idx = testimonials.findIndex((t) => t.id === id);
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === testimonials.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const current = testimonials[idx];
    const swap = testimonials[swapIdx];

    // Optimistic update
    const updated = [...testimonials];
    updated[idx] = { ...current, display_order: swap.display_order };
    updated[swapIdx] = { ...swap, display_order: current.display_order };
    setTestimonials(updated.sort((a, b) => a.display_order - b.display_order));

    setReorderingId(id);
    try {
      await Promise.all([
        fetch(`/api/admin/testimonials/${current.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: swap.display_order }),
        }),
        fetch(`/api/admin/testimonials/${swap.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ display_order: current.display_order }),
        }),
      ]);
    } catch {
      toast.error('Failed to reorder testimonials.');
      fetchTestimonials(); // revert on error
    } finally {
      setReorderingId(null);
    }
  };

  const openAdd = () => {
    setModalInitial(null);
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setModalInitial({
      id: t.id,
      name: t.name,
      role: t.role ?? '',
      location: t.location ?? '',
      rating: t.rating,
      text: t.text,
      image_url: t.image_url ?? '',
      is_active: Boolean(t.is_active),
      display_order: t.display_order,
    });
    setModalOpen(true);
  };

  const nextOrder = testimonials.length > 0 ? Math.max(...testimonials.map((t) => t.display_order)) + 1 : 0;
  const activeCount = testimonials.filter((t) => t.is_active).length;

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
                <MessageSquare size={20} />
              </div>
              <h1 className="text-4xl font-black text-brand-950 tracking-tight">Testimonials</h1>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-lg">
                {activeCount} active
              </span>
            </div>
            <p className="text-slate-500 font-medium">
              Manage customer testimonials shown on the homepage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchTestimonials}
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
              Add Testimonial
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="p-2.5 bg-white border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">
              All Testimonials ({testimonials.length})
            </h2>
            <button
              onClick={fetchTestimonials}
              className="p-2 text-slate-500 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-all"
              title="Refresh"
              aria-label="Refresh testimonials"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Order</th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Customer</th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Rating</th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Preview</th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Active</th>
                  <th className="px-5 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : testimonials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <MessageSquare size={32} />
                      </div>
                      <p className="text-slate-500 font-medium">No testimonials yet.</p>
                      <button onClick={openAdd} className="mt-4 text-brand-600 text-sm font-black hover:underline">
                        Add the first testimonial →
                      </button>
                    </td>
                  </tr>
                ) : (
                  testimonials.map((t, idx) => (
                    <motion.tr
                      key={t.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Order controls */}
                      <td className="px-5 py-4 w-24">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-slate-500 w-5 text-right">{t.display_order}</span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleReorder(t.id, 'up')}
                              disabled={idx === 0 || reorderingId === t.id}
                              className="p-0.5 text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move up"
                              aria-label={`Move ${t.name} up`}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => handleReorder(t.id, 'down')}
                              disabled={idx === testimonials.length - 1 || reorderingId === t.id}
                              className="p-0.5 text-slate-400 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Move down"
                              aria-label={`Move ${t.name} down`}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          {t.image_url ? (
                            <img
                              src={t.image_url}
                              alt={`${t.name} testimonial`}
                              className="w-11 h-11 rounded-2xl object-cover border border-slate-100 bg-slate-50 shadow-sm"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-400 shrink-0">
                              <Quote size={16} />
                            </div>
                          )}
                          <div>
                            <p className="font-black text-sm text-brand-950">{t.name}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {[t.role, t.location].filter(Boolean).join(' · ') || <span className="text-slate-400">—</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-4">
                        <Stars count={t.rating} />
                      </td>

                      {/* Text preview */}
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                          {t.text}
                        </p>
                      </td>

                      {/* Active toggle */}
                      <td className="px-5 py-4">
                        <ActiveSwitch
                          checked={Boolean(t.is_active)}
                          disabled={togglingId === t.id}
                          onChange={() => handleToggleActive(t)}
                          label={t.is_active ? 'Active' : 'Hidden'}
                          compact
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(t)}
                            className="px-3 py-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all text-xs font-black"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(t.id, t.name)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete"
                            aria-label={`Delete testimonial from ${t.name}`}
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

      <TestimonialFormModal
        open={modalOpen}
        initial={modalInitial}
        nextOrder={nextOrder}
        onClose={() => setModalOpen(false)}
        onSaved={fetchTestimonials}
      />
    </div>
  );
}
