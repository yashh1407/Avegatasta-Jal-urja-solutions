import type { Metadata } from 'next';
import ServicesPageClient from '../ServicesPageClient';

export const metadata: Metadata = {
  title: 'Heat Pump Installation Service Nashik | Avegatasta',
  description: 'Avegatasta provides heat pump installation service Nashik support along with installation for solar water heaters, water purifiers and pumping systems.',
  keywords: [
    'Heat pump installation service Nashik',
    'heat pump water heater installation Nashik',
    'solar water heater installation Nashik',
    'pumping system installation Nashik',
  ],
  alternates: {
    canonical: '/services/installation',
  },
};

export default function InstallationServicePage() {
  return <ServicesPageClient focus="installation" />;
}
