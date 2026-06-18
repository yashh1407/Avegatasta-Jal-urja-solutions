'use client';

import React, { useState, useRef } from 'react';
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

function validateContact(data: { name: string; email: string; phone: string; message: string }): string | null {
  if (!data.name.trim()) return 'Name is required.';
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'A valid email address is required.';
  if (!data.message.trim()) return 'Message is required.';
  if (data.phone && data.phone.length > 20) return 'Phone number is too long.';
  return null;
}

export default function ContactPageClient() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

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
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1541944743827-e04aa6427c33?auto=format&fit=crop&q=80&w=1920&h=1080&blur=10')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950 via-blue-950/80 to-blue-950" />
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
                Contact Us – Avegatasta Solution
              </span>
              <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-8">
                Get in Touch with <br />
                <span className="text-blue-500">Our Experts</span>
              </h1>
              <p className="text-xl text-blue-100/70 leading-relaxed font-medium mb-10">
                At Avegatasta Solution, we are committed to providing reliable support and expert guidance for all your water heating, pumping, water treatment, and solar energy needs. Whether you are planning a new installation or looking for the right solution for your home or business, our team is here to help.
              </p>
              <div className="flex flex-wrap gap-6">
                <a href="#contact-form" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                  Request a Consultation
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white">
                    <Phone size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Call us directly</div>
                    <div className="text-lg font-bold text-white">+91 96898 81369</div>
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
              { icon: Phone, title: "Phone", value: "+91 96898 81369", desc: "Mon-Sat, 9:30 AM - 6:30 PM", color: "bg-emerald-500" },
              { icon: MapPin, title: "Office Address", value: "Avegatasta Solution", desc: "Nashik, Maharashtra", color: "bg-orange-500" },
              { icon: Clock, title: "Working Hours", value: "Monday - Saturday", desc: "9:30 AM - 6:30 PM", color: "bg-green-500" },
              { icon: Mail, title: "Email", value: "sales@avegatasta.com", desc: "Send us your enquiry", color: "bg-blue-500" }
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
                <Zap size={14} /> Request a Consultation
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-950 tracking-tight mb-8 leading-tight">
                Planning a new installation? <br />
                <span className="text-blue-600">Let our experts help.</span>
              </h2>
              <p className="text-lg text-slate-600 font-medium leading-relaxed mb-12">
                If you are planning a solar installation, water heating system, pump installation, or water purification solution, our experts can help you choose the right system based on your requirements. Send us your enquiry and our team will contact you with the best solution and quotation.
              </p>
              
              <div className="space-y-6">
                <h3 className="text-xl font-black text-blue-950 mb-4">Our Solutions</h3>
                <p className="text-slate-600 font-medium mb-6">We provide professional consultation and installation services for:</p>
                {[
                  { icon: ShieldCheck, text: "Water Heating Solutions" },
                  { icon: CheckCircle2, text: "Pumping Solutions" },
                  { icon: Clock, text: "Water Treatment Solutions" },
                  { icon: Zap, text: "Solar On-Grid Systems" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-slate-700">{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-16 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <h4 className="text-xl font-black text-blue-950 mb-2">Trusted Brands</h4>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                  Our solutions are supported by trusted brands such as V-Guard, Wilo, and Zero B from Ion Exchange (India) Ltd.
                </p>
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
                    <h3 className="text-2xl sm:text-3xl font-black text-blue-950 mb-4">Message Received!</h3>
                    <p className="text-slate-500 font-medium mb-10">Our team will contact you soon.</p>
                    <button 
                      onClick={() => setSubmitState('idle')}
                      className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all"
                    >
                      Send Another Message
                    </button>
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
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Common Questions</h2>
            <h3 className="text-3xl sm:text-4xl font-black text-blue-950 tracking-tight">Frequently Asked Questions</h3>
          </div>
          <div className="max-w-3xl mx-auto">
            <FAQAccordion items={faqs} />
          </div>
        </div>
      </section>

      {/* 5. Map Section - Immersive */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-1">
              <h2 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight mb-6">Visit our Visitors Area</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-8">
                Experience our range of V-Guard, Wilo, and Zero B products in person. Our technical staff is available for live demonstrations.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Address</div>
                    <div className="text-sm font-bold text-blue-950">Flat No. 2, Suryapraksh Apartment, Nashik</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email</div>
                    <div className="text-sm font-bold text-blue-950">sales@avegatasta.com</div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Hours</div>
                    <div className="text-sm font-bold text-blue-950">Monday - Saturday, 9:30 AM - 6:30 PM</div>
                  </div>
                </div>
              </div>
              <a 
                href="https://maps.google.com" 
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
                    <h3 className="text-xl font-black text-blue-950 mb-2">Avegatasta Visitors Area</h3>
                    <p className="text-slate-500 text-sm font-medium mb-8">Click below to view our exact location on Google Maps.</p>
                    <a 
                      href="https://maps.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
                    >
                      Open Maps
                    </a>
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

