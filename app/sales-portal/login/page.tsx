'use client';

import React, { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import toast, { Toaster } from 'react-hot-toast';

export default function SalesLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/sales-portal');
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
          toast.error('Invalid email or password');
        } else {
          setError(result.error);
          toast.error(result.error);
        }
      } else {
        toast.success('Welcome back! Logging in...');
        router.push('/sales-portal');
        router.refresh();
      }
    } catch (err: any) {
      setLoading(false);
      setError('An unexpected error occurred');
      toast.error('Connection error. Please try again.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center text-slate-600">
        <Loader2 size={36} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col items-center justify-center p-4 font-sans antialiased">
      <Toaster position="top-center" />

      <div className="w-full max-w-sm space-y-6">
        {/* Branding Logo */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-12 w-full items-center justify-center mb-1">
            <Image
              src="/logo.webp"
              alt="Avegatasta Jal-Urja Solutions"
              width={180}
              height={62}
              priority
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/80">
            <Clock size={12} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Sales Team Portal</span>
          </div>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-100/50"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">Agent Sign in</h2>
            <p className="text-slate-400 font-medium text-xs mt-1">Enter your credentials to manage check-ins and leads</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {error && (
              <div className="bg-red-50 text-red-650 p-3.5 rounded-2xl font-bold border border-red-100/80">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-450"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-800 placeholder:text-slate-450"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center justify-center gap-1.5 group disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Verifying...' : 'Access Portal'}
              {!loading && <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
          Avegatasta Jal-Urja Solutions © 2026
        </p>
      </div>
    </div>
  );
}

// Simple loader helper
function Loader2({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
