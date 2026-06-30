import type { Metadata } from 'next';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BrandMarquee from '@/components/BrandMarquee';
import Footer from '@/components/Footer';
import FAQAccordion from '@/components/FAQAccordion';
import { query } from '@/lib/db';

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

export async function generateMetadata(): Promise<Metadata> {
  let dbPage: any = null;
  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'home'") as any[];
    if (pages && pages.length > 0) {
      dbPage = pages[0];
    }
  } catch (e) {
    console.error("Failed to load home page metadata from DB:", e);
  }

  const title = dbPage?.meta_title || 'Avegatasta Jal-Urja Solutions | Enterprise Water, Energy & Pool Systems, Nashik';
  const description = dbPage?.meta_description || 'Authorized B2B partner for V-Guard, Wilo, Zero B & Bluewave India in Nashik. Enterprise water heating, pumping, treatment, solar, and swimming pool solutions for industrial, commercial, and large-scale projects.';
  const keywords = dbPage?.meta_keywords ? dbPage.meta_keywords.split(',').map((k: string) => k.trim()) : [
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
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: dbPage?.canonical_url || 'https://avegatasta.com',
    },
    openGraph: {
      title: dbPage?.og_title || title,
      description: dbPage?.og_description || description,
      url: dbPage?.canonical_url || 'https://avegatasta.com',
      images: [
        {
          url: dbPage?.og_image || 'https://avegatasta.com/og-image.jpg',
          width: 1200,
          height: 630,
          alt: 'Avegatasta Jal-Urja Solutions — Water, Energy & Pool Systems, Nashik',
        },
      ],
      type: 'website',
    },
  };
}

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

const defaultFaqs = [
  {
    question: 'What is Avegatasta Jal-Urja Solutions?',
    answer: 'Avegatasta Jal-Urja Solutions is an authorized B2B distributor and installation partner for V-Guard, Wilo, Zero B, and Bluewave India in Nashik, Maharashtra. We specialize in enterprise-grade water heating, pumping systems, water treatment, solar energy, and swimming pool solutions.',
  },
  {
    question: 'What areas does Avegatasta serve?',
    answer: 'Avegatasta primarily serves Nashik and the surrounding Maharashtra region, catering to industrial, commercial, and large-scale residential projects.',
  },
  {
    question: 'Which brands does Avegatasta distribute?',
    answer: 'Avegatasta is an authorized distributor for V-Guard (heat pumps, solar water heaters, domestic pumps), Wilo (pumping systems), Zero B by Ion Exchange (water purifiers, water softeners), and Bluewave India (swimming pool equipment and chemicals).',
  },
  {
    question: 'Does Avegatasta offer installation services?',
    answer: 'Yes. Avegatasta provides end-to-end installation services for heat pump water heaters, pumping systems, water treatment plants, solar on-grid systems, and swimming pool equipment across Nashik and Maharashtra.',
  },
  {
    question: 'Where can I buy swimming pool chemicals in Nashik?',
    answer: 'Avegatasta Jal-Urja Solutions is an authorized supplier of Bluewave India swimming pool chemicals and equipment in Nashik. Contact us at +919689881369 or visit avegatasta.com for enquiries.',
  },
  {
    question: 'What types of heat pumps are available in Nashik?',
    answer: 'Avegatasta stocks V-Guard heat pump water heaters suitable for residential, commercial, and industrial applications. These are energy-efficient alternatives to traditional electric geysers. Contact us for the best heat pump in Nashik.',
  },
];

const parseJson = (val: any) => {
  if (typeof val === 'object' && val !== null) return val;
  try { return JSON.parse(val || '{}'); } catch { return {}; }
};

export default async function Home() {
  let page: any = {};
  let sections: any[] = [];
  let faqs: any[] = [];

  try {
    const pages = await query("SELECT * FROM pages WHERE slug = 'home'") as any[];
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
    console.error("Failed to query DB for homepage:", err);
  }

  const faqItems = faqs.length > 0 ? faqs.map(f => ({
    question: f.question,
    answer: f.answer
  })) : defaultFaqs;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

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

        {sections.length === 0 ? (
          <>
            <Hero />
            <BrandMarquee />
            <BrandsSection />
            <CategorySection />
            <FeaturedProducts />
            <WhyUsSection />
            <EnterpriseSection />
            <TestimonialsSectionClient />
            <AiFaqSection faqItems={faqItems} />
          </>
        ) : (
          sections.map((sec) => {
            const data = parseJson(sec.data_json);
            switch (sec.section_type) {
              case 'HeroSection':
                return (
                  <Hero
                    key={sec.id}
                    badge={sec.subtitle}
                    title={sec.title}
                    content={sec.content}
                    {...data}
                  />
                );
              case 'BrandMarquee':
                return <BrandMarquee key={sec.id} />;
              case 'BrandsSection':
                return (
                  <BrandsSection
                    key={sec.id}
                    badge={sec.title}
                    titleHtml={sec.subtitle}
                    description={sec.content}
                  />
                );
              case 'CategorySection':
                return (
                  <CategorySection
                    key={sec.id}
                    badge={sec.title}
                    titleHtml={sec.subtitle}
                    description={sec.content}
                  />
                );
              case 'FeaturedProducts':
                return (
                  <FeaturedProducts
                    key={sec.id}
                    badge={sec.title}
                    titleHtml={sec.subtitle}
                    description={sec.content}
                  />
                );
              case 'WhyUsSection':
                return (
                  <WhyUsSection
                    key={sec.id}
                    badge={sec.title}
                    titleHtml={sec.subtitle}
                    benefits={data.benefits}
                    firstImage={data.firstImage || data.first_image || data.hero_image_1}
                    secondImage={data.secondImage || data.second_image || data.hero_image_2}
                  />
                );
              case 'EnterpriseSection':
                return (
                  <EnterpriseSection
                    key={sec.id}
                    eyebrow={sec.title}
                    title={sec.subtitle}
                    copy={sec.content}
                    image={data.image || data.hero_image_1}
                    buttonText={data.buttonText || data.primaryButtonText}
                  />
                );
              case 'TestimonialsSectionClient':
                return (
                  <TestimonialsSectionClient
                    key={sec.id}
                    badge={sec.title}
                    titleHtml={sec.subtitle}
                  />
                );
              case 'FAQAccordion':
                return (
                  <AiFaqSection
                    key={sec.id}
                    badge={sec.title}
                    title={sec.subtitle}
                    faqItems={faqItems}
                  />
                );
              default:
                return null;
            }
          })
        )}

        <Footer />
      </main>
    </>
  );
}

function AiFaqSection({ faqItems, badge, title }: { faqItems: any[]; badge?: string; title?: string }) {
  return (
    <section className="py-20 bg-slate-50 border-t border-slate-100" aria-label="Frequently Asked Questions">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm font-black text-blue-600 uppercase tracking-[0.2em] mb-3 text-center">
            {badge || 'FAQ'}
          </h2>
          <h3 className="text-3xl font-black text-blue-950 tracking-tight mb-12 text-center">
            {title || 'Frequently Asked Questions'}
          </h3>
          <FAQAccordion items={faqItems} />
        </div>
      </div>
    </section>
  );
}
