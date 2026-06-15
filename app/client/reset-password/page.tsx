'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Droplets, CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Captcha, CaptchaRef } from '@/components/Captcha';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';
  const email = searchParams?.get('email') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const captchaRef = useRef<CaptchaRef>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!captchaRef.current?.validate()) {
      return;
    }

    setLoading(true);

    try {
      const captchaData = captchaRef.current?.getCaptchaData() || { token: '', input: '' };
      const res = await fetch('/api/client/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token, 
          email, 
          password,
          captchaToken: captchaData.token,
          captchaInput: captchaData.input,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = typeof data.error === 'string' ? data.error : 'Reset failed';
        setError(msg);
        if (msg.includes('verification code') || msg.toLowerCase().includes('captcha')) {
          captchaRef.current?.setErrorState(true);
        } else {
          captchaRef.current?.reset();
        }
      } else {
        captchaRef.current?.reset();
        setDone(true);
        setTimeout(() => router.push('/client/login'), 2500);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      captchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-600 font-bold">Invalid or expired reset link.</p>
        <Link
          href="/client/forgot-password"
          className="inline-flex items-center gap-2 text-brand-600 font-bold text-sm hover:text-brand-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex justify-center">
          <CheckCircle2 size={48} className="text-emerald-500" />
        </div>
        <p className="text-blue-950 font-bold">Password updated!</p>
        <p className="text-slate-500 text-sm">Redirecting you to login...</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-blue-950"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium text-blue-950"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      <Captcha ref={captchaRef} />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-brand-600 transition-all shadow-lg shadow-brand-200 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Updating...' : 'Set New Password'}
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
  );
}

export default function ResetPasswordPage() {
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
            <h1 className="text-3xl font-black text-blue-950 tracking-tight">New Password</h1>
            <p className="text-slate-500 font-medium mt-2 text-center">
              Choose a strong password for your account
            </p>
          </div>

          <Suspense fallback={<div className="text-center text-slate-400 py-8">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </motion.div>
    </div>
  );
}
