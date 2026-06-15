import type { Metadata } from 'next';
import ServicesPageClient from '../ServicesPageClient';

export const metadata: Metadata = {
  title: 'Maintenance Services | Avegatasta Jal-Urja Solutions',
  description: 'Expert maintenance, repair, and AMC services for water heating, pumping, and treatment solutions in Nashik.',
  alternates: {
    canonical: '/services/maintenance',
  },
};

export default function MaintenanceServicePage() {
  return <ServicesPageClient />;
}
