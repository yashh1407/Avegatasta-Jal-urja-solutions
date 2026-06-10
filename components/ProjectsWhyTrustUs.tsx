'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

type ProjectsWhyTrustUsProps = {
  title?: string;
  subtitle?: string;
  content?: string;
  reasons?: string[];
};

export default function ProjectsWhyTrustUs({
  title = 'Why Customers Trust Us',
  subtitle = 'Trusted execution for water and energy infrastructure',
  content = 'From system selection to commissioning, Avegatasta focuses on delivering reliable performance, clean installation work, and long-term service value.',
  reasons = [
    'Experienced installation team',
    'Trusted technology from leading brands',
    'Customized solutions for every project',
    'Reliable service and technical support',
  ]
}: ProjectsWhyTrustUsProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 max-w-7xl mx-auto">
        <div className="bg-blue-950 rounded-[1.75rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 text-white">
          <div className="max-w-3xl mb-10">
            <h2 className="text-sm font-black text-blue-300 uppercase tracking-[0.2em] mb-4">{title}</h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-5">{subtitle}</h3>
            <p className="text-blue-100/80 text-lg font-medium leading-relaxed">
              {content}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {reasons.map((item, index) => (
              <div key={index} className="rounded-3xl bg-white/5 border border-white/10 p-5 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <span className="font-semibold text-blue-50">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
