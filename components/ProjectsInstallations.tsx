'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Sun, Droplets, Waves, ShieldCheck, CheckCircle2, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Sun, Droplets, Waves, ShieldCheck
};

export type InstallationListType = {
  title: string;
  items: string[];
};

export type InstallationType = {
  id: string;
  title: string;
  icon: string;
  intro: string;
  lists: InstallationListType[];
};

type ProjectsInstallationsProps = {
  installations?: InstallationType[];
};

export default function ProjectsInstallations({
  installations = [
    {
      id: 'solar',
      title: 'Solar System Installations',
      icon: 'Sun',
      intro: 'We design and install on-grid solar power systems for residential and commercial customers. Our team manages the entire process from system planning to installation and commissioning.',
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
      icon: 'Droplets',
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
      icon: 'Waves',
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
      icon: 'ShieldCheck',
      intro: 'We provide professional installation of water treatment systems to ensure clean and safe water for both utility and drinking purposes.',
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
  ]
}: ProjectsInstallationsProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 max-w-7xl mx-auto">
        <div className="space-y-16">
          {installations.map((type, index) => {
            const Icon = ICON_MAP[type.icon] || Sun;
            return (
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
                    <Icon size={30} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight">{type.title}</h2>
                </div>

                <p className="text-lg text-slate-600 font-medium leading-relaxed mb-10 max-w-4xl">{type.intro}</p>

                <div className="grid md:grid-cols-2 gap-10">
                  {type.lists.map((list) => (
                    <div key={list.title} className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                      <h3 className="text-sm font-black text-blue-600 uppercase tracking-wider mb-6">{list.title}</h3>
                      <ul className="space-y-4">
                        {list.items.map((item) => (
                          <li key={item} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <span className="text-slate-700 font-medium">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
