import React from 'react';
import { notFound } from 'next/navigation';
import Hero from '@/components/Hero';
import BrandsSection from '@/components/BrandsSection';
import WhyUsSection from '@/components/WhyUsSection';
import FAQAccordion from '@/components/FAQAccordion';
import CategorySection from '@/components/CategorySection';

import BrandMarquee from '@/components/BrandMarquee';
import EnterpriseSection from '@/components/EnterpriseSection';
import TestimonialsSectionClient from '@/components/TestimonialsSectionClient';
import FeaturedProducts from '@/components/FeaturedProducts';

import GenericHero from '@/components/GenericHero';
import AboutWhatWeDo from '@/components/AboutWhatWeDo';
import AboutMissionVision from '@/components/AboutMissionVision';
import AboutWhyChooseUs from '@/components/AboutWhyChooseUs';
import ServicesServiceAreas from '@/components/ServicesServiceAreas';
import ServicesList from '@/components/ServicesList';
import ProjectsInstallations from '@/components/ProjectsInstallations';
import ProjectsProcess from '@/components/ProjectsProcess';
import ProjectsWhyTrustUs from '@/components/ProjectsWhyTrustUs';
import EnterpriseHero from '@/components/EnterpriseHero';
import EnterpriseSections from '@/components/EnterpriseSections';
import EnterpriseForm from '@/components/EnterpriseForm';
import ContactHero from '@/components/ContactHero';
import ContactInfo from '@/components/ContactInfo';
import ContactForm from '@/components/ContactForm';
import ContactMap from '@/components/ContactMap';

const COMPONENT_MAP: Record<string, any> = {
  HeroSection: Hero,
  BrandMarquee: BrandMarquee,
  BrandsSection: BrandsSection,
  CategorySection: CategorySection,
  FeaturedProducts: FeaturedProducts,
  WhyUsSection: WhyUsSection,
  EnterpriseSection: EnterpriseSection,
  TestimonialsSectionClient: TestimonialsSectionClient,
  FAQAccordion: FAQAccordion,
  GenericHero: GenericHero,
  AboutWhatWeDo: AboutWhatWeDo,
  AboutMissionVision: AboutMissionVision,
  AboutWhyChooseUs: AboutWhyChooseUs,
  ServicesServiceAreas: ServicesServiceAreas,
  ServicesList: ServicesList,
  ProjectsInstallations: ProjectsInstallations,
  ProjectsProcess: ProjectsProcess,
  ProjectsWhyTrustUs: ProjectsWhyTrustUs,
  EnterpriseHero: EnterpriseHero,
  EnterpriseSections: EnterpriseSections,
  EnterpriseForm: EnterpriseForm,
  ContactHero: ContactHero,
  ContactInfo: ContactInfo,
  ContactForm: ContactForm,
  ContactMap: ContactMap,
};

export default function DynamicPageRenderer({ page, sections, faqs }: { page: any, sections: any[], faqs: any[] }) {
  if (!page || page.status !== 'published') {
    notFound();
  }

  // Parse page_data if available
  let pageData: Record<string, any> = {};
  if (page.page_data) {
    try {
      pageData = typeof page.page_data === 'string' ? JSON.parse(page.page_data) : page.page_data;
    } catch { /* ignore */ }
  }

  return (
    <div className="w-full">
      {sections.map((section) => {
        // Find component mapping
        const Component = COMPONENT_MAP[section.section_type];
        
        if (!Component) {
          return (
            <div key={section.id} className="py-20 bg-gray-50 text-center">
              <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
              {section.subtitle && <p className="text-xl text-gray-600 mb-6">{section.subtitle}</p>}
              <div dangerouslySetInnerHTML={{ __html: section.content }} />
            </div>
          );
        }

        // Parse section data_json
        let sectionData: Record<string, any> = {};
        if (section.data_json) {
          try {
            sectionData = typeof section.data_json === 'string' ? JSON.parse(section.data_json) : section.data_json;
          } catch { /* ignore */ }
        }

        // For FAQAccordion, pass items from the faqs prop
        if (section.section_type === 'FAQAccordion') {
          return <Component key={section.id} items={faqs || []} {...sectionData} />;
        }

        // Spread data_json as props so components can read their editable fields
        return (
          <Component 
            key={section.id} 
            title={section.title}
            subtitle={section.subtitle}
            content={section.content}
            {...sectionData}
          />
        );
      })}

      {/* Standalone FAQs if not already rendered via a FAQAccordion section */}
      {faqs && faqs.length > 0 && !sections.some(s => s.section_type === 'FAQAccordion') && (
        <div className="py-16 bg-white max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <FAQAccordion items={faqs} />
        </div>
      )}
    </div>
  );
}

