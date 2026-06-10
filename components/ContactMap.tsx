'use client';

import React from 'react';
import { MapPin, Mail, Clock, ArrowRight } from 'lucide-react';

type ContactMapProps = {
  title?: string;
  subtitle?: string;
  content?: string;
  addressTitle?: string;
  addressValue?: string;
  emailTitle?: string;
  emailValue?: string;
  hoursTitle?: string;
  hoursValue?: string;
  mapLink?: string;
  buttonText?: string;
  mapTitle?: string;
  mapDesc?: string;
};

export default function ContactMap({
  title = 'Visit our Visitors Area',
  subtitle = '',
  content = 'Experience our range of V-Guard, Wilo, and Zero B products in person. Our technical staff is available for live demonstrations.',
  addressTitle = 'Address',
  addressValue = 'Flat No. 2, Suryapraksh Apartment, Nashik',
  emailTitle = 'Email',
  emailValue = 'sales@avegatasta.com',
  hoursTitle = 'Hours',
  hoursValue = 'Monday - Saturday, 9:30 AM - 6:30 PM',
  mapLink = 'https://maps.google.com',
  buttonText = 'Open Maps',
  mapTitle = 'Avegatasta Visitors Area',
  mapDesc = 'Click below to view our exact location on Google Maps.'
}: ContactMapProps) {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1">
            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight mb-6">{title}</h2>
            {subtitle && <h3 className="text-xl sm:text-2xl font-black text-blue-900 tracking-tight mb-4">{subtitle}</h3>}
            <p className="text-slate-500 font-medium leading-relaxed mb-8">
              {content}
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{addressTitle}</div>
                  <div className="text-sm font-bold text-blue-950">{addressValue}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{emailTitle}</div>
                  <div className="text-sm font-bold text-blue-950">{emailValue}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{hoursTitle}</div>
                  <div className="text-sm font-bold text-blue-950">{hoursValue}</div>
                </div>
              </div>
            </div>
            <a 
              href={mapLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:underline"
            >
              Get Driving Directions <ArrowRight size={16} />
            </a>
          </div>
          <div className="lg:col-span-2">
            <div className="w-full h-[500px] bg-slate-100 rounded-[3rem] overflow-hidden relative border border-slate-200 shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200&h=800&blur=2')] bg-cover bg-center opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white text-center max-w-sm mx-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200">
                    <MapPin size={32} />
                  </div>
                  <h3 className="text-xl font-black text-blue-950 mb-2">{mapTitle}</h3>
                  <p className="text-slate-500 text-sm font-medium mb-8">{mapDesc}</p>
                  <a 
                    href={mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                  >
                    {buttonText}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
