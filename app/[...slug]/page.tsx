import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import pool from '@/lib/db';
import DynamicPageRenderer from '@/components/DynamicPageRenderer';

export const revalidate = 60; // Revalidate every 60 seconds

async function getPageData(slug: string) {
  try {
    const [pageRows] = await pool.query('SELECT * FROM pages WHERE slug = ? AND status = "published"', [slug]);
    const pages = pageRows as any[];
    
    if (pages.length === 0) return null;
    const page = pages[0];

    const [sectionRows] = await pool.query('SELECT * FROM page_sections WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC', [page.id]);
    const sections = sectionRows as any[];

    const [faqRows] = await pool.query('SELECT * FROM page_faqs WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC', [page.id]);
    const faqs = faqRows as any[];

    // Parse JSON
    sections.forEach(s => {
      try {
        s.data_json = typeof s.data_json === 'string' ? JSON.parse(s.data_json) : (s.data_json || {});
      } catch (e) {
        s.data_json = {};
      }
    });

    return { page, sections, faqs };
  } catch (error) {
    console.error('Error fetching page data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  const slugPath = params.slug.join('/');
  const data = await getPageData(slugPath);
  
  if (!data) return { title: 'Not Found' };
  const { page } = data;

  return {
    title: page.meta_title || page.title,
    description: page.meta_description,
    keywords: page.meta_keywords,
    alternates: {
      canonical: page.canonical_url || undefined,
    },
    openGraph: {
      title: page.og_title || page.meta_title || page.title,
      description: page.og_description || page.meta_description,
      images: page.og_image ? [{ url: page.og_image }] : undefined,
    }
  };
}

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function DynamicSlugPage({ params }: { params: { slug: string[] } }) {
  const slugPath = params.slug.join('/');
  const data = await getPageData(slugPath);

  if (!data) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <DynamicPageRenderer page={data.page} sections={data.sections} faqs={data.faqs} />
      <Footer />
    </main>
  );
}
