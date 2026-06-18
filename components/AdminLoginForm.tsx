'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function AdminLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        setError('Invalid email or password');
      } else {
        setError(result.error);
      }
    } else {
      router.push('/admin');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans w-full">
      {/* Left Column: Branding (Hidden on mobile) */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-gradient-to-br from-white via-[#F0F9FF] to-[#E0F2FE]/60 text-slate-900 pt-6 pb-12 px-12 lg:pt-10 lg:pb-20 lg:px-20 flex-col justify-between relative overflow-hidden border-r border-slate-100">
        {/* Decorative background glow */}
        <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-teal-400/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Center: Main Heading & Checklist */}
        <div className="my-auto relative z-10 max-w-lg space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900">
              Welcome to the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                Staff Portal
              </span>
            </h1>
            <p className="text-slate-600 font-bold text-sm lg:text-base leading-relaxed">
              Manage quotations, products, inquiries, and staff access control all in one place.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-5 pt-5 border-t border-slate-200/60">
            {[
              { title: 'Quotation Tracking', desc: 'Monitor and process customer quote requests' },
              { title: 'Product & Service Catalog', desc: 'Update public products, details, and features' },
              { title: 'Customer Inquiries', desc: 'Respond to customer support and product inquiries' },
              { title: 'Staff Access Control', desc: 'Securely manage credentials and module permissions' }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5 shadow-sm">
                  <Check size={12} className="stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 tracking-wide">{item.title}</h4>
                  <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Footer Info */}
        <div className="relative z-10 pt-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-bold">
          <span>Avegatasta Jal-Urja — Water & Solar Solutions</span>
        </div>
      </div>

      {/* Right Column: Sign In Card */}
      <div className="flex-1 flex items-center justify-center bg-slate-50/50 p-6 sm:p-12 relative overflow-hidden">
        {/* Background blobs for subtle depth on light background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-[80px] -z-10 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-100/20 rounded-full blur-[80px] -z-10 pointer-events-none" />

        <div className="w-full max-w-md space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-blue-900/5 border border-slate-100/80"
          >
            <div className="flex flex-col items-center mb-8">
              <div className="mb-6 flex h-14 w-full items-center justify-center">
                <Image
                  src="/logo.webp"
                  alt="Avegatasta Jal-Urja Solutions"
                  width={220}
                  height={76}
                  priority
                  className="h-11 w-auto object-contain"
                />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-sans text-center">Sign in</h2>
              <p className="text-slate-500 font-semibold text-xs mt-2 text-center">Enter your staff credentials to continue</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-650 p-4 rounded-2xl text-xs font-black border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-800 text-sm"
                    placeholder="e.g. name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold text-slate-800 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Authenticating...' : 'Sign in to Dashboard'}
                {!loading && <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </form>
          </motion.div>

          <p className="text-center text-xs text-slate-400 font-semibold">
            Avegatasta Jal-Urja Staff Portal © 2026
          </p>
        </div>
      </div>
    </div>
  );
}
