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
    // Delete extra pages that are NOT the core or subservices pages
    const allowedSlugs = ['home','about','services','projects','enterprise','contact','services-installation','services-maintenance','services-project-consultation'];
    await query(`DELETE FROM page_faqs WHERE page_id NOT IN (SELECT id FROM pages WHERE slug IN (${allowedSlugs.map(() => '?').join(',')}))`, allowedSlugs);
    await query(`DELETE FROM page_sections WHERE page_id NOT IN (SELECT id FROM pages WHERE slug IN (${allowedSlugs.map(() => '?').join(',')}))`, allowedSlugs);
    await query(`DELETE FROM pages WHERE slug NOT IN (${allowedSlugs.map(() => '?').join(',')})`, allowedSlugs);
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
        faqs: [
          {
            question: "What is Avegatasta Jal-Urja Solutions?",
            answer: "Avegatasta Jal-Urja Solutions is an authorized B2B distributor and installation partner for V-Guard, Wilo, Zero B, and Bluewave India in Nashik, Maharashtra. We specialize in enterprise-grade water heating, pumping systems, water treatment, solar energy, and swimming pool solutions."
          },
          {
            question: "What areas does Avegatasta serve?",
            answer: "Avegatasta primarily serves Nashik and the surrounding Maharashtra region, catering to industrial, commercial, and large-scale residential projects."
          },
          {
            question: "Which brands does Avegatasta distribute?",
            answer: "Avegatasta is an authorized distributor for V-Guard (heat pumps, solar water heaters, domestic pumps), Wilo (pumping systems), Zero B by Ion Exchange (water purifiers, water softeners), and Bluewave India (swimming pool equipment and chemicals)."
          },
          {
            question: "Does Avegatasta offer installation services?",
            answer: "Yes. Avegatasta provides end-to-end installation services for heat pump water heaters, pumping systems, water treatment plants, solar on-grid systems, and swimming pool equipment across Nashik and Maharashtra."
          },
          {
            question: "Where can I buy swimming pool chemicals in Nashik?",
            answer: "Avegatasta Jal-Urja Solutions is an authorized supplier of Bluewave India swimming pool chemicals and equipment in Nashik. Contact us at +919689881369 or visit avegatasta.com for enquiries."
          },
          {
            question: "What types of heat pumps are available in Nashik?",
            answer: "Avegatasta stocks V-Guard heat pump water heaters suitable for residential, commercial, and industrial applications. These are energy-efficient alternatives to traditional electric geysers. Contact us for the best heat pump in Nashik."
          }
        ],
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
            data_json: {
              badge: 'FAQ',
              title: 'Frequently Asked Questions'
            }
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
        page_data: {},
        sections: [
          {
            type: 'GenericHero', key: 'about-hero', category: 'About', 
            title: 'About Us – Avegatasta Solution', 
            subtitle: 'Your Trusted <br /><span class="text-blue-500">Water & Energy</span> Partner', 
            content: 'At Avegatasta Solution, we specialize in delivering enterprise-grade water heating, pumping, water treatment, and solar power systems. With a strong presence across Nashik and Maharashtra, we are committed to sustainable and reliable infrastructure.', 
            data_json: {
              background_image: "",
              button_label: "",
              button_link: ""
            } 
          },
          {
            type: 'AboutWhatWeDo', key: 'about-what', category: 'About', 
            title: 'What We Do', 
            subtitle: 'Providing complete solutions for domestic, commercial, and industrial requirements.', 
            content: 'Avegatasta Solution provides end-to-end services from site evaluation to after-sales support.', 
            data_json: {
              services: [
                { title: "Water Heating Solutions", description: "We provide modern water heating technologies, including the latest heat pump water heater models and comprehensive solar water heater installation. As a leading solar water heater supplier, we offer energy efficient water heater solutions and commercial heat pump water heater systems suitable for homes, hotels, hospitals, and commercial facilities.", icon: "Droplets" },
                { title: "Pumping Solutions", description: "Our pumping solutions ensure smooth water flow, stable pressure, and efficient water distribution. We specialize in water pressure pump installation and provide robust booster pump system for buildings. As a trusted Wilo pump dealer and inline water pump supplier, we deliver reliable water transfer pump system setups for residential and industrial environments.", icon: "Waves" },
                { title: "Water Treatment Systems", description: "We offer advanced utility water treatment and drinking water purification. Our services include water softener installation, whole house water filter setups, and expert RO water purifier installation. As a certified Zero B water purifier dealer and UV water purifier supplier, we ensure safe and high-quality water for your property.", icon: "ShieldCheck" },
                { title: "Solar On-Grid Power Systems", description: "We design and execute professional solar system installation, including on grid solar system installation and commercial solar installation. If you are looking for solar panel installation near me or a solar power system for home, our experts can help, offering scalable solutions like 3kW solar system installation to reduce dependence on conventional power sources.", icon: "Sun" }
              ]
            } 
          },
          {
            type: 'AboutMissionVision', key: 'about-mission', category: 'About', 
            title: 'Our Mission', 
            subtitle: 'Our Vision', 
            content: '', 
            data_json: {
              mission: "To deliver reliable, energy-efficient, and sustainable water and power solutions that empower businesses, industries, and communities to operate at their highest potential.",
              vision: "To be the most trusted and innovative infrastructure partner in Maharashtra, recognized for our uncompromising quality, technical expertise, and dedicated customer service."
            } 
          },
          {
            type: 'AboutWhyChooseUs', key: 'about-why', category: 'About', 
            title: 'Why Choose Us', 
            subtitle: 'Why Choose Avegatasta Solution', 
            content: 'We believe in building long-term relationships with our customers by providing trusted products, expert guidance, and dependable service.', 
            data_json: {
              why_image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200&h=1200",
              why_image_alt: "Modern Home with Solar Panels",
              quote: "\"We believe in building long-term relationships with our customers by providing trusted products, expert guidance, and dependable service.\"",
              benefits: [
                "Authorized partner for V-Guard, Wilo, Zero B & Bluewave India",
                "End-to-end B2B project delivery — supply, install, and support",
                "Serving industrial, commercial, hospitality, and residential sectors",
                "Swimming pool equipment & chemical solutions via Bluewave India",
                "Bulk procurement and enterprise project management capabilities",
                "Energy-efficient systems with certified after-sales service"
              ]
            } 
          }
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
        page_data: {},
        sections: [
          {
            type: 'GenericHero', key: 'services-hero', category: 'Services', 
            title: 'Our Services', 
            subtitle: 'Professional <br /> <span class="text-blue-500">Water & Energy</span> Solutions', 
            content: 'From domestic installations to large-scale industrial projects, Avegatasta Solution provides end-to-end services. As an authorized partner for V-Guard, Wilo, and Zero B, we ensure quality supply, professional installation, and reliable after-sales support.', 
            data_json: {
              background_image: "",
              button_label: "",
              button_link: ""
            } 
          },
          {
            type: 'ServicesServiceAreas', key: 'services-areas', category: 'Services', 
            title: 'Our Core Sectors', 
            subtitle: 'Expertise across diverse applications', 
            content: '', 
            data_json: {
              areas: [
                "Apartments and Villas",
                "Hotels and Hospitals",
                "Commercial Buildings",
                "Industrial Facilities"
              ]
            } 
          },
          {
            type: 'ServicesList', key: 'services-list', category: 'Services', 
            title: 'Why Choose Avegatasta Solution', 
            subtitle: 'Contact Us', 
            content: '', 
            data_json: {
              why_title: "Why Choose Avegatasta Solution",
              contact_label: "Contact Us"
            } 
          }
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
        page_data: {},
        sections: [
          {
            type: 'GenericHero', key: 'projects-hero', category: 'Projects', 
            title: 'Projects & Installations', 
            subtitle: 'Proven Solutions. <br /> <span class="text-blue-500">Successful Installations.</span>', 
            content: 'Explore our portfolio of successful installations across Nashik and surrounding regions. From industrial RO plants to commercial solar water heating systems, we deliver enterprise-grade solutions tailored to complex requirements.', 
            data_json: {
              background_image: "",
              button_label: "",
              button_link: ""
            } 
          },
          {
            type: 'ProjectsInstallations', key: 'projects-installations', category: 'Projects', 
            title: 'Projects Showcase', 
            subtitle: 'Our Installations',
            content: '',
            data_json: {
              types: [
                {
                  id: "solar",
                  title: "Solar System Installations",
                  icon: "Sun",
                  intro: "We design and install on-grid solar power systems for residential and commercial customers. Our team manages the entire process from system planning to installation and commissioning.",
                  lists: [
                    {
                      title: "Typical Projects",
                      items: [
                        "Residential rooftop solar systems",
                        "Solar installations for commercial buildings",
                        "Solar systems for small industries",
                        "Solar systems ranging from 3 kW to 100 kW"
                      ]
                    },
                    {
                      title: "Project Benefits",
                      items: ["Reduced electricity costs", "Sustainable energy generation", "Reliable power production"]
                    }
                  ]
                },
                {
                  id: "water-heating",
                  title: "Water Heating System Installations",
                  icon: "Droplets",
                  intro: "We install modern water heating systems that deliver efficient hot water solutions for various applications.",
                  lists: [
                    {
                      title: "Projects Include",
                      items: [
                        "Heat pump installations for residential buildings",
                        "Commercial heat pump systems for hotels and hospitals",
                        "Solar water heater installations",
                        "Electric geyser installations for homes and offices"
                      ]
                    }
                  ]
                },
                {
                  id: "pumping",
                  title: "Pumping System Installations",
                  icon: "Waves",
                  intro: "Our team installs advanced pumping systems designed for efficient water pressure management and water distribution.",
                  lists: [
                    {
                      title: "Common Installations",
                      items: [
                        "Pressure pump systems for residential buildings",
                        "Booster pump systems for high-rise apartments",
                        "Inline pumps for circulation systems",
                        "Water transfer pumps for tank filling and distribution"
                      ]
                    }
                  ]
                },
                {
                  id: "water-treatment",
                  title: "Water Treatment Installations",
                  icon: "ShieldCheck",
                  intro: "We provide professional installation of water treatment systems to ensure clean and safe water for both utility and drinking purposes.",
                  lists: [
                    {
                      title: "Systems Installed",
                      items: [
                        "Water softeners for hard water treatment",
                        "Whole-house filtration systems",
                        "RO drinking water purification systems",
                        "UV purification systems"
                      ]
                    }
                  ]
                }
              ]
            } 
          },
          { type: 'CaseStudiesSection', key: 'projects-case-studies', category: 'Projects', title: 'Enterprise Case Studies', data_json: {} },
          {
            type: 'ProjectsProcess', key: 'projects-process', category: 'Projects', 
            title: 'How We Work', 
            subtitle: 'A structured installation process from start to support', 
            content: 'Every project is planned with technical clarity, professional execution, and dependable after-sales service.', 
            data_json: {
              steps: [
                { icon: "ClipboardCheck", text: "Site inspection and requirement analysis" },
                { icon: "PenTool", text: "System design and product selection" },
                { icon: "Wrench", text: "Professional installation and testing" },
                { icon: "Settings", text: "System handover and user orientation" }
              ]
            } 
          },
          {
            type: 'ProjectsWhyTrustUs', key: 'projects-why', category: 'Projects', 
            title: 'Why Customers Trust Us', 
            subtitle: 'Trusted execution for water and energy infrastructure', 
            content: 'From system selection to commissioning, Avegatasta focuses on delivering reliable performance, clean installation work, and long-term service value.', 
            data_json: {
              points: [
                { title: "Authorised Distributor", desc: "Official supply of V-Guard, Wilo, and Zero B systems with warranty." },
                { title: "Qualified Engineers", desc: "Experienced technical staff for load estimation and layout planning." },
                { title: "Quality Materials", desc: "We use premium piping, electrical, and plumbing accessories." },
                { title: "On-Time Completion", desc: "Dedicated project execution teams ensuring prompt completion." }
              ]
            } 
          }
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
        page_data: {},
        sections: [
          { 
            type: 'EnterpriseHero', key: 'enterprise-hero', category: 'Enterprise', 
            title: 'Enterprise & Bulk Projects · Nashik', 
            subtitle: 'Infrastructure-Scale <br class="hidden sm:block" /><span class="text-accent-400">Water, Energy</span><br />&amp; Pool Solutions', 
            content: 'End-to-end B2B project delivery for industrial, commercial, and institutional clients across Nashik. Authorized supply, certified installation, and dedicated after-sales support from a single trusted partner.', 
            data_json: {
              background_image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=900&h=675",
              button_label: "Submit Enterprise Enquiry",
              button_link: "#enterprise-enquiry",
              call_label: "Talk to Our Team",
              footer_text: "V-Guard · Wilo · Zero B · Bluewave India — authorized channel partner"
            } 
          },
          { 
            type: 'EnterpriseClientTypes', key: 'enterprise-clients', category: 'Enterprise', 
            title: 'Who We Serve', 
            subtitle: 'Built for Every <span class="text-brand-600">Enterprise Sector</span>', 
            content: 'From a single commercial building to a multi-site industrial estate, our B2B solutions are scoped and delivered to match the demands of your sector.', 
            data_json: {
              clients: [
                { title: "Apartments & Villas", desc: "Scalable centralized systems." },
                { title: "Hotels & Hospitals", desc: "High capacity water management." },
                { title: "Commercial Buildings", desc: "Reliable commercial installations." },
                { title: "Industrial Facilities", desc: "Heavy duty pumping & treatment." }
              ]
            } 
          },
          { 
            type: 'EnterpriseDeliverables', key: 'enterprise-deliverables', category: 'Enterprise', 
            title: 'What We Deliver', 
            subtitle: 'Full-Cycle <span class="text-brand-600">Project Execution</span>', 
            content: 'We handle every stage — from initial scoping to post-installation support — so your project stays on schedule and on budget.', 
            data_json: {
              deliverables: [
                { title: "Site Inspection", desc: "Technical evaluation & design." },
                { title: "Product Supply", desc: "Authorized distribution of brands." },
                { title: "Certified Installation", desc: "Professional setup & testing." },
                { title: "Maintenance & AMC", desc: "Dedicated support & servicing." }
              ]
            } 
          },
          { 
            type: 'EnterpriseWhyUs', key: 'enterprise-why-us', category: 'Enterprise', 
            title: 'Why Choose Us', 
            subtitle: 'Why Enterprise Buyers <span class="text-accent-400">Choose Avegatasta</span>', 
            content: 'We believe in building long-term relationships with our customers by providing trusted products, expert guidance, and dependable service.', 
            data_json: {
              image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800&h=1000",
              benefits: [
                { title: "Authorized Partner", desc: "For V-Guard, Wilo, Zero B & Bluewave India." },
                { title: "Technical Expertise", desc: "Detailed load calculations and layout design." },
                { title: "Dedicated Support", desc: "Committed after-sales team with quick response time." }
              ],
              button_label: "Start Your Project"
            } 
          },
          { 
            type: 'EnterpriseTrackRecord', key: 'enterprise-stats', category: 'Enterprise', 
            title: 'Our Track Record', 
            subtitle: 'Proven at Scale', 
            content: '',
            data_json: {
              stats: [
                { value: "10+", label: "Years Serving B2B Clients", sub: "Established enterprise partner in Nashik" },
                { value: "1,000+", label: "Corporate Clients", sub: "Across industrial, commercial & hospitality" },
                { value: "5,000+", label: "Units Installed", sub: "Heat pumps, pumps, purifiers, pool systems" },
                { value: "10+", label: "Industry Sectors", sub: "From manufacturing to aquatics" }
              ]
            } 
          },
          { 
            type: 'EnterpriseForm', key: 'enterprise-form', category: 'Enterprise', 
            title: 'Get in Touch', 
            subtitle: 'Enterprise Enquiry', 
            content: 'Tell us about your project. Our team will respond within one business day with a tailored proposal.', 
            data_json: {} 
          },
          { 
            type: 'EnterpriseCredentials', key: 'enterprise-credentials', category: 'Enterprise', 
            title: 'Authorized Channel Partner For', 
            subtitle: '',
            content: '',
            data_json: {
              credentials: [
                { name: "V-Guard" },
                { name: "Zero B" },
                { name: "Wilo" },
                { name: "Bluewave India" }
              ]
            } 
          }
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
        faqs: [
          {
            question: "How long does installation take?",
            answer: "Most domestic pump and water purifier installations are completed within 4-6 hours. Larger solar or industrial systems may take 1-2 days depending on the complexity."
          },
          {
            question: "Do you provide after-sales service?",
            answer: "Yes, we are authorized service providers for all brands we sell. We offer both on-call repairs and annual maintenance contracts (AMC)."
          },
          {
            question: "What is the warranty period?",
            answer: "Warranty varies by product and brand. Typically, V-Guard and Zero B products come with a 1-year comprehensive warranty, while some pump motors have up to 2 years."
          },
          {
            question: "Do you offer free site visits?",
            answer: "For solar water heaters and industrial pumping solutions, we provide free site surveys within Nashik city limits to ensure the right product selection."
          }
        ],
        page_data: {},
        sections: [
          { 
            type: 'ContactHero', key: 'contact-hero', category: 'Contact', 
            title: 'Contact Us – Avegatasta Solution', 
            subtitle: 'Get in Touch with <br /><span class="text-blue-500">Our Experts</span>', 
            content: 'At Avegatasta Solution, we are committed to providing reliable support and expert guidance for all your water heating, pumping, water treatment, and solar energy needs. Whether you are planning a new installation or looking for the right solution for your home or business, our team is here to help.', 
            data_json: {} 
          },
          { 
            type: 'ContactInfo', key: 'contact-info', category: 'Contact', 
            title: 'Contact Info', 
            subtitle: '',
            content: '',
            data_json: {
              phone: "+91 96898 81369",
              phone_description: "Monday - Saturday, 9:30 AM - 6:30 PM",
              company_name: "Avegatasta Solution",
              short_address: "Nashik, Maharashtra",
              working_days: "Monday - Saturday",
              working_hours: "9:30 AM - 6:30 PM",
              email: "sales@avegatasta.com",
              email_description: "Send us your enquiry",
              address: "Flat No. 2, Suryapraksh Apartment, Sant Kabir Nagar, Parijat Nagar, Nashik, Maharashtra 422005"
            } 
          },
          { 
            type: 'ContactForm', key: 'contact-form', category: 'Contact', 
            title: 'Request a Consultation', 
            subtitle: 'Planning a new installation? <br /><span class="text-blue-600">Let our experts help.</span>', 
            content: 'If you are planning a solar installation, water heating system, pump installation, or water purification solution, our experts can help you choose the right system based on your requirements. Send us your enquiry and our team will contact you with the best solution and quotation.', 
            data_json: {
              solutions: [
                "Water Heating",
                "Pumping Systems",
                "Water Treatment",
                "Solar On-Grid",
                "Swimming Pools"
              ]
            } 
          },
          { 
            type: 'FAQAccordion', key: 'contact-faqs', category: 'Contact', 
            title: 'Contact FAQs', 
            subtitle: '',
            content: '',
            data_json: { badge: 'Common Questions', title: 'Frequently Asked Questions' } 
          },
          { 
            type: 'ContactMap', key: 'contact-map', category: 'Contact', 
            title: 'Visit our Visitors Area', 
            subtitle: '', 
            content: 'Experience our range of V-Guard, Wilo, and Zero B products in person. Our technical staff is available for live demonstrations.', 
            data_json: {
              address: "Flat No. 2, Suryapraksh Apartment, Sant Kabir Nagar, Parijat Nagar, Nashik, Maharashtra 422005",
              maps_url: "https://maps.google.com/?q=Avegatasta+Jal+Urja+Solutions+Nashik"
            } 
          }
        ]
      },
      {
        title: 'Services: Installation',
        slug: 'services-installation',
        status: 'published',
        meta_title: 'Heat Pump Installation Service Nashik | Avegatasta',
        meta_description: 'Avegatasta provides heat pump installation service Nashik support along with installation for solar water heaters, water purifiers and pumping systems.',
        show_in_menu: 0,
        menu_label: 'Installation',
        menu_order: 7,
        sections: [
          { 
            type: 'GenericHero', key: 'services-installation-hero', category: 'Services', 
            title: 'Installation Services', 
            subtitle: 'Heat Pump Installation Service Nashik', 
            content: 'Avegatasta provides heat pump installation service Nashik support for homes, hotels, hospitals and commercial projects, along with solar water heater, water purifier and pumping system installation coordination.', 
            data_json: {} 
          },
          { 
            type: 'ServicesServiceAreas', key: 'services-installation-areas', category: 'Services', 
            title: 'Our Core Sectors', 
            subtitle: 'Expertise across diverse applications', 
            content: '', 
            data_json: {
              areas: [
                "Apartments and Villas",
                "Hotels and Hospitals",
                "Commercial Buildings",
                "Industrial Facilities"
              ]
            } 
          },
          { 
            type: 'ServicesList', key: 'services-installation-list', category: 'Services', 
            title: 'Why Choose Avegatasta Solution', 
            subtitle: 'Contact Us', 
            content: '', 
            data_json: {
              why_title: "Why Choose Avegatasta Solution",
              contact_label: "Contact Us"
            } 
          }
        ]
      },
      {
        title: 'Services: Maintenance',
        slug: 'services-maintenance',
        status: 'published',
        meta_title: 'Maintenance Services | Avegatasta Jal-Urja Solutions',
        meta_description: 'Expert maintenance, repair, and AMC services for water heating, pumping, and treatment solutions in Nashik.',
        show_in_menu: 0,
        menu_label: 'Maintenance',
        menu_order: 8,
        sections: [
          { 
            type: 'GenericHero', key: 'services-maintenance-hero', category: 'Services', 
            title: 'Maintenance Services', 
            subtitle: 'Expert Maintenance & Repair Solutions', 
            content: 'Avegatasta Jal-Urja Solutions provides professional repair, preventative maintenance, and Annual Maintenance Contracts (AMC) to ensure your water heating, pumping, and treatment systems run with maximum efficiency and zero downtime.', 
            data_json: {} 
          },
          { 
            type: 'ServicesServiceAreas', key: 'services-maintenance-areas', category: 'Services', 
            title: 'Our Core Sectors', 
            subtitle: 'Expertise across diverse applications', 
            content: '', 
            data_json: {
              areas: [
                "Apartments and Villas",
                "Hotels and Hospitals",
                "Commercial Buildings",
                "Industrial Facilities"
              ]
            } 
          },
          { 
            type: 'ServicesList', key: 'services-maintenance-list', category: 'Services', 
            title: 'Why Choose Avegatasta Solution', 
            subtitle: 'Contact Us', 
            content: '', 
            data_json: {
              why_title: "Why Choose Avegatasta Solution",
              contact_label: "Contact Us"
            } 
          }
        ]
      },
      {
        title: 'Services: Project Consultation',
        slug: 'services-project-consultation',
        status: 'published',
        meta_title: 'Project Consultation | Avegatasta Jal-Urja Solutions',
        meta_description: 'Consultation and design for enterprise-scale water, energy, and pool infrastructure projects in Nashik and Maharashtra.',
        show_in_menu: 0,
        menu_label: 'Consultation',
        menu_order: 9,
        sections: [
          { 
            type: 'GenericHero', key: 'services-consultation-hero', category: 'Services', 
            title: 'Project Consultation', 
            subtitle: 'Custom Design & Infrastructure Consultation', 
            content: 'We offer technical site evaluations, load calculations, custom system design, and engineering consultation for large-scale enterprise water heating, pumping, solar power, and pool systems.', 
            data_json: {} 
          },
          { 
            type: 'ServicesServiceAreas', key: 'services-consultation-areas', category: 'Services', 
            title: 'Our Core Sectors', 
            subtitle: 'Expertise across diverse applications', 
            content: '', 
            data_json: {
              areas: [
                "Apartments and Villas",
                "Hotels and Hospitals",
                "Commercial Buildings",
                "Industrial Facilities"
              ]
            } 
          },
          { 
            type: 'ServicesList', key: 'services-consultation-list', category: 'Services', 
            title: 'Why Choose Avegatasta Solution', 
            subtitle: 'Contact Us', 
            content: '', 
            data_json: {
              why_title: "Why Choose Avegatasta Solution",
              contact_label: "Contact Us"
            } 
          }
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

      // Seed FAQs if any are defined on the page object
      await query(`DELETE FROM page_faqs WHERE page_id = ?`, [pageId]);
      if (page.faqs && page.faqs.length > 0) {
        let faqSort = 1;
        for (const faq of page.faqs) {
          await query(
            `INSERT INTO page_faqs (page_id, question, answer, sort_order, is_active) VALUES (?, ?, ?, ?, ?)`,
            [pageId, faq.question, faq.answer, faqSort, true]
          );
          faqSort++;
        }
        console.log(`Seeded ${page.faqs.length} FAQs for page: ${page.title}`);
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
