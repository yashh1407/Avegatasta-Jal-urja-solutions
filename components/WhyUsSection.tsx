'use client';

import { motion } from 'motion/react';
import { staggerContainer, fadeUp } from '@/lib/motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// ── Data ─────────────────────────────────────────────────────────────────────

const BENEFITS = [
  'Authorized partner for V-Guard, Wilo, Zero B & Bluewave India',
  'End-to-end B2B project delivery — supply, install, and support',
  'Serving industrial, commercial, hospitality, and residential sectors',
  'Swimming pool equipment & chemical solutions via Bluewave India',
  'Bulk procurement and enterprise project management capabilities',
  'Energy-efficient systems with certified after-sales service',
];

// ── Component ─────────────────────────────────────────────────────────────────

interface WhyUsSectionProps {
  badge?: string;
  titleHtml?: string;
  benefits?: string[];
  firstImage?: string;
  secondImage?: string;
}

export default function WhyUsSection({ badge, titleHtml, benefits, firstImage, secondImage }: WhyUsSectionProps = {}) {
  const resolvedBadge = badge || 'Why Choose Us';
  const resolvedTitleHtml = titleHtml || 'Your Enterprise <br /> Solutions Partner';
  const titleLines = resolvedTitleHtml.split('<br />');
  const resolvedBenefits = benefits || BENEFITS;
  const resolvedFirstImage = firstImage || 'https://images.unsplash.com/photo-1581093806997-124204d9fa9d?auto=format&fit=crop&q=80&w=800&h=450';
  const resolvedSecondImage = secondImage || '/about/b2b-services.jpg';

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-brand-950 text-white overflow-hidden relative">
      {/* Background glows */}
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

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        {/* ── Why Us split ──────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
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
              {resolvedBadge}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-black tracking-tight mb-10 leading-tight"
            >
              {titleLines.map((line, index) => (
                <span key={line || index} dangerouslySetInnerHTML={{ __html: line }} />
              ))}
            </motion.h2>

            <motion.ul variants={staggerContainer} className="space-y-5 mb-10">
              {resolvedBenefits.map((item) => (
                <motion.li key={item} variants={fadeUp} className="flex gap-4 items-start">
                  <div className="w-7 h-7 rounded-full bg-accent-500/20 border border-accent-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      viewBox="0 0 12 12"
                      width={10}
                      fill="none"
                      aria-hidden
                      className="text-accent-400"
                    >
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
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-brand-950 rounded-2xl font-bold hover:bg-brand-50 transition-colors"
              >
                Contact Our Experts
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: brand/services image collage */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden lg:flex flex-col gap-4"
          >
            <div className="motion-media relative rounded-[2rem] overflow-hidden aspect-video shadow-2xl">
              <Image
                src={resolvedFirstImage}
                alt="Authorized Brand Products — V-Guard, Wilo, Zero B, Bluewave"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl">
                Authorized Brands
              </div>
            </div>
            <div className="motion-media relative rounded-[2rem] overflow-hidden aspect-video shadow-2xl">
              <Image
                src={resolvedSecondImage}
                alt="End-to-End B2B Project Services"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl">
                B2B Services
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
