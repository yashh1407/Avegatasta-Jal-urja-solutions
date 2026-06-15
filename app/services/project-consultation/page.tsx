import type { Metadata } from 'next';
import ServicesPageClient from '../ServicesPageClient';

export const metadata: Metadata = {
  title: 'Project Consultation | Avegatasta Jal-Urja Solutions',
  description: 'Consultation and design for enterprise-scale water, energy, and pool infrastructure projects in Nashik and Maharashtra.',
  alternates: {
    canonical: '/services/project-consultation',
  },
};

export default function ConsultationServicePage() {
  return <ServicesPageClient />;
}
