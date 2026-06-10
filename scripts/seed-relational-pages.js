const mysql = require('mysql2/promise');

async function seedPages() {
  console.log("Starting relational CMS seeding...");
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'avegatasta',
  });

  const query = async (sql, values) => {
    const [results] = await connection.execute(sql, values);
    return results;
  };

  try {
    // Delete extra pages that are NOT the 6 core pages
    await query(`DELETE FROM page_faqs WHERE page_id NOT IN (SELECT id FROM pages WHERE slug IN ('home','about','services','projects','enterprise','contact'))`);
    await query(`DELETE FROM page_sections WHERE page_id NOT IN (SELECT id FROM pages WHERE slug IN ('home','about','services','projects','enterprise','contact'))`);
    await query(`DELETE FROM pages WHERE slug NOT IN ('home','about','services','projects','enterprise','contact')`);
    console.log('Cleaned up extra pages.');

    const corePages = [
      {
        title: 'Home',
        slug: 'home',
        status: 'published',
        meta_title: 'Avegatasta Jal-Urja Solutions | Enterprise Water, Energy & Pool Systems, Nashik',
        meta_description: 'Authorized B2B partner for V-Guard, Wilo, Zero B & Bluewave India in Nashik.',
        show_in_menu: 1,
        menu_label: 'Home',
        menu_order: 1,
        sections: [
          {
            type: 'HeroSection', key: 'home-hero', category: 'Homepage', 
            title: 'Enterprise Water,\nEnergy & Pool\nSolutions',
            subtitle: "Authorized Partner for V-Guard, Wilo, Zero B, and Bluewave",
            content: 'End-to-end B2B solutions — water heating, pumping, treatment, solar, and swimming pool systems — for industrial, commercial, and large-scale residential projects across Nashik.',
            data_json: {
              badge: 'Avegatasta Jal-Urja Solutions · Nashik',
              hero_image_1: '/hero/solar-field.jpg',
              hero_image_2: '/hero/water-pump.png',
              hero_image_3: '/hero/partner-team.jpg',
              hero_image_4: '/hero/water-solutions.jpg',
              primaryButtonText: 'Explore Products',
              primaryButtonUrl: '/products',
              secondaryButtonText: 'Get Free Advice',
              secondaryButtonUrl: '/contact',
              trustStripText: 'Enterprise-grade products · B2B project specialists · Multi-sector experience',
              image1Label: 'Solar',
              image2Label: 'Pumping',
              image3Label: 'Partner',
              image4Label: 'Water',
              floatingBadgeEyebrow: 'Authorized Partner',
              floatingBadgeText: 'V-Guard · Wilo · Zero B · Bluewave'
            }
          },
          {
            type: 'BrandMarquee', key: 'home-marquee', category: 'Homepage', title: 'Brand Marquee',
            data_json: {
              title: 'Authorized Distributor',
              brands: [
                { name: 'V-Guard', logo: '/brands/vguard.png', tagline: 'Water Heating & Solar' },
                { name: 'Zero B', logo: '/brands/zerob.png', tagline: 'Water Treatment' },
                { name: 'Bluewave India', logo: '/brands/bluewave.png', tagline: 'Pool Equipment & Chemicals' },
                { name: 'Wilo', logo: '/brands/wilo.png', tagline: 'Wilo pump dealer Nashik' }
              ]
            }
          },
          {
            type: 'BrandsSection', key: 'home-brands', category: 'Homepage', title: 'Brands Section',
            data_json: {
              badge: 'Brands We Partner With',
              titleHtml: 'Authorized for India\'s <span class="text-accent-400">Leading Brands</span>',
              description: 'We are authorized channel partners for four specialized brands, covering every aspect of water, energy, and pool infrastructure for enterprise clients.'
            }
          },
          {
            type: 'CategorySection', key: 'home-categories', category: 'Homepage', title: 'Category Section',
            data_json: {
              badge: 'Our Solutions',
              titleHtml: 'Specialized Water &amp; Energy Solutions',
              description: 'From heat pumps to water purifiers — complete solutions for every need.'
            }
          },
          {
            type: 'FeaturedProducts', key: 'home-featured', category: 'Homepage', title: 'Featured Products',
            data_json: {
              badge: 'Featured Products',
              titleHtml: 'Top Picks for You',
              description: 'Handpicked water solutions from V-Guard, Zero B, and Wilo.'
            }
          },
          {
            type: 'WhyUsSection', key: 'home-why-us', category: 'Homepage', title: 'Why Us Section',
            data_json: {
              badge: 'Why Choose Us',
              titleHtml: 'Your Enterprise <br /> Solutions Partner',
              benefits: [
                'Authorized partner for V-Guard, Wilo, Zero B & Bluewave India',
                'End-to-end B2B project delivery — supply, install, and support',
                'Serving industrial, commercial, hospitality, and residential sectors',
                'Swimming pool equipment & chemical solutions via Bluewave India',
                'Bulk procurement and enterprise project management capabilities',
                'Energy-efficient systems with certified after-sales service'
              ]
            }
          },
          {
            type: 'EnterpriseSection', key: 'home-enterprise', category: 'Homepage', title: 'Enterprise Section',
            data_json: {
              badge: 'Enterprise &amp; Bulk Projects',
              titleHtml: 'Powering India&rsquo;s <span class="text-accent-400">Enterprises</span>',
              description: 'From a single commercial building to an entire industrial estate — Avegatasta delivers end-to-end B2B project execution with authorised equipment, certified installation, and dedicated after-sales support across every major sector.'
            }
          },
          {
            type: 'TestimonialsSectionClient', key: 'home-testimonials', category: 'Homepage', title: 'Testimonials',
            data_json: {
              badge: 'Testimonials',
              titleHtml: 'What Our Customers Say'
            }
          },
          {
            type: 'FAQAccordion', key: 'home-faqs', category: 'Homepage', title: 'Home FAQs',
            data_json: {}
          },
        ]
      },
      {
        title: 'About Us',
        slug: 'about',
        status: 'published',
        meta_title: 'About Us | Avegatasta Jal-Urja Solutions',
        meta_description: 'Learn about Avegatasta Solution, a reliable provider of advanced water heating.',
        show_in_menu: 1,
        menu_label: 'About',
        menu_order: 2,
        page_data: {
          hero_title: 'Your Trusted Partner for Water & Energy Solutions',
          hero_subtitle: 'About Us – Avegatasta Solution',
          company_intro: "Since our inception, Avegatasta Solution has grown to become Nashik's premier authorized B2B and enterprise partner for top-tier brands like V-Guard, Wilo, and Zero B. We specialize in providing end-to-end solutions for water heating, fluid management, water treatment, and solar energy systems.",
          mission: "To deliver reliable, energy-efficient, and sustainable water and power solutions that empower businesses, industries, and communities to operate at their highest potential.",
          vision: "To be the most trusted and innovative infrastructure partner in Maharashtra, recognized for our uncompromising quality, technical expertise, and dedicated customer service.",
          services: [
            { title: "Consultation & Design", description: "Expert site surveys and system design tailored to your specific industrial or commercial requirements." },
            { title: "Authorized Supply", description: "Direct supply of authentic products from V-Guard, Wilo, and Zero B with complete warranty support." },
            { title: "Professional Installation", description: "Certified technicians ensuring safe, compliant, and efficient installation of all systems." },
            { title: "After-Sales & AMC", description: "Comprehensive maintenance contracts and prompt repair services to ensure zero downtime." }
          ]
        },
        sections: [
          { type: 'GenericHero', key: 'about-hero', category: 'About', title: 'About Us – Avegatasta Solution', subtitle: 'Your Trusted <br /><span class="text-blue-500">Water & Energy</span> Partner', content: 'At Avegatasta Solution, we specialize in delivering enterprise-grade water heating, pumping, water treatment, and solar power systems. With a strong presence across Nashik and Maharashtra, we are committed to sustainable and reliable infrastructure.', data_json: {} },
          { type: 'AboutWhatWeDo', key: 'about-what', category: 'About', title: 'What We Do', subtitle: 'Providing complete solutions for domestic, commercial, and industrial requirements.', content: 'Avegatasta Solution provides end-to-end services from site evaluation to after-sales support.', data_json: {} },
          { type: 'AboutMissionVision', key: 'about-mission', category: 'About', title: 'Mission & Vision', subtitle: 'Our mission is to provide efficient, sustainable, and reliable water and energy solutions that enhance everyday living while supporting environmentally responsible practices.', content: 'To become a trusted leader in water and renewable energy solutions by delivering innovative technologies, dependable service, and customer-focused solutions.', data_json: {} },
          { type: 'AboutWhyChooseUs', key: 'about-why', category: 'About', title: 'Why Choose Us', subtitle: 'Why Choose Avegatasta Solution', content: 'We believe in building long-term relationships with our customers by providing trusted products, expert guidance, and dependable service.', data_json: {} }
        ]
      },
      {
        title: 'Our Services',
        slug: 'services',
        status: 'published',
        meta_title: 'Services | Avegatasta Jal-Urja Solutions',
        meta_description: 'Professional water and energy solutions.',
        show_in_menu: 1,
        menu_label: 'Services',
        menu_order: 3,
        page_data: {
          hero_title: 'Professional <br /> <span class="text-blue-500">Water & Energy</span> Solutions',
          hero_subtitle: 'Our Services',
          description: 'From domestic installations to large-scale industrial projects, Avegatasta Solution provides end-to-end services. As an authorized partner for V-Guard, Wilo, and Zero B, we ensure quality supply, professional installation, and reliable after-sales support.'
        },
        sections: [
          { type: 'GenericHero', key: 'services-hero', category: 'Services', title: 'Our Services', subtitle: 'Professional <br /> <span class="text-blue-500">Water & Energy</span> Solutions', content: 'From domestic installations to large-scale industrial projects, Avegatasta Solution provides end-to-end services. As an authorized partner for V-Guard, Wilo, and Zero B, we ensure quality supply, professional installation, and reliable after-sales support.', data_json: {} },
          { type: 'ServicesServiceAreas', key: 'services-areas', category: 'Services', title: 'Our Core Sectors', subtitle: 'Expertise across diverse applications', content: '', data_json: {} },
          { type: 'ServicesList', key: 'services-list', category: 'Services', title: 'Services List', data_json: {} }
        ]
      },
      {
        title: 'Projects',
        slug: 'projects',
        status: 'published',
        meta_title: 'Projects & Installations | Avegatasta Jal-Urja Solutions',
        meta_description: 'Proven solutions and successful installations.',
        show_in_menu: 1,
        menu_label: 'Projects',
        menu_order: 4,
        page_data: {
          hero_title: 'Proven Solutions. <br /> <span class="text-blue-500">Successful Installations.</span>',
          hero_subtitle: 'Projects & Installations',
          description: 'Explore our portfolio of successful installations across Nashik and surrounding regions. From industrial RO plants to commercial solar water heating systems, we deliver enterprise-grade solutions tailored to complex requirements.'
        },
        sections: [
          { type: 'GenericHero', key: 'projects-hero', category: 'Projects', title: 'Projects & Installations', subtitle: 'Proven Solutions. <br /> <span class="text-blue-500">Successful Installations.</span>', content: 'Explore our portfolio of successful installations across Nashik and surrounding regions. From industrial RO plants to commercial solar water heating systems, we deliver enterprise-grade solutions tailored to complex requirements.', data_json: {} },
          { type: 'ProjectsInstallations', key: 'projects-installations', category: 'Projects', title: 'Projects Installations', data_json: {} },
          { type: 'ProjectsProcess', key: 'projects-process', category: 'Projects', title: 'How We Work', subtitle: 'A structured installation process from start to support', content: 'Every project is planned with technical clarity, professional execution, and dependable after-sales service.', data_json: {} },
          { type: 'ProjectsWhyTrustUs', key: 'projects-why', category: 'Projects', title: 'Why Customers Trust Us', subtitle: 'Trusted execution for water and energy infrastructure', content: 'From system selection to commissioning, Avegatasta focuses on delivering reliable performance, clean installation work, and long-term service value.', data_json: {} }
        ]
      },
      {
        title: 'Enterprise Solutions',
        slug: 'enterprise',
        status: 'published',
        meta_title: 'Enterprise Solutions | Avegatasta Jal-Urja Solutions',
        meta_description: 'B2B solutions for large-scale projects.',
        show_in_menu: 1,
        menu_label: 'Enterprise',
        menu_order: 5,
        page_data: {
          hero_title: 'Infrastructure-Scale \n<span class="text-accent-400">Water, Energy</span>\n& Pool Solutions',
          hero_subtitle: 'Enterprise & Bulk Projects · Nashik',
          description: 'End-to-end B2B project delivery for industrial, commercial, and institutional clients across Nashik. Authorized supply, certified installation, and dedicated after-sales support from a single trusted partner.'
        },
        sections: [
          { type: 'EnterpriseHero', key: 'enterprise-hero', category: 'Enterprise', title: 'Enterprise & Bulk Projects · Nashik', subtitle: 'Infrastructure-Scale <br class="hidden sm:block" /><span class="text-accent-400">Water, Energy</span><br />&amp; Pool Solutions', content: 'End-to-end B2B project delivery for industrial, commercial, and institutional clients across Nashik. Authorized supply, certified installation, and dedicated after-sales support from a single trusted partner.', data_json: {} },
          { type: 'EnterpriseSections', key: 'enterprise-sections', category: 'Enterprise', title: 'Enterprise Sections', data_json: {} },
          { type: 'EnterpriseForm', key: 'enterprise-form', category: 'Enterprise', title: 'Enterprise Enquiry', subtitle: 'Get in Touch', content: 'Tell us about your project. Our team will respond within one business day with a tailored proposal.', data_json: {} }
        ]
      },
      {
        title: 'Contact Us',
        slug: 'contact',
        status: 'published',
        meta_title: 'Contact Us | Avegatasta Jal-Urja Solutions',
        meta_description: 'Get in touch with our experts.',
        show_in_menu: 1,
        menu_label: 'Contact',
        menu_order: 6,
        page_data: {
          hero_title: 'Get in Touch with <br />\n<span class="text-blue-500">Our Experts</span>',
          hero_subtitle: 'Contact Us – Avegatasta Solution',
          description: 'At Avegatasta Solution, we are committed to providing reliable support and expert guidance for all your water heating, pumping, water treatment, and solar energy needs. Whether you are planning a new installation or looking for the right solution for your home or business, our team is here to help.'
        },
        sections: [
          { type: 'ContactHero', key: 'contact-hero', category: 'Contact', title: 'Contact Us – Avegatasta Solution', subtitle: 'Get in Touch with <br /><span class="text-blue-500">Our Experts</span>', content: 'At Avegatasta Solution, we are committed to providing reliable support and expert guidance for all your water heating, pumping, water treatment, and solar energy needs. Whether you are planning a new installation or looking for the right solution for your home or business, our team is here to help.', data_json: {} },
          { type: 'ContactInfo', key: 'contact-info', category: 'Contact', title: 'Contact Info', data_json: {} },
          { type: 'ContactForm', key: 'contact-form', category: 'Contact', title: 'Request a Consultation', subtitle: 'Planning a new installation? <br /><span class="text-blue-600">Let our experts help.</span>', content: 'If you are planning a solar installation, water heating system, pump installation, or water purification solution, our experts can help you choose the right system based on your requirements. Send us your enquiry and our team will contact you with the best solution and quotation.', data_json: {} },
          { type: 'FAQAccordion', key: 'contact-faqs', category: 'Contact', title: 'Contact FAQs', data_json: {} },
          { type: 'ContactMap', key: 'contact-map', category: 'Contact', title: 'Visit our Visitors Area', subtitle: '', content: 'Experience our range of V-Guard, Wilo, and Zero B products in person. Our technical staff is available for live demonstrations.', data_json: {} }
        ]
      }
    ];

    for (const page of corePages) {
      const existing = await query('SELECT id FROM pages WHERE slug = ?', [page.slug]);
      let pageId;
      if (existing.length === 0) {
        const result = await query(
          `INSERT INTO pages (title, slug, status, meta_title, meta_description, show_in_menu, menu_label, menu_order, page_data) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [page.title, page.slug, page.status, page.meta_title, page.meta_description, page.show_in_menu, page.menu_label, page.menu_order, JSON.stringify(page.page_data || {})]
        );
        pageId = result.insertId;
        console.log(`Inserted page: ${page.title}`);
      } else {
        pageId = existing[0].id;
        await query(
          `UPDATE pages SET title=?, status=?, meta_title=?, meta_description=?, show_in_menu=?, menu_label=?, menu_order=?, page_data=? WHERE id=?`,
          [page.title, page.status, page.meta_title, page.meta_description, page.show_in_menu, page.menu_label, page.menu_order, JSON.stringify(page.page_data || {}), pageId]
        );
        console.log(`Updated page: ${page.title}`);
      }

      // Delete existing sections to replace them cleanly
      await query(`DELETE FROM page_sections WHERE page_id = ?`, [pageId]);

      let sort = 1;
      for (const sec of page.sections) {
        await query(
          `INSERT INTO page_sections (page_id, section_type, section_key, category, title, subtitle, content, data_json, sort_order) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [pageId, sec.type, sec.key, sec.category, sec.title, sec.subtitle || '', sec.content || '', JSON.stringify(sec.data_json || {}), sort]
        );
        sort++;
      }
    }

    console.log('Seeding complete.');
  } catch (error) {
    console.error('Error seeding pages:', error);
  } finally {
    await connection.end();
  }
}

seedPages();
