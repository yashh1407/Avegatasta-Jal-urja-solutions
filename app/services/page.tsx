import type { Metadata } from 'next';
import ServicesPageClient from './ServicesPageClient';

export const metadata: Metadata = {
  title: 'Our Services | Avegatasta Jal-Urja Solutions, Nashik',
  description:
    'Professional water heating, pumping systems, water treatment, and solar on-grid solutions for homes, hotels, hospitals, and commercial buildings in Nashik.',
  keywords: [
    'water heating installation Nashik',
    'heat pump water heater Nashik',
    'Wilo pump installation',
    'water purifier Nashik',
    'solar system installation Nashik',
    'water softener Nashik',
    'RO water purifier Nashik',
    'heat pump installation service Nashik',
    'solar water heater installation Nashik',
    'water treatment service Nashik',
    'booster pump installation Nashik',
    'commercial water heating solutions Nashik',
  ],
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Our Services | Avegatasta Jal-Urja Solutions',
    description:
      'Water heating, pumping, treatment & solar energy services — professional installation across Nashik.',
    url: 'https://avegatasta.com/services',
    images: [
      {
        url: 'https://avegatasta.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Avegatasta Jal-Urja Solutions — Services',
      },
    ],
    type: 'website',
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
