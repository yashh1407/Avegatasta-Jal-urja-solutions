'use client';

import { motion } from 'motion/react';
import { staggerContainer, fadeUp } from '@/lib/motion';

const BRAND_PARTNERS = [
  {
    name: 'V-Guard',
    categories: ['Water Heating Solutions', 'Solar Power Systems'],
    color: 'from-red-600/20 to-red-500/5',
    border: 'border-red-500/20',
    dot: 'bg-red-500',
    initial: 'VG',
  },
  {
    name: 'ZeroB',
    categories: ['Water Treatment Solutions'],
    color: 'from-sky-600/20 to-sky-500/5',
    border: 'border-sky-500/20',
    dot: 'bg-sky-500',
    initial: 'ZB',
  },
  {
    name: 'Bluewave India',
    categories: ['Swimming Pool Solutions'],
    color: 'from-cyan-600/20 to-cyan-500/5',
    border: 'border-cyan-500/20',
    dot: 'bg-cyan-500',
    initial: 'BW',
  },
  {
    name: 'Wilo',
    categories: ['Pumping Solutions'],
    color: 'from-rose-700/20 to-rose-600/5',
    border: 'border-rose-600/20',
    dot: 'bg-rose-600',
    initial: 'WI',
  },
];

interface BrandsSectionProps {
  badge?: string;
  titleHtml?: string;
  description?: string;
}

export default function BrandsSection({ badge, titleHtml, description }: BrandsSectionProps = {}) {
  const resolvedBadge = badge || 'Brands We Partner With';
  const resolvedTitleHtml = titleHtml || 'Authorized for India\'s <span class="text-accent-400">Leading Brands</span>';
  const resolvedDescription = description || 'We are authorized channel partners for four specialized brands, covering every aspect of water, energy, and pool infrastructure for enterprise clients.';

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-950 text-white overflow-hidden relative">
      {/* Background glow */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(ellipse, oklch(47% 0.18 250 / 0.4), transparent 70%)' }}
      />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-black text-accent-400 uppercase tracking-[0.2em] mb-4"
          >
            {resolvedBadge}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
            dangerouslySetInnerHTML={{ __html: resolvedTitleHtml }}
          />
          <motion.p
            variants={fadeUp}
            className="mt-5 text-brand-300 max-w-2xl mx-auto text-lg leading-relaxed"
          >
            {resolvedDescription}
          </motion.p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BRAND_PARTNERS.map((brand, i) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`motion-card relative rounded-3xl border ${brand.border} bg-gradient-to-br ${brand.color} backdrop-blur-sm p-7 flex flex-col gap-4`}
            >
              {/* Brand initial badge */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black ${brand.dot} bg-opacity-80`}
                >
                  {brand.initial}
                </div>
                <p className="text-lg font-black text-white leading-tight">{brand.name}</p>
              </div>

              {/* Categories */}
              <div className="flex flex-col gap-2">
                {brand.categories.map((cat) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${brand.dot}`} />
                    <span className="text-sm text-brand-200 font-medium">{cat}</span>
                  </div>
                ))}
              </div>
              {/* Authorized tag */}
              <div className="mt-auto pt-3 border-t border-white/10">
                <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">
                  Authorized Partner
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
