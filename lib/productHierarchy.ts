import type { Product } from '@/lib/data';

export interface ProductHierarchyNode {
  label: string;
  href?: string;
  image?: string;
  filters?: {
    categories?: string[];
    subCategories?: string[];
  };
  children?: ProductHierarchyNode[];
}

export const productHierarchy: ProductHierarchyNode[] = [
  {
    label: 'Water Heating Solutions',
    href: '/products/water-heating-solutions',
    image: '/categories/heating.jpg',
    filters: {
      categories: ['Heat Pumps', 'Solar Water Heaters', 'Water Heaters'],
    },
    children: [
      {
        label: 'Heat Pump',
        href: '/products/water-heating-solutions/heat-pump-water-heaters',
        filters: { categories: ['Heat Pumps'] },
        children: [
          {
            label: 'Domestic Heat Pump',
            href: '/products?category=Domestic+Heat+Pump',
            filters: { categories: ['Heat Pumps'], subCategories: ['Domestic'] },
          },
          {
            label: 'Commercial Heat Pump',
            href: '/products?category=Commercial+Heat+Pump',
            filters: { categories: ['Heat Pumps'], subCategories: ['Commercial'] },
          },
        ],
      },
      {
        label: 'Solar Water Heater',
        href: '/products/water-heating-solutions/solar-water-heaters',
        filters: { categories: ['Solar Water Heaters'] },
      },
      {
        label: 'Electric Geyser',
        href: '/products/water-heating-solutions/electric-geysers',
        filters: { categories: ['Water Heaters'] },
      },
    ],
  },
  {
    label: 'Pumping Solutions',
    href: '/products/pumping-solutions',
    image: '/categories/pumping.jpg',
    filters: {
      categories: ['Domestic Pumps', 'Pumping Segments', 'Electric Motors'],
    },
    children: [
      {
        label: 'Pressure Pump',
        href: '/products/pumping-solutions/pressure-pumps',
        filters: {
          categories: ['Pumping Segments'],
          subCategories: ['Pressure Pump'],
        },
      },
      {
        label: 'Booster Pumps',
        href: '/products/pumping-solutions/booster-pumps',
        filters: {
          categories: ['Pumping Segments'],
          subCategories: ['Pressure Pump'],
        },
      },
      {
        label: 'Inline / Circulation Pump',
        href: '/products/pumping-solutions/inline-pumps',
        filters: {
          categories: ['Pumping Segments'],
          subCategories: ['Inline / Circulation Pump'],
        },
      },
      {
        label: 'Submersible Pumpset',
        href: '/products/pumping-solutions/water-transfer-pumps',
        filters: {
          categories: ['Pumping Segments'],
          subCategories: ['Submersible Pumpset'],
        },
      },
      {
        label: 'Borewell Submersible Pumpset',
        href: '/products?category=Borewell+Submersible+Pumpset',
        filters: {
          categories: ['Pumping Segments'],
          subCategories: ['Borewell Submersible Pumpset', 'Borewell Submersible Pumpset Control Panel'],
        },
      },
    ],
  },
  {
    label: 'Water Treatment Solutions',
    href: '/products/water-treatment-solutions',
    image: '/categories/treatment.jpg',
    filters: {
      categories: ['Water Treatment'],
    },
    children: [
      {
        label: 'Water Softeners',
        href: '/products/water-treatment-solutions/water-softeners',
        filters: { categories: ['Water Treatment'], subCategories: ['Softeners'] },
      },
      {
        label: 'RO Water Purifiers',
        href: '/products/water-treatment-solutions/ro-water-purifiers',
        filters: { categories: ['Water Treatment'], subCategories: ['RO Purifiers', 'Commercial RO'] },
      },
      {
        label: 'UV Water Purifiers',
        href: '/products/water-treatment-solutions/uv-water-purifiers',
        filters: { categories: ['Water Treatment'], subCategories: ['UV Purifiers'] },
      },
      {
        label: 'Sand Filters',
        href: '/products/water-treatment-solutions/filtration-systems',
        filters: { categories: ['Water Treatment'], subCategories: ['Filters'] },
      },
      {
        label: 'Alkaline Water Purifiers',
        href: '/products?category=Alkaline+Water+Purifiers',
        filters: { categories: ['Water Treatment'], subCategories: ['Alkaline Purifiers'] },
      },
    ],
  },
  {
    label: 'Swimming Pool Solutions',
    href: '/products/swimming-pool-solutions',
    image: '/categories/swimming-pool.png',
    filters: {
      categories: ['Swimming Pool'],
    },
    children: [
      {
        label: 'Swimming Pool Equipment',
        href: '/products/swimming-pool-solutions/pool-equipment',
        filters: { categories: ['Swimming Pool'], subCategories: ['Pool Accessories'] },
      },
      {
        label: 'Pool Pumps & Filters',
        href: '/products?category=Pool+Pumps+%26+Filters',
        filters: { categories: ['Swimming Pool'], subCategories: ['Pool Pumps & Filtration'] },
      },
      {
        label: 'Pool Chemical Solutions',
        href: '/products/swimming-pool-solutions/pool-chemicals',
        filters: { categories: ['Swimming Pool'], subCategories: ['Pool Chemicals'] },
      },
      {
        label: 'Swimming Pool Heat Pumps',
        href: '/products/swimming-pool-solutions/swimming-pool-heat-pumps',
        filters: { categories: ['Heat Pumps'], subCategories: ['Swimming Pool'] },
      }
    ],
  },
  {
    label: 'Solar Power Systems',
    href: '/products/solar-power-systems',
    image: '/hero/solar-field.jpg',
    filters: {
      categories: [
        'On-Grid PV Inverters',
        'Solar Panels',
        'Solar Off-Grid System with Battery and Panel',
        'Solar Off-Grid Inverter',
      ],
    },
    children: [
      {
        label: 'On-Grid PV Inverters',
        href: '/products/solar-power-systems/on-grid-solar-systems',
        filters: { categories: ['On-Grid PV Inverters'] },
      },
      {
        label: 'Solar Panels',
        href: '/products/solar-power-systems/solar-panels',
        filters: { categories: ['Solar Panels'] },
      },
      {
        label: 'Solar Off-Grid System with Battery and Panel',
        href: '/products?category=Solar+Off-Grid+System+with+Battery+and+Panel',
        filters: { categories: ['Solar Off-Grid System with Battery and Panel', 'Solar Off-Grid Inverter'] },
      },
    ],
  },
  {
    label: 'Power Backup',
    href: '/products?category=Power+Backup',
    image: 'https://www.pureenergy.co.in/assets/purepower/images/purepower-5.0.png',
    filters: {
      categories: [
        'Smart Energy Storage',
        'Solar Battery',
        'Inverter',
      ],
    },
    children: [
      {
        label: 'Smart Energy Storage (Purepower)',
        href: '/products?category=Smart+Energy+Storage',
        filters: { categories: ['Smart Energy Storage'] },
      },
      {
        label: 'Battery',
        href: '/products?category=Solar+Battery',
        filters: { categories: ['Solar Battery'] },
      },
      {
        label: 'Inverter',
        href: '/products?category=Inverter',
        filters: { categories: ['Inverter'] },
      },
    ],
  },
];

function findNodeByLabel(nodes: ProductHierarchyNode[], label: string): ProductHierarchyNode | null {
  for (const node of nodes) {
    if (node.label === label) return node;
    if (node.children) {
      const match = findNodeByLabel(node.children, label);
      if (match) return match;
    }
  }
  return null;
}

export function getHierarchyNode(label: string | null | undefined): ProductHierarchyNode | null {
  if (!label) return null;
  return findNodeByLabel(productHierarchy, label);
}

export function getTopLevelCategories() {
  return productHierarchy.map(({ label, href, image }) => ({ name: label, href, image }));
}

export function productMatchesHierarchy(product: Product, label: string | null | undefined) {
  if (!label) return true;

  const node = getHierarchyNode(label);
  if (!node) {
    return product.category === label || product.subCategory === label;
  }

  const filters = node.filters;
  if (!filters) return false;

  const categoryMatch =
    !filters.categories || filters.categories.length === 0
      ? false
      : filters.categories.includes(product.category);

  const subCategoryMatch =
    !filters.subCategories || filters.subCategories.length === 0
      ? categoryMatch
      : filters.subCategories.includes(product.subCategory ?? '');

  if (filters.subCategories && filters.subCategories.length > 0) {
    return categoryMatch && subCategoryMatch;
  }

  return categoryMatch;
}
