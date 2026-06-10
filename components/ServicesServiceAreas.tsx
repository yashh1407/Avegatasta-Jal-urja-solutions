'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Home, Hotel, Building2, Factory, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Home, Hotel, Building2, Factory
};

export type ServiceAreaItem = {
  name: string;
  icon: string;
};

type ServicesServiceAreasProps = {
  title?: string;
  subtitle?: string;
  areas?: ServiceAreaItem[];
};

export default function ServicesServiceAreas({
  title = 'Service Areas',
  subtitle = 'We provide specialized services for various sectors including:',
  areas = [
    { name: "Apartments and Villas", icon: 'Home' },
    { name: "Hotels and Hospitals", icon: 'Hotel' },
    { name: "Commercial Buildings", icon: 'Building2' },
    { name: "Industrial Facilities", icon: 'Factory' },
  ]
}: ServicesServiceAreasProps) {
  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-black text-blue-950 tracking-tight mb-4">{title}</h3>
          <p className="text-slate-600 font-medium">{subtitle}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {areas.map((area, index) => {
            const Icon = ICON_MAP[area.icon] || Home;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <Icon size={24} />
                </div>
                <h4 className="font-bold text-blue-950">{area.name}</h4>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
