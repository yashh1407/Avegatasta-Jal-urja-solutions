import { Suspense } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { products } from '@/lib/data';
import ProductDetailContent from './ProductDetailClient';
import pool, { initDB } from '@/lib/db';

type Props = { params: Promise<{ id: string }> };

// ─── Helper to fetch product ──────────────────────────────────────────────────

async function getProductById(id: string) {
  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const list = rows as any[];
    if (list.length > 0) {
      const row = list[0];
      return {
        ...row,
        features: typeof row.features === 'string' ? JSON.parse(row.features) : (row.features || []),
        specs: typeof row.specs === 'string' ? JSON.parse(row.specs) : (row.specs || {}),
        inStock: Boolean(row.inStock),
      };
    }
  } catch (error) {
    console.error(`Failed to fetch product by id ${id}:`, error);
  }
  // Fallback to static list
  return products.find((p) => p.id === id) || null;
}

// ─── Dynamic metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

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

function ProductJsonLd({ product }: { product: any }) {
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
    additionalProperty: Object.entries(product.specs || {}).map(([name, value]) => ({
      '@type': 'PropertyValue',
      name,
      value: String(value),
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
  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-blue-950">Product Not Found</h1>
          <a href="/products" className="text-blue-600 hover:underline font-bold">Browse Products</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProductJsonLd product={product} />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <ProductDetailContent product={product} />
      </Suspense>
    </>
  );
}
