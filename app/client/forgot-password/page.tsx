'use client';

import React, { useState, useRef } from 'react';
import { Mail, Droplets, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Captcha, CaptchaRef } from '@/components/Captcha';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const captchaRef = useRef<CaptchaRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaRef.current?.validate()) {
      return;
    }

    setLoading(true);

    try {
      const captchaData = captchaRef.current?.getCaptchaData() || { token: '', input: '' };
      const res = await fetch('/api/client/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          captchaToken: captchaData.token,
          captchaInput: captchaData.input,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg = typeof data.error === 'string' ? data.error : 'Request failed';
        setError(msg);
        if (msg.includes('verification code') || msg.toLowerCase().includes('captcha')) {
          captchaRef.current?.setErrorState(true);
        } else {
          captchaRef.current?.reset();
        }
      } else {
        captchaRef.current?.reset();
        setSent(true);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      captchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-blue-900/5 border border-slate-100">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-brand-200">
              <Droplets size={32} />
            </div>
            <h1 className="text-3xl font-black text-blue-950 tracking-tight">Reset Password</h1>
            <p className="text-slate-500 font-medium mt-2 text-center">
              Enter your email and we&apos;ll send a reset link
            </p>
          </div>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="flex justify-center">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <p className="text-blue-950 font-bold">Check your email</p>
              <p className="text-slate-500 text-sm">
                If an account exists for <span className="font-bold text-blue-950">{email}</span>,
                you&apos;ll receive a password reset link shortly.
              </p>
              <Link
                href="/client/login"
                className="inline-flex items-center gap-2 text-brand-600 font-bold text-sm hover:text-brand-700 transition-colors mt-4"
              >
                <ArrowLeft size={16} />
                Back to login
              </Link>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-blue-950"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <Captcha ref={captchaRef} />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-600 transition-all shadow-lg shadow-brand-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center">
                <Link
                  href="/client/login"
                  className="inline-flex items-center gap-2 text-brand-600 font-bold text-sm hover:text-brand-700 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
