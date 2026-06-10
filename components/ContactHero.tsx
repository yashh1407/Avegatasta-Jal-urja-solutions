'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Phone } from 'lucide-react';

type ContactHeroProps = {
  title?: string;
  subtitle?: string;
  content?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  phoneLabel?: string;
  phoneNumber?: string;
};

export default function ContactHero({
  title = 'Contact Us – Avegatasta Solution',
  subtitle = 'Get in Touch with <br /><span class="text-blue-500">Our Experts</span>',
  content = 'At Avegatasta Solution, we are committed to providing reliable support and expert guidance for all your water heating, pumping, water treatment, and solar energy needs. Whether you are planning a new installation or looking for the right solution for your home or business, our team is here to help.',
  primaryButtonText = 'Request a Consultation',
  primaryButtonLink = '#contact-form',
  phoneLabel = 'Call us directly',
  phoneNumber = '+91 96898 81369'
}: ContactHeroProps) {
  return (
    <section className="relative pt-28 sm:pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-blue-950">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1541944743827-e04aa6427c33?auto=format&fit=crop&q=80&w=1920&h=1080&blur=10')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-950/80 to-blue-950" />
      </div>
      
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 relative z-10 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
              {title}
            </span>
            <h1 
              className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8"
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
            <p className="text-xl text-blue-100/70 leading-relaxed font-medium mb-10">
              {content}
            </p>
            <div className="flex flex-wrap gap-6">
              <a href={primaryButtonLink} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                {primaryButtonText}
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{phoneLabel}</div>
                  <div className="text-lg font-bold text-white">{phoneNumber}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
