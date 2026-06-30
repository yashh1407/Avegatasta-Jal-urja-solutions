'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Captcha, CaptchaRef } from '@/components/Captcha';
import {
  Phone,
  MapPin,
  Clock,
  Mail,
  Send,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';

const faqs = [
  {
    question: "How long does installation take?",
    answer: "Most domestic pump and water purifier installations are completed within 4-6 hours. Larger solar or industrial systems may take 1-2 days depending on the complexity."
  },
  {
    question: "Do you provide after-sales service?",
    answer: "Yes, we are authorized service providers for all brands we sell. We offer both on-call repairs and annual maintenance contracts (AMC)."
  },
  {
    question: "What is the warranty period?",
    answer: "Warranty varies by product and brand. Typically, V-Guard and Zero B products come with a 1-year comprehensive warranty, while some pump motors have up to 2 years."
  },
  {
    question: "Do you offer free site visits?",
    answer: "For solar water heaters and industrial pumping solutions, we provide free site surveys within Nashik city limits to ensure the right product selection."
  }
];

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

type ContactFaq = { question: string; answer: string };

function parseJsonArray<T>(value: string | undefined, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(value ?? '[]');
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function validateContact(data: { name: string; email: string; phone: string; message: string }): string | null {
  if (!data.name.trim()) return 'Name is required.';
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'A valid email address is required.';
  if (!data.message.trim()) return 'Message is required.';
  if (data.phone && data.phone.length > 20) return 'Phone number is too long.';
  return null;
}

export default function ContactPageClient({ sections = [], pageData = {}, faqs = [] }: { sections?: any[]; pageData?: any; faqs?: any[] } = {}) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    gstin: ''
  });
  const captchaRef = useRef<CaptchaRef>(null);

  const isSubmitted = submitState === 'success';

  useEffect(() => {
    fetch('/api/site-settings')
      .then((response) => response.json())
      .then((data) => {
        if (data && typeof data === 'object') setSettings(data);
      })
      .catch(console.error);
  }, []);

  const heroSec = sections.find(s => s.section_type === 'GenericHero' || s.section_key === 'contact-hero');
  const infoSec = sections.find(s => s.section_type === 'ContactInfo' || s.section_key === 'contact-info');
  const formSec = sections.find(s => s.section_type === 'ContactForm' || s.section_key === 'contact-form');
  const faqSec = sections.find(s => s.section_type === 'FAQAccordion' || s.section_key === 'contact-faqs');
  const mapSec = sections.find(s => s.section_type === 'ContactMap' || s.section_key === 'contact-map');

  const parseJson = (val: any) => {
    if (typeof val === 'object' && val !== null) return val;
    try { return JSON.parse(val || '{}'); } catch { return {}; }
  };

  const heroData = heroSec ? parseJson(heroSec.data_json) : {};
  const infoData = infoSec ? parseJson(infoSec.data_json) : {};
  const formDataJson = formSec ? parseJson(formSec.data_json) : {};
  const mapData = mapSec ? parseJson(mapSec.data_json) : {};

  const phone = infoData.phone || settings.company_phone || '+91 96898 81369';
  const email = infoData.email || settings.company_email || 'sales@avegatasta.com';
  const address = mapData.address || infoData.address || settings.company_address || 'Flat No. 2, Suryapraksh Apartment, Nashik';
  const shortAddress = infoData.short_address || settings.company_address_short || 'Nashik, Maharashtra';
  const workingDays = infoData.working_days || settings.company_working_days || 'Monday - Saturday';
  const workingHours = infoData.working_hours || settings.company_working_hours || '9:30 AM - 6:30 PM';
  const mapsUrl = mapData.maps_url || settings.google_maps_url || 'https://maps.google.com';
  
  const phoneDesc = infoData.phone_description || `${workingDays}, ${workingHours}`;
  const companyName = infoData.company_name || settings.company_name || 'Avegatasta Solution';
  const emailDesc = infoData.email_description || 'Send us your enquiry';
  
  const rawContactFaqs = parseJsonArray<ContactFaq>(settings.contact_faqs, faqs);
  const contactFaqs = faqs && faqs.length > 0
    ? faqs.map(f => ({ question: f.question, answer: f.answer }))
    : rawContactFaqs;

  let solutionItems = formDataJson.solutions || formDataJson.solution_items;
  if (!solutionItems || !Array.isArray(solutionItems)) {
    solutionItems = parseJsonArray<string>(settings.contact_solution_items, [
      'Water Heating Solutions',
      'Pumping Solutions',
      'Water Treatment Solutions',
      'Solar On-Grid Systems',
    ]);
  }

  const heroBackground = heroData.background_image || heroData.image || settings.contact_hero_background_image || 'https://images.unsplash.com/photo-1541944743827-e04aa6427c33?auto=format&fit=crop&q=80&w=1920&h=1080&blur=10';
  const mapBackground = mapData.background_image || mapData.image || settings.contact_map_background_image || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200&h=800&blur=2';

  const contactHeroEyebrow = heroSec?.title || settings.contact_hero_eyebrow || 'Contact Us - Avegatasta Solution';
  const contactHeroTitle = heroSec?.subtitle || settings.contact_hero_title || 'Get in Touch with';
  const contactHeroHighlight = heroData.highlight || settings.contact_hero_highlight || 'Our Experts';
  const contactHeroCopy = heroSec?.content || settings.contact_hero_copy || 'At Avegatasta Solution, we are committed to providing reliable support and expert guidance for all your water heating, pumping, water treatment, and solar energy needs. Whether you are planning a new installation or looking for the right solution for your home or business, our team is here to help.';
  const contactHeroButtonLabel = heroData.button_label || settings.contact_hero_button_label || 'Request a Consultation';
  const contactCallLabel = heroData.call_label || settings.contact_call_label || 'Call us directly';

  const contactFormEyebrow = formSec?.title || settings.contact_form_eyebrow || 'Request a Consultation';
  const contactFormTitle = formSec?.subtitle || settings.contact_form_title || 'Planning a new installation?';
  const contactFormHighlight = formDataJson.highlight || settings.contact_form_highlight || 'Let our experts help.';
  const contactFormCopy = formSec?.content || settings.contact_form_copy || 'If you are planning a solar installation, water heating system, pump installation, or water purification solution, our experts can help you choose the right system based on your requirements. Send us your inquiry and our team will contact you with the best solution and quotation.';
  const contactSolutionsTitle = formDataJson.solutions_title || settings.contact_solutions_title || 'Our Solutions';
  const contactSolutionsCopy = formDataJson.solutions_copy || settings.contact_solutions_copy || 'We provide professional consultation and installation services for:';
  const contactTrustedTitle = formDataJson.trusted_title || settings.contact_trusted_title || 'Trusted Brands';
  const contactTrustedCopy = formDataJson.trusted_copy || settings.contact_trusted_copy || 'Our solutions are supported by trusted brands such as V-Guard, Wilo, and Zero B from Ion Exchange (India) Ltd.';

  const contactFaqEyebrow = faqSec?.title || settings.contact_faq_eyebrow || 'Common Questions';
  const contactFaqTitle = faqSec?.subtitle || settings.contact_faq_title || 'Frequently Asked Questions';

  const contactMapTitle = mapSec?.title || settings.contact_map_title || 'Visit our Visitors Area';
  const contactMapCopy = mapSec?.content || settings.contact_map_copy || 'Experience our range of V-Guard, Wilo, and Zero B products in person. Our technical staff is available for live demonstrations.';
  const contactDirectionsLabel = mapData.directions_label || settings.contact_directions_label || 'Get Driving Directions';
  const contactMapCardTitle = mapData.card_title || settings.contact_map_card_title || 'Avegatasta Visitors Area';
  const contactMapCardCopy = mapData.card_copy || settings.contact_map_card_copy || 'Click below to view our exact location on Google Maps.';
  const contactMapButtonLabel = mapData.button_label || settings.contact_map_button_label || 'Open Maps';

  const contactSuccessTitle = formDataJson.success_title || settings.contact_success_title || 'Message Received!';
  const contactSuccessCopy = formDataJson.success_copy || settings.contact_success_copy || 'Our team will contact you soon.';
  const contactSuccessButtonLabel = formDataJson.success_button_label || settings.contact_success_button_label || 'Send Another Message';

  const handleSubmit = async (e: React.FormEvent) => {
    if (!captchaRef.current?.validate()) {
      return;
    }

    const validationError = validateContact(formData);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitState('loading');
    try {
      const captchaData = captchaRef.current?.getCaptchaData() || { token: '', input: '' };
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captchaToken: captchaData.token,
          captchaInput: captchaData.input,
        })
      });

      if (response.ok) {
        setSubmitState('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '', gstin: '' });
        captchaRef.current?.reset();
        setTimeout(() => setSubmitState('idle'), 5000);
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.';
        setErrorMsg(msg);
        setSubmitState('error');
        if (msg.includes('verification code') || msg.toLowerCase().includes('captcha')) {
          captchaRef.current?.setErrorState(true);
        } else {
          captchaRef.current?.reset();
        }
      }
    } catch {
      setErrorMsg('Network error — please check your connection and try again.');
      setSubmitState('error');
      captchaRef.current?.reset();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (submitState === 'error') setSubmitState('idle');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* 1. Hero Section - Bold & Immersive */}
      <section className="relative pt-28 sm:pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-blue-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${heroBackground}")` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-950/80 to-blue-950" />
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6" dangerouslySetInnerHTML={{ __html: contactHeroEyebrow }} />
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
                <span dangerouslySetInnerHTML={{ __html: contactHeroTitle }} /> <br />
                <span className="text-blue-500" dangerouslySetInnerHTML={{ __html: contactHeroHighlight }} />
              </h1>
              <p className="text-xl text-blue-100/70 leading-relaxed font-medium mb-10" dangerouslySetInnerHTML={{ __html: contactHeroCopy }} />
              <div className="flex flex-wrap gap-6">
                <a href="#contact-form" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20" dangerouslySetInnerHTML={{ __html: contactHeroButtonLabel }} />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest" dangerouslySetInnerHTML={{ __html: contactCallLabel }} />
                    <div className="text-lg font-bold text-white">{phone}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Contact Methods Grid */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 -mt-32 relative z-20">
            {[
              { icon: Phone, title: "Phone", value: phone, desc: phoneDesc, color: "bg-emerald-500" },
              { icon: MapPin, title: "Office Address", value: companyName, desc: shortAddress, color: "bg-orange-500" },
              { icon: Clock, title: "Working Hours", value: workingDays, desc: workingHours, color: "bg-green-500" },
              { icon: Mail, title: "Email", value: email, desc: emailDesc, color: "bg-blue-500" }
            ].map((method, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group"
              >
                <div className={`w-14 h-14 ${method.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <method.icon size={28} />
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{method.title}</h3>
                <div className="text-lg font-black text-blue-950 mb-2 break-words">{method.value}</div>
                <p className="text-sm text-slate-500 font-medium">{method.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Main Contact Form Section */}
      <section id="contact-form" className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-8">
                <Zap size={14} /> <span dangerouslySetInnerHTML={{ __html: contactFormEyebrow }} />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-950 tracking-tight mb-8 leading-tight">
                <span dangerouslySetInnerHTML={{ __html: contactFormTitle }} /> <br />
                <span className="text-blue-600" dangerouslySetInnerHTML={{ __html: contactFormHighlight }} />
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-12" dangerouslySetInnerHTML={{ __html: contactFormCopy }} />
              
              <div className="space-y-6">
                <h3 className="text-xl font-black text-blue-950 mb-4" dangerouslySetInnerHTML={{ __html: contactSolutionsTitle }} />
                <p className="text-slate-600 font-medium mb-6" dangerouslySetInnerHTML={{ __html: contactSolutionsCopy }} />
                {solutionItems.map((text: string, i: number) => {
                  const icons = [ShieldCheck, CheckCircle2, Clock, Zap];
                  const Icon = icons[i % icons.length];
                  return (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="font-bold text-slate-700">{text}</span>
                  </div>
                  );
                })}
              </div>

              <div className="mt-16 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h4 className="text-xl font-black text-blue-950 mb-2" dangerouslySetInnerHTML={{ __html: contactTrustedTitle }} />
                <p className="text-slate-500 font-medium text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: contactTrustedCopy }} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-blue-600/5 rounded-[3rem] blur-2xl" />
              <div className="relative bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-blue-100/50">
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 text-emerald-500">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-blue-950 mb-4" dangerouslySetInnerHTML={{ __html: contactSuccessTitle }} />
                    <p className="text-slate-500 font-medium mb-10" dangerouslySetInnerHTML={{ __html: contactSuccessCopy }} />
                    <button 
                      onClick={() => setSubmitState('idle')}
                      className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all"
                      dangerouslySetInnerHTML={{ __html: contactSuccessButtonLabel }}
                    />
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          required
                          type="text" 
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          required
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Phone Number</label>
                        <input 
                          required
                          type="tel" 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Inquiry Type</label>
                        <select 
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                        >
                          <option value="">Select a subject</option>
                          <option value="Sales">Sales Inquiry</option>
                          <option value="Service">Service & Maintenance</option>
                          <option value="Installation">Installation Request</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">GSTIN (Optional)</label>
                      <input 
                        type="text" 
                        name="gstin"
                        value={formData.gstin}
                        onChange={handleChange}
                        placeholder="Enter your GSTIN here"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      />
                      <span className="text-[10px] text-slate-400 font-bold ml-1 block">Enter your GSTIN here</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Your Message</label>
                      <textarea 
                        required
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about your requirements..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      ></textarea>
                    </div>

                    <Captcha ref={captchaRef} />

                    {(submitState === 'error' || errorMsg) && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium"
                      >
                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={submitState === 'loading'}
                      className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 disabled:opacity-60 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-3"
                    >
                      {submitState === 'loading' ? (
                        <><Loader2 size={18} className="animate-spin" /> Sending…</>
                      ) : (
                        <>Send Message <Send size={18} /></>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="text-center mb-16">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4" dangerouslySetInnerHTML={{ __html: contactFaqEyebrow }} />
            <h3 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight" dangerouslySetInnerHTML={{ __html: contactFaqTitle }} />
          </div>
          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={contactFaqs} />
          </div>
        </div>
      </section>

      {/* 5. Map Section - Immersive */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight mb-6" dangerouslySetInnerHTML={{ __html: contactMapTitle }} />
              <p className="text-slate-500 font-medium leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: contactMapCopy }} />
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Address</div>
                    <div className="text-sm font-bold text-blue-950">{address}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email</div>
                    <div className="text-sm font-bold text-blue-950">{email}</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Hours</div>
                    <div className="text-sm font-bold text-blue-950">{workingDays}, {workingHours}</div>
                  </div>
                </div>
              </div>
              <a 
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-10 inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:underline"
              >
                <span dangerouslySetInnerHTML={{ __html: contactDirectionsLabel }} /> <ArrowRight size={16} />
              </a>
            </div>
            <div className="lg:col-span-2">
              <div className="w-full h-[500px] bg-slate-100 rounded-[3rem] overflow-hidden relative border border-slate-200 shadow-2xl">
                <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: `url("${mapBackground}")` }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-white text-center max-w-sm mx-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200">
                      <MapPin size={32} />
                    </div>
                    <h3 className="text-xl font-black text-blue-950 mb-2" dangerouslySetInnerHTML={{ __html: contactMapCardTitle }} />
                    <p className="text-slate-500 text-sm font-medium mb-8" dangerouslySetInnerHTML={{ __html: contactMapCardCopy }} />
                    <a 
                      href={mapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                      dangerouslySetInnerHTML={{ __html: contactMapButtonLabel }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

