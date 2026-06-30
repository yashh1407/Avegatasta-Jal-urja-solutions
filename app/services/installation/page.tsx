import type { Metadata } from 'next';
import ServicesPageClient from '../ServicesPageClient';
import { query } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  let dbPage: any = null;
  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'services-installation'") as any[];
    if (pages && pages.length > 0) {
      dbPage = pages[0];
    }
  } catch (e) {
    console.error("Failed to load installation service metadata from DB:", e);
  }

  const title = dbPage?.meta_title || 'Heat Pump Installation Service Nashik | Avegatasta';
  const description = dbPage?.meta_description || 'Avegatasta provides heat pump installation service Nashik support along with installation for solar water heaters, water purifiers and pumping systems.';
  const keywords = dbPage?.meta_keywords ? dbPage.meta_keywords.split(',').map((k: string) => k.trim()) : [
    'Heat pump installation service Nashik',
    'heat pump water heater installation Nashik',
    'solar water heater installation Nashik',
    'pumping system installation Nashik',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: dbPage?.canonical_url || '/services/installation',
    },
    openGraph: {
      title: dbPage?.og_title || title,
      description: dbPage?.og_description || description,
      url: dbPage?.canonical_url || 'https://avegatasta.com/services/installation',
      images: [
        {
          url: dbPage?.og_image || 'https://avegatasta.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Avegatasta Jal-Urja Solutions — Installation Services',
        },
      ],
      type: 'website',
    },
  };
}

export default async function InstallationServicePage() {
  let page: any = {};
  let sections: any[] = [];

  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'services-installation'") as any[];
    if (pages && pages.length > 0) {
      page = pages[0];
      sections = await query(
        "SELECT * FROM page_sections WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC",
        [page.id]
      ) as any[];
    }
  } catch (err) {
    console.error("Failed to query database for installation service page:", err);
  }

  return <ServicesPageClient sections={sections} pageData={page} focus="installation" />;
}
