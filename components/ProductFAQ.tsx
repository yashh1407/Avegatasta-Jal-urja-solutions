'use client';

import React, { useState, useMemo } from 'react';
import Script from 'next/script';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import { getFaqsByCategory } from '@/lib/faqs';

const INITIAL_COUNT = 10;
const LOAD_MORE_COUNT = 10;

interface ProductFAQProps {
  category: string;
}

export default function ProductFAQ({ category }: ProductFAQProps) {
  const allFaqs = useMemo(() => getFaqsByCategory(category), [category]);
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return allFaqs;
    const q = query.toLowerCase();
    return allFaqs.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [allFaqs, query]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => setVisibleCount((c) => c + LOAD_MORE_COUNT);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setVisibleCount(INITIAL_COUNT);
    setOpenId(null);
  };

  const toggleOpen = (id: string) => setOpenId((prev) => (prev === id ? null : id));

  if (allFaqs.length === 0) return null;

  // FAQPage JSON-LD — use all FAQs, not just visible ones
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <>
      <Script
        id={`faq-jsonld-${category}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section aria-label="Frequently Asked Questions">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600">
            <HelpCircle size={16} />
          </div>
          <h2 className="text-2xl font-black text-blue-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <span className="text-xs text-slate-400 font-medium">{allFaqs.length} questions</span>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-lg">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search questions…"
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            aria-label="Search FAQs"
          />
        </div>

        {/* FAQ list */}
        {visible.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-400 text-sm font-medium py-8 text-center"
          >
            No questions match &ldquo;{query}&rdquo;.
          </motion.p>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          >
            {visible.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <motion.div
                  key={faq.id}
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                  }}
                  className="border border-blue-50 rounded-2xl overflow-hidden bg-white"
                >
                  <button
                    onClick={() => toggleOpen(faq.id)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-blue-50/40 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-black text-blue-950 leading-snug pr-2">
                      {faq.question}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 text-blue-400"
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-sm text-slate-500 font-medium leading-relaxed border-t border-blue-50 pt-3">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Load more */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 flex justify-center"
          >
            <button
              onClick={handleLoadMore}
              className="px-8 py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-2xl font-black uppercase tracking-widest text-xs transition-all"
            >
              Load More ({filtered.length - visibleCount} remaining)
            </button>
          </motion.div>
        )}
      </section>
    </>
  );
}
