'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Target, Eye } from 'lucide-react';

type AboutMissionVisionProps = {
  subtitle?: string;
  content?: string;
};

export default function AboutMissionVision({
  subtitle = 'Our mission is to provide efficient, sustainable, and reliable water and energy solutions that enhance everyday living while supporting environmentally responsible practices.',
  content = 'To become a trusted leader in water and renewable energy solutions by delivering innovative technologies, dependable service, and customer-focused solutions.'
}: AboutMissionVisionProps) {
  return (
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
                {subtitle}
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
                {content}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
