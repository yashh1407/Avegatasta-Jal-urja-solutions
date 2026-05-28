'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Tag, Package } from 'lucide-react';
import Image from 'next/image';
import { products } from '@/lib/data';

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductAdminCard({ product }: { product: (typeof products)[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-blue-50 shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-1"
            referrerPolicy="no-referrer"
            unoptimized={product.image.includes('lh3.googleusercontent.com') || product.image.includes('vguard.in')}
            sizes="56px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-sm text-blue-950 line-clamp-1">{product.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-wider">{product.brand}</span>
            <span className="text-[10px] text-slate-400">·</span>
            <span className="text-[10px] text-slate-500 font-medium">{product.category}</span>
            {product.inStock ? (
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">In Stock</span>
            ) : (
              <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Out of Stock</span>
            )}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-1 border-t border-slate-50 bg-slate-50/40">
              {/* Current description */}
              <div className="mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Current Description</p>
                <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Specs summary */}
              {Object.keys(product.specs).length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Specs</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(product.specs).map(([k, v]) => (
                      <span key={k} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg font-medium">
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');

  const brands = Array.from(new Set(products.map((p) => p.brand)));

  const filtered = products.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBrand = brandFilter === 'all' || p.brand === brandFilter;
    return matchSearch && matchBrand;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <Package size={20} className="text-blue-600" />
            <h1 className="text-2xl font-black text-blue-950">Products</h1>
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-lg">
              {products.length} total
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Browse and manage all products.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all w-64"
          />
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setBrandFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                brandFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200'
              }`}
            >
              <Tag size={11} /> All
            </button>
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => setBrandFilter(brand)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                  brandFilter === brand ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-200'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Product list */}
        <div className="space-y-3">
          {filtered.map((product) => (
            <ProductAdminCard key={product.id} product={product} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
