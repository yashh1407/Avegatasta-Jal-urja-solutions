'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import {
  Sun,
  Droplets,
  Waves,
  ShieldCheck,
  CheckCircle2,
  ClipboardCheck,
  PenTool,
  Wrench,
  Settings,
  Users,
} from 'lucide-react';
import CaseStudiesSection from '@/components/CaseStudiesSection';

const installationTypes = [
  {
    id: 'solar',
    title: 'Solar System Installations',
    icon: Sun,
    intro:
      'We design and install on-grid solar power systems for residential and commercial customers. Our team manages the entire process from system planning to installation and commissioning.',
    lists: [
      {
        title: 'Typical Projects',
        items: [
          'Residential rooftop solar systems',
          'Solar installations for commercial buildings',
          'Solar systems for small industries',
          'Solar systems ranging from 3 kW to 100 kW',
        ],
      },
      {
        title: 'Project Benefits',
        items: ['Reduced electricity costs', 'Sustainable energy generation', 'Reliable power production'],
      },
    ],
  },
  {
    id: 'water-heating',
    title: 'Water Heating System Installations',
    icon: Droplets,
    intro: 'We install modern water heating systems that deliver efficient hot water solutions for various applications.',
    lists: [
      {
        title: 'Projects Include',
        items: [
          'Heat pump installations for residential buildings',
          'Commercial heat pump systems for hotels and hospitals',
          'Solar water heater installations',
          'Electric geyser installations for homes and offices',
        ],
      },
    ],
  },
  {
    id: 'pumping',
    title: 'Pumping System Installations',
    icon: Waves,
    intro: 'Our team installs advanced pumping systems designed for efficient water pressure management and water distribution.',
    lists: [
      {
        title: 'Common Installations',
        items: [
          'Pressure pump systems for residential buildings',
          'Booster pump systems for high-rise apartments',
          'Inline pumps for circulation systems',
          'Water transfer pumps for tank filling and distribution',
        ],
      },
    ],
  },
  {
    id: 'water-treatment',
    title: 'Water Treatment Installations',
    icon: ShieldCheck,
    intro:
      'We provide professional installation of water treatment systems to ensure clean and safe water for both utility and drinking purposes.',
    lists: [
      {
        title: 'Systems Installed',
        items: [
          'Water softeners for hard water treatment',
          'Whole-house filtration systems',
          'RO drinking water purification systems',
          'UV purification systems',
        ],
      },
    ],
  },
] as const;

const processSteps = [
  { icon: ClipboardCheck, text: 'Site inspection and requirement analysis' },
  { icon: PenTool, text: 'System design and product selection' },
  { icon: Wrench, text: 'Professional installation by trained technicians' },
  { icon: Settings, text: 'Testing and system commissioning' },
  { icon: Users, text: 'Customer guidance and after-sales support' },
] as const;

const whyChooseUs = [
  'Experienced installation team',
  'Trusted technology from leading brands',
  'Customized solutions for every project',
  'Reliable service and technical support',
] as const;

type SiteSettingsMap = Record<string, string | null | undefined>;
type ProjectTypeOverride = { id?: string; title?: string; intro?: string };

function parseJsonArray<T>(value: string | null | undefined, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export default function ProjectsPageClient({ sections = [], pageData = {} }: { sections?: any[]; pageData?: any } = {}) {
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
        /* keep static project defaults if settings are unavailable */
      });

    return () => {
      active = false;
    };
  }, []);

  const setting = (key: string) => {
    const value = settings[key];
    return typeof value === 'string' && value.trim() ? value : undefined;
  };

  const heroSec = sections.find(s => s.section_type === 'GenericHero' || s.section_key === 'projects-hero');
  const installationsSec = sections.find(s => s.section_type === 'ProjectsInstallations' || s.section_key === 'projects-installations');
  const processSec = sections.find(s => s.section_type === 'ProjectsProcess' || s.section_key === 'projects-process');
  const trustSec = sections.find(s => s.section_type === 'ProjectsWhyTrustUs' || s.section_key === 'projects-why');

  const parseJson = (val: any) => {
    if (typeof val === 'object' && val !== null) return val;
    try { return JSON.parse(val || '{}'); } catch { return {}; }
  };

  const installationsData = installationsSec ? parseJson(installationsSec.data_json) : {};
  const processData = processSec ? parseJson(processSec.data_json) : {};
  const trustData = trustSec ? parseJson(trustSec.data_json) : {};

  const projectTypeOverrides = parseJsonArray<ProjectTypeOverride>(settings.projects_installation_types, []);
  const projectTypeById = new Map(
    projectTypeOverrides
      .filter((item): item is ProjectTypeOverride & { id: string } => Boolean(item.id))
      .map((item) => [item.id, item])
  );
  const editableInstallationTypes = installationTypes.map((type) => {
    const override = projectTypeById.get(type.id);
    return {
      ...type,
      title: override?.title || type.title,
      intro: override?.intro || type.intro,
    };
  });

  const TYPE_ICON_MAP: Record<string, any> = { Sun, Droplets, Waves, ShieldCheck };

  let finalInstallationTypes = editableInstallationTypes.map(t => {
    const IconComp = TYPE_ICON_MAP[t.id] ?? Sun;
    return { ...t, icon: IconComp };
  });

  if (installationsData.types && Array.isArray(installationsData.types)) {
    finalInstallationTypes = installationsData.types.map((t: any) => {
      const IconComp = TYPE_ICON_MAP[t.icon] ?? TYPE_ICON_MAP[t.id] ?? Sun;
      return {
        id: t.id || t.title,
        title: t.title,
        intro: t.intro,
        icon: IconComp,
        lists: t.lists || [],
      };
    });
  } else if (installationsData.installation_types && Array.isArray(installationsData.installation_types)) {
    finalInstallationTypes = installationsData.installation_types.map((t: any) => {
      const IconComp = TYPE_ICON_MAP[t.icon] ?? TYPE_ICON_MAP[t.id] ?? Sun;
      return {
        id: t.id || t.title,
        title: t.title,
        intro: t.intro,
        icon: IconComp,
        lists: t.lists || [],
      };
    });
  }

  const processTexts = parseJsonArray<string>(settings.projects_process_steps, Array.from(processSteps, (step) => step.text));
  const editableProcessSteps = processTexts.map((text, index) => ({
    text,
    icon: processSteps[index % processSteps.length].icon,
  }));

  const fallbackStepsIcons = [ClipboardCheck, PenTool, Wrench, Settings, Users];
  let finalProcessSteps: any[] = [];
  if (processData.steps && Array.isArray(processData.steps)) {
    finalProcessSteps = processData.steps.map((step: any, index: number) => {
      const iconName = typeof step === 'object' ? step.icon : '';
      const stepText = typeof step === 'object' ? step.text : step;
      const STEP_ICON_MAP: Record<string, any> = { ClipboardCheck, PenTool, Wrench, Settings, Users };
      const IconComp = STEP_ICON_MAP[iconName] ?? fallbackStepsIcons[index % fallbackStepsIcons.length];
      return { text: stepText, icon: IconComp };
    });
  } else {
    finalProcessSteps = editableProcessSteps;
  }

  const editableTrustItems = parseJsonArray<string>(settings.projects_trust_items, Array.from(whyChooseUs));
  let finalTrustItems: string[] = [];
  if (trustData.items && Array.isArray(trustData.items)) {
    finalTrustItems = trustData.items;
  } else if (trustData.benefits && Array.isArray(trustData.benefits)) {
    finalTrustItems = trustData.benefits;
  } else {
    finalTrustItems = Array.from(editableTrustItems);
  }

  const heroEyebrow = heroSec?.title || setting('projects_hero_eyebrow') || 'Projects & Installations';
  const heroTitle = heroSec?.subtitle || (setting('projects_hero_title') ? `${setting('projects_hero_title')} <br /><span class="text-blue-500">${setting('projects_hero_highlight')}</span>` : 'Proven Solutions. <br /><span class="text-blue-500">Successful Installations.</span>');
  const heroCopy1 = heroSec?.content || setting('projects_hero_copy_1') || 'At Avegatasta Solution, we take pride in delivering reliable and efficient solutions for water heating, pumping systems, water treatment, and solar energy projects. Our experienced team ensures professional installation, system optimization, and long-term performance for every project we undertake.';
  const heroCopy2 = heroSec ? '' : (setting('projects_hero_copy_2') || 'We work with trusted brands such as V-Guard, Wilo, and Zero B from Ion Exchange (India) Ltd., ensuring high-quality systems and dependable results.');

  const processEyebrow = processSec?.title || setting('projects_process_eyebrow') || 'How We Work';
  const processTitle = processSec?.subtitle || setting('projects_process_title') || 'A structured installation process from start to support';
  const processCopy = processSec?.content || setting('projects_process_copy') || 'Every project is planned with technical clarity, professional execution, and dependable after-sales service.';

  const trustEyebrow = trustSec?.title || setting('projects_trust_eyebrow') || 'Why Customers Trust Us';
  const trustTitle = trustSec?.subtitle || setting('projects_trust_title') || 'Trusted execution for water and energy infrastructure';
  const trustCopy = trustSec?.content || setting('projects_trust_copy') || 'From system selection to commissioning, Avegatasta focuses on delivering reliable performance, clean installation work, and long-term service value.';

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      <section className="pt-28 sm:pt-32 pb-20 bg-blue-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[22rem] h-[22rem] sm:w-[800px] sm:h-[800px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[18rem] h-[18rem] sm:w-[600px] sm:h-[600px] bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <h1 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4" dangerouslySetInnerHTML={{ __html: heroEyebrow }} />
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]" dangerouslySetInnerHTML={{ __html: heroTitle }} />
            <p className="text-lg text-blue-100/80 font-medium leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: heroCopy1 }} />
            {heroCopy2 && (
              <p className="text-lg text-blue-100/80 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: heroCopy2 }} />
            )}
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="space-y-16">
            {finalInstallationTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="bg-white rounded-[2.25rem] p-8 md:p-12 shadow-sm border border-slate-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                    <type.icon size={30} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight" dangerouslySetInnerHTML={{ __html: type.title }} />
                </div>

                <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10 max-w-4xl" dangerouslySetInnerHTML={{ __html: type.intro }} />

                <div className="grid md:grid-cols-2 gap-10">
                  {type.lists.map((list) => (
                    <div key={list.title} className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                      <h3 className="text-sm font-black text-blue-600 uppercase tracking-wider mb-6" dangerouslySetInnerHTML={{ __html: list.title }} />
                      <ul className="space-y-4">
                        {list.items.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="text-slate-700 font-medium" dangerouslySetInnerHTML={{ __html: item }} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CaseStudiesSection />

      <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4" dangerouslySetInnerHTML={{ __html: processEyebrow }} />
            <h3 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight mb-5" dangerouslySetInnerHTML={{ __html: processTitle }} />
            <p className="text-lg text-slate-600 font-medium" dangerouslySetInnerHTML={{ __html: processCopy }} />
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">
            {finalProcessSteps.map((step, index) => (
              <motion.div
                key={step.text}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <step.icon size={24} />
                </div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: step.text }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="bg-blue-950 rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 text-white">
            <div className="max-w-3xl mb-10">
              <h2 className="text-sm font-black text-blue-300 uppercase tracking-[0.2em] mb-4" dangerouslySetInnerHTML={{ __html: trustEyebrow }} />
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-5" dangerouslySetInnerHTML={{ __html: trustTitle }} />
              <p className="text-blue-100/80 text-lg font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: trustCopy }} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {finalTrustItems.map((item) => (
                <div key={item} className="rounded-3xl bg-white/5 border border-white/10 p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                  <span className="font-semibold text-blue-50" dangerouslySetInnerHTML={{ __html: item }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
