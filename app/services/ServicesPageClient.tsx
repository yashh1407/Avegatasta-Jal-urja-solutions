'use client';

import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplets, Waves, ShieldCheck, Sun,
  CheckCircle2, ArrowRight, Building2, Home, Factory, Hotel, type LucideIcon
} from 'lucide-react';
import Link from 'next/link';

// ── Icon map (icon_name string → component) ───────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = { Droplets, Waves, ShieldCheck, Sun };

// ── Types ─────────────────────────────────────────────────────────────────────

type ServiceList = { id: number; list_title: string; items: string[] };
type ServiceCategory = { id: number; name: string; description: string; lists: ServiceList[] };
type Service = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  icon_name: string;
  intro: string;
  why_choose: string[];
  cta_title: string;
  cta_desc: string;
  categories: ServiceCategory[];
};

// ── Static data ───────────────────────────────────────────────────────────────

// ── Component ─────────────────────────────────────────────────────────────────



const DEFAULT_HERO = {
  eyebrow: 'Our Services',
  title: 'Professional Water & Energy Solutions',
  copy: 'Avegatasta Solution provides comprehensive services for residential, commercial, and industrial projects. Our experienced team ensures professional installation and reliable service support across all our offerings.',
};

const HERO_BY_FOCUS: Record<NonNullable<{ focus?: 'installation' }['focus']>, typeof DEFAULT_HERO> = {
  installation: {
    eyebrow: 'Installation Services',
    title: 'Heat Pump Installation Service Nashik',
    copy: 'Avegatasta provides heat pump installation service Nashik support for homes, hotels, hospitals and commercial projects, along with solar water heater, water purifier and pumping system installation coordination.',
  },
};

export default function ServicesPageClient({ sections = [], pageData = {}, focus }: { sections?: any[]; pageData?: any; focus?: 'installation' } = {}) {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/services').then(r => r.json()),
      fetch('/api/site-settings').then(r => r.json()),
    ])
      .then(([serviceData, settingsData]) => {
        if (Array.isArray(serviceData) && serviceData.length > 0) {
          setServices(serviceData);
          setActiveTab(serviceData[0].slug);
        }
        if (settingsData && typeof settingsData === 'object') {
          setSettings(settingsData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const heroSec = sections.find(s => s.section_type === 'GenericHero' || s.section_key === 'services-hero');
  const areasSec = sections.find(s => s.section_type === 'ServicesServiceAreas' || s.section_key === 'services-areas');
  const listSec = sections.find(s => s.section_type === 'ServicesList' || s.section_key === 'services-list');

  const parseJson = (val: any) => {
    if (typeof val === 'object' && val !== null) return val;
    try { return JSON.parse(val || '{}'); } catch { return {}; }
  };

  const areasData = areasSec ? parseJson(areasSec.data_json) : {};
  const listData = listSec ? parseJson(listSec.data_json) : {};

  let serviceAreaItems: string[] = [];
  if (areasData.items && Array.isArray(areasData.items)) {
    serviceAreaItems = areasData.items;
  } else if (areasData.areas && Array.isArray(areasData.areas)) {
    serviceAreaItems = areasData.areas;
  } else {
    try {
      const parsed = JSON.parse(settings.services_areas_items || '[]');
      serviceAreaItems = Array.isArray(parsed) ? parsed : [];
    } catch {
      serviceAreaItems = [];
    }
  }

  const areaIcons = [Home, Hotel, Building2, Factory];
  const serviceAreas = (serviceAreaItems.length > 0 ? serviceAreaItems : [
    'Apartments and Villas',
    'Hotels and Hospitals',
    'Commercial Buildings',
    'Industrial Facilities',
  ]).map((name, index) => ({ name, icon: areaIcons[index % areaIcons.length] }));

  const fallbackHero = focus ? HERO_BY_FOCUS[focus] : DEFAULT_HERO;
  const hero = focus === 'installation'
    ? {
      eyebrow: heroSec?.title || settings.services_installation_hero_eyebrow || fallbackHero.eyebrow,
      title: heroSec?.subtitle || settings.services_installation_hero_title || fallbackHero.title,
      copy: heroSec?.content || settings.services_installation_hero_copy || fallbackHero.copy,
    }
    : {
      eyebrow: heroSec?.title || settings.services_hero_eyebrow || fallbackHero.eyebrow,
      title: heroSec?.subtitle || settings.services_hero_title || fallbackHero.title,
      copy: heroSec?.content || settings.services_hero_copy || fallbackHero.copy,
    };

  const servicesAreasTitle = areasSec?.title || settings.services_areas_title || 'Service Areas';
  const servicesAreasCopy = areasSec?.subtitle || areasSec?.content || settings.services_areas_copy || 'We provide specialized services for various sectors including:';
  const servicesWhyTitle = listSec?.title || listData.why_title || settings.services_why_title || 'Why Choose Avegatasta Solution';
  const servicesContactButtonLabel = listSec?.subtitle || listData.contact_label || settings.services_contact_button_label || 'Contact Us';

  const handleTabClick = (slug: string) => {
    setActiveTab(slug);
    if (contentRef.current) {
      const yOffset = -100;
      const y = contentRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-20 bg-blue-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[22rem] h-[22rem] sm:w-[800px] sm:h-[800px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[18rem] h-[18rem] sm:w-[600px] sm:h-[600px] bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4" dangerouslySetInnerHTML={{ __html: hero.eyebrow }} />
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]" dangerouslySetInnerHTML={{ __html: hero.title }} />
            <p className="text-lg text-blue-100/80 font-medium leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: hero.copy }} />
          </motion.div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-black text-blue-950 tracking-tight mb-4" dangerouslySetInnerHTML={{ __html: servicesAreasTitle }} />
            <p className="text-slate-600 font-medium" dangerouslySetInnerHTML={{ __html: servicesAreasCopy }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {serviceAreas.map((area, index) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <area.icon size={24} />
                </div>
                <h4 className="font-bold text-blue-950" dangerouslySetInnerHTML={{ __html: area.name }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Services Content */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

            {/* Sidebar Navigation */}
            <div className="lg:w-1/4 shrink-0">
              <div className="sticky top-32 flex flex-col gap-2">
                {loading ? (
                  <div className="space-y-2 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-14 bg-slate-100 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  services.map((service) => {
                    const Icon = ICON_MAP[service.icon_name] ?? Droplets;
                    return (
                      <button
                        key={service.slug}
                        onClick={() => handleTabClick(service.slug)}
                        className={`flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-300 ${
                          activeTab === service.slug
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                            : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-100'
                        }`}
                      >
                        <Icon size={20} className={activeTab === service.slug ? 'text-white' : 'text-blue-600'} />
                        <span className="font-bold text-sm" dangerouslySetInnerHTML={{ __html: service.title }} />
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:w-3/4" ref={contentRef}>
              {loading ? (
                <div className="animate-pulse bg-white rounded-[2.5rem] p-12">
                  <div className="h-8 bg-slate-100 rounded-full max-w-lg mb-4" />
                  <div className="h-1.5 w-20 bg-slate-100 rounded-full mb-8" />
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded-full" />
                    <div className="h-4 bg-slate-100 rounded-full max-w-xl" />
                    <div className="h-4 bg-slate-100 rounded-full max-w-lg" />
                  </div>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  {services.map((service) =>
                    service.slug === activeTab && (
                      <motion.div
                        key={service.slug}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="bg-white rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-sm border border-slate-100"
                      >
                        <div className="mb-12">
                          <h2 className="text-3xl md:text-3xl sm:text-4xl font-black text-blue-950 tracking-tight mb-4" dangerouslySetInnerHTML={{ __html: service.subtitle }} />
                          <div className="w-20 h-1.5 bg-blue-600 rounded-full mb-8" />

                          <div className="prose prose-lg text-slate-600 font-medium max-w-none">
                            {service.intro.split('\n\n').map((paragraph, i) => (
                              <p key={i} className="mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph }} />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-12">
                          {service.categories.map((category, idx) => (
                            <div key={idx} className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                              <h3 className="text-2xl font-bold text-blue-950 mb-4" dangerouslySetInnerHTML={{ __html: category.name }} />
                              <p className="text-slate-600 font-medium leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: category.description }} />

                              {category.lists.length > 0 && (
                                <div className="grid md:grid-cols-2 gap-8 mt-8">
                                  {category.lists.map((list, lIdx) => (
                                    <div key={lIdx}>
                                      <h4 className="text-sm font-black text-blue-600 uppercase tracking-wider mb-4" dangerouslySetInnerHTML={{ __html: list.list_title }} />
                                      <ul className="space-y-3">
                                        {list.items.map((item, iIdx) => (
                                          <li key={iIdx} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                            <span className="text-slate-700 font-medium" dangerouslySetInnerHTML={{ __html: item }} />
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
                          <div>
                            <h3 className="text-2xl font-black text-blue-950 mb-6" dangerouslySetInnerHTML={{ __html: servicesWhyTitle }} />
                            <ul className="space-y-4">
                              {service.why_choose.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
                                    <span className="font-bold text-xs">✔</span>
                                  </div>
                                  <span className="text-slate-700 font-bold" dangerouslySetInnerHTML={{ __html: item }} />
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-blue-950 text-white p-8 rounded-3xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                            <h3 className="text-2xl font-black mb-4 relative z-10" dangerouslySetInnerHTML={{ __html: service.cta_title }} />
                            <div className="space-y-4 mb-8 relative z-10">
                              {service.cta_desc.split('\n').map((p, i) => (
                                <p key={i} className="text-blue-100/80 font-medium text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: p }} />
                              ))}
                            </div>
                            <Link
                              href="/contact"
                              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors relative z-10"
                            >
                              {servicesContactButtonLabel}
                              <ArrowRight size={18} />
                            </Link>
                          </div>
                        </div>

                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
