import type { Metadata } from 'next';
import ServicesPageClient from '../ServicesPageClient';
import { query } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  let dbPage: any = null;
  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'services-project-consultation'") as any[];
    if (pages && pages.length > 0) {
      dbPage = pages[0];
    }
  } catch (e) {
    console.error("Failed to load project consultation metadata from DB:", e);
  }

  const title = dbPage?.meta_title || 'Project Consultation | Avegatasta Jal-Urja Solutions';
  const description = dbPage?.meta_description || 'Consultation and design for enterprise-scale water, energy, and pool infrastructure projects in Nashik and Maharashtra.';
  const keywords = dbPage?.meta_keywords ? dbPage.meta_keywords.split(',').map((k: string) => k.trim()) : [
    'project consultation Nashik',
    'water system design Nashik',
    'solar energy design Nashik',
    'swimming pool consultant Nashik',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: dbPage?.canonical_url || '/services/project-consultation',
    },
    openGraph: {
      title: dbPage?.og_title || title,
      description: dbPage?.og_description || description,
      url: dbPage?.canonical_url || 'https://avegatasta.com/services/project-consultation',
      images: [
        {
          url: dbPage?.og_image || 'https://avegatasta.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Avegatasta Jal-Urja Solutions — Project Consultation',
        },
      ],
      type: 'website',
    },
  };
}

export default async function ConsultationServicePage() {
  let page: any = {};
  let sections: any[] = [];

  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'services-project-consultation'") as any[];
    if (pages && pages.length > 0) {
      page = pages[0];
      sections = await query(
        "SELECT * FROM page_sections WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC",
        [page.id]
      ) as any[];
    }
  } catch (err) {
    console.error("Failed to query database for project consultation page:", err);
  }

  return <ServicesPageClient sections={sections} pageData={page} />;
}
