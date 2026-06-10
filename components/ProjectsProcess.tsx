'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, PenTool, Wrench, Settings, Users, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  ClipboardCheck, PenTool, Wrench, Settings, Users
};

export type ProcessStep = {
  icon: string;
  text: string;
};

type ProjectsProcessProps = {
  title?: string;
  subtitle?: string;
  content?: string;
  steps?: ProcessStep[];
};

export default function ProjectsProcess({
  title = 'How We Work',
  subtitle = 'A structured installation process from start to support',
  content = 'Every project is planned with technical clarity, professional execution, and dependable after-sales service.',
  steps = [
    { icon: 'ClipboardCheck', text: 'Site inspection and requirement analysis' },
    { icon: 'PenTool', text: 'System design and product selection' },
    { icon: 'Wrench', text: 'Professional installation by trained technicians' },
    { icon: 'Settings', text: 'Testing and system commissioning' },
    { icon: 'Users', text: 'Customer guidance and after-sales support' },
  ]
}: ProjectsProcessProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">{title}</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight mb-5">{subtitle}</h3>
          <p className="text-lg text-slate-600 font-medium">{content}</p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">
          {steps.map((step, index) => {
            const Icon = ICON_MAP[step.icon] || ClipboardCheck;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="bg-slate-50 border border-slate-100 rounded-3xl p-6 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} />
                </div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{step.text}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
