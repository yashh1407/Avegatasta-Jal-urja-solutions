'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { fadeUp, staggerContainer, staggerFast, wordReveal } from '@/lib/motion';
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const STAT_KEYS = [
  { key: 'established_year', label: 'Established' },
  { key: 'total_clients',    label: 'Corporate Clients' },
  { key: 'units_installed',  label: 'Units Installed' },
  { key: 'industry_sectors', label: 'Industry Sectors' },
];

const HERO_HEADLINE: Array<Array<{ text: string; accent?: boolean }>> = [
  [{ text: 'Enterprise' }, { text: 'Water,' }],
  [{ text: 'Energy', accent: true }, { text: '&', accent: true }, { text: 'Pool', accent: true }],
  [{ text: 'Solutions' }],
];

export default function Hero() {
  const [statsSettings, setStatsSettings] = useState<Record<string, string>>({
    established_year: '2015',
    total_clients: '1000+',
    units_installed: '5000+',
    industry_sectors: '10+',
  });

  useEffect(() => {
    const loadSettings = () => {
      fetch('/api/site-settings?group=hero')
        .then(r => r.json())
        .then(data => { if (data && typeof data === 'object') setStatsSettings(prev => ({ ...prev, ...data })); })
        .catch(console.error);
    };

    const requestIdle = window.requestIdleCallback;
    const cancelIdle = window.cancelIdleCallback;

    if (typeof requestIdle === 'function' && typeof cancelIdle === 'function') {
      const id = requestIdle(loadSettings, { timeout: 2000 });
      return () => cancelIdle(id);
    }

    const id = window.setTimeout(loadSettings, 1200);
    return () => window.clearTimeout(id);
  }, []);

  const stats = STAT_KEYS.map(({ key, label }) => ({
    value: statsSettings[key] ?? '—',
    label,
  }));

  return (
    <section className="relative min-h-svh flex flex-col justify-center overflow-hidden bg-brand-950 pt-20 pb-4 lg:pt-24 lg:pb-8">
      {/* Radial gradient overlays */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 80% 60% at 65% 40%, oklch(30% 0.14 250 / 0.45), transparent)',
            'radial-gradient(ellipse 50% 40% at 10% 85%, oklch(63% 0.16 195 / 0.18), transparent)',
          ].join(','),
        }}
      />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 py-8 lg:py-12 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* ── Left: Copy ──────────────────────────────────────────────────── */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-full bg-brand-800/60 border border-brand-700/50 text-accent-400 text-xs sm:text-sm font-semibold tracking-wide mb-6 sm:mb-8"
          >
            <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
            Avegatasta Jal-Urja Solutions · Nashik
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={staggerFast}
            className="font-black tracking-tight text-white leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.15rem, 9vw, 5rem)' }}
          >
            {HERO_HEADLINE.map((line, lineIndex) => (
              <span key={lineIndex} className="block overflow-hidden pb-1">
                {line.map((word, wordIndex) => (
                  <motion.span
                    key={word.text}
                    variants={wordReveal}
                    className={`inline-block ${word.accent ? 'text-accent-400' : ''} ${wordIndex > 0 ? 'ml-[0.18em]' : ''}`}
                  >
                    {word.text}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="text-base sm:text-lg text-brand-300 font-medium leading-relaxed max-w-lg mb-8 sm:mb-10"
          >
            Authorized channel partner for V&#8209;Guard, Wilo, Zero&nbsp;B, and Bluewave India.
            End-to-end B2B solutions — water heating, pumping, treatment, solar, and swimming pool
            systems — for industrial, commercial, and large-scale residential projects across Nashik.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-10 sm:mb-12">
            <Link
              href="/products"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{ boxShadow: '0 16px 48px -8px oklch(47% 0.18 250 / 0.40)' }}
            >
              Explore Products
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl font-bold backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              Get Free Advice
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div variants={fadeUp} className="flex items-start sm:items-center gap-2 text-brand-400">
            <ShieldCheck size={16} className="text-accent-400 shrink-0" />
            <span className="text-sm font-semibold">
              Enterprise-grade products · B2B project specialists · Multi-sector experience
            </span>
          </motion.div>
        </motion.div>

        {/* ── Right: Hero image ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative hidden lg:block"
        >
          <div
            className="relative rounded-[2.5rem] overflow-hidden aspect-square lg:aspect-[1.15/1] p-2"
            style={{ boxShadow: '0 40px 100px -20px oklch(14% 0.07 250 / 0.7)', background: 'oklch(14% 0.07 250)' }}
          >
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src="/hero/solar-field.jpg"
                  alt="Solar Energy Solutions"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  sizes="(min-width: 1024px) 25vw, 0px"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">Solar</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src="/hero/water-pump.png"
                  alt="Industrial Pumping Systems"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  sizes="(min-width: 1024px) 25vw, 0px"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">Pumping</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src="/hero/partner-team.jpg"
                  alt="Authorized partnership and teamwork"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  sizes="(min-width: 1024px) 25vw, 0px"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">Partner</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-white">
                <Image
                  src="/hero/water-solutions.jpg"
                  alt="Water Heating & Treatment"
                  fill
                  className="object-contain p-2"
                  referrerPolicy="no-referrer"
                  sizes="(min-width: 1024px) 25vw, 0px"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">Water</div>
              </div>
            </div>
          </div>

          {/* Floating partnership badge */}
          <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl px-5 py-4 shadow-xl">
            <p className="text-xs font-black text-brand-950 uppercase tracking-widest mb-1">
              Authorized Partner
            </p>
            <p className="text-sm font-bold text-brand-600">V-Guard · Wilo · Zero B · Bluewave</p>
          </div>
        </motion.div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08, duration: 0.5 }}
              className="bg-white/8 border border-white/10 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 backdrop-blur-sm"
            >
              <div className="text-xl sm:text-2xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-brand-400 uppercase tracking-widest">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
