import type { Metadata } from 'next';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BrandMarquee from '@/components/BrandMarquee';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';

const SectionLoading = () => (
  <section className="py-20 bg-white" aria-hidden="true">
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
      <div className="h-24 rounded-[2rem] bg-slate-50 animate-pulse" />
    </div>
  </section>
);

const BrandsSection = dynamic(() => import('@/components/BrandsSection'), {
  loading: SectionLoading,
});
const CategorySection = dynamic(() => import('@/components/CategorySection'), {
  loading: SectionLoading,
});
const FeaturedProducts = dynamic(() => import('@/components/FeaturedProducts'), {
  loading: SectionLoading,
});
const WhyUsSection = dynamic(() => import('@/components/WhyUsSection'), {
  loading: SectionLoading,
});
const EnterpriseSection = dynamic(() => import('@/components/EnterpriseSection'), {
  loading: SectionLoading,
});
const TestimonialsSectionClient = dynamic(() => import('@/components/TestimonialsSectionClient'), {
  loading: SectionLoading,
});

export const metadata: Metadata = {
  title: 'Avegatasta Jal-Urja Solutions | Enterprise Water, Energy & Pool Systems, Nashik',
  description:
    'Authorized B2B partner for V-Guard, Wilo, Zero B & Bluewave India in Nashik. Enterprise water heating, pumping, treatment, solar, and swimming pool solutions for industrial, commercial, and large-scale projects.',
  keywords: [
    'enterprise water solutions Nashik',
    'B2B water energy systems Nashik',
    'V-Guard authorized dealer Nashik',
    'Wilo pumping systems Nashik',
    'Zero B water treatment Nashik',
    'Bluewave India swimming pool equipment',
    'industrial water heating Nashik',
    'commercial pumping systems Nashik',
    'solar power systems Nashik',
    'swimming pool chemicals Nashik',
    'Avegatasta Jal-Urja Solutions',
    'multi-sector energy solutions Nashik',
    'best heat pump in Nashik',
    'swimming pool chemicals supplier Nashik',
    'water treatment company Nashik',
    'solar water heater dealer Nashik',
    'who sells Wilo pumps in Nashik',
    'where to buy V-Guard heat pump Nashik',
  ],
  alternates: {
    canonical: 'https://avegatasta.com',
  },
  openGraph: {
    title: 'Avegatasta Jal-Urja Solutions | Enterprise Water, Energy & Pool Systems',
    description:
      'Authorized B2B partner for V-Guard, Wilo, Zero B & Bluewave India — enterprise water, energy, and pool infrastructure solutions in Nashik',
    url: 'https://avegatasta.com',
    images: [
      {
        url: 'https://avegatasta.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Avegatasta Jal-Urja Solutions — Water, Energy & Pool Systems, Nashik',
      },
    ],
    type: 'website',
  },
};

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Avegatasta Jal-Urja Solutions',
  alternateName: 'Avegatasta Solution',
  description:
    'Authorized B2B partner for V-Guard, Wilo, Zero B, and Bluewave India in Nashik. Enterprise-grade water heating, pumping systems, water treatment, solar power, and swimming pool equipment & chemical solutions for industrial, commercial, and large-scale residential projects.',
  url: 'https://avegatasta.com',
  telephone: '+919689881369',
  email: 'sales@avegatasta.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nashik',
    addressRegion: 'Maharashtra',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '19.9975',
    longitude: '73.7898',
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '19:00',
    },
  ],
  areaServed: [
    { '@type': 'City', name: 'Nashik' },
    { '@type': 'State', name: 'Maharashtra' },
  ],
  sameAs: [],
  brand: [
    { '@type': 'Brand', name: 'V-Guard' },
    { '@type': 'Brand', name: 'Zero B' },
    { '@type': 'Brand', name: 'Wilo' },
    { '@type': 'Brand', name: 'Bluewave India' },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Water, Energy & Pool Solutions',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Heat Pump Water Heaters' },
      { '@type': 'OfferCatalog', name: 'Solar Water Heaters' },
      { '@type': 'OfferCatalog', name: 'Domestic & Industrial Pumps' },
      { '@type': 'OfferCatalog', name: 'Water Purifiers & Softeners' },
      { '@type': 'OfferCatalog', name: 'Solar On-Grid Systems' },
      { '@type': 'OfferCatalog', name: 'Swimming Pool Equipment & Chemicals' },
    ],
  },
  makesOffer: [
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Heat Pump Installation' },
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Pump System Installation' },
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Water Treatment System Installation' },
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Solar Power System Installation' },
    },
    {
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: 'Swimming Pool Equipment Supply' },
    },
  ],
  knowsAbout: [
    'Heat Pump Water Heaters',
    'Solar Water Heaters',
    'Domestic Pumps',
    'Booster Pump Systems',
    'Water Purifiers',
    'Water Softeners',
    'Solar On-Grid Systems',
    'Swimming Pool Equipment',
    'Swimming Pool Chemicals',
    'Enterprise B2B Water Solutions',
    'Industrial Pumping Systems',
  ],
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Avegatasta Jal-Urja Solutions',
  alternateName: 'Avegatasta Solution',
  url: 'https://avegatasta.com',
  logo: 'https://avegatasta.com/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+919689881369',
    contactType: 'sales',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi', 'Marathi'],
  },
  brand: [
    { '@type': 'Brand', name: 'V-Guard' },
    { '@type': 'Brand', name: 'Zero B' },
    { '@type': 'Brand', name: 'Wilo' },
    { '@type': 'Brand', name: 'Bluewave India' },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Avegatasta Jal-Urja Solutions?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Avegatasta Jal-Urja Solutions is an authorized B2B distributor and installation partner for V-Guard, Wilo, Zero B, and Bluewave India in Nashik, Maharashtra. We specialize in enterprise-grade water heating, pumping systems, water treatment, solar energy, and swimming pool solutions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What areas does Avegatasta serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Avegatasta primarily serves Nashik and the surrounding Maharashtra region, catering to industrial, commercial, and large-scale residential projects.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which brands does Avegatasta distribute?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Avegatasta is an authorized distributor for V-Guard (heat pumps, solar water heaters, domestic pumps), Wilo (pumping systems), Zero B by Ion Exchange (water purifiers, water softeners), and Bluewave India (swimming pool equipment and chemicals).',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Avegatasta offer installation services?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Avegatasta provides end-to-end installation services for heat pump water heaters, pumping systems, water treatment plants, solar on-grid systems, and swimming pool equipment across Nashik and Maharashtra.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where can I buy swimming pool chemicals in Nashik?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Avegatasta Jal-Urja Solutions is an authorized supplier of Bluewave India swimming pool chemicals and equipment in Nashik. Contact us at +919689881369 or visit avegatasta.com for enquiries.',
      },
    },
    {
      '@type': 'Question',
      name: 'What types of heat pumps are available in Nashik?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Avegatasta stocks V-Guard heat pump water heaters suitable for residential, commercial, and industrial applications. These are energy-efficient alternatives to traditional electric geysers. Contact us for the best heat pump in Nashik.',
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <Script
        id="local-business-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <Script
        id="organization-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <main className="min-h-screen">
        <Navbar />
        <Hero />
        <BrandMarquee />
        <BrandsSection />
        <CategorySection />
        <FeaturedProducts />
        <WhyUsSection />
        <EnterpriseSection />
        <TestimonialsSectionClient />
        <AiFaqSection />
        <Footer />
      </main>
    </>
  );
}

function AiFaqSection() {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100" aria-label="Frequently Asked Questions">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-3 text-center">
              FAQ
            </h2>
            <h3 className="text-3xl font-black text-blue-950 tracking-tight mb-12 text-center">
              Frequently Asked Questions
            </h3>
            <FAQAccordion 
              items={faqJsonLd.mainEntity.map(item => ({
                question: item.name,
                answer: item.acceptedAnswer.text
              }))} 
            />
          </div>
        </div>
      </section>
  );
}
