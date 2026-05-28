"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  Search,
  Maximize,
  Minimize,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter, usePathname } from "next/navigation";
import type { Product } from "@/lib/data";
import { productHierarchy } from "@/lib/productHierarchy";

interface SearchResult {
  products: Product[];
}

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function useSearch(query: string) {
  const [result, setResult] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResult(null);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      import("@/lib/data").then(({ products }) => {
        if (cancelled) return;

        const lq = query.toLowerCase();
        const matched = products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(lq) ||
              p.brand.toLowerCase().includes(lq) ||
              p.category.toLowerCase().includes(lq),
          )
          .slice(0, 5);

        setResult({ products: matched });
      });
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [query]);

  return { result };
}

export default function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isMobileCatsOpen, setIsMobileCatsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLDivElement>(null);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaCloseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { result: searchResult } = useSearch(searchQuery);
  const showDropdown = searchOpen && searchQuery.trim().length >= 2;

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    return () => {
      if (megaCloseTimeoutRef.current) {
        clearTimeout(megaCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (megaCloseTimeoutRef.current) {
      clearTimeout(megaCloseTimeoutRef.current);
      megaCloseTimeoutRef.current = null;
    }
    setIsMobileOpen(false);
    setIsMegaOpen(false);
    setIsMobileCatsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
        setSearchOpen(false);
        setIsMobileOpen(false);
      }
    },
    [router, searchQuery],
  );

  const handleResultClick = useCallback(
    (productId: string) => {
      router.push(`/product/${productId}`);
      setSearchQuery("");
      setSearchOpen(false);
      setIsMobileOpen(false);
    },
    [router],
  );

  const openMega = useCallback(() => {
    if (megaCloseTimeoutRef.current) {
      clearTimeout(megaCloseTimeoutRef.current);
      megaCloseTimeoutRef.current = null;
    }
    setIsMegaOpen(true);
  }, []);

  const closeMega = useCallback(() => {
    if (megaCloseTimeoutRef.current) {
      clearTimeout(megaCloseTimeoutRef.current);
    }

    megaCloseTimeoutRef.current = setTimeout(() => {
      setIsMegaOpen(false);
      megaCloseTimeoutRef.current = null;
    }, 100);
  }, []);

  const closeMegaNow = useCallback(() => {
    if (megaCloseTimeoutRef.current) {
      clearTimeout(megaCloseTimeoutRef.current);
      megaCloseTimeoutRef.current = null;
    }
    setIsMegaOpen(false);
  }, []);

  const handleProductsClick = useCallback(() => {
    closeMegaNow();
    router.push('/products');
  }, [closeMegaNow, router]);

  const mobileMainCategories = productHierarchy.slice(0, 5);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm py-2.5 sm:py-3">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 flex items-center justify-between gap-3 lg:gap-5 xl:gap-8">
        <Link href="/" className="flex-shrink-0">
          <div className="relative h-8 w-36 sm:h-9 sm:w-44 lg:w-40 xl:w-44 transition-all duration-300">
            <Image
              src="/logo.webp"
              alt="Avegatasta Jal-Urja Solutions"
              fill
              className="object-contain"
              sizes="(max-width: 640px) 144px, 176px"
              priority
            />
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-4 xl:gap-8 flex-1 relative z-10 min-w-0">
          <div
            ref={megaRef}
            onMouseEnter={openMega}
            onMouseLeave={closeMega}
            className="relative z-[90] flex items-center"
          >
            <button
              type="button"
              onClick={handleProductsClick}
              aria-expanded={isMegaOpen}
              className="flex items-center gap-1 text-xs xl:text-sm font-bold transition-colors text-slate-600 hover:text-brand-600 whitespace-nowrap"
            >
              Products
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${isMegaOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {isMegaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                  className="fixed left-1/2 -translate-x-1/2 top-[68px] sm:top-[74px] w-[1240px] max-w-[calc(100vw-32px)] bg-white rounded-[24px] sm:rounded-[28px] shadow-[0_28px_80px_-24px_rgba(15,23,42,0.28)] border border-slate-200 overflow-hidden z-[70]"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                        Browse Categories
                      </p>

                      <Link
                        href="/products"
                        onClick={closeMegaNow}
                        className="text-xs font-black text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        View all products
                        <ArrowRight size={11} />
                      </Link>
                    </div>

                    <div className="grid grid-cols-5 gap-2 xl:gap-3 items-stretch">
                      {productHierarchy.map((section) => (
                        <div
                          key={section.label}
                          className="rounded-2xl bg-slate-50/70 border border-slate-100 p-2.5 xl:p-3 hover:border-brand-100 hover:bg-brand-50/30 transition-colors h-full min-h-[210px] xl:min-h-[228px]"
                        >
                          <Link
                            href={
                              section.href ||
                              `/products?category=${encodeURIComponent(section.label)}`
                            }
                            onClick={closeMegaNow}
                            className="flex flex-col items-center text-center gap-1.5 mb-2 group"
                          >
                            {section.image ? (
                              <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-white border border-slate-100 shadow-sm">
                                <Image
                                  src={section.image}
                                  alt={section.label}
                                  width={48}
                                  height={48}
                                  sizes="48px"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : null}

                            <span className="text-[13px] xl:text-[15px] font-black text-slate-800 group-hover:text-brand-700 transition-colors leading-tight">
                              {section.label}
                            </span>
                          </Link>

                          <div className="space-y-2">
                            {section.children?.slice(0, 4).map((child) => (
                              <Link
                                key={child.label}
                                href={
                                  child.href ||
                                  `/products?category=${encodeURIComponent(child.label)}`
                                }
                                onClick={closeMegaNow}
                                className="flex items-start gap-2 px-1.5 py-1 rounded-lg hover:bg-white text-[11px] xl:text-[12px] font-bold text-slate-600 hover:text-brand-700 transition-colors leading-snug"
                              >
                                <ArrowRight
                                  size={11}
                                  className="mt-1 text-slate-300 shrink-0"
                                />
                                <span>{child.label}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onMouseEnter={closeMegaNow}
              onFocus={closeMegaNow}
              className="relative z-[80] text-xs xl:text-sm font-bold transition-colors text-slate-600 hover:text-brand-600 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          <div className="relative hidden lg:block" ref={searchRef}>
            <form
              onSubmit={handleSearch}
              suppressHydrationWarning
              className="flex items-center rounded-full px-4 py-2 gap-2 border transition-all bg-slate-100/60 border-slate-200 focus-within:ring-2 focus-within:ring-brand-500/25 focus-within:border-brand-400"
            >
              <Search size={14} className="shrink-0 text-brand-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search products..."
                className="bg-transparent text-xs focus:outline-none w-36 xl:w-56 transition-colors text-brand-950 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </form>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-80 bg-white border border-blue-50 rounded-2xl shadow-xl overflow-hidden z-[60]"
                >
                  {searchResult && searchResult.products.length > 0 ? (
                    <div>
                      {searchResult.products.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleResultClick(product.id)}
                          className="w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors flex items-center gap-3 group border-b border-slate-50 last:border-0"
                        >
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={36}
                              height={36}
                              sizes="36px"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-brand-950 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-brand-500 font-black uppercase tracking-wider">
                              {product.brand}
                            </p>
                          </div>
                        </button>
                      ))}
                      <div className="px-4 py-2.5 bg-slate-50/50">
                        <button
                          onClick={() => {
                            if (searchQuery.trim()) {
                              router.push(
                                `/products?q=${encodeURIComponent(searchQuery.trim())}`,
                              );
                              setSearchQuery("");
                              setSearchOpen(false);
                            }
                          }}
                          className="text-xs font-black text-brand-600 hover:text-brand-700 flex items-center gap-1"
                        >
                          <Search size={11} />
                          Search all results for &ldquo;{searchQuery}&rdquo;
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-5 text-center">
                      <p className="text-xs text-slate-400 font-bold">
                        No products found
                      </p>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        Try a different search term
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleFullscreen}
            className="hidden md:flex p-2 rounded-full transition-colors text-slate-500 hover:bg-slate-100"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors text-slate-700 hover:bg-slate-100"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
  initial={{ opacity: 0, x: "100%" }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: "100%" }}
  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
  className="fixed top-0 left-0 z-[9999] bg-white lg:hidden flex flex-col"
  style={{ width: "100vw", height: "100dvh" }}
>
            <div className="flex items-center justify-between px-4 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-slate-100 bg-white shrink-0">
              <div className="relative h-10 w-44">
                <Image
                  src="/logo.webp"
                  alt="Avegatasta Jal-Urja Solutions"
                  fill
                  className="object-contain object-left"
                  sizes="176px"
                />
              </div>

              <button
                onClick={() => setIsMobileOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 bg-white">
              <form onSubmit={handleSearch} suppressHydrationWarning className="mb-6">
                <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-400 transition-all">
                  <Search size={18} className="text-brand-500 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    placeholder="Search products..."
                    className="bg-transparent text-sm focus:outline-none flex-1 text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 bg-white border border-slate-100 rounded-2xl shadow-md overflow-hidden"
                    >
                      {searchResult && searchResult.products.length > 0 ? (
                        searchResult.products.map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleResultClick(product.id)}
                            className="w-full text-left px-4 py-3 hover:bg-brand-50 transition-colors flex items-center gap-3 border-b border-slate-50 last:border-0"
                          >
                            <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={36}
                                height={36}
                                sizes="36px"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-[10px] text-brand-500 font-black uppercase tracking-wider">
                                {product.brand}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-4 text-center">
                          <p className="text-xs text-slate-400 font-bold">
                            No results found
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <nav className="bg-white">
                <button
                  onClick={() => setIsMobileCatsOpen(!isMobileCatsOpen)}
                  className="w-full flex items-center justify-between py-4 text-[18px] font-black text-slate-900 border-b border-slate-100"
                >
                  Products
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 text-slate-400 ${
                      isMobileCatsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isMobileCatsOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden bg-white"
                    >
                      <div className="py-2">
                        {mobileMainCategories.map((section) => (
                          <Link
                            key={section.label}
                            href={
                              section.href ||
                              `/products?category=${encodeURIComponent(section.label)}`
                            }
                            onClick={() => setIsMobileOpen(false)}
                            className="flex items-center gap-3 py-3 text-[16px] font-bold text-slate-700 hover:text-brand-600 transition-colors border-b border-slate-50 last:border-b-0"
                          >
                            {section.image ? (
                              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                                <Image
                                  src={section.image}
                                  alt={section.label}
                                  width={36}
                                  height={36}
                                  sizes="36px"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : null}
                            <span>{section.label}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center py-4 text-[18px] font-black text-slate-900 border-b border-slate-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-slate-100 px-4 sm:px-6 py-4 sm:py-5 bg-white shrink-0">
              <a
                href="https://wa.me/919689881369"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-brand-600 text-white font-black text-sm hover:bg-brand-700 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
