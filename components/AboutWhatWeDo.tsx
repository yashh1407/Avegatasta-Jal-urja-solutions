'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Droplets, Waves, ShieldCheck, Sun, Target, Eye, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Droplets, Waves, ShieldCheck, Sun, Target, Eye
};

export type ServiceItem = {
  title: string;
  description: string;
  icon: string;
};

type AboutWhatWeDoProps = {
  title?: string;
  subtitle?: string;
  content?: string;
  services?: ServiceItem[];
};

export default function AboutWhatWeDo({
  title = 'What We Do',
  subtitle = 'Complete Solutions for Modern Requirements',
  content = 'At Avegatasta Solution, we offer complete solutions that address modern water and energy requirements. From efficient water heating systems to advanced water purification and solar power generation, our services are designed to deliver long-term value and sustainability.',
  services = [
    {
      title: "Water Heating Solutions",
      description: "We provide modern water heating technologies, including the latest heat pump water heater models and comprehensive solar water heater installation. As a leading solar water heater supplier, we offer energy efficient water heater solutions and commercial heat pump water heater systems suitable for homes, hotels, hospitals, and commercial facilities.",
      icon: 'Droplets'
    },
    {
      title: "Pumping Solutions",
      description: "Our pumping solutions ensure smooth water flow, stable pressure, and efficient water distribution. We specialize in water pressure pump installation and provide robust booster pump system for buildings. As a trusted Wilo pump dealer and inline water pump supplier, we deliver reliable water transfer pump system setups for residential and industrial environments.",
      icon: 'Waves'
    },
    {
      title: "Water Treatment Systems",
      description: "We offer advanced utility water treatment and drinking water purification. Our services include water softener installation, whole house water filter setups, and expert RO water purifier installation. As a certified Zero B water purifier dealer and UV water purifier supplier, we ensure safe and high-quality water for your property.",
      icon: 'ShieldCheck'
    },
    {
      title: "Solar On-Grid Power Systems",
      description: "We design and execute professional solar system installation, including on grid solar system installation and commercial solar installation. If you are looking for solar panel installation near me or a solar power system for home, our experts can help, offering scalable solutions like 3kW solar system installation to reduce dependence on conventional power sources.",
      icon: 'Sun'
    }
  ]
}: AboutWhatWeDoProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">{title}</h2>
          <h3 className="text-3xl md:text-3xl sm:text-4xl font-black text-blue-950 tracking-tight mb-6">
            {subtitle}
          </h3>
          <p className="text-slate-600 font-medium leading-relaxed text-lg">
            {content}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = ICON_MAP[service.icon] || Droplets;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={28} />
                </div>
                <h4 className="text-2xl font-bold text-blue-950 mb-4">{service.title}</h4>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
