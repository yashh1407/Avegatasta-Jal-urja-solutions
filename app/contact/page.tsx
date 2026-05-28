import type { Metadata } from 'next';
import ContactPageClient from './ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Us | Avegatasta Jal-Urja Solutions, Nashik',
  description:
    'Get in touch with Avegatasta Jal-Urja Solutions in Nashik. Call, WhatsApp, or send an inquiry for heat pumps, pumping systems, water purifiers, and solar installations.',
  keywords: [
    'contact Avegatasta',
    'water heater service Nashik',
    'pump repair Nashik',
    'solar installation contact',
    'Jal Urja Solutions phone number',
    'water purifier service Nashik',
    'Avegatasta contact number',
    'water solutions enquiry Nashik',
    'heat pump dealer contact Nashik',
    'swimming pool equipment contact Nashik',
  ],
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact Us | Avegatasta Jal-Urja Solutions',
    description: 'Reach our team in Nashik for all water & energy solution enquiries.',
    url: 'https://avegatasta.com/contact',
    images: [
      {
        url: 'https://avegatasta.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contact Avegatasta Jal-Urja Solutions, Nashik',
      },
    ],
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
