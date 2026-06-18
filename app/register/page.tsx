'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Captcha, CaptchaRef } from '@/components/Captcha';

export default function RegisterPage() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    gstin: ''
  });
  const [error, setError] = useState('');
  const captchaRef = useRef<CaptchaRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaRef.current?.validate()) {
      return;
    }
    
    try {
      const captchaData = captchaRef.current?.getCaptchaData() || { token: '', input: '' };
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          gstin: formData.gstin,
          captchaToken: captchaData.token,
          captchaInput: captchaData.input,
        })
      });

      if (response.ok) {
        setIsRegistered(true);
        setFormData({ firstName: '', lastName: '', phone: '', gstin: '' });
        captchaRef.current?.reset();
      } else {
        const data = await response.json().catch(() => ({}));
        const msg = typeof data?.error === 'string' ? data.error : 'Registration failed. Please try again.';
        setError(msg);
        if (msg.includes('verification code') || msg.toLowerCase().includes('captcha')) {
          captchaRef.current?.setErrorState(true);
        } else {
          captchaRef.current?.reset();
        }
      }
    } catch (error) {
      console.error('Error registering:', error);
      setError('Something went wrong. Please try again.');
      captchaRef.current?.reset();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-blue-50/30">
      <Navbar />
      
      <main className="max-w-md mx-auto px-6 pt-28 sm:pt-32 pb-16 sm:pb-24">
        <div className="bg-white rounded-[2.5rem] p-10 border border-blue-50 shadow-xl shadow-blue-100/50">
          {isRegistered ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-blue-950 mb-2">Registration Successful!</h2>
              <p className="text-slate-500 mb-8 font-medium">Welcome to Avegatasta Jal Urja Solutions. Your account has been created and synced with our CRM.</p>
              <Link href="/" className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                Go to Homepage
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                  <User size={32} />
                </div>
                <h1 className="text-2xl font-black text-blue-950 tracking-tight">Create Account</h1>
                <p className="text-slate-500 text-sm font-medium mt-2">Join Avegatasta Jal Urja Solutions for premium water solutions.</p>
              </div>

              <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 animate-pulse">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">First Name</label>
                    <input 
                      required
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Last Name</label>
                    <input 
                      required
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-blue-950 uppercase tracking-widest ml-1">GSTIN (Optional)</label>
                  <input 
                    type="text" 
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleChange}
                    placeholder="Enter your GSTIN here"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <span className="text-[10px] text-slate-400 font-bold ml-1 block">Enter your GSTIN here</span>
                </div>

                <Captcha ref={captchaRef} />

                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 mt-4"
                >
                  Create Account
                </button>

                <p className="text-center text-xs text-slate-400 font-bold mt-6">
                  Are you a team member? <Link href="/admin" className="text-blue-600 hover:underline">Staff Login</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
