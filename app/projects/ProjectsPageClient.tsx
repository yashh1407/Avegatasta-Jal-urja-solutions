'use client';

import React from 'react';
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

export default function ProjectsPageClient() {
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
            <h1 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Projects & Installations</h1>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
              Proven Solutions. <br />
              <span className="text-blue-500">Successful Installations.</span>
            </h2>
            <p className="text-lg text-blue-100/80 font-medium leading-relaxed mb-6">
              At Avegatasta Solution, we take pride in delivering reliable and efficient solutions for water heating,
              pumping systems, water treatment, and solar energy projects. Our experienced team ensures professional
              installation, system optimization, and long-term performance for every project we undertake.
            </p>
            <p className="text-lg text-blue-100/80 font-medium leading-relaxed">
              We work with trusted brands such as V-Guard, Wilo, and Zero B from Ion Exchange (India) Ltd., ensuring
              high-quality systems and dependable results.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="space-y-16">
            {installationTypes.map((type, index) => (
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
            ))}
          </div>
        </div>
      </section>

      <CaseStudiesSection />

      <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">How We Work</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight mb-5">A structured installation process from start to support</h3>
            <p className="text-lg text-slate-600 font-medium">
              Every project is planned with technical clarity, professional execution, and dependable after-sales service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">
            {processSteps.map((step, index) => (
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
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="bg-blue-950 rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 text-white">
            <div className="max-w-3xl mb-10">
              <h2 className="text-sm font-black text-blue-300 uppercase tracking-[0.2em] mb-4">Why Customers Trust Us</h2>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-5">Trusted execution for water and energy infrastructure</h3>
              <p className="text-blue-100/80 text-lg font-medium leading-relaxed">
                From system selection to commissioning, Avegatasta focuses on delivering reliable performance, clean installation work, and long-term service value.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {whyChooseUs.map((item) => (
                <div key={item} className="rounded-3xl bg-white/5 border border-white/10 p-5 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                  <span className="font-semibold text-blue-50">{item}</span>
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
