'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Filter, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getTopLevelCategories } from '@/lib/productHierarchy';
import type { Product } from '@/lib/data';

async function logSearchEvent(query: string) {
  try {
    await fetch('/api/client/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'search', query }),
    });
  } catch {
    // Non-critical, ignore errors (user may not be logged in)
  }
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const isExternal =
    product.image.includes('lh3.googleusercontent.com') || product.image.includes('vguard.in');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.04, 0.24) }}
      className="group flex flex-col bg-white rounded-[2rem] border border-blue-50 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500"
    >
      <Link href={`/product/${product.id}`} className="relative aspect-square bg-blue-50/30 overflow-hidden block">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-8 group-hover:scale-110 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          unoptimized={isExternal}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 shadow-sm">
          {product.brand}
        </div>
        {!product.inStock && (
          <div className="absolute top-3 left-3 bg-red-50 text-red-500 border border-red-100 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            Enquire
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-5 gap-3">
        {product.subCategory && (
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
            {product.subCategory}
          </span>
        )}
        <Link
          href={`/product/${product.id}`}
          className="text-sm font-bold text-blue-950 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 flex-1"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
            {product.category}
          </span>
          <Link
            href={`/product/${product.id}`}
            className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
          >
            Details <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

export default function ClientProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [category, setCategory] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProducts = useCallback(async (q: string, cat: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cat) params.set('category', cat);

      const res = await fetch(`/api/client/products?${params.toString()}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedQuery, category);
  }, [debouncedQuery, category, fetchProducts]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedQuery(value);
      if (value.trim().length >= 2) {
        logSearchEvent(value.trim());
      }
    }, 500);
  };

  const clearSearch = () => {
    setQuery('');
    setDebouncedQuery('');
  };

  const categoryNames = getTopLevelCategories().map((c) => c.name);

  return (
    <div className="px-6 py-16 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-blue-950 tracking-tight"
        >
          Product Catalog
        </motion.h1>
        <p className="text-slate-500 font-medium mt-1">
          Browse Avegatasta&apos;s complete range of Jal-Urja solutions
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-blue-950 text-sm"
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative sm:w-56">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-blue-950 text-sm appearance-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categoryNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 font-medium">
          {loading ? 'Searching...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
        </p>
        {(query || category) && (
          <button
            onClick={() => { clearSearch(); setCategory(''); }}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-blue-50 overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-100" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-100 rounded-xl w-full" />
                <div className="h-4 bg-slate-100 rounded-xl w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center space-y-3">
          <Search size={40} className="text-slate-300 mx-auto" />
          <p className="font-bold text-blue-950">No products found</p>
          <p className="text-slate-500 text-sm">Try a different search term or category.</p>
          <button
            onClick={() => { clearSearch(); setCategory(''); }}
            className="inline-flex items-center gap-2 text-brand-600 font-bold text-sm hover:text-brand-700 transition-colors mt-2"
          >
            <X size={14} /> Clear filters
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
