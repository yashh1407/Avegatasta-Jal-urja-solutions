'use client';

import React from 'react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

type AboutWhyChooseUsProps = {
  title?: string;
  subtitle?: string;
  content?: string;
  reasons?: string[];
  image?: string;
};

export default function AboutWhyChooseUs({
  title = 'Why Choose Us',
  subtitle = 'Why Choose Avegatasta Solution',
  reasons = [
    'Experienced installation team',
    'Trusted technology from leading brands',
    'Customized solutions for every project',
    'Reliable service and technical support'
  ],
  content = "We believe in building long-term relationships with our customers by providing trusted products, expert guidance, and dependable service.",
  image = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200&h=1200'
}: AboutWhyChooseUsProps) {
  return (
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
              src={image}
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
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">{title}</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight mb-8">
              {subtitle}
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
                &quot;{content}&quot;
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
