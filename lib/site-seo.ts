export const SITE_URL = 'https://avegatasta.com';

export const BUSINESS_NAME = 'Avegatasta Jal-Urja Solutions';

export const BUSINESS_PHONE = '+919689881369';

export const BUSINESS_EMAIL = 'sales@avegatasta.com';

export const BUSINESS_ADDRESS = {
  streetAddress: 'Flat No. 2, Suryapraksh Apartment, Sant Kabir Nagar, Parijat Nagar',
  addressLocality: 'Nashik',
  addressRegion: 'Maharashtra',
  postalCode: '422005',
  addressCountry: 'IN',
};

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function absoluteUrl(path = '/') {
  if (path.startsWith('http')) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS_NAME,
    alternateName: 'Avegatasta Solution',
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/logo.png`,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    address: {
      '@type': 'PostalAddress',
      ...BUSINESS_ADDRESS,
    },
    areaServed: ['Nashik', 'Maharashtra'],
    description:
      'Avegatasta Jal-Urja Solutions provides water heating, pumping, water treatment, solar power and swimming pool solutions for residential, commercial and industrial projects.',
    sameAs: ['https://www.instagram.com/avegatasta_/'],
    brand: [
      { '@type': 'Brand', name: 'V-Guard' },
      { '@type': 'Brand', name: 'Wilo' },
      { '@type': 'Brand', name: 'Zero B' },
      { '@type': 'Brand', name: 'Bluewave India' },
    ],
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}
