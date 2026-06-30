'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, X, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { products, type Product } from '@/lib/data';

// ── Quick-inquiry dialog ─────────────────────────────────────────────────────

interface InquiryDialogProps {
  product: Product;
  onClose: () => void;
}

function InquiryDialog({ product, onClose }: InquiryDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/product-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          message: message || `Inquiry about ${product.name}`,
          productName: product.name,
          productId: product.id,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  const inputCls =
    'w-full px-4 py-3 rounded-xl border border-brand-200 bg-white text-brand-950 text-sm font-medium placeholder:text-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm"
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-md bg-white rounded-[1.75rem] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand-950 px-7 pt-7 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
          <p className="text-xs font-black text-brand-400 uppercase tracking-widest mb-1">
            Quick Inquiry
          </p>
          <h3 className="text-lg font-black text-white leading-tight line-clamp-2 pr-10">
            {product.name}
          </h3>
          <p className="text-sm text-brand-400 mt-1">{product.brand}</p>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-brand-500" size={28} />
              </div>
              <h4 className="text-lg font-black text-brand-950 mb-2">Inquiry Sent!</h4>
              <p className="text-sm text-brand-500 mb-6">
                We&apos;ll get back to you within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-brand-500 text-white rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-700 mb-1.5">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-700 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any specific requirements..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {status === 'error' && (
                <p className="text-xs text-red-500 font-semibold">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send Inquiry'
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface FeaturedProductsProps {
  badge?: string;
  titleHtml?: string;
  description?: string;
}

export default function FeaturedProducts({ badge, titleHtml, description }: FeaturedProductsProps = {}) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [productsList, setProductsList] = useState<Product[]>(() => products);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProductsList(data);
        }
      })
      .catch((err) => console.error('Failed to sync featured products:', err));
  }, []);
  
  // Custom selection for "Top Picks" based on B2B requirements
  const featuredIds = ['vg-hp-vhp150', 'zb-softener-as1', 'wilo-fmhil-booster', 'zb-zenora-ro-uf'];
  const featured = featuredIds
    .map(id => productsList.find(p => p.id === id))
    .filter(Boolean) as Product[];

  const resolvedBadge = badge || 'Featured Products';
  const resolvedTitleHtml = titleHtml || 'Top Picks for You';
  const resolvedDescription = description || 'Handpicked water solutions from V-Guard, Zero B, and Wilo.';

  return (
    <>
      <section id="products" className="py-16 sm:py-20 lg:py-24 bg-surface-subtle border-t border-brand-100/60">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          {/* Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-black text-brand-500 uppercase tracking-[0.2em] mb-2">
                {resolvedBadge}
              </p>
              <h2 className="text-3xl font-black text-brand-950 tracking-tight" dangerouslySetInnerHTML={{ __html: resolvedTitleHtml }} />
              <p className="text-brand-500 font-medium mt-2">
                {resolvedDescription}
              </p>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-bold text-sm transition-colors"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* 4-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="motion-card group flex flex-col bg-white rounded-[1.75rem] border border-brand-100/60 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-500"
              >
                {/* Image container */}
                <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-surface-subtle block">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-6 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-[1.08]"
                    referrerPolicy="no-referrer"
                    unoptimized={product.image.includes('lh3.googleusercontent.com') || product.image.includes('vguard.in')}
                  />

                  {/* Hover overlay with Quick Inquiry CTA */}
                  <div className="absolute inset-0 bg-brand-950/0 group-hover:bg-brand-950/60 transition-colors duration-400 flex items-center justify-center">
                    <button
                      onClick={(e) => { e.preventDefault(); setActiveProduct(product); }}
                      className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 px-5 py-2.5 bg-white text-brand-950 rounded-xl text-xs font-black shadow-lg hover:bg-brand-50"
                    >
                      Quick Inquiry
                    </button>
                  </div>

                  {/* In-stock badge */}
                  {product.inStock && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 rounded-lg text-[10px] font-black text-brand-500 uppercase tracking-wider">
                      In Stock
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex flex-col flex-1 p-5">
                  <Link
                    href={`/product/${product.id}`}
                    className="text-sm font-bold text-brand-950 leading-snug line-clamp-2 mb-1 hover:text-brand-600 transition-colors"
                  >
                    {product.name}
                  </Link>
                  <p className="text-[11px] font-black text-brand-400 uppercase tracking-widest mb-4">
                    {product.brand}
                  </p>

                  <div className="mt-auto">
                    <div className="flex items-center gap-1.5 text-[10px] text-brand-500 font-bold mb-3">
                      <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
                      <span className="uppercase tracking-wider">Official Partner</span>
                    </div>
                    <button
                      onClick={() => setActiveProduct(product)}
                      className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Quick Inquiry
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View all CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold transition-colors shadow-lg"
            >
              View All Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Inquiry dialog (portal-like via AnimatePresence) */}
      <AnimatePresence>
        {activeProduct && (
          <InquiryDialog
            product={activeProduct}
            onClose={() => setActiveProduct(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
