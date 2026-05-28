import { Suspense } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { products } from '@/lib/data';
import ProductDetailContent from './ProductDetailClient';

type Props = { params: Promise<{ id: string }> };

// ─── Dynamic metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    return {
      title: 'Product Not Found | Avegatasta Jal-Urja Solutions',
    };
  }

  const title = `${product.name} | Avegatasta Jal-Urja Solutions`;
  const description = product.description;
  const canonicalUrl = `https://avegatasta.com/product/${id}`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand,
      product.category,
      'Nashik',
      `${product.brand} dealer Nashik`,
      `buy ${product.category} Nashik`,
      `best ${product.category} in Nashik`,
      `${product.brand} authorized dealer Nashik`,
      `${product.category} supplier Nashik`,
      `${product.name} price India`,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [{ url: product.image, alt: product.name }],
      type: 'website',
    },
  };
}

// ─── Product JSON-LD ───────────────────────────────────────────────────────────

function ProductJsonLd({ id }: { id: string }) {
  const product = products.find((p) => p.id === id);
  if (!product) return null;

  const productUrl = `https://avegatasta.com/product/${product.id}`;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: 'INR',
      url: productUrl,
      seller: {
        '@type': 'Organization',
        name: 'Avegatasta Jal-Urja Solutions',
        url: 'https://avegatasta.com',
      },
    },
    additionalProperty: Object.entries(product.specs).map(([name, value]) => ({
      '@type': 'PropertyValue',
      name,
      value,
    })),
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
        name: 'Products',
        item: 'https://avegatasta.com/products',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.category,
        item: `https://avegatasta.com/products?category=${encodeURIComponent(product.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: product.name,
        item: productUrl,
      },
    ],
  };

  return (
    <>
      <Script
        id={`product-jsonld-${product.id}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Script
        id={`breadcrumb-jsonld-${product.id}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}

// ─── RSC page ─────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <>
      <ProductJsonLd id={id} />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ProductDetailContent id={id} />
      </Suspense>
    </>
  );
}
