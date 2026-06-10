'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Building2,
  Factory,
  Hotel,
  Waves,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Wrench,
  ClipboardList,
  HeartHandshake,
  LucideIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { staggerContainer, fadeUp } from '@/lib/motion';

const ICON_MAP: Record<string, LucideIcon> = {
  Factory, Hotel, Building2, Waves, GraduationCap, ClipboardList, ShieldCheck, Wrench, Zap, HeartHandshake
};

// ... Data Types
export type ClientType = { icon: string; label: string; description: string; };
export type Deliverable = { icon: string; title: string; body: string; };
export type Stat = { value: string; label: string; sub: string; };

type EnterpriseSectionsProps = {
  clientTypes?: ClientType[];
  deliverables?: Deliverable[];
  whyUs?: string[];
  stats?: Stat[];
};

export default function EnterpriseSections({
  clientTypes = [
    { icon: 'Factory', label: 'Industrial', description: 'Large-scale pumping systems, water treatment plants, and solar on-grid installations for factories, industrial estates, and manufacturing units.' },
    { icon: 'Hotel', label: 'Hospitality', description: 'Heat pump water heaters, complete swimming pool setups, and bulk chemical supply for hotels, resorts, and service apartments.' },
    { icon: 'Building2', label: 'Commercial', description: 'Booster pump systems, water purifiers, softeners, and energy systems for office buildings, malls, and commercial complexes.' },
    { icon: 'Waves', label: 'Aquatics', description: 'Full-spectrum pool solutions via Bluewave India — filtration equipment, pool chemicals, and ongoing supply contracts.' },
    { icon: 'GraduationCap', label: 'Institutional', description: 'Reliable water and energy infrastructure for schools, hospitals, housing societies, and government projects in Nashik.' },
  ],
  deliverables = [
    { icon: 'ClipboardList', title: 'Site Assessment & Scoping', body: 'Our team visits your site to evaluate load requirements, infrastructure fit, and optimal product selection — at no cost for Nashik projects.' },
    { icon: 'ShieldCheck', title: 'Authorized Equipment Supply', body: 'Factory-fresh stock from V-Guard, Wilo, Zero B, and Bluewave India with full manufacturer warranty on every unit.' },
    { icon: 'Wrench', title: 'Certified Installation', body: 'End-to-end installation by trained technicians — from civil prep to commissioning — with safety compliance documentation.' },
    { icon: 'Zap', title: 'Energy & Performance Audits', body: 'Post-install efficiency checks and energy reports to help your project meet sustainability targets and reduce operating costs.' },
    { icon: 'HeartHandshake', title: 'After-Sales & AMC', body: 'Dedicated support contracts, spare parts availability, and priority service response for all enterprise accounts.' },
  ],
  whyUs = [
    'Authorized channel partner for V-Guard, Wilo, Zero B & Bluewave India',
    'Single-vendor B2B project delivery — supply, install, and support',
    'Bulk procurement pricing and flexible payment terms for large orders',
    'Dedicated project manager for every enterprise engagement',
    'Proven track record across 10+ industry sectors in Nashik',
    'Certified technicians with manufacturer-endorsed training',
    'Fast turnaround on site visits and formal project quotations',
  ],
  stats = [
    { value: '10+', label: 'Years Serving B2B Clients', sub: 'Established enterprise partner in Nashik' },
    { value: '1,000+', label: 'Corporate Clients', sub: 'Across industrial, commercial & hospitality' },
    { value: '5,000+', label: 'Units Installed', sub: 'Heat pumps, pumps, purifiers, pool systems' },
    { value: '10+', label: 'Industry Sectors', sub: 'From manufacturing to aquatics' },
  ]
}: EnterpriseSectionsProps) {
  return (
    <>
      {/* ── 2. Enterprise Client Types ───────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100 overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="max-w-2xl mb-14"
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-black text-accent-500 uppercase tracking-[0.2em] mb-3"
            >
              Who We Serve
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-950 tracking-tight leading-tight mb-5"
            >
              Built for Every{' '}
              <span className="text-brand-600">Enterprise Sector</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-600 font-medium text-lg leading-relaxed">
              From a single commercial building to a multi-site industrial estate, our B2B solutions
              are scoped and delivered to match the demands of your sector.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5"
          >
            {clientTypes.map(({ icon, label, description }) => {
              const Icon = ICON_MAP[icon] || Factory;
              return (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  className="group rounded-2xl border border-slate-100 bg-slate-50 p-7 hover:border-brand-200 hover:bg-brand-50 transition-colors duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-100 flex items-center justify-center mb-5 group-hover:bg-brand-200 transition-colors duration-300">
                    <Icon size={20} className="text-brand-700" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-base font-black text-brand-950 mb-2">{label}</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── 3. What We Deliver ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50 border-t border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="max-w-2xl mb-14"
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-black text-accent-500 uppercase tracking-[0.2em] mb-3"
            >
              What We Deliver
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-950 tracking-tight leading-tight mb-5"
            >
              Full-Cycle{' '}
              <span className="text-brand-600">Project Execution</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-600 font-medium text-lg leading-relaxed">
              We handle every stage — from initial scoping to post-installation support — so your
              project stays on schedule and on budget.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {deliverables.map(({ icon, title, body }) => {
              const Icon = ICON_MAP[icon] || ClipboardList;
              return (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-5">
                    <Icon size={22} className="text-brand-700" strokeWidth={1.7} />
                  </div>
                  <h3 className="text-base font-black text-brand-950 mb-2">{title}</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── 4. Why Enterprise Buyers Choose Us ──────────────────────────── */}
      <section className="py-16 sm:py-20 lg:py-24 bg-brand-950 text-white overflow-hidden relative">
        <div
          aria-hidden
          className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, oklch(30% 0.14 250 / 0.5), transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, oklch(63% 0.16 195 / 0.15), transparent 70%)' }}
        />

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-black text-accent-400 uppercase tracking-[0.2em] mb-4"
            >
              Why Choose Us
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-10 leading-tight"
            >
              Why Enterprise Buyers{' '}
              <br />
              <span className="text-accent-400">Choose Avegatasta</span>
            </motion.h2>

            <motion.ul variants={staggerContainer} className="space-y-5 mb-10">
              {whyUs.map((item) => (
                <motion.li key={item} variants={fadeUp} className="flex gap-4 items-start">
                  <div className="w-7 h-7 rounded-full bg-accent-500/20 border border-accent-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <svg viewBox="0 0 12 12" width={10} fill="none" aria-hidden className="text-accent-400">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-brand-200 leading-relaxed font-medium">{item}</p>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div variants={fadeUp}>
              <a
                href="#enterprise-enquiry"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-brand-950 rounded-2xl font-bold hover:bg-brand-50 transition-colors"
              >
                Start Your Project
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden lg:block"
          >
            <div className="rounded-[2.5rem] overflow-hidden aspect-[4/5] rotate-2 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800&h=1000"
                alt="Industrial pump and energy installation"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. Reference Project Stats ──────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            className="text-center mb-14"
          >
            <p className="text-xs font-black text-accent-500 uppercase tracking-[0.2em] mb-3">
              Our Track Record
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-950 tracking-tight">
              Proven at Scale
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-7 text-center"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-950 mb-2 tabular-nums">
                  {stat.value}
                </div>
                <p className="text-sm font-black text-brand-700 mb-1">{stat.label}</p>
                <p className="text-xs text-slate-500 font-medium">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
