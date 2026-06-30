import type { Metadata } from 'next';
import ProjectsPageClient from './ProjectsPageClient';
import { query } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  let dbPage: any = null;
  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'projects'") as any[];
    if (pages && pages.length > 0) {
      dbPage = pages[0];
    }
  } catch (e) {
    console.error("Failed to load projects page metadata:", e);
  }

  const title = dbPage?.meta_title || 'Projects & Installations | Avegatasta Jal-Urja Solutions, Nashik';
  const description = dbPage?.meta_description || 'Explore installation projects by Avegatasta — solar systems, heat pump installations, pumping systems, and water treatment plants across Nashik and Maharashtra.';
  const keywords = dbPage?.meta_keywords ? dbPage.meta_keywords.split(',').map((k: string) => k.trim()) : [
    'solar installation projects Nashik',
    'heat pump installation Nashik',
    'water treatment project Nashik',
    'pump system installation Maharashtra',
    'case studies water energy Nashik',
    'V-Guard installation Nashik',
    'Wilo pump project Nashik',
    'solar water heater project Nashik',
    'commercial water heating project Nashik',
    'Avegatasta project portfolio',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: dbPage?.canonical_url || '/projects',
    },
    openGraph: {
      title: dbPage?.og_title || title,
      description: dbPage?.og_description || description,
      url: dbPage?.canonical_url || 'https://avegatasta.com/projects',
      images: [
        {
          url: dbPage?.og_image || 'https://avegatasta.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Avegatasta Jal-Urja Solutions — Projects & Installations',
        },
      ],
      type: 'website',
    },
  };
}

export default async function ProjectsPage() {
  let page: any = {};
  let sections: any[] = [];

  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'projects'") as any[];
    if (pages && pages.length > 0) {
      page = pages[0];
      sections = await query(
        "SELECT * FROM page_sections WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC",
        [page.id]
      ) as any[];
    }
  } catch (err) {
    console.error("Failed to query database for projects page:", err);
  }

  return <ProjectsPageClient sections={sections} pageData={page} />;
}
