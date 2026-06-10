'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { staggerContainer, fadeUp } from '@/lib/motion';

type EnterpriseHeroProps = {
  title?: string;
  subtitle?: string;
  content?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  trustText?: string;
  image?: string;
};

export default function EnterpriseHero({
  title = 'Enterprise & Bulk Projects · Nashik',
  subtitle = 'Infrastructure-Scale <br class="hidden sm:block" /><span class="text-accent-400">Water, Energy</span><br />&amp; Pool Solutions',
  content = 'End-to-end B2B project delivery for industrial, commercial, and institutional clients across Nashik. Authorized supply, certified installation, and dedicated after-sales support from a single trusted partner.',
  primaryButtonText = 'Submit Enterprise Enquiry',
  primaryButtonLink = '#enterprise-enquiry',
  secondaryButtonText = 'Talk to Our Team',
  secondaryButtonLink = '/contact',
  trustText = 'V-Guard · Wilo · Zero B · Bluewave India — authorized channel partner',
  image = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=900&h=675'
}: EnterpriseHeroProps) {
  return (
    <section className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden bg-brand-950 pt-24 pb-20">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 70% 55% at 70% 35%, oklch(30% 0.14 250 / 0.50), transparent)',
            'radial-gradient(ellipse 45% 40% at 5% 90%, oklch(63% 0.16 195 / 0.18), transparent)',
          ].join(','),
        }}
      />

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 grid lg:grid-cols-2 gap-14 items-center">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-800/60 border border-brand-700/50 text-accent-400 text-sm font-semibold tracking-wide mb-8"
          >
            <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
            {title}
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-black tracking-tight text-white leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.25rem, 4.5vw + 1rem, 4.5rem)' }}
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />

          <motion.p variants={fadeUp} className="text-lg text-brand-300 font-medium leading-relaxed max-w-xl mb-10">
            {content}
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-10">
            {primaryButtonLink.startsWith('#') ? (
              <a
                href={primaryButtonLink}
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: '0 16px 48px -8px oklch(47% 0.18 250 / 0.40)' }}
              >
                {primaryButtonText}
                <ArrowRight size={18} />
              </a>
            ) : (
              <Link
                href={primaryButtonLink}
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: '0 16px 48px -8px oklch(47% 0.18 250 / 0.40)' }}
              >
                {primaryButtonText}
                <ArrowRight size={18} />
              </Link>
            )}
            
            <Link
              href={secondaryButtonLink}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl font-bold backdrop-blur-sm transition-all duration-300"
            >
              {secondaryButtonText}
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-2 text-brand-400">
            <ShieldCheck size={16} className="text-accent-400 shrink-0" />
            <span className="text-sm font-semibold">{trustText}</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative hidden lg:block"
        >
          <div
            className="relative rounded-[2.5rem] overflow-hidden aspect-[4/3]"
            style={{ boxShadow: '0 40px 100px -20px oklch(14% 0.07 250 / 0.7)' }}
          >
            <Image
              src={image}
              alt="Hero Image"
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-5 -left-6 bg-white rounded-2xl px-5 py-4 shadow-xl">
            <p className="text-xs font-black text-brand-950 uppercase tracking-widest mb-1">
              Authorized Partner
            </p>
            <p className="text-sm font-bold text-brand-600">V-Guard · Wilo · Zero B · Bluewave</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
