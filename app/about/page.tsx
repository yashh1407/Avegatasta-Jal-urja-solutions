import type { Metadata } from 'next';
import AboutPageClient from './AboutPageClient';

export const metadata: Metadata = {
  title: 'About Us | Avegatasta Jal-Urja Solutions, Nashik',
  description:
    'Avegatasta Solution is an authorized distributor of V-Guard, Wilo, and Zero B in Nashik. Learn about our mission, vision, and commitment to energy-efficient water and solar solutions.',
  keywords: [
    'about Avegatasta',
    'Jal Urja Solutions Nashik',
    'V-Guard dealer Nashik',
    'Wilo authorized distributor',
    'Zero B dealer Nashik',
    'water energy solutions Nashik',
    'authorized water solutions company Nashik',
    'Avegatasta Jal-Urja Solutions about',
    'water heating company Nashik',
    'energy solutions distributor Maharashtra',
  ],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | Avegatasta Jal-Urja Solutions',
    description:
      'Authorized distributor of V-Guard, Wilo, and Zero B in Nashik — water heating, pumping, treatment & solar.',
    url: 'https://avegatasta.com/about',
    images: [
      {
        url: 'https://avegatasta.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Avegatasta Jal-Urja Solutions — About Us',
      },
    ],
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
