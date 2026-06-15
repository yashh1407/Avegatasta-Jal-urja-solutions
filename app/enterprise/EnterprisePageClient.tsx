'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Captcha, CaptchaRef } from '@/components/Captcha';
import {
  ArrowRight,
  Building2,
  Factory,
  Hotel,
  Waves,
  GraduationCap,
  CheckCircle2,
  Send,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Wrench,
  ClipboardList,
  HeartHandshake,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { staggerContainer, fadeUp } from '@/lib/motion';

// ─── Data ────────────────────────────────────────────────────────────────────

const CLIENT_TYPES = [
  {
    icon: Factory,
    label: 'Industrial',
    description:
      'Large-scale pumping systems, water treatment plants, and solar on-grid installations for factories, industrial estates, and manufacturing units.',
  },
  {
    icon: Hotel,
    label: 'Hospitality',
    description:
      'Heat pump water heaters, complete swimming pool setups, and bulk chemical supply for hotels, resorts, and service apartments.',
  },
  {
    icon: Building2,
    label: 'Commercial',
    description:
      'Booster pump systems, water purifiers, softeners, and energy systems for office buildings, malls, and commercial complexes.',
  },
  {
    icon: Waves,
    label: 'Aquatics',
    description:
      'Full-spectrum pool solutions via Bluewave India — filtration equipment, pool chemicals, and ongoing supply contracts.',
  },
  {
    icon: GraduationCap,
    label: 'Institutional',
    description:
      'Reliable water and energy infrastructure for schools, hospitals, housing societies, and government projects in Nashik.',
  },
];

const DELIVERABLES = [
  {
    icon: ClipboardList,
    title: 'Site Assessment & Scoping',
    body: 'Our team visits your site to evaluate load requirements, infrastructure fit, and optimal product selection — at no cost for Nashik projects.',
  },
  {
    icon: ShieldCheck,
    title: 'Authorized Equipment Supply',
    body: 'Factory-fresh stock from V-Guard, Wilo, Zero B, and Bluewave India with full manufacturer warranty on every unit.',
  },
  {
    icon: Wrench,
    title: 'Certified Installation',
    body: 'End-to-end installation by trained technicians — from civil prep to commissioning — with safety compliance documentation.',
  },
  {
    icon: Zap,
    title: 'Energy & Performance Audits',
    body: 'Post-install efficiency checks and energy reports to help your project meet sustainability targets and reduce operating costs.',
  },
  {
    icon: HeartHandshake,
    title: 'After-Sales & AMC',
    body: 'Dedicated support contracts, spare parts availability, and priority service response for all enterprise accounts.',
  },
];

const WHY_US = [
  'Authorized channel partner for V-Guard, Wilo, Zero B & Bluewave India',
  'Single-vendor B2B project delivery — supply, install, and support',
  'Bulk procurement pricing and flexible payment terms for large orders',
  'Dedicated project manager for every enterprise engagement',
  'Proven track record across 10+ industry sectors in Nashik',
  'Certified technicians with manufacturer-endorsed training',
  'Fast turnaround on site visits and formal project quotations',
];

const STATS = [
  { value: '10+', label: 'Years in Business' },
  { value: '1,000+', label: 'Corporate Clients' },
  { value: '5,000+', label: 'Units Installed' },
  { value: '10+', label: 'Industry Sectors' },
];

const CREDENTIALS = [
  { name: 'V-Guard', category: 'Heat Pumps · Solar · Pumps' },
  { name: 'Wilo', category: 'Industrial Pumping Systems' },
  { name: 'Zero B', category: 'Water Purifiers · Softeners' },
  { name: 'Bluewave India', category: 'Pool Equipment · Chemicals' },
];

const SECTORS = [
  'Industrial / Manufacturing',
  'Hospitality (Hotel / Resort)',
  'Commercial (Office / Mall)',
  'Aquatics / Swimming Pool',
  'Institutional (School / Hospital)',
  'Residential Society / Township',
  'Government / Municipal',
  'Other',
];

const PROJECT_TYPES = [
  'New Installation',
  'Replacement / Upgrade',
  'Expansion / Additional Units',
  'Maintenance Contract (AMC)',
  'Consultation / Site Assessment',
  'Bulk Supply (without installation)',
];

// ─── Form types ───────────────────────────────────────────────────────────────

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

interface FormData {
  name: string;
  company: string;
  email: string;
  phone: string;
  scale: string;
  project_type: string;
  message: string;
  gstin: string;
}

const EMPTY_FORM: FormData = {
  name: '',
  company: '',
  email: '',
  phone: '',
  scale: '',
  project_type: '',
  message: '',
  gstin: '',
};

function validateForm(data: FormData): string | null {
  if (!data.name.trim()) return 'Your name is required.';
  if (!data.company.trim()) return 'Company / Organisation name is required.';
  if (!data.phone.trim()) return 'Phone number is required.';
  if (!data.email.trim()) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return 'Please enter a valid email address.';
  if (!data.message.trim()) return 'Please describe your project or requirements.';
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EnterprisePageClient() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const captchaRef = useRef<CaptchaRef>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitState === 'error') {
      setSubmitState('idle');
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!captchaRef.current?.validate()) {
      return;
    }

    const validationError = validateForm(formData);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitState('loading');
    try {
      // Map sector to database enum, keep project_type as scale
      const sectorToEnum: Record<string, string> = {
        'Industrial / Manufacturing': 'industrial',
        'Hospitality (Hotel / Resort)': 'hotel',
        'Commercial (Office / Mall)': 'commercial',
        'Aquatics / Swimming Pool': 'commercial',
        'Institutional (School / Hospital)': 'healthcare',
        'Residential Society / Township': 'residential_society',
        'Government / Municipal': 'commercial',
        'Other': 'other',
      };

      const captchaData = captchaRef.current?.getCaptchaData() || { token: '', input: '' };
      const submitData = {
        ...formData,
        project_type: sectorToEnum[formData.scale] || 'other',
        scale: formData.project_type,
        captchaToken: captchaData.token,
        captchaInput: captchaData.input,
      };

      const res = await fetch('/api/enterprise-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (res.ok) {
        setSubmitState('success');
        setFormData(EMPTY_FORM);
        captchaRef.current?.reset();
        setTimeout(() => setSubmitState('idle'), 6000);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg =
          typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.';
        setErrorMsg(msg);
        setSubmitState('error');
        if (msg.includes('verification code') || msg.toLowerCase().includes('captcha')) {
          captchaRef.current?.setErrorState(true);
        } else {
          captchaRef.current?.reset();
        }
      }
    } catch {
      setErrorMsg('Network error — please check your connection and try again.');
      setSubmitState('error');
      captchaRef.current?.reset();
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-[70vh] flex flex-col justify-center overflow-hidden bg-brand-950 pt-24 pb-20">
        {/* Background radial glows */}
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
          {/* Left: copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-800/60 border border-brand-700/50 text-accent-400 text-sm font-semibold tracking-wide mb-8"
            >
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              Enterprise &amp; Bulk Projects · Nashik
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-black tracking-tight text-white leading-[1.05] mb-6"
              style={{ fontSize: 'clamp(2.25rem, 4.5vw + 1rem, 4.5rem)' }}
            >
              Infrastructure-Scale{' '}
              <br className="hidden sm:block" />
              <span className="text-accent-400">Water, Energy</span>
              <br />
              &amp; Pool Solutions
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg text-brand-300 font-medium leading-relaxed max-w-xl mb-10"
            >
              End-to-end B2B project delivery for industrial, commercial, and institutional clients
              across Nashik. Authorized supply, certified installation, and dedicated after-sales
              support from a single trusted partner.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-10">
              <a
                href="#enterprise-enquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ boxShadow: '0 16px 48px -8px oklch(47% 0.18 250 / 0.40)' }}
              >
                Submit Enterprise Enquiry
                <ArrowRight size={18} />
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl font-bold backdrop-blur-sm transition-all duration-300"
              >
                Talk to Our Team
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-2 text-brand-400">
              <ShieldCheck size={16} className="text-accent-400 shrink-0" />
              <span className="text-sm font-semibold">
                V-Guard · Wilo · Zero B · Bluewave India — authorized channel partner
              </span>
            </motion.div>
          </motion.div>

          {/* Right: image */}
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
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=900&h=675"
                alt="Industrial water and energy infrastructure"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 mt-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.08, duration: 0.5 }}
                className="bg-white/8 border border-white/10 rounded-2xl px-6 py-5 backdrop-blur-sm"
              >
                <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-brand-400 uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
            {CLIENT_TYPES.map(({ icon: Icon, label, description }) => (
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
            ))}
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
            {DELIVERABLES.map(({ icon: Icon, title, body }) => (
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
            ))}
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
              {WHY_US.map((item) => (
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
            {[
              { value: '10+', label: 'Years Serving B2B Clients', sub: 'Established enterprise partner in Nashik' },
              { value: '1,000+', label: 'Corporate Clients', sub: 'Across industrial, commercial & hospitality' },
              { value: '5,000+', label: 'Units Installed', sub: 'Heat pumps, pumps, purifiers, pool systems' },
              { value: '10+', label: 'Industry Sectors', sub: 'From manufacturing to aquatics' },
            ].map((stat, i) => (
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

      {/* ── 6. Enterprise Enquiry Form ───────────────────────────────────── */}
      <section
        id="enterprise-enquiry"
        className="py-16 sm:py-20 lg:py-24 bg-slate-50 border-t border-slate-100 scroll-mt-20"
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="max-w-3xl mx-auto">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="text-center mb-12"
            >
              <motion.p
                variants={fadeUp}
                className="text-xs font-black text-accent-500 uppercase tracking-[0.2em] mb-3"
              >
                Get in Touch
              </motion.p>
              <motion.h2
                variants={fadeUp}
                className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-950 tracking-tight mb-4"
              >
                Enterprise Enquiry
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-600 font-medium text-lg">
                Tell us about your project. Our team will respond within one business day with a
                tailored proposal.
              </motion.p>
            </motion.div>

            {submitState === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-2xl font-black text-brand-950 mb-2">Enquiry Submitted</h3>
                <p className="text-slate-600 font-medium">
                  Thank you for reaching out. We will review your requirements and get back to you
                  within one business day.
                </p>
                <p className="text-sm text-slate-400 font-medium mt-4">
                  You can also reach us directly at{' '}
                  <a href="tel:+919689881369" className="text-brand-600 hover:underline">
                    +91 96898 81369
                  </a>
                </p>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-10 space-y-6"
                noValidate
              >
                {/* Row 1: Name + Company */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">
                      Company / Organisation <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Company or organisation name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Row 2: Phone + Email */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="gstin" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">
                    GSTIN (Optional)
                  </label>
                  <input
                    id="gstin"
                    name="gstin"
                    type="text"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="Enter your GSTIN here"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all"
                  />
                  <span className="text-[10px] text-slate-400 font-bold ml-1 block">Enter your GSTIN here</span>
                </div>

                {/* Row 3: Scale + Project Type */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="scale" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">
                      Industry Sector
                    </label>
                    <select
                      id="scale"
                      name="scale"
                      value={formData.scale}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all bg-white appearance-none"
                    >
                      <option value="">Select sector…</option>
                      {SECTORS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="project_type" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">
                      Project Type
                    </label>
                    <select
                      id="project_type"
                      name="project_type"
                      value={formData.project_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all bg-white appearance-none"
                    >
                      <option value="">Select type…</option>
                      {PROJECT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">
                    Project Requirements <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your project — scale, location, timeline, and any specific products or services you need…"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all resize-none"
                    required
                  />
                </div>

                <Captcha ref={captchaRef} />

                {/* Error message */}
                {(submitState === 'error' || errorMsg) && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {errorMsg || 'Something went wrong. Please try again.'}
                  </div>
                )}

                {/* Submit */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <p className="text-xs text-slate-400 font-medium">
                    We respond within 1 business day.
                  </p>
                  <button
                    type="submit"
                    disabled={submitState === 'loading'}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-brand-950 hover:bg-brand-800 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                  >
                    {submitState === 'loading' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Submit Enquiry
                      </>
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </section>

      {/* ── 7. Credentials Strip ─────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
              Authorized Channel Partner For
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {CREDENTIALS.map(({ name, category }) => (
              <motion.div
                key={name}
                variants={fadeUp}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-6 py-7 hover:border-brand-200 hover:bg-brand-50 transition-colors duration-300"
              >
                <p className="text-lg font-black text-brand-950">{name}</p>
                <p className="text-xs font-semibold text-slate-500 text-center">{category}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 text-center"
          >
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Have questions? Contact our team
              <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
