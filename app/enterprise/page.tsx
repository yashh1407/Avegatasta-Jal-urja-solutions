import type { Metadata } from 'next';
import Script from 'next/script';
import EnterprisePageClient from './EnterprisePageClient';
import { query } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  let dbPage: any = null;
  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'enterprise'") as any[];
    if (pages && pages.length > 0) {
      dbPage = pages[0];
    }
  } catch (e) {
    console.error("Failed to load enterprise page metadata:", e);
  }

  const title = dbPage?.meta_title || 'Enterprise Solutions | Avegatasta Jal-Urja Solutions, Nashik';
  const description = dbPage?.meta_description || 'End-to-end B2B water, energy & pool infrastructure solutions for industrial, commercial, hospitality and institutional projects in Nashik. Authorized partner for V-Guard, Wilo, Zero B & Bluewave India.';
  const keywords = dbPage?.meta_keywords ? dbPage.meta_keywords.split(',').map((k: string) => k.trim()) : [
    'enterprise water solutions Nashik',
    'enterprise water heater Nashik',
    'industrial hot water systems Maharashtra',
    'commercial heat pump supplier',
    'B2B industrial water systems Nashik',
    'commercial heat pump supply Nashik',
    'bulk pump supply Nashik',
    'industrial water treatment Nashik',
    'enterprise solar installation Nashik',
    'swimming pool project contractor Nashik',
    'V-Guard enterprise partner Nashik',
    'Wilo distributor Nashik',
    'Zero B bulk supply Nashik',
    'Bluewave pool solutions Nashik',
    'enterprise project enquiry water energy Nashik',
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: dbPage?.canonical_url || '/enterprise',
    },
    openGraph: {
      title: dbPage?.og_title || title,
      description: dbPage?.og_description || description,
      url: dbPage?.canonical_url || 'https://avegatasta.com/enterprise',
      images: [
        {
          url: dbPage?.og_image || 'https://avegatasta.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Enterprise Solutions — Avegatasta Jal-Urja Solutions, Nashik',
        },
      ],
      type: 'website',
    },
  };
}

const provider = {
  '@type': 'LocalBusiness',
  name: 'Avegatasta Jal-Urja Solutions',
  url: 'https://avegatasta.com',
  telephone: '+919689881369',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nashik',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN',
  },
};

const enterpriseServicesJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Enterprise Water, Energy & Pool Infrastructure Solutions',
  description:
    'End-to-end B2B supply, installation, and commissioning of water heating, pumping, water treatment, solar, and swimming pool systems for industrial, hospitality, commercial, and institutional projects in Nashik and Maharashtra.',
  url: 'https://avegatasta.com/enterprise',
  serviceType: 'Enterprise Infrastructure Solutions',
  provider,
  areaServed: [
    { '@type': 'City', name: 'Nashik' },
    { '@type': 'State', name: 'Maharashtra' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Enterprise Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Enterprise Water Heater Supply & Installation — Nashik',
          description:
            'Bulk supply and commissioning of commercial and industrial water heaters — heat pump and solar — for factories, hotels, and large residential complexes in Nashik.',
          serviceType: 'Enterprise Water Heater',
          provider,
          areaServed: { '@type': 'City', name: 'Nashik' },
          brand: [
            { '@type': 'Brand', name: 'V-Guard' },
            { '@type': 'Brand', name: 'Wilo' },
          ],
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Heat Pump Supplier for Hotels — Maharashtra',
          description:
            'Authorised supply, installation, and AMC of heat pump water heaters for hotels, resorts, and service apartments across Maharashtra. V-Guard and Wilo authorised partner.',
          serviceType: 'Heat Pump Supply & Installation',
          provider,
          areaServed: { '@type': 'State', name: 'Maharashtra' },
          brand: [
            { '@type': 'Brand', name: 'V-Guard' },
            { '@type': 'Brand', name: 'Wilo' },
          ],
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Industrial Pumping Contractor — Nashik',
          description:
            'Design, supply, and installation of industrial pumping systems including booster pumps, sewage pumps, and high-capacity water transfer systems for factories and industrial estates in Nashik.',
          serviceType: 'Industrial Pumping',
          provider,
          areaServed: { '@type': 'City', name: 'Nashik' },
          brand: [{ '@type': 'Brand', name: 'Wilo' }],
        },
      },
    ],
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://avegatasta.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Enterprise Solutions',
      item: 'https://avegatasta.com/enterprise',
    },
  ],
};

export default async function EnterprisePage() {
  let page: any = {};
  let sections: any[] = [];

  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'enterprise'") as any[];
    if (pages && pages.length > 0) {
      page = pages[0];
      sections = await query(
        "SELECT * FROM page_sections WHERE page_id = ? AND is_active = 1 ORDER BY sort_order ASC",
        [page.id]
      ) as any[];
    }
  } catch (err) {
    console.error("Failed to query database for enterprise page:", err);
  }

  return (
    <>
      <Script
        id="enterprise-services-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(enterpriseServicesJsonLd) }}
      />
      <Script
        id="enterprise-breadcrumb-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <EnterprisePageClient sections={sections} pageData={page} />
    </>
  );
}
