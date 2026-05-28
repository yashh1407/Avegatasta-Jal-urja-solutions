'use client';

import { motion } from 'motion/react';
import { staggerContainer, fadeUp } from '@/lib/motion';
import { ArrowRight, Building2, Factory, Hotel, Waves } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const SEGMENTS = [
  { icon: Factory,   label: 'Industrial' },
  { icon: Hotel,     label: 'Hospitality' },
  { icon: Building2, label: 'Commercial' },
  { icon: Waves,     label: 'Aquatics' },
];

const STATS = [
  { value: '1,000+', label: 'Corporate Clients' },
  { value: '5,000+', label: 'Units Installed' },
  { value: '10+',    label: 'Sectors Served' },
];

export default function EnterpriseSection() {
  return (
    <section
      className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100 overflow-hidden"
      aria-label="Enterprise & Bulk Project Solutions"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="relative rounded-[2.5rem] bg-brand-950 px-8 py-14 md:px-14 md:py-16 overflow-hidden"
          style={{
            background: [
              'radial-gradient(ellipse 70% 60% at 90% 50%, oklch(30% 0.14 250 / 0.5), transparent)',
              'radial-gradient(ellipse 50% 70% at 5% 80%, oklch(63% 0.16 195 / 0.15), transparent)',
              'oklch(14% 0.07 250)',
            ].join(','),
          }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* ── Left: text content ──────────────────────────────────── */}
            <div>
              {/* ── Eyebrow ─────────────────────────────────────────────── */}
              <motion.p
                variants={fadeUp}
                className="text-xs font-black text-accent-400 uppercase tracking-[0.2em] mb-4"
              >
                Enterprise &amp; Bulk Projects
              </motion.p>

              {/* ── Headline ──────────────────────────────────────────── */}
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-5 max-w-xl"
              >
                Powering India&rsquo;s{' '}
                <span className="text-accent-400">Enterprises</span>
              </motion.h2>

              {/* ── Sub-copy ──────────────────────────────────────────── */}
              <motion.p
                variants={fadeUp}
                className="text-brand-300 font-medium text-lg leading-relaxed max-w-2xl mb-8"
              >
                From a single commercial building to an entire industrial estate — Avegatasta delivers
                end-to-end B2B project execution with authorised equipment, certified installation,
                and dedicated after-sales support across every major sector.
              </motion.p>

              {/* ── Vertical icons ────────────────────────────────────── */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-3 mb-8"
              >
                {SEGMENTS.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/8 border border-white/12 text-brand-200 text-sm font-semibold backdrop-blur-sm"
                  >
                    <Icon size={15} strokeWidth={1.8} className="text-accent-400 shrink-0" />
                    {label}
                  </div>
                ))}
              </motion.div>

              {/* ── Stat chips ────────────────────────────────────────── */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-3 mb-10"
              >
                {STATS.map(({ value, label }) => (
                  <div
                    key={label}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-500/15 border border-accent-500/30 text-white text-sm font-bold"
                  >
                    <span className="text-accent-400">{value}</span>
                    <span className="text-brand-300 font-medium">{label}</span>
                  </div>
                ))}
              </motion.div>

              {/* ── CTA ───────────────────────────────────────────────── */}
              <motion.div variants={fadeUp}>
                <Link
                  href="/enterprise"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ boxShadow: '0 16px 48px -8px oklch(47% 0.18 250 / 0.45)' }}
                >
                  Explore Enterprise Solutions
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </div>

            {/* ── Right: enterprise image ──────────────────────────────── */}
            <motion.div
              variants={fadeUp}
              className="motion-media hidden lg:block relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=700&h=875"
                alt="Enterprise Commercial Infrastructure"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white font-black text-sm uppercase tracking-widest mb-1">Enterprise Ready</p>
                <p className="text-brand-300 text-xs font-medium">Industrial · Commercial · Hospitality · Aquatics</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
