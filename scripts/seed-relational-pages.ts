import pool, { initDB } from '../lib/db';

async function seedPages() {
  try {
    await initDB();
    console.log('Connected to the database.');

    const corePages = [
      {
        title: 'Home',
        slug: 'home',
        status: 'published',
        template: 'home',
        meta_title: 'Avegatasta Jal-Urja Solutions | Enterprise Water, Energy & Pool Systems, Nashik',
        meta_description: 'Authorized B2B partner for V-Guard, Wilo, Zero B & Bluewave India in Nashik. Enterprise water heating, pumping, treatment, solar, and swimming pool solutions for industrial, commercial, and large-scale projects.',
        page_data: JSON.stringify({}),
      },
      {
        title: 'About Us',
        slug: 'about',
        status: 'published',
        template: 'about',
        meta_title: 'About Us | Avegatasta Jal-Urja Solutions',
        meta_description: 'Learn about Avegatasta Solution, a reliable provider of advanced water heating, pumping systems, water treatment, and solar energy solutions.',
        page_data: JSON.stringify({
          hero_title: 'Your Trusted Partner for Water & Energy Solutions',
          hero_subtitle: 'About Us ΓÇô Avegatasta Solution',
        }),
      },
      {
        title: 'Our Services',
        slug: 'services',
        status: 'published',
        template: 'services',
        meta_title: 'Services | Avegatasta Jal-Urja Solutions',
        meta_description: 'Professional water and energy solutions for residential, commercial, and industrial projects.',
        page_data: JSON.stringify({
          hero_title: 'Professional Water & Energy Solutions',
          hero_subtitle: 'Our Services',
        }),
      },
      {
        title: 'Projects',
        slug: 'projects',
        status: 'published',
        template: 'projects',
        meta_title: 'Projects & Installations | Avegatasta Jal-Urja Solutions',
        meta_description: 'Proven solutions and successful installations by Avegatasta Solution.',
        page_data: JSON.stringify({
          hero_title: 'Proven Solutions. \nSuccessful Installations.',
          hero_subtitle: 'Projects & Installations',
        }),
      },
      {
        title: 'Enterprise Solutions',
        slug: 'enterprise',
        status: 'published',
        template: 'enterprise',
        meta_title: 'Enterprise Solutions | Avegatasta Jal-Urja Solutions',
        meta_description: 'B2B solutions for large-scale projects.',
        page_data: JSON.stringify({
          hero_title: 'B2B Solutions for Large-Scale Projects',
          hero_subtitle: 'Enterprise Solutions',
        }),
      },
      {
        title: 'Contact Us',
        slug: 'contact',
        status: 'published',
        template: 'contact',
        meta_title: 'Contact Us | Avegatasta Jal-Urja Solutions',
        meta_description: 'Get in touch with our experts.',
        page_data: JSON.stringify({
          hero_title: 'Get in Touch with <br />\n<span class="text-blue-500">Our Experts</span>',
          hero_subtitle: 'Contact Us ΓÇô Avegatasta Solution',
        }),
      }
    ];

    for (const page of corePages) {
      const [existing] = await pool.query('SELECT id FROM pages WHERE slug = ?', [page.slug]);
      if ((existing as any[]).length === 0) {
        await pool.query(
          `INSERT INTO pages (title, slug, status, template, meta_title, meta_description, page_data) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [page.title, page.slug, page.status, page.template, page.meta_title, page.meta_description, page.page_data]
        );
        console.log(`Inserted page: ${page.title}`);
      } else {
        await pool.query(
          `UPDATE pages SET template = ?, page_data = COALESCE(page_data, ?) WHERE slug = ?`,
          [page.template, page.page_data, page.slug]
        );
        console.log(`Updated page: ${page.title}`);
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding pages:', error);
    process.exit(1);
  }
}

seedPages();
