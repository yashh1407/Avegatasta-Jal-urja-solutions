export type BlogTopic = {
  category: string;
  categorySlug: string;
  categoryUrl: string;
  slug: string;
  topic: string;
  targetKeyword: string;
  title: string;
  description: string;
  h1: string;
  links: Array<{ href: string; label: string }>;
};

const topics = [
  ['Water Heating', 'water-heating', 'Heat Pump Water Heater vs Electric Geyser: Which Is Better?', 'Heat pump water heater vs electric geyser', 'heat-pump-water-heater-vs-electric-geyser', '/products/water-heating-solutions/heat-pump-water-heaters', 'heat pump water heaters'],
  ['Water Heating', 'water-heating', 'Best Heat Pump Water Heater for Hotels in Nashik', 'best heat pump water heater for hotels Nashik', 'best-heat-pump-water-heater-for-hotels-nashik', '/products/water-heating-solutions/heat-pump-water-heaters', 'commercial heat pump water heaters'],
  ['Water Heating', 'water-heating', 'How Commercial Hot Water Systems Work', 'commercial hot water system', 'how-commercial-hot-water-systems-work', '/products/water-heating-solutions', 'water heating solutions'],
  ['Water Heating', 'water-heating', 'Solar Water Heater vs Heat Pump Water Heater', 'solar water heater vs heat pump', 'solar-water-heater-vs-heat-pump-water-heater', '/products/water-heating-solutions/solar-water-heaters', 'solar water heaters'],
  ['Pumps', 'pumps', 'Pressure Pump vs Booster Pump: Difference Explained', 'pressure pump vs booster pump', 'pressure-pump-vs-booster-pump', '/products/pumping-solutions/pressure-pumps', 'pressure pumps'],
  ['Pumps', 'pumps', 'How to Choose the Right Pump for a Building', 'right pump for building water pressure', 'choose-right-pump-for-building-water-pressure', '/products/pumping-solutions', 'pumping solutions'],
  ['Pumps', 'pumps', 'Best Pumping Solution for Apartments and Commercial Buildings', 'pumping solution for apartments', 'best-pumping-solution-for-apartments-commercial-buildings', '/products/pumping-solutions/booster-pumps', 'booster pump systems'],
  ['Water Treatment', 'water-treatment', 'Water Softener vs RO Water Purifier: What Do You Need?', 'water softener vs RO purifier', 'water-softener-vs-ro-water-purifier', '/products/water-treatment-solutions', 'water treatment solutions'],
  ['Water Treatment', 'water-treatment', 'Hard Water Problems in Nashik and How to Fix Them', 'hard water problems in Nashik', 'hard-water-problems-in-nashik', '/products/water-treatment-solutions/water-softeners', 'water softeners'],
  ['Water Treatment', 'water-treatment', 'Best Water Treatment Solution for Hotels and Restaurants', 'water treatment for hotels restaurants', 'water-treatment-solution-for-hotels-restaurants', '/products/water-treatment-solutions', 'commercial water treatment systems'],
  ['Water Treatment', 'water-treatment', 'RO, UV and Water Softener: Complete Guide', 'RO UV water softener guide', 'ro-uv-water-softener-complete-guide', '/products/water-treatment-solutions/ro-water-purifiers', 'RO water purifiers'],
  ['Swimming Pool', 'swimming-pool', 'Swimming Pool Chemicals Required for Clean Pool Water', 'swimming pool chemicals', 'swimming-pool-chemicals-required-for-clean-water', '/products/swimming-pool-solutions/pool-chemicals', 'swimming pool chemicals'],
  ['Swimming Pool', 'swimming-pool', 'How to Maintain Swimming Pool Water Quality', 'maintain swimming pool water quality', 'maintain-swimming-pool-water-quality', '/products/swimming-pool-solutions', 'swimming pool solutions'],
  ['Swimming Pool', 'swimming-pool', 'Swimming Pool Heat Pump: Benefits for Hotels and Resorts', 'swimming pool heat pump hotels', 'swimming-pool-heat-pump-benefits-hotels-resorts', '/products/swimming-pool-solutions/swimming-pool-heat-pumps', 'swimming pool heat pumps'],
  ['Swimming Pool', 'swimming-pool', 'Best Swimming Pool Equipment for Commercial Pools', 'commercial swimming pool equipment', 'best-swimming-pool-equipment-commercial-pools', '/products/swimming-pool-solutions/pool-equipment', 'swimming pool equipment'],
  ['Solar', 'solar', 'On-Grid Solar System: Complete Guide for Businesses', 'on-grid solar system business', 'on-grid-solar-system-guide-businesses', '/products/solar-power-systems/on-grid-solar-systems', 'on-grid solar systems'],
  ['Solar', 'solar', '3kW to 100kW Solar System: Which Size Do You Need?', '3kW to 100kW solar system', '3kw-to-100kw-solar-system-size-guide', '/products/solar-power-systems', 'solar power systems'],
  ['Solar', 'solar', 'Solar Panels for Commercial Buildings in Nashik', 'commercial solar panels Nashik', 'solar-panels-commercial-buildings-nashik', '/products/solar-power-systems/solar-panels', 'solar panels'],
] as const;

export const blogTopics: BlogTopic[] = topics.map(([category, categorySlug, topic, targetKeyword, slug, primaryHref, primaryLabel]) => ({
  category,
  categorySlug,
  categoryUrl: `/blog/${categorySlug}`,
  slug,
  topic,
  targetKeyword,
  title: `${topic} | Avegatasta`,
  description: `Learn about ${targetKeyword} with practical guidance from Avegatasta Jal-Urja Solutions in Nashik. Explore related products and request project support.`,
  h1: topic,
  links: [
    { href: primaryHref, label: primaryLabel },
    { href: '/contact', label: 'request a quote' },
  ],
}));

export function getBlogCategories() {
  const seen = new Map<string, { name: string; slug: string; url: string }>();
  for (const topic of blogTopics) {
    if (!seen.has(topic.categorySlug)) {
      seen.set(topic.categorySlug, {
        name: topic.category,
        slug: topic.categorySlug,
        url: topic.categoryUrl,
      });
    }
  }
  return Array.from(seen.values());
}

export function getBlogTopic(categorySlug: string, slug: string) {
  return blogTopics.find((topic) => topic.categorySlug === categorySlug && topic.slug === slug) ?? null;
}
