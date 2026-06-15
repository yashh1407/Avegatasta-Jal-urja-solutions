import type { Metadata } from 'next';
import Script from 'next/script';
import EnterprisePageClient from './EnterprisePageClient';

export const metadata: Metadata = {
  title: 'Enterprise Solutions | Avegatasta Jal-Urja Solutions, Nashik',
  description:
    'End-to-end B2B water, energy & pool infrastructure solutions for industrial, commercial, hospitality and institutional projects in Nashik. Authorized partner for V-Guard, Wilo, Zero B & Bluewave India.',
  keywords: [
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
  ],
  alternates: {
    canonical: '/enterprise',
  },
  openGraph: {
    title: 'Enterprise Solutions | Avegatasta Jal-Urja Solutions',
    description:
      'Infrastructure-scale water, energy & pool solutions for B2B projects across Nashik and Maharashtra. Submit your enterprise enquiry today.',
    url: 'https://avegatasta.com/enterprise',
    images: [
      {
        url: 'https://avegatasta.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Enterprise Solutions — Avegatasta Jal-Urja Solutions, Nashik',
      },
    ],
    type: 'website',
  },
};

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EnterprisePage() {
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
      <EnterprisePageClient />
    </>
  );
}
