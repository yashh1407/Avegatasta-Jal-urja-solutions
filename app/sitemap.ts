import type { MetadataRoute } from 'next';
import { products } from '@/lib/data';
import { productHierarchy, type ProductHierarchyNode } from '@/lib/productHierarchy';
import { CATEGORY_BY_PATH } from '@/lib/seo-categories';

const BASE_URL = 'https://avegatasta.com';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

function toAbsoluteUrl(pathOrHref: string) {
  if (pathOrHref === '/') return BASE_URL;
  return `${BASE_URL}${pathOrHref.startsWith('/') ? pathOrHref : `/${pathOrHref}`}`;
}

function sitemapEntry(
  pathOrHref: string,
  lastModified: Date,
  changeFrequency: ChangeFrequency,
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: toAbsoluteUrl(pathOrHref),
    lastModified,
    changeFrequency,
    priority,
  };
}

function flattenHierarchyLinks(nodes: ProductHierarchyNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.href ? [node.href] : []),
    ...(node.children ? flattenHierarchyLinks(node.children) : []),
  ]);
}

function categoryHref(category: string) {
  return `/products?${new URLSearchParams({ category }).toString()}`;
}

function uniqueByUrl(routes: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  return routes.filter((route) => {
    if (seen.has(route.url)) return false;
    seen.add(route.url);
    return true;
  });
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    sitemapEntry('/', now, 'weekly', 1.0),
    sitemapEntry('/products', now, 'weekly', 0.95),
    sitemapEntry('/services', now, 'monthly', 0.8),
    sitemapEntry('/services/installation', now, 'monthly', 0.75),
    sitemapEntry('/services/maintenance', now, 'monthly', 0.75),
    sitemapEntry('/services/project-consultation', now, 'monthly', 0.75),
    sitemapEntry('/projects', now, 'monthly', 0.75),
    sitemapEntry('/enterprise', now, 'monthly', 0.75),
    sitemapEntry('/about', now, 'monthly', 0.7),
    sitemapEntry('/contact', now, 'monthly', 0.7),
    sitemapEntry('/blog', now, 'monthly', 0.7),
    sitemapEntry('/register', now, 'monthly', 0.6),
    sitemapEntry('/privacy-policy', now, 'yearly', 0.3),
    sitemapEntry('/terms-of-service', now, 'yearly', 0.3),
    sitemapEntry('/cookies', now, 'yearly', 0.3),
    sitemapEntry('/sitemap', now, 'monthly', 0.5),
  ];

  const hierarchyCategoryRoutes: MetadataRoute.Sitemap = flattenHierarchyLinks(productHierarchy).map((href) =>
    sitemapEntry(href, now, 'monthly', 0.75)
  );

  const productCategoryRoutes: MetadataRoute.Sitemap = Array.from(
    new Set(
      products.flatMap((product) => [
        product.category,
        ...(product.subCategory ? [product.subCategory] : []),
      ])
    )
  )
    .filter(Boolean)
    .map((category) => sitemapEntry(categoryHref(category), now, 'monthly', 0.7));

  const productRoutes: MetadataRoute.Sitemap = products.map((product) =>
    sitemapEntry(`/product/${product.id}`, now, 'monthly', 0.8)
  );

  const seoCategoryRoutes: MetadataRoute.Sitemap = Object.keys(CATEGORY_BY_PATH).map((path) =>
    sitemapEntry(`/products/${path}`, now, 'monthly', 0.8)
  );

  return uniqueByUrl([
    ...staticRoutes,
    ...hierarchyCategoryRoutes,
    ...productCategoryRoutes,
    ...seoCategoryRoutes,
    ...productRoutes,
  ]);
}
