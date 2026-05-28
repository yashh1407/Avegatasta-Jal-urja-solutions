'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, LogOut } from 'lucide-react';
import Footer from '@/components/Footer';
import CaseStudyForm from '../CaseStudyForm';

export default function NewCaseStudyPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-blue-950 tracking-tight">New Case Study</h1>
            <p className="text-slate-500 font-medium">Add a new project case study.</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="ml-auto p-2.5 bg-white border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

        <CaseStudyForm mode="new" />
      </main>

      <Footer />
    </div>
  );
}
