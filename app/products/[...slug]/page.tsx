import type { Metadata } from 'next';
import ProductsPageClient from '../ProductsPageClient';

import { CATEGORY_BY_PATH } from '@/lib/seo-categories';


type PageProps = { params: Promise<{ slug: string[] }> };

function getPath(slug: string[]) {
  return slug.join('/');
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = getPath(slug);
  const data = CATEGORY_BY_PATH[path];

  if (!data) {
    return {
      title: 'Products | Avegatasta',
      description: 'Browse Avegatasta products for water heating, pumping, water treatment, solar and swimming pool solutions.',
      alternates: { canonical: `https://avegatasta.com/products/${path}` },
    };
  }

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    alternates: { canonical: `https://avegatasta.com/products/${path}` },
    openGraph: {
      title: data.title,
      description: data.description,
      url: `https://avegatasta.com/products/${path}`,
      type: 'website',
    },
  };
}

import pool, { initDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ProductCategoryLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const path = getPath(slug);
  const data = CATEGORY_BY_PATH[path];

  let dbProducts: any[] = [];
  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM products ORDER BY name ASC');
    dbProducts = (rows as any[]).map((row) => ({
      ...row,
      features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []),
      specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || {}),
      inStock: Boolean(row.inStock),
    }));
  } catch (error) {
    console.error('Failed to pre-fetch products for slug page:', error);
  }

  const faqJsonLd = data?.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <ProductsPageClient initialCategory={data?.label ?? null} initialProducts={dbProducts} />
    </>
  );
}
