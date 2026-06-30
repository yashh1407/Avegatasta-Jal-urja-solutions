import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';
import { query } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  let dbPage: any = null;
  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'about'") as any[];
    if (pages && pages.length > 0) {
      dbPage = pages[0];
    }
  } catch (e) {
    console.error("Failed to load about page metadata:", e);
  }

  const title = dbPage?.meta_title || 'About Us | Avegatasta Jal-Urja Solutions, Nashik';
  const description = dbPage?.meta_description || 'Avegatasta Solution is an authorized distributor of V-Guard, Wilo, and Zero B in Nashik. Learn about our mission, vision, and commitment to energy-efficient water and solar solutions.';
  const keywords = dbPage?.meta_keywords ? dbPage.meta_keywords.split(',').map((k: string) => k.trim()) : [
    'about Avegatasta',
    'Jal Urja Solutions Nashik',
    'V-Guard dealer Nashik',
    'Wilo authorized distributor',
    'Zero B dealer Nashik',
    'water energy solutions Nashik',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: dbPage?.canonical_url || '/about',
    },
    openGraph: {
      title: dbPage?.og_title || title,
      description: dbPage?.og_description || description,
      url: dbPage?.canonical_url || 'https://avegatasta.com/about',
      images: [
        {
          url: dbPage?.og_image || 'https://avegatasta.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Avegatasta Jal-Urja Solutions — About Us',
        },
      ],
      type: 'website',
    },
  };
}

export default async function AboutPage() {
  let page: any = {};
  let sections: any[] = [];

  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'about'") as any[];
    if (pages && pages.length > 0) {
      page = pages[0];
      sections = await query(
        "SELECT * FROM page_sections WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC",
        [page.id]
      ) as any[];
    }
  } catch (err) {
    console.error("Failed to query database for about page:", err);
  }

  return <AboutPageClient sections={sections} pageData={page} />;
}
