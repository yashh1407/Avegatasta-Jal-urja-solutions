import type { Metadata } from 'next';
import ProjectsPageClient from './ProjectsPageClient';

export const metadata: Metadata = {
  title: 'Projects & Installations | Avegatasta Jal-Urja Solutions, Nashik',
  description:
    'Explore installation projects by Avegatasta — solar systems, heat pump installations, pumping systems, and water treatment plants across Nashik and Maharashtra.',
  keywords: [
    'solar installation projects Nashik',
    'heat pump installation Nashik',
    'water treatment project Nashik',
    'pump system installation Maharashtra',
    'case studies water energy Nashik',
    'V-Guard installation Nashik',
    'Wilo pump project Nashik',
    'solar water heater project Nashik',
    'commercial water heating project Nashik',
    'Avegatasta project portfolio',
  ],
  alternates: {
    canonical: '/projects',
  },
  openGraph: {
    title: 'Projects & Installations | Avegatasta Jal-Urja Solutions',
    description:
      'Solar, heat pump, pumping, and water treatment installation projects across Nashik and Maharashtra.',
    url: 'https://avegatasta.com/projects',
    images: [
      {
        url: 'https://avegatasta.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Avegatasta Jal-Urja Solutions — Projects & Installations',
      },
    ],
    type: 'website',
  },
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
