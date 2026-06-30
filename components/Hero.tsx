'use client';

import { motion } from 'motion/react';
import { fadeUp, staggerContainer, staggerFast } from '@/lib/motion';
import { ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Stat {
  label: string;
  value: string;
}

interface HeroProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  content?: string;
  hero_image_1?: string;
  hero_image_2?: string;
  hero_image_3?: string;
  hero_image_4?: string;
  stats?: Stat[];
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  trustStripText?: string;
  image1Label?: string;
  image2Label?: string;
  image3Label?: string;
  image4Label?: string;
  floatingBadgeEyebrow?: string;
  floatingBadgeText?: string;
}

type SiteSettingsMap = Record<string, string | null | undefined>;

export default function Hero(props: HeroProps) {
  const [settings, setSettings] = useState<SiteSettingsMap>({});

  useEffect(() => {
    let active = true;

    fetch('/api/site-settings')
      .then((response) => (response.ok ? response.json() : {}))
      .then((data) => {
        if (active && data && typeof data === 'object') {
          setSettings(data as SiteSettingsMap);
        }
      })
      .catch(() => {
        /* keep static hero defaults if settings are unavailable */
      });

    return () => {
      active = false;
    };
  }, []);

  const setting = (key: string) => {
    const value = settings[key];
    return typeof value === 'string' && value.trim() ? value : undefined;
  };

  // Map standard props and provide defaults
  const badge = props.badge || props.subtitle || 'Avegatasta Jal-Urja Solutions · Nashik';
  const titleHtml = props.title || '<span class="whitespace-nowrap">Enterprise Water,</span><br/><span class="text-accent-400 whitespace-nowrap">Energy & Pool</span><br/>Solutions';
  const description = props.content || 'Authorized channel partner for V-Guard, Wilo, Zero B, and Bluewave India. End-to-end B2B solutions — water heating, pumping, treatment, solar, and swimming pool systems — for industrial, commercial, and large-scale residential projects across Nashik.';
  
  const hero_image_1 = props.hero_image_1 || '/hero/solar-field.jpg';
  const hero_image_2 = props.hero_image_2 || '/hero/water-pump.png';
  const hero_image_3 = props.hero_image_3 || '/hero/partner-team.jpg';
  const hero_image_4 = props.hero_image_4 || '/hero/water-solutions.jpg';

  const primaryButtonText = props.primaryButtonText || 'Explore Products';
  const primaryButtonUrl = props.primaryButtonUrl || '/products';
  const secondaryButtonText = props.secondaryButtonText || 'Get Free Advice';
  const secondaryButtonUrl = props.secondaryButtonUrl || '/contact';
  const trustStripText = props.trustStripText || 'Enterprise-grade products · B2B project specialists · Multi-sector experience';
  
  const image1Label = props.image1Label || 'Solar';
  const image2Label = props.image2Label || 'Pumping';
  const image3Label = props.image3Label || 'Partner';
  const image4Label = props.image4Label || 'Water';

  const floatingBadgeEyebrow = props.floatingBadgeEyebrow || 'Authorized Partner';
  const floatingBadgeText = props.floatingBadgeText || 'V-Guard · Wilo · Zero B · Bluewave';

  const resolvedBadge = props.badge || props.subtitle || setting('home_hero_badge') || badge;
  const resolvedTitleHtml = props.title || setting('home_hero_title') || titleHtml;
  const resolvedDescription = props.content || setting('home_hero_content') || description;
  const resolvedHeroImage1 = props.hero_image_1 || setting('home_hero_image_1') || hero_image_1;
  const resolvedHeroImage2 = props.hero_image_2 || setting('home_hero_image_2') || hero_image_2;
  const resolvedHeroImage3 = props.hero_image_3 || setting('home_hero_image_3') || hero_image_3;
  const resolvedHeroImage4 = props.hero_image_4 || setting('home_hero_image_4') || hero_image_4;
  const resolvedPrimaryButtonText = props.primaryButtonText || setting('home_primary_button_text') || primaryButtonText;
  const resolvedPrimaryButtonUrl = props.primaryButtonUrl || setting('home_primary_button_url') || primaryButtonUrl;
  const resolvedSecondaryButtonText = props.secondaryButtonText || setting('home_secondary_button_text') || secondaryButtonText;
  const resolvedSecondaryButtonUrl = props.secondaryButtonUrl || setting('home_secondary_button_url') || secondaryButtonUrl;
  const resolvedTrustStripText = props.trustStripText || setting('home_trust_strip_text') || trustStripText;
  const resolvedImage1Label = props.image1Label || setting('home_hero_image_1_label') || image1Label;
  const resolvedImage2Label = props.image2Label || setting('home_hero_image_2_label') || image2Label;
  const resolvedImage3Label = props.image3Label || setting('home_hero_image_3_label') || image3Label;
  const resolvedImage4Label = props.image4Label || setting('home_hero_image_4_label') || image4Label;

  const defaultStats = [
    { label: 'Established', value: '2015' },
    { label: 'Corporate Clients', value: '1000+' },
    { label: 'Units Installed', value: '5000+' },
    { label: 'Industry Sectors', value: '10+' },
  ];
  
  const settingsStats = [
    { label: 'Established', value: setting('established_year') || defaultStats[0].value },
    { label: 'Corporate Clients', value: setting('total_clients') || defaultStats[1].value },
    { label: 'Units Installed', value: setting('units_installed') || defaultStats[2].value },
    { label: 'Industry Sectors', value: setting('industry_sectors') || defaultStats[3].value },
  ];

  const stats = props.stats && props.stats.length > 0 ? props.stats : settingsStats;

  return (
    <section className="relative min-h-svh flex flex-col justify-start overflow-hidden bg-brand-950 pt-14 pb-3 sm:pt-16 lg:pt-16 lg:pb-4">
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

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-3 pb-6 lg:pt-4 lg:pb-6 grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] gap-8 lg:gap-10 xl:gap-12 items-center">
        {/* ── Left: Copy ──────────────────────────────────────────────────── */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 px-3 sm:px-4 py-2 rounded-full bg-brand-800/60 border border-brand-700/50 text-accent-400 text-xs sm:text-sm font-semibold tracking-wide mb-5"
          >
            <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
            {resolvedBadge}
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={staggerFast}
            className="font-black tracking-tight text-white leading-[1.03] mb-4 [&_span.text-accent-400]:text-accent-400"
            style={{ fontSize: 'clamp(2.15rem, 5vw, 4.15rem)' }}
            dangerouslySetInnerHTML={{ __html: resolvedTitleHtml.replace(/\n/g, '<br/>') }}
          />

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="text-base lg:text-[1.05rem] text-brand-300 font-medium leading-relaxed max-w-lg mb-6 sm:mb-7"
          >
            {resolvedDescription}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-7">
            <Link
              href={resolvedPrimaryButtonUrl}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{ boxShadow: '0 16px 48px -8px oklch(47% 0.18 250 / 0.40)' }}
            >
              {resolvedPrimaryButtonText}
              <ArrowRight size={18} />
            </Link>
            <Link
              href={resolvedSecondaryButtonUrl}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-2xl font-bold backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              {resolvedSecondaryButtonText}
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div variants={fadeUp} className="flex items-start sm:items-center gap-2 text-brand-400">
            <ShieldCheck size={16} className="text-accent-400 shrink-0" />
            <span className="text-sm font-semibold">
              {resolvedTrustStripText}
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
            className="relative rounded-[2.5rem] overflow-hidden aspect-square lg:aspect-auto lg:h-[64svh] lg:min-h-[470px] lg:max-h-[620px] p-2"
            style={{ boxShadow: '0 40px 100px -20px oklch(14% 0.07 250 / 0.7)', background: 'oklch(14% 0.07 250)' }}
          >
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src={resolvedHeroImage1}
                  alt={resolvedImage1Label}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  sizes="(min-width: 1024px) 25vw, 0px"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">{resolvedImage1Label}</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src={resolvedHeroImage2}
                  alt={resolvedImage2Label}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  sizes="(min-width: 1024px) 25vw, 0px"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">{resolvedImage2Label}</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src={resolvedHeroImage3}
                  alt={resolvedImage3Label}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                  sizes="(min-width: 1024px) 25vw, 0px"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">{resolvedImage3Label}</div>
              </div>
              <div className="relative rounded-2xl overflow-hidden bg-white">
                <Image
                  src={resolvedHeroImage4}
                  alt={resolvedImage4Label}
                  fill
                  className="object-contain p-2"
                  referrerPolicy="no-referrer"
                  sizes="(min-width: 1024px) 25vw, 0px"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">{resolvedImage4Label}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pb-6 lg:pb-7">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + i * 0.08, duration: 0.5 }}
              className="bg-white/8 border border-white/10 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-sm"
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
