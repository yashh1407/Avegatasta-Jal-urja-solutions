'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export type EnterpriseFormProps = {
  title?: string;
  subtitle?: string;
  content?: string;
};

// ... Form Types
type SubmitState = 'idle' | 'loading' | 'success' | 'error';
interface FormData { name: string; company: string; email: string; phone: string; scale: string; project_type: string; message: string; }
const EMPTY_FORM: FormData = { name: '', company: '', email: '', phone: '', scale: '', project_type: '', message: '', };

const SECTORS = [
  'Industrial / Manufacturing', 'Hospitality (Hotel / Resort)', 'Commercial (Office / Mall)',
  'Aquatics / Swimming Pool', 'Institutional (School / Hospital)', 'Residential Society / Township',
  'Government / Municipal', 'Other',
];

const PROJECT_TYPES = [
  'New Installation', 'Replacement / Upgrade', 'Expansion / Additional Units',
  'Maintenance Contract (AMC)', 'Consultation / Site Assessment', 'Bulk Supply (without installation)',
];

function validateForm(data: FormData): string | null {
  if (!data.name.trim()) return 'Your name is required.';
  if (!data.company.trim()) return 'Company / Organisation name is required.';
  if (!data.phone.trim()) return 'Phone number is required.';
  if (!data.email.trim()) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Please enter a valid email address.';
  if (!data.message.trim()) return 'Please describe your project or requirements.';
  return null;
}

export default function EnterpriseForm({
  title = 'Get in Touch',
  subtitle = 'Enterprise Enquiry',
  content = 'Tell us about your project. Our team will respond within one business day with a tailored proposal.'
}: EnterpriseFormProps) {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (submitState === 'error') {
      setSubmitState('idle');
      setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const validationError = validateForm(formData);
    if (validationError) { setErrorMsg(validationError); return; }

    setSubmitState('loading');
    try {
      const sectorToEnum: Record<string, string> = {
        'Industrial / Manufacturing': 'industrial', 'Hospitality (Hotel / Resort)': 'hotel',
        'Commercial (Office / Mall)': 'commercial', 'Aquatics / Swimming Pool': 'commercial',
        'Institutional (School / Hospital)': 'healthcare', 'Residential Society / Township': 'residential_society',
        'Government / Municipal': 'commercial', 'Other': 'other',
      };
      const submitData = { ...formData, project_type: sectorToEnum[formData.scale] || 'other', scale: formData.project_type, };
      const res = await fetch('/api/enterprise-inquiries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submitData),
      });

      if (res.ok) {
        setSubmitState('success'); setFormData(EMPTY_FORM); setTimeout(() => setSubmitState('idle'), 6000);
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(typeof data?.error === 'string' ? data.error : 'Something went wrong. Please try again.');
        setSubmitState('error');
      }
    } catch {
      setErrorMsg('Network error — please check your connection and try again.');
      setSubmitState('error');
    }
  };

  return (
    <section id="enterprise-enquiry" className="py-16 sm:py-20 lg:py-24 bg-slate-50 border-t border-slate-100 scroll-mt-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        <div className="max-w-3xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="text-center mb-12">
            <motion.p className="text-xs font-black text-accent-500 uppercase tracking-[0.2em] mb-3">{title}</motion.p>
            <motion.h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-950 tracking-tight mb-4">{subtitle}</motion.h2>
            <motion.p className="text-slate-600 font-medium text-lg">{content}</motion.p>
          </motion.div>

          {submitState === 'success' ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-brand-950 mb-2">Enquiry Submitted</h3>
              <p className="text-slate-600 font-medium">Thank you for reaching out. We will review your requirements and get back to you within one business day.</p>
            </motion.div>
          ) : (
            <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.55 }} onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 md:p-10 space-y-6" noValidate>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">Full Name <span className="text-red-500">*</span></label>
                  <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all" required />
                </div>
                <div>
                  <label htmlFor="company" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">Company / Organisation <span className="text-red-500">*</span></label>
                  <input id="company" name="company" type="text" value={formData.company} onChange={handleChange} placeholder="Company or organisation name" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all" required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">Phone Number <span className="text-red-500">*</span></label>
                  <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all" required />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">Email Address <span className="text-red-500">*</span></label>
                  <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="you@company.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="scale" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">Industry Sector</label>
                  <select id="scale" name="scale" value={formData.scale} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all bg-white appearance-none">
                    <option value="">Select sector…</option>
                    {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="project_type" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">Project Type</label>
                  <select id="project_type" name="project_type" value={formData.project_type} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all bg-white appearance-none">
                    <option value="">Select type…</option>
                    {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-black text-brand-950 uppercase tracking-widest mb-2">Project Requirements <span className="text-red-500">*</span></label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} placeholder="Describe your project..." className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-brand-950 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-400 transition-all resize-none" required />
              </div>
              {(submitState === 'error' || errorMsg) && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600 font-medium">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  {errorMsg || 'Something went wrong. Please try again.'}
                </div>
              )}
              <button type="submit" disabled={submitState === 'loading'} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-4 rounded-xl shadow-md hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {submitState === 'loading' ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
}
