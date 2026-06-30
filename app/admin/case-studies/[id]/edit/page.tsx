'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { BookOpen, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import CaseStudyForm, { type CaseStudyInitialData } from '../../CaseStudyForm';

export default function EditCaseStudyPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [caseStudy, setCaseStudy] = useState<CaseStudyInitialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }
    if (status !== 'authenticated') return;
    if (!params) return;

    fetch(`/api/admin/case-studies/${params.id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setCaseStudy({
          id: data.id,
          title: data.title ?? '',
          slug: data.slug ?? '',
          summary: data.summary ?? '',
          description: data.description ?? '',
          category: data.category ?? '',
          client_name: data.client_name ?? '',
          location_name: data.location_name ?? '',
          status: data.status ?? 'draft',
          cover_image: data.cover_image ?? null,
          images: Array.isArray(data.images) ? data.images : [],
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        });
      })
      .catch(() => {
        setNotFound(true);
        toast.error('Failed to load case study.');
      })
      .finally(() => setLoading(false));
  }, [status, router, params]);

  if (status === 'loading' || status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 pt-8 pb-16 sm:pb-24">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
            <BookOpen size={20} />
          </div>
          <div>
            <h1 className="text-4xl font-black text-brand-950 tracking-tight">Edit Case Study</h1>
            <p className="text-slate-500 font-medium">Update case study details and images.</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="ml-auto p-2.5 bg-white border border-red-200 rounded-2xl text-red-500 hover:bg-red-50 transition-all"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notFound ? (
          <div className="text-center py-32">
            <p className="text-slate-500 font-medium text-lg">Case study not found.</p>
          </div>
        ) : caseStudy ? (
          <CaseStudyForm mode="edit" initialData={caseStudy} />
        ) : null}
      </main>

          </div>
  );
}
