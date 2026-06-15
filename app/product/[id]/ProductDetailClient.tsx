'use client';

import React, { useState, useEffect, useRef } from 'react';
import { products, Product } from '@/lib/data';
import { Captcha, CaptchaRef } from '@/components/Captcha';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Download,
  FileText,
  LayoutGrid,
  SlidersHorizontal,
  MessageSquare,

} from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { WhatsAppEnquireButton } from '@/components/WhatsAppButton';

import { Suspense } from 'react';
import ProductFAQ from '@/components/ProductFAQ';

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'specs' | 'downloads' | 'inquiry';
type InquiryState = 'idle' | 'loading' | 'success' | 'error';

// ─── Inquiry Form ──────────────────────────────────────────────────────────────

function ProductInquiryForm({ product }: { product: Product }) {
  const [state, setState] = useState<InquiryState>('idle');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', gstin: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const captchaRef = useRef<CaptchaRef>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!captchaRef.current?.validate()) {
      return;
    }

    setState('loading');
    try {
      const captchaData = captchaRef.current?.getCaptchaData() || { token: '', input: '' };
      const res = await fetch('/api/product-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          productName: product.name, 
          productId: product.id,
          captchaToken: captchaData.token,
          captchaInput: captchaData.input,
        }),
      });
      if (res.ok) {
        setState('success');
        setForm({ name: '', phone: '', email: '', message: '', gstin: '' });
        captchaRef.current?.reset();
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = typeof data?.error === 'string' ? data.error : 'Submission failed. Please try again.';
        setErrorMsg(msg);
        setState('error');
        if (msg.includes('verification code') || msg.toLowerCase().includes('captcha')) {
          captchaRef.current?.setErrorState(true);
        } else {
          captchaRef.current?.reset();
        }
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setState('error');
      captchaRef.current?.reset();
    }
  };

  if (state === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500">
          <CheckCircle2 size={36} />
        </div>
        <h4 className="text-xl font-black text-blue-950 mb-2">Inquiry Sent!</h4>
        <p className="text-slate-500 font-medium mb-6">We will contact you shortly.</p>
        <button
          onClick={() => setState('idle')}
          className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all"
        >
          Send Another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Full Name *</label>
          <input
            required
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Phone *</label>
          <input
            required
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Email (optional)</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">GSTIN (Optional)</label>
        <input
          type="text"
          name="gstin"
          value={form.gstin}
          onChange={handleChange}
          placeholder="Enter your GSTIN here"
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        <span className="text-[10px] text-slate-400 font-bold ml-1 block">Enter your GSTIN here</span>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Message *</label>
        <textarea
          required
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={4}
          placeholder="Tell us what you need..."
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
        />
      </div>
      <Captcha ref={captchaRef} />
      {state === 'error' && (
        <p className="text-red-500 text-xs font-bold px-1">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
      >
        {state === 'loading' ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : 'Send Inquiry'}
      </button>
    </form>
  );
}

// ─── Tab definitions ───────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutGrid size={15} /> },
  { id: 'specs', label: 'Specifications', icon: <SlidersHorizontal size={15} /> },
  { id: 'downloads', label: 'Downloads', icon: <Download size={15} /> },
  { id: 'inquiry', label: 'Inquiry', icon: <MessageSquare size={15} /> },
];

// ─── Inner page (needs useSearchParams) ───────────────────────────────────────

export default function ProductDetailContent({ product: initialProduct }: { product: Product }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [product, setProduct] = useState<Product>(initialProduct);
  const [productsList, setProductsList] = useState<Product[]>(() => products);

  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    // Sync single product detail and all products (for related)
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsList(data);
          const found = data.find((p: any) => p.id === initialProduct.id);
          if (found) {
            setProduct(found);
          }
        }
      })
      .catch((err) => console.error('Failed to sync products catalog details:', err));
  }, [initialProduct.id]);

  const rawTab = searchParams?.get('tab') as TabId | null;
  const validTab = rawTab && TABS.some((t) => t.id === rawTab) ? rawTab : 'overview';
  const [activeTab, setActiveTab] = useState<TabId>(validTab);

  // Sync URL when tab changes
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams?.toString() ?? '');
    if (tab === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.replace(`/product/${product.id}?${params.toString()}`, { scroll: false });
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-blue-950">Product Not Found</h1>
          <Link href="/products" className="text-blue-600 hover:underline font-bold">Browse Products</Link>
        </div>
      </div>
    );
  }

  const isExternal =
    product.image.includes('lh3.googleusercontent.com') ||
    product.image.includes('vguard.in') ||
    product.image.includes('bluewaveindia.com') ||
    product.image.includes('5.imimg.com') ||
    product.image.includes('zerobonline.com');

  const shouldZoomDetailImage =
    product.id === 'zb-kitchenmate-ro-uf' ||
    product.name.toLowerCase().includes('kitchenmate ro+uf');

  const detailImageClassName = shouldZoomDetailImage
    ? 'object-contain p-2 sm:p-3 scale-[1.28] sm:scale-[1.45] transition-transform duration-300'
    : 'object-contain p-5 sm:p-8 lg:p-10';

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Full-width hero ──────────────────────────────────────────────── */}
      <div className="relative w-full bg-gradient-to-b from-blue-50/60 to-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 pt-6 sm:pt-8 mb-6 sm:mb-8"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-blue-600 transition-colors font-bold">Home</Link>
            <ChevronRight size={12} className="text-slate-300" />
            <Link href="/products" className="hover:text-blue-600 transition-colors font-bold">Products</Link>
            <ChevronRight size={12} className="text-slate-300" />
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="hover:text-blue-600 transition-colors font-bold"
            >
              {product.category}
            </Link>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-blue-950 font-black line-clamp-1 max-w-[180px] sm:max-w-[260px]">{product.name}</span>
          </motion.nav>

          {/* Hero grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 pb-12 sm:pb-16 items-center">
            {/* Product image — full-width hero treatment */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="relative w-full"
            >
              <div className="relative aspect-square rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white border border-blue-100 shadow-xl shadow-blue-50">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  className={detailImageClassName}
                  referrerPolicy="no-referrer"
                  unoptimized={isExternal}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Stock badge */}
                <div
                  className={`absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    product.inStock
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
                      : 'bg-red-50 text-red-500 border border-red-100'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  {product.inStock ? 'In Stock' : 'Enquire'}
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className={`aspect-square rounded-xl sm:rounded-2xl overflow-hidden border bg-blue-50/30 cursor-pointer transition-all ${
                      i === 0 ? 'border-blue-500 shadow-md' : 'border-blue-100 hover:border-blue-300'
                    }`}
                  >
                    <Image
                      src={product.image}
                      alt={`${product.name} view ${i + 1}`}
                      width={120}
                      height={120}
                      className={`object-contain p-3 transition-opacity ${i === 0 ? 'opacity-100' : 'opacity-50 hover:opacity-90'}`}
                      referrerPolicy="no-referrer"
                      unoptimized={isExternal}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Product header info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col gap-5 sm:gap-6"
            >
              {/* Back button */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors font-black uppercase tracking-widest text-[10px] self-start"
              >
                <ArrowLeft size={14} />
                Back
              </button>

              {/* Brand + category */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Link
                  href={`/products?brand=${encodeURIComponent(product.brand)}`}
                  className="px-3 py-1.5 bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200 hover:bg-blue-600 hover:text-white transition-all"
                >
                  {product.brand}
                </Link>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-200 transition-all"
                >
                  {product.category}
                </Link>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              <p className="text-slate-500 leading-relaxed text-sm font-medium">{product.description}</p>

              <div className="flex items-center gap-2 text-[10px] text-blue-600 font-black uppercase tracking-widest">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                Authorised Distributor — Jal Urja Solutions
              </div>

              {/* CTA strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                <WhatsAppEnquireButton
                  productName={product.name}
                  className="group relative inline-flex min-h-[54px] sm:min-h-[56px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1FAF57] to-[#25D366] px-4 sm:px-5 py-3.5 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-white shadow-lg shadow-green-200/70 ring-1 ring-green-300/50 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-200 active:translate-y-0 active:scale-[0.99] text-center leading-tight"
                />
                <button
                  onClick={() => handleTabChange('inquiry')}
                  aria-label="Send product inquiry"
                  className="group inline-flex min-h-[54px] sm:min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 sm:px-5 py-3.5 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-white shadow-lg shadow-blue-200/70 ring-1 ring-blue-300/50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 active:translate-y-0 active:scale-[0.99] text-center leading-tight"
                >
                  <MessageSquare size={17} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
      <div className="sticky top-14 sm:top-16 z-30 bg-white/90 backdrop-blur-md border-b border-blue-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-14 lg:py-16">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl"
            >
              <h2 className="text-xl sm:text-2xl font-black text-blue-950 mb-6 sm:mb-8 flex items-center gap-3">
                <LayoutGrid className="text-blue-600" size={22} />
                Product Highlights
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.features.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-start gap-3 bg-blue-50/40 rounded-2xl p-4 border border-blue-50"
                  >
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                    <span className="text-sm text-slate-600 font-medium leading-snug">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl sm:text-2xl font-black text-blue-950 mb-6 sm:mb-8 flex items-center gap-3">
                <SlidersHorizontal className="text-blue-600" size={22} />
                Technical Specifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
                {Object.entries(product.specs).map(([key, value], i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl p-5 border border-blue-50 shadow-sm"
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">{key}</div>
                    <div className="text-sm font-black text-blue-950">{value}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'downloads' && (
            <motion.div
              key="downloads"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl"
            >
              <h2 className="text-xl sm:text-2xl font-black text-blue-950 mb-6 sm:mb-8 flex items-center gap-3">
                <Download className="text-blue-600" size={22} />
                Product Downloads
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'Product Brochure', sub: 'PDF • ~2MB', available: false },
                  { label: 'Installation Manual', sub: 'PDF • ~1.5MB', available: false },
                  { label: 'Technical Data Sheet', sub: 'PDF • ~500KB', available: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-blue-50 shadow-sm"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-400">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-blue-950">{item.label}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                    <button
                      disabled={!item.available}
                      className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                    >
                      <Download size={12} />
                      {item.available ? 'Download' : 'Coming Soon'}
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium mt-6">
                Downloads will be available shortly. Contact us to request product documentation.
              </p>
            </motion.div>
          )}

          {activeTab === 'inquiry' && (
            <motion.div
              key="inquiry"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-2xl font-black text-blue-950 mb-2 flex items-center gap-3">
                <MessageSquare className="text-blue-600" size={22} />
                Send Inquiry
              </h2>
              <p className="text-slate-400 text-sm font-medium mb-8">
                Interested in <span className="font-bold text-blue-950">{product.name}</span>? Fill in your details and we&apos;ll get back to you promptly.
              </p>
              <ProductInquiryForm product={product} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="mt-16 pt-16 border-t border-blue-50">
          <ProductFAQ category={product.category} />
        </section>

        {/* ── Related products ─────────────────────────────────────────── */}
        <section className="mt-20 pt-16 border-t border-blue-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
            <h2 className="text-2xl font-black text-blue-950 tracking-tight">You might also like</h2>
            <Link href="/products" className="text-blue-600 font-black hover:underline text-[10px] uppercase tracking-widest">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {productsList
              .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
              .slice(0, 4)
              .map((p, i) => {
                const ext =
                  p.image.includes('lh3.googleusercontent.com') ||
                  p.image.includes('vguard.in') ||
                  p.image.includes('bluewaveindia.com') ||
                  p.image.includes('5.imimg.com') ||
                  p.image.includes('zerobonline.com');
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="group"
                  >
                    <Link href={`/product/${p.id}`}>
                      <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-blue-50/30 mb-4 border border-blue-50 group-hover:shadow-xl transition-all duration-500">
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          unoptimized={ext}
                          sizes="(max-width: 640px) 100vw, 25vw"
                        />
                      </div>
                      <p className="font-bold text-blue-950 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm">
                        {p.name}
                      </p>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">{p.brand}</p>
                    </Link>
                  </motion.div>
                );
              })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// ProductDetailContent is the default export — RSC page.tsx handles params + Suspense
