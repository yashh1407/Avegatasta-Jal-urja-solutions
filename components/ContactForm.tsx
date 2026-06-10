'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, ShieldCheck, Clock, Zap, AlertCircle } from 'lucide-react';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

function validateContact(data: { name: string; email: string; phone: string; message: string }): string | null {
  if (!data.name.trim()) return 'Name is required.';
  if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'A valid email address is required.';
  if (!data.message.trim()) return 'Message is required.';
  if (data.phone && data.phone.length > 20) return 'Phone number is too long.';
  return null;
}

type ContactFormProps = {
  title?: string;
  subtitle?: string;
  content?: string;
  solutionsTitle?: string;
};

export default function ContactForm({
  title = 'Request a Consultation',
  subtitle = 'Planning a new installation? <br /><span class="text-blue-600">Let our experts help.</span>',
  content = 'If you are planning a solar installation, water heating system, pump installation, or water purification solution, our experts can help you choose the right system based on your requirements. Send us your enquiry and our team will contact you with the best solution and quotation.',
  solutionsTitle = 'Our Solutions'
}: ContactFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const isSubmitted = submitState === 'success';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const validationError = validateContact(formData);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitState('loading');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitState('success');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => setSubmitState('idle'), 5000);
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.';
        setErrorMsg(msg);
        setSubmitState('error');
      }
    } catch {
      setErrorMsg('Network error — please check your connection and try again.');
      setSubmitState('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (submitState === 'error') setSubmitState('idle');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact-form" className="py-16 sm:py-20 lg:py-24 bg-white overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-8">
              <Zap size={14} /> {title}
            </div>
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-950 tracking-tight mb-8 leading-tight"
              dangerouslySetInnerHTML={{ __html: subtitle }}
            />
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-12">
              {content}
            </p>
            
            <div className="space-y-6">
              <h3 className="text-xl font-black text-blue-950 mb-4">{solutionsTitle}</h3>
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
                      <span className="flex items-center gap-2">Sending…</span>
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
  );
}
