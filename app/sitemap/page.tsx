import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight, ExternalLink, FolderTree, FileText, Package, ShieldCheck, Building2, Phone } from 'lucide-react';
import { products } from '@/lib/data';
import { productHierarchy, type ProductHierarchyNode } from '@/lib/productHierarchy';

export const metadata: Metadata = {
  title: 'Sitemap | Avegatasta Jal-Urja Solutions',
  description: 'Browse all important Avegatasta website pages, product collections, product categories, product detail pages, company pages, and policy links.',
};

type SitemapLink = {
  label: string;
  href: string;
};

type SectionProps = {
  title: string;
  eyebrow: string;
  icon: ReactNode;
  children: ReactNode;
  count?: number;
};

const mainPages: SitemapLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'Projects', href: '/projects' },
  { label: 'Enterprise Solutions', href: '/enterprise' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Register', href: '/register' },
];

const companyLinks: SitemapLink[] = [
  { label: 'About Avegatasta', href: '/about' },
  { label: 'Projects & Case Studies', href: '/projects' },
  { label: 'Enterprise Solutions', href: '/enterprise' },
  { label: 'Contact Sales Team', href: '/contact' },
  { label: 'Customer Registration', href: '/register' },
];

const policyLinks: SitemapLink[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Cookies Policy', href: '/cookies' },
  { label: 'XML Sitemap', href: '/sitemap.xml' },
];

function safeCategoryHref(category: string) {
  return `/products?${new URLSearchParams({ category }).toString()}`;
}

function flattenHierarchy(nodes: ProductHierarchyNode[]): SitemapLink[] {
  return nodes.flatMap((node) => [
    ...(node.href ? [{ label: node.label, href: node.href }] : []),
    ...(node.children ? flattenHierarchy(node.children) : []),
  ]);
}

function uniqueLinks(links: SitemapLink[]) {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.label}|${link.href}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function groupProductsByCategory() {
  return products.reduce<Record<string, typeof products>>((acc, product) => {
    const category = product.category || 'Other Products';
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});
}

function Section({ title, eyebrow, icon, children, count }: SectionProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            {icon}
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          </div>
        </div>
        {typeof count === 'number' && (
          <span className="w-fit rounded-full bg-slate-100 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600">
            {count} Links
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function LinkList({ links }: { links: SitemapLink[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <Link
            href={link.href}
            className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <span>{link.label}</span>
            {link.href === '/sitemap.xml' ? (
              <ExternalLink className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-blue-600" />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function HierarchyTree({ nodes }: { nodes: ProductHierarchyNode[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {nodes.map((node) => (
        <div key={node.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
          {node.href ? (
            <Link href={node.href} className="text-base font-black text-slate-950 hover:text-blue-700">
              {node.label}
            </Link>
          ) : (
            <h3 className="text-base font-black text-slate-950">{node.label}</h3>
          )}

          {node.children && node.children.length > 0 && (
            <ul className="mt-4 space-y-2 border-l border-slate-200 pl-4">
              {node.children.map((child) => (
                <li key={child.label}>
                  {child.href ? (
                    <Link href={child.href} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-blue-700">
                      <ChevronRight className="h-3.5 w-3.5" />
                      {child.label}
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-600">
                      <ChevronRight className="h-3.5 w-3.5" />
                      {child.label}
                    </span>
                  )}

                  {child.children && child.children.length > 0 && (
                    <ul className="mt-2 space-y-2 pl-6">
                      {child.children.map((grandChild) => (
                        <li key={grandChild.label}>
                          {grandChild.href ? (
                            <Link href={grandChild.href} className="text-sm text-slate-500 hover:text-blue-700">
                              {grandChild.label}
                            </Link>
                          ) : (
                            <span className="text-sm text-slate-500">{grandChild.label}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function SitemapPage() {
  const hierarchyLinks = uniqueLinks(flattenHierarchy(productHierarchy));

  const productCategories = uniqueLinks(
    products.flatMap((product) => [
      product.category ? { label: product.category, href: safeCategoryHref(product.category) } : null,
      product.subCategory ? { label: product.subCategory, href: safeCategoryHref(product.subCategory) } : null,
    ]).filter(Boolean) as SitemapLink[]
  ).sort((a, b) => a.label.localeCompare(b.label));

  const productGroups = groupProductsByCategory();
  const sortedProductGroupNames = Object.keys(productGroups).sort((a, b) => a.localeCompare(b));
  const totalLinks = mainPages.length + hierarchyLinks.length + productCategories.length + products.length + companyLinks.length + policyLinks.length;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-brand-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top_right,_#60a5fa,_transparent_34%),radial-gradient(circle_at_bottom_left,_#22c55e,_transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.3em] text-blue-200">Website Navigation</p>
          <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">Sitemap</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            Find all important Avegatasta pages, product collections, product categories, product detail pages, company links, and policy pages in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white ring-1 ring-white/15">
              {totalLinks} Total Links
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white ring-1 ring-white/15">
              {products.length} Products
            </span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-white ring-1 ring-white/15">
              {productCategories.length} Categories
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Section title="Pages" eyebrow="Main Website" icon={<FileText className="h-5 w-5" />} count={mainPages.length}>
          <LinkList links={mainPages} />
        </Section>

        <Section title="Product Collections" eyebrow="Categories" icon={<FolderTree className="h-5 w-5" />} count={hierarchyLinks.length}>
          <HierarchyTree nodes={productHierarchy} />
        </Section>

        <Section title="Product Category Links" eyebrow="Filters" icon={<FolderTree className="h-5 w-5" />} count={productCategories.length}>
          <LinkList links={productCategories} />
        </Section>

        <Section title="Products" eyebrow="Product Detail Pages" icon={<Package className="h-5 w-5" />} count={products.length}>
          <div className="grid gap-6">
            {sortedProductGroupNames.map((category) => (
              <div key={category} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-lg font-black text-slate-950">{category}</h3>
                  <Link href={safeCategoryHref(category)} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-800">
                    View Category
                  </Link>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {productGroups[category]
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((product) => (
                      <li key={product.id}>
                        <Link
                          href={`/product/${product.id}`}
                          className="group flex h-full items-start justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-700 ring-1 ring-slate-100 transition-all hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200"
                        >
                          <span>{product.name}</span>
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Section title="Company" eyebrow="About & Support" icon={<Building2 className="h-5 w-5" />} count={companyLinks.length}>
              <LinkList links={companyLinks} />
            </Section>
          </div>
          <Section title="Policies" eyebrow="Legal" icon={<ShieldCheck className="h-5 w-5" />} count={policyLinks.length}>
            <LinkList links={policyLinks} />
          </Section>
        </div>

        <section className="rounded-[2rem] bg-brand-950 p-6 text-white sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-200">Need Help?</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight">Talk to Avegatasta</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">For product selection, service, AMC, or enterprise enquiries, contact our team directly.</p>
            </div>
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-widest text-brand-950 transition-all hover:bg-blue-50">
              <Phone className="h-4 w-4" />
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
