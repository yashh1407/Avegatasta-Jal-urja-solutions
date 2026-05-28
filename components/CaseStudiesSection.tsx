'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Tag } from 'lucide-react';
import { caseStudies, SECTORS, type CaseStudy } from '@/lib/case-studies';

function CaseStudyCard({ study }: { study: CaseStudy }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col"
    >
      {/* Card header */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 rounded-full px-3 py-1">
            {study.sector}
          </span>
          {study.brands.map((b) => (
            <span
              key={b}
              className="inline-block text-xs font-bold text-slate-500 bg-slate-100 rounded-full px-3 py-1"
            >
              {b}
            </span>
          ))}
        </div>

        <h3 className="text-lg font-black text-blue-950 tracking-tight leading-snug mb-2">
          {study.title}
        </h3>
        <p className="text-sm font-medium text-slate-400 mb-4">{study.client}</p>

        {/* Brief summary visible always */}
        <div className="grid grid-cols-2 gap-3 mt-auto mb-4">
          <div className="bg-red-50/60 rounded-2xl p-3 border border-red-100/80">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Challenge</p>
            <p className="text-xs font-medium text-slate-700 leading-relaxed line-clamp-3">{study.challenge}</p>
          </div>
          <div className="bg-emerald-50/60 rounded-2xl p-3 border border-emerald-100/80">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Result</p>
            <p className="text-xs font-medium text-slate-700 leading-relaxed line-clamp-3">{study.result}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap mt-auto">
          <Tag size={11} className="text-slate-400" />
          {study.tags.map((t) => (
            <span key={t} className="text-[10px] font-semibold text-slate-400">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-3 border-t border-slate-100 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-colors"
        aria-expanded={expanded}
      >
        {expanded ? 'Hide Details' : 'View Full Solution'}
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} />
        </motion.span>
      </button>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 space-y-4 border-t border-slate-100 bg-slate-50">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Challenge</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{study.challenge}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Solution</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{study.solution}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Result</p>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{study.result}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function CaseStudiesSection() {
  const [activeSector, setActiveSector] = useState<string>('all');

  const filtered = useMemo(() => {
    if (activeSector === 'all') return caseStudies;
    return caseStudies.filter((s) => s.sectorId === activeSector);
  }, [activeSector]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Avegatasta Solution — Enterprise Case Studies',
    description:
      'Installation case studies across 10 industry sectors: solar, water heating, pumping, and water treatment.',
    numberOfItems: caseStudies.length,
    itemListElement: caseStudies.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Article',
        name: s.title,
        description: `${s.challenge} ${s.result}`,
        about: s.sector,
      },
    })),
  };

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-slate-50 border-t border-slate-100" aria-labelledby="case-studies-heading">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4" id="case-studies-heading">
            Enterprise Case Studies
          </h2>
          <h3 className="text-4xl font-black text-blue-950 tracking-tight mb-6">
            Real Projects. Real Results.
          </h3>
          <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
            Over 30 documented installations across 10 industry sectors — from single homes to large commercial and
            industrial facilities.
          </p>
        </div>

        {/* Sector filter pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {SECTORS.map((sector) => (
            <button
              key={sector.id}
              onClick={() => setActiveSector(sector.id)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 border ${
                activeSector === sector.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {sector.label}
              {sector.id !== 'all' && (
                <span className={`ml-1.5 ${activeSector === sector.id ? 'text-blue-200' : 'text-slate-400'}`}>
                  ({caseStudies.filter((s) => s.sectorId === sector.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Card grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((study) => (
              <CaseStudyCard key={study.id} study={study} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 font-medium py-16">No case studies found for this sector.</p>
        )}
      </div>
    </section>
  );
}
