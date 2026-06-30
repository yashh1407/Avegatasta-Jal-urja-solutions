import type { Metadata } from 'next';
import ServicesPageClient from './ServicesPageClient';
import { query } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  let dbPage: any = null;
  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'services'") as any[];
    if (pages && pages.length > 0) {
      dbPage = pages[0];
    }
  } catch (e) {
    console.error("Failed to load services page metadata:", e);
  }

  const title = dbPage?.meta_title || 'Our Services | Avegatasta Jal-Urja Solutions, Nashik';
  const description = dbPage?.meta_description || 'Professional water heating, pumping systems, water treatment, and solar on-grid solutions for homes, hotels, hospitals, and commercial buildings in Nashik.';
  const keywords = dbPage?.meta_keywords ? dbPage.meta_keywords.split(',').map((k: string) => k.trim()) : [
    'water heating installation Nashik',
    'heat pump water heater Nashik',
    'Wilo pump installation',
    'water purifier Nashik',
    'solar system installation Nashik',
    'water softener Nashik',
    'RO water purifier Nashik',
    'heat pump installation service Nashik',
    'solar water heater installation Nashik',
    'water treatment service Nashik',
    'booster pump installation Nashik',
    'commercial water heating solutions Nashik',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: dbPage?.canonical_url || '/services',
    },
    openGraph: {
      title: dbPage?.og_title || title,
      description: dbPage?.og_description || description,
      url: dbPage?.canonical_url || 'https://avegatasta.com/services',
      images: [
        {
          url: dbPage?.og_image || 'https://avegatasta.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Avegatasta Jal-Urja Solutions — Services',
        },
      ],
      type: 'website',
    },
  };
}

export default async function ServicesPage() {
  let page: any = {};
  let sections: any[] = [];

  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'services'") as any[];
    if (pages && pages.length > 0) {
      page = pages[0];
      sections = await query(
        "SELECT * FROM page_sections WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC",
        [page.id]
      ) as any[];
    }
  } catch (err) {
    console.error("Failed to query database for services page:", err);
  }

  return <ServicesPageClient sections={sections} pageData={page} />;
}
