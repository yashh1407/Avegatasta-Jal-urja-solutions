'use client';

import React, { useState, useMemo, Suspense, useCallback, useEffect } from 'react';
import { products } from '@/lib/data';
import { getHierarchyNode, productHierarchy, productMatchesHierarchy, type ProductHierarchyNode } from '@/lib/productHierarchy';
import { CATEGORY_SEO_BY_LABEL } from '@/lib/seo-categories';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Search,
  ChevronRight,
  Filter,
  SlidersHorizontal,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const PAGE_SIZE = 24;

function Breadcrumb({ category }: { category: string | null }) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-6 sm:mb-8"
    >
      <Link href="/" className="hover:text-blue-600 transition-colors font-bold">Home</Link>
      <ChevronRight size={12} className="text-slate-300" />
      {category ? (
        <>
          <Link href="/products" className="hover:text-blue-600 transition-colors font-bold">Products</Link>
          <ChevronRight size={12} className="text-slate-300" />
          <span className="text-blue-950 font-black">{category}</span>
        </>
      ) : (
        <span className="text-blue-950 font-black">Products</span>
      )}
    </motion.nav>
  );
}

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory?: string;
  image: string;
  inStock: boolean;
  index: number;
}

function ProductCard({ id, name, brand, subCategory, image, inStock, index }: ProductCardProps) {
  const isExternal = image.includes('lh3.googleusercontent.com') || image.includes('vguard.in') || image.includes('bluewaveindia.com') || image.includes('5.imimg.com');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.24), ease: 'easeOut' }}
      className="group flex flex-col h-full bg-white rounded-[2rem] border border-blue-50 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-500"
    >
      <Link href={`/product/${id}`} scroll={true} className="relative aspect-square bg-blue-50/30 overflow-hidden block">
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain p-5 sm:p-8 group-hover:scale-110 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
          unoptimized={isExternal}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          priority={index < 4}
        />
        <div
          className={`absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            inStock
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-200'
              : 'bg-red-50 text-red-500 border border-red-100'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${inStock ? 'bg-emerald-500' : 'bg-red-400'}`} />
          {inStock ? 'In Stock' : 'Enquire'}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 shadow-sm">
          {brand}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
        {subCategory && (
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{subCategory}</span>
        )}
        <Link
          href={`/product/${id}`}
          scroll={true}
          className="text-[13px] sm:text-sm font-bold text-blue-950 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 flex-1"
        >
          {name}
        </Link>
        <div className="flex items-center gap-1.5 text-[10px] text-blue-600 font-bold">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
          <span className="uppercase tracking-wider">Official Partner</span>
        </div>
        <Link
          href={`/product/${id}?tab=inquiry`}
          scroll={true}
          className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-blue-100"
        >
          Enquire Now
        </Link>
      </div>
    </motion.article>
  );
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      onClick={onRemove}
      className="flex items-center gap-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
    >
      {label}
      <X size={10} />
    </motion.button>
  );
}

function collectExpandedLabels(node: ProductHierarchyNode | null): string[] {
  if (!node) return [];
  const labels = [node.label];
  if (node.children) {
    for (const child of node.children) labels.push(...collectExpandedLabels(child));
  }
  return labels;
}

function matchesBranch(
  node: ProductHierarchyNode,
  selectedCategory: string | null,
): boolean {
  if (!selectedCategory) return false;
  if (node.label === selectedCategory) return true;

  return (
    node.children?.some((child: ProductHierarchyNode) =>
      matchesBranch(child, selectedCategory),
    ) ?? false
  );
}

function CategoryTree({
  node,
  depth,
  selectedCategory,
  expanded,
  onToggle,
  onSelect,
}: {
  node: ProductHierarchyNode;
  depth: number;
  selectedCategory: string | null;
  expanded: Record<string, boolean>;
  onToggle: (label: string) => void;
  onSelect: (label: string | null) => void;
}) {
  const hasChildren = !!node.children?.length;
  const isSelected = selectedCategory === node.label;
  const isExpanded = expanded[node.label] ?? false;
  const inActiveBranch = matchesBranch(node, selectedCategory);

  return (
    <div className="space-y-2">
      <div
        className={`rounded-2xl border transition-all ${
          depth === 0
            ? isSelected || inActiveBranch
              ? 'border-blue-200 bg-blue-50/60 shadow-sm'
              : 'border-slate-200 bg-white'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className={`flex items-center gap-2 ${depth === 0 ? 'p-2' : ''}`}>
          <button
            type="button"
            onClick={() => onSelect(isSelected ? null : node.label)}
            className={`flex-1 text-left rounded-xl transition-colors ${
              depth === 0
                ? `px-3 py-3 ${isSelected ? 'bg-blue-600 text-white shadow-md' : 'text-slate-800 hover:bg-slate-50'}`
                : `px-3 py-2.5 ${isSelected ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`
            }`}
          >
            <span className={`block ${depth === 0 ? 'text-[13px] font-black' : depth === 1 ? 'text-[12px] font-bold' : 'text-[11px] font-semibold'}`}>
              {node.label}
            </span>
          </button>

          {hasChildren && (
            <button
              type="button"
              onClick={() => onToggle(node.label)}
              aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
              className={`shrink-0 rounded-xl border transition-colors ${
                depth === 0
                  ? isSelected
                    ? 'border-blue-500/20 bg-white/15 text-white hover:bg-white/20'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
              } min-h-[40px] min-w-[40px] flex items-center justify-center`}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className={`${depth === 0 ? 'px-3 pb-3 pt-1' : 'pl-4 pb-1'} space-y-1.5`}>
                {node.children?.map((child) => (
                  <CategoryTree
                    key={child.label}
                    node={child}
                    depth={depth + 1}
                    selectedCategory={selectedCategory}
                    expanded={expanded}
                    onToggle={onToggle}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProductsContent({ initialCategory = null }: { initialCategory?: string | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedCategory = searchParams?.get('category') ?? initialCategory ?? null;
  const selectedBrand = searchParams?.get('brand') ?? null;
  const searchQuery = searchParams?.get('q') || '';
  const sortBy = searchParams?.get('sort') || 'Popularity';
  const categorySeo = selectedCategory ? CATEGORY_SEO_BY_LABEL[selectedCategory] : null;
  const pageHeading = categorySeo?.title.split('|')[0].trim() || selectedCategory || 'All Products';

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(productHierarchy.map((node) => [node.label, true]))
  );
  const resultsTopRef = React.useRef<HTMLDivElement | null>(null);
  const productsPanelRef = React.useRef<HTMLDivElement | null>(null);
  const hasMountedRef = React.useRef(false);

  const setProductResultsRef = useCallback((node: HTMLDivElement | null) => {
    resultsTopRef.current = node;
    productsPanelRef.current = node;
  }, []);

  const scrollToFirstProduct = useCallback(() => {
    const target = resultsTopRef.current;
    const productsPanel = productsPanelRef.current;

    if (productsPanel) {
      productsPanel.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (!target) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    const fixedHeaderOffset = 120;
    const targetTop = window.scrollY + target.getBoundingClientRect().top - fixedHeaderOffset;

    window.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'auto',
    });
  }, []);

  useEffect(() => {
    setPage(1);

    const shouldScrollToFirstProduct =
      hasMountedRef.current ||
      !!selectedCategory ||
      !!selectedBrand ||
      !!searchQuery ||
      sortBy !== 'Popularity';

    hasMountedRef.current = true;

    if (!shouldScrollToFirstProduct) return;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToFirstProduct);
    });
  }, [selectedCategory, selectedBrand, searchQuery, sortBy, scrollToFirstProduct]);

  useEffect(() => {
    if (!selectedCategory) {
      setExpanded((prev) => ({ ...prev, ...Object.fromEntries(productHierarchy.map((node) => [node.label, true])) }));
      return;
    }

    const node = getHierarchyNode(selectedCategory);
    if (!node) return;

    setExpanded((prev) => {
      const next = { ...prev };
      for (const label of collectExpandedLabels(node)) next[label] = true;
      for (const root of productHierarchy) {
        if (matchesBranch(root, selectedCategory)) next[root.label] = true;
      }
      return next;
    });
  }, [selectedCategory]);

  const setParam = useCallback(
    (key: string, value: string | null) => {
      setPage(1);
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (value) params.set(key, value);
      else params.delete(key);
      const qs = params.toString();
      const targetPath = initialCategory && key === 'category' ? '/products' : (pathname ?? '/products');
      router.push(qs ? `${targetPath}?${qs}` : targetPath, { scroll: false });
    },
    [searchParams, router, pathname, initialCategory],
  );

  const clearAll = () => {
    setLocalSearch('');
    setPage(1);
    router.push(initialCategory ? '/products' : (pathname ?? '/products'), { scroll: false });
  };

  const toggleExpanded = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const hasFilters = !!(selectedCategory || selectedBrand || searchQuery);
  const brands = ['V-Guard', 'Zero B', 'Wilo', 'Bluewave India'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = !selectedCategory || productMatchesHierarchy(p, selectedCategory);
        const matchesBrand = !selectedBrand || p.brand === selectedBrand;
        const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesBrand && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'Newest First') return -1;
        if (sortBy === 'In Stock First') return a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1;
        return 0;
      });
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

  const visibleProducts = filteredProducts.slice(0, page * PAGE_SIZE);
  const hasMore = visibleProducts.length < filteredProducts.length;

  return (
    <div className="min-h-screen bg-blue-50/30">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-28 sm:pt-32 pb-16 sm:pb-24">
        <Breadcrumb category={selectedCategory} />

        <div className="flex flex-col lg:flex-row gap-5 sm:gap-6 lg:gap-8 items-start lg:items-stretch">
          <aside className="w-full lg:w-[300px] xl:w-[340px] 2xl:w-[360px] shrink-0 lg:sticky lg:top-24 self-start z-20 lg:h-[calc(100vh-7.5rem)] lg:max-h-[calc(100vh-7.5rem)]">
            <div className="lg:h-full">
              <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-blue-50 p-4 sm:p-5 shadow-sm max-h-[75vh] lg:h-full lg:max-h-full overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-black text-blue-950 flex items-center gap-2 uppercase tracking-widest">
                    <SlidersHorizontal size={16} className="text-blue-600" />
                    Filters
                  </h2>
                  <AnimatePresence>
                    {hasFilters && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={clearAll}
                        className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest"
                      >
                        Clear All
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mb-5 pb-5 border-b border-blue-50">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" size={14} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={localSearch}
                      onChange={(e) => {
                        setLocalSearch(e.target.value);
                        setParam('q', e.target.value || null);
                      }}
                      className="w-full pl-10 pr-4 min-h-[44px] rounded-xl border border-blue-100 bg-blue-50/40 text-sm text-blue-950 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>

                <div data-lenis-prevent="true" className="flex-1 overflow-y-auto pr-1 space-y-5 [scrollbar-width:thin]">
                  <div className="pb-5 border-b border-blue-50">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                      Category
                    </label>
                    <div className="space-y-3">
                      {productHierarchy.map((node) => (
                        <CategoryTree
                          key={node.label}
                          node={node}
                          depth={0}
                          selectedCategory={selectedCategory}
                          expanded={expanded}
                          onToggle={toggleExpanded}
                          onSelect={(value) => setParam('category', value)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block">
                      Brand
                    </label>
                    <div className="space-y-2">
                      {brands.map((brand) => {
                        const isActive = selectedBrand === brand;
                        return (
                          <label
                            key={brand}
                            className="flex items-center gap-3 cursor-pointer group px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => setParam('brand', isActive ? null : brand)}
                              className="w-4 h-4 rounded border-blue-200 text-blue-600 focus:ring-blue-500 transition-all accent-blue-600"
                            />
                            <span
                              className={`text-xs transition-colors font-bold ${
                                isActive ? 'text-blue-600' : 'text-slate-600 group-hover:text-blue-700'
                              }`}
                            >
                              {brand}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div
            ref={setProductResultsRef}
            className="flex-1 min-w-0 w-full scroll-mt-32 lg:h-[calc(100vh-7.5rem)] lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto lg:pr-2 lg:pb-6 [scrollbar-width:thin]"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <motion.h1
                  key={pageHeading}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight"
                >
                  {pageHeading}
                </motion.h1>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  {visibleProducts.length} of {filteredProducts.length} products
                </p>
                {categorySeo?.intro && (
                  <motion.p
                    key={`${selectedCategory}-intro`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 max-w-3xl text-sm sm:text-base text-slate-600 font-medium leading-relaxed"
                  >
                    {categorySeo.intro}
                  </motion.p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap w-full sm:w-auto">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort</span>
                {['Popularity', 'Newest First', 'In Stock First'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setParam('sort', tab === 'Popularity' ? null : tab)}
                    className={`px-3 sm:px-4 min-h-[42px] sm:min-h-[44px] text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                      sortBy === tab
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-105'
                        : 'bg-white border-blue-100 text-slate-500 hover:border-blue-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {hasFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2 mb-5 overflow-hidden"
                >
                  {selectedCategory && (
                    <FilterPill label={selectedCategory} onRemove={() => setParam('category', null)} />
                  )}
                  {selectedBrand && (
                    <FilterPill label={selectedBrand} onRemove={() => setParam('brand', null)} />
                  )}
                  {searchQuery && (
                    <FilterPill
                      label={`\"${searchQuery}\"`}
                      onRemove={() => {
                        setLocalSearch('');
                        setParam('q', null);
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {categorySeo?.highlights?.length ? (
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {categorySeo.highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-xs font-bold text-blue-950 shadow-sm"
                  >
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-blue-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              <AnimatePresence mode="popLayout">
                {visibleProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    index={i}
                    id={product.id}
                    name={product.name}
                    brand={product.brand}
                    category={product.category}
                    subCategory={product.subCategory}
                    image={product.image}
                    inStock={product.inStock}
                  />
                ))}
              </AnimatePresence>
            </motion.div>

            {hasMore && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 flex justify-center">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 min-h-[44px] bg-white border border-blue-100 text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 shadow-sm"
                >
                  Load More ({filteredProducts.length - visibleProducts.length} remaining)
                </button>
              </motion.div>
            )}

            {categorySeo?.faq?.length ? (
              <section className="mt-10 rounded-[1.5rem] border border-blue-100 bg-white p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-black text-blue-950 tracking-tight mb-5">
                  Frequently Asked Questions
                </h2>
                <div className="grid gap-4">
                  {categorySeo.faq.map((item) => (
                    <div key={item.question} className="rounded-2xl bg-blue-50/50 p-4">
                      <h3 className="text-sm font-black text-blue-950 mb-2">{item.question}</h3>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">{item.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {filteredProducts.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                  <Filter size={40} className="text-blue-200" />
                </div>
                <h3 className="text-2xl font-black text-blue-950 mb-2">No products found</h3>
                <p className="text-slate-400 font-medium mb-6">Try adjusting your filters.</p>
                <button
                  onClick={clearAll}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProductsSkeletonFallback() {
  return (
    <div className="min-h-screen bg-blue-50/30">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="h-3 w-32 bg-blue-100 rounded-full animate-pulse mb-8" />

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white rounded-[2rem] border border-blue-50 p-6 shadow-sm space-y-4 animate-pulse">
              <div className="h-3 w-20 bg-blue-100 rounded-full" />
              <div className="h-10 bg-blue-50 rounded-xl" />
              <div className="space-y-2 pt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-9 bg-blue-50 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[2rem] border border-blue-50 overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="aspect-square bg-blue-50/60" />
                  <div className="p-5 space-y-3">
                    <div className="h-2.5 w-14 bg-blue-50 rounded-full" />
                    <div className="h-3.5 bg-blue-50 rounded-full" />
                    <div className="h-3.5 w-3/4 bg-blue-50 rounded-full" />
                    <div className="h-11 bg-blue-50 rounded-xl mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPageClient({ initialCategory = null }: { initialCategory?: string | null } = {}) {
  return (
    <Suspense fallback={<ProductsSkeletonFallback />}>
      <ProductsContent initialCategory={initialCategory} />
    </Suspense>
  );
}
