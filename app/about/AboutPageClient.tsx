'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'motion/react';
import { CheckCircle2, Droplets, Sun, Waves, ShieldCheck, Target, Eye } from 'lucide-react';
import Image from 'next/image';

type AboutContentRow = { id: number; section: string; content: string };

export default function AboutPageClient() {
  const [aboutContent, setAboutContent] = useState<AboutContentRow[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch('/api/about-content').then(r => r.json()),
      fetch('/api/site-settings?group=general').then(r => r.json()),
    ])
      .then(([content, s]) => {
        if (Array.isArray(content)) setAboutContent(content);
        if (s && typeof s === 'object') setSettings(s);
      })
      .catch(console.error);
  }, []);

  const mission = aboutContent.find(a => a.section === 'mission')?.content ?? '';
  const vision = aboutContent.find(a => a.section === 'vision')?.content ?? '';
  const companyIntro = aboutContent.find(a => a.section === 'company_intro')?.content ?? '';

  let reasons: string[] = [];
  try { reasons = JSON.parse(settings.about_why_choose || '[]'); } catch { reasons = []; }

  const services = [
    {
      title: "Water Heating Solutions",
      description: "We provide modern water heating technologies, including the latest heat pump water heater models and comprehensive solar water heater installation. As a leading solar water heater supplier, we offer energy efficient water heater solutions and commercial heat pump water heater systems suitable for homes, hotels, hospitals, and commercial facilities.",
      icon: Droplets
    },
    {
      title: "Pumping Solutions",
      description: "Our pumping solutions ensure smooth water flow, stable pressure, and efficient water distribution. We specialize in water pressure pump installation and provide robust booster pump system for buildings. As a trusted Wilo pump dealer and inline water pump supplier, we deliver reliable water transfer pump system setups for residential and industrial environments.",
      icon: Waves
    },
    {
      title: "Water Treatment Systems",
      description: "We offer advanced utility water treatment and drinking water purification. Our services include water softener installation, whole house water filter setups, and expert RO water purifier installation. As a certified Zero B water purifier dealer and UV water purifier supplier, we ensure safe and high-quality water for your property.",
      icon: ShieldCheck
    },
    {
      title: "Solar On-Grid Power Systems",
      description: "We design and execute professional solar system installation, including on grid solar system installation and commercial solar installation. If you are looking for solar panel installation near me or a solar power system for home, our experts can help, offering scalable solutions like 3kW solar system installation to reduce dependence on conventional power sources.",
      icon: Sun
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-20 bg-blue-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[22rem] h-[22rem] sm:w-[800px] sm:h-[800px] bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[18rem] h-[18rem] sm:w-[600px] sm:h-[600px] bg-blue-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-4">
              About Us – Avegatasta Solution
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
              Your Trusted Partner for Water & Energy Solutions
            </h2>
            {companyIntro ? (
              companyIntro.split('\n\n').map((para, i) => (
                <p key={i} className="text-lg text-blue-100/80 font-medium leading-relaxed mb-4">
                  {para}
                </p>
              ))
            ) : (
              <>
                <p className="text-lg text-blue-100/80 font-medium leading-relaxed mb-8">
                  Avegatasta Solution is a reliable provider of advanced water heating, pumping systems, water treatment, and solar energy solutions for residential, commercial, and industrial customers. Our goal is to deliver high-quality, energy-efficient solutions that improve everyday comfort while reducing energy and water management costs.
                </p>
                <p className="text-lg text-blue-100/80 font-medium leading-relaxed">
                  We are proud to be an official channel partner of trusted industry brands such as V-Guard, Wilo, and Zero B from Ion Exchange (India) Ltd.. Through these partnerships, we provide reliable products backed by advanced technology and proven performance.
                </p>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">What We Do</h2>
            <h3 className="text-3xl md:text-3xl sm:text-4xl font-black text-blue-950 tracking-tight mb-6">
              Complete Solutions for Modern Requirements
            </h3>
            <p className="text-slate-600 font-medium leading-relaxed text-lg">
              At Avegatasta Solution, we offer complete solutions that address modern water and energy requirements. From efficient water heating systems to advanced water purification and solar power generation, our services are designed to deliver long-term value and sustainability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <service.icon size={28} />
                </div>
                <h4 className="text-2xl font-bold text-blue-950 mb-4">{service.title}</h4>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                  <Target size={32} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-blue-950 mb-4">Our Mission</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-lg">
                  {mission || 'Our mission is to provide efficient, sustainable, and reliable water and energy solutions that enhance everyday living while supporting environmentally responsible practices.'}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0" />
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-8">
                  <Eye size={32} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-blue-950 mb-4">Our Vision</h3>
                <p className="text-slate-600 font-medium leading-relaxed text-lg">
                  {vision || 'To become a trusted leader in water and renewable energy solutions by delivering innovative technologies, dependable service, and customer-focused solutions.'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl"
            >
              <Image
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200&h=1200"
                alt="Modern Home with Solar Panels"
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Why Choose Us</h2>
              <h3 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight mb-8">
                Why Choose Avegatasta Solution
              </h3>

              <div className="space-y-6 mb-10">
                {reasons.map((reason, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-slate-700 font-bold text-lg">{reason}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-blue-900 font-medium italic leading-relaxed">
                  &quot;We believe in building long-term relationships with our customers by providing trusted products, expert guidance, and dependable service.&quot;
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
