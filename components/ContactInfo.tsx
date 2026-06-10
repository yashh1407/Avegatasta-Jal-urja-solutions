'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Phone, MapPin, Clock, Mail, LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Phone, MapPin, Clock, Mail
};

export type ContactMethod = {
  icon: string;
  title: string;
  value: string;
  desc: string;
  color: string;
};

type ContactInfoProps = {
  methods?: ContactMethod[];
};

export default function ContactInfo({
  methods = [
    { icon: 'Phone', title: "Phone", value: "+91 96898 81369", desc: "Mon-Sat, 9:30 AM - 6:30 PM", color: "bg-emerald-500" },
    { icon: 'MapPin', title: "Office Address", value: "Avegatasta Solution", desc: "Nashik, Maharashtra", color: "bg-orange-500" },
    { icon: 'Clock', title: "Working Hours", value: "Monday - Saturday", desc: "9:30 AM - 6:30 PM", color: "bg-green-500" },
    { icon: 'Mail', title: "Email", value: "sales@avegatasta.com", desc: "Send us your enquiry", color: "bg-blue-500" }
  ]
}: ContactInfoProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-32 relative z-20">
          {methods.map((method, i) => {
            const Icon = ICON_MAP[method.icon] || Phone;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group"
              >
                <div className={`w-14 h-14 ${method.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{method.title}</h3>
                <div className="text-lg font-black text-blue-950 mb-2 break-words">{method.value}</div>
                <p className="text-sm text-slate-500 font-medium">{method.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
