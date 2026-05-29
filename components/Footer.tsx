'use client';

import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const PRODUCT_CATEGORIES = [
  { name: 'Water Heating Solutions', href: '/products/water-heating-solutions' },
  { name: 'Pumping Solutions', href: '/products/pumping-solutions' },
  { name: 'Water Treatment Solutions', href: '/products/water-treatment-solutions' },
  { name: 'Swimming Pool Solutions', href: '/products/swimming-pool-solutions' },
  { name: 'Solar Power Systems', href: '/products/solar-power-systems' },
];

const QUICK_LINKS = [
  { name: 'Home',       href: '/' },
  { name: 'Products',   href: '/products' },
  { name: 'Services',   href: '/services' },
  { name: 'Projects',   href: '/projects' },
  { name: 'Enterprise', href: '/enterprise' },
  { name: 'About Us',   href: '/about' },
  { name: 'Contact',    href: '/contact' },
];

// â”€â”€â”€ WhatsApp icon (inline SVG â€” not in Lucide) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Footer() {
  const [contact, setContact] = useState({
    company_phone: '+919689881369',
    company_email: 'sales@avegatasta.com',
    company_address: 'Flat No. 2, Suryapraksh Apartment, Sant Kabir Nagar, Parijat Nagar, Nashik, Maharashtra 422005',
    whatsapp_number: '',
    social_linkedin: '',
    social_instagram: '',
  });

  useEffect(() => {
    const loadSettings = () => {
      fetch('/api/site-settings?group=contact')
        .then(r => r.json())
        .then(data => {
          if (data && typeof data === 'object') {
            setContact(prev => ({ ...prev, ...data }));
          }
        })
        .catch(console.error);
    };

    const requestIdle = window.requestIdleCallback;
    const cancelIdle = window.cancelIdleCallback;

    if (typeof requestIdle === 'function' && typeof cancelIdle === 'function') {
      const id = requestIdle(loadSettings, { timeout: 3000 });
      return () => cancelIdle(id);
    }

    const id = window.setTimeout(loadSettings, 1500);
    return () => window.clearTimeout(id);
  }, []);

  const phone = contact.company_phone || '+919689881369';
  const email = contact.company_email || 'sales@avegatasta.com';
  const address = contact.company_address || '';
  const waNumber = (contact.whatsapp_number || phone).replace(/\D/g, '');
  const linkedinUrl = contact.social_linkedin || '';
  const instagramUrl = contact.social_instagram || '';

  return (
    <footer className="bg-brand-50 text-slate-600 pt-10 lg:pt-14 pb-6 lg:pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">

        {/* â”€â”€ Main grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-6 sm:mb-8">

          {/* Col 1 â€” Brand info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="block relative h-12 sm:h-14 w-48 sm:w-56 mb-6">
              <Image
                src="/logo.webp"
                alt="Avegatasta Jal-Urja Solutions"
                fill
                className="object-contain object-left"
                sizes="(max-width: 640px) 192px, 224px"
              />
            </Link>

            <p className="text-slate-600 text-sm leading-relaxed mb-6 max-w-xs">
              Authorized distributor of V-Guard, Zero B, and Wilo water solutions. Premium heat pumps, pumps, and water treatment for homes and industries across Nashik.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:bg-green-500 hover:text-white hover:shadow-md transition-all"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon size={18} />
              </a>
              {linkedinUrl && (
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:shadow-md transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
              )}
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white hover:shadow-md transition-all"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Col 2 - Product categories */}
          <div>
            <h4 className="text-sm font-black text-brand-950 uppercase tracking-widest mb-6">
              Products
            </h4>
            <ul className="space-y-3">
              {PRODUCT_CATEGORIES.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-600 hover:text-brand-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 - Quick links */}
          <div>
            <h4 className="text-sm font-black text-brand-950 uppercase tracking-widest mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-600 hover:text-brand-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact + Map */}
          <div>
            <h4 className="text-sm font-black text-brand-950 uppercase tracking-widest mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4 mb-6">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-brand-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600 leading-relaxed">
                    {address}
                  </span>
                </li>
              )}
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-brand-600 shrink-0" />
                <a
                  href={`tel:${phone}`}
                  className="text-sm text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-brand-600 shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-slate-600 hover:text-brand-600 transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>

            {/* Google Maps link */}
            <a
              href="https://maps.google.com/?q=Avegatasta+Jal+Urja+Solutions+Nashik"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors border border-slate-200 bg-white rounded-xl px-3 py-2 hover:border-slate-300"
            >
              <MapPin size={12} />
              View on Google Maps
            </a>
          </div>
        </div>

        {/* Premium Brands strip */}
        <div className="relative border-t border-slate-200/60 pt-12 pb-10 mt-4 overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-full bg-gradient-to-r from-blue-50/0 via-blue-100/30 to-blue-50/0 blur-xl -z-10 rounded-full" />
          
          <div className="max-w-4xl mx-auto">
            {/* Title with delicate lines */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent to-slate-200 flex-1" />
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">
                Authorized Distributor
              </p>
              <div className="h-px bg-gradient-to-l from-transparent to-slate-200 flex-1" />
            </div>
            
            {/* Brands with diamonds */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:gap-x-10 text-slate-700">
              {['V-Guard', 'Zero B', 'Wilo', 'Bluewave'].map((brand, index, array) => (
                <React.Fragment key={brand}>
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-brand-950">
                    {brand}
                  </span>
                  {index < array.length - 1 && (
                    <span className="text-slate-300 text-sm hidden sm:inline-block" aria-hidden="true">
                      ✦
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-slate-500">
            &copy; {new Date().getFullYear()} Avegatasta Jal Urja Solutions. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link href="/privacy-policy" className="text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
              Cookies
            </Link>
            <Link href="/sitemap" className="text-xs font-medium text-slate-500 hover:text-brand-600 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

