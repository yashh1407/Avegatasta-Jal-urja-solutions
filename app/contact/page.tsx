import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';
import { query } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  let dbPage: any = null;
  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'contact'") as any[];
    if (pages && pages.length > 0) {
      dbPage = pages[0];
    }
  } catch (e) {
    console.error("Failed to load contact page metadata:", e);
  }

  const title = dbPage?.meta_title || 'Contact Us | Avegatasta Jal-Urja Solutions, Nashik';
  const description = dbPage?.meta_description || 'Get in touch with Avegatasta Jal-Urja Solutions in Nashik. Call, WhatsApp, or send an inquiry for heat pumps, pumping systems, water purifiers, and solar installations.';
  const keywords = dbPage?.meta_keywords ? dbPage.meta_keywords.split(',').map((k: string) => k.trim()) : [
    'contact Avegatasta',
    'water heater service Nashik',
    'pump repair Nashik',
    'solar installation contact',
    'Jal Urja Solutions phone number',
    'water purifier service Nashik',
    'Avegatasta contact number',
    'water solutions enquiry Nashik',
    'heat pump dealer contact Nashik',
    'swimming pool equipment contact Nashik',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: dbPage?.canonical_url || '/contact',
    },
    openGraph: {
      title: dbPage?.og_title || title,
      description: dbPage?.og_description || description,
      url: dbPage?.canonical_url || 'https://avegatasta.com/contact',
      images: [
        {
          url: dbPage?.og_image || 'https://avegatasta.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Contact Avegatasta Jal-Urja Solutions, Nashik',
        },
      ],
      type: 'website',
    },
  };
}

export default async function ContactPage() {
  let page: any = {};
  let sections: any[] = [];
  let faqs: any[] = [];

  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'contact'") as any[];
    if (pages && pages.length > 0) {
      page = pages[0];
      sections = await query(
        "SELECT * FROM page_sections WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC",
        [page.id]
      ) as any[];
      faqs = await query(
        "SELECT * FROM page_faqs WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC",
        [page.id]
      ) as any[];
    }
  } catch (err) {
    console.error("Failed to query database for contact page:", err);
  }

  return <ContactPageClient sections={sections} pageData={page} faqs={faqs} />;
}
