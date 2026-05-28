import type { Metadata } from 'next';
import ProductsPageClient from './ProductsPageClient';

export const metadata: Metadata = {
  title: 'Products | Avegatasta Jal-Urja Solutions, Nashik',
  description:
    'Browse the full range of V-Guard, Wilo, and Zero B products — heat pumps, domestic pumps, water heaters, water purifiers, and solar systems available in Nashik.',
  keywords: [
    'V-Guard products Nashik',
    'Wilo pump Nashik',
    'Zero B purifier Nashik',
    'heat pump water heater',
    'domestic pump Nashik',
    'water treatment products',
    'solar water heater',
    'buy heat pump Nashik',
    'Bluewave India pool equipment Nashik',
    'water purifier price Nashik',
    'best solar water heater Nashik',
    'industrial pumping system Nashik',
    'water softener price Maharashtra',
  ],
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Products | Avegatasta Jal-Urja Solutions',
    description:
      'V-Guard, Wilo, and Zero B authorized products — pumps, heaters, purifiers, and solar systems in Nashik.',
    url: 'https://avegatasta.com/products',
    images: [
      {
        url: 'https://avegatasta.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Avegatasta Jal-Urja Solutions — Product Catalog',
      },
    ],
    type: 'website',
  },
};

export default function ProductsPage() {
  return <ProductsPageClient />;
}
