import { categories, type Product } from '@/lib/data';

export type ProductGroupKey =
  | 'Water Heating'
  | 'Pumping Systems'
  | 'Electric Motors'
  | 'Water Treatment'
  | 'Water Heaters'
  | 'Swimming Pool'
  | 'Solar Power';

export interface ProductMenuItem {
  label: string;
  href: string;
  category?: string;
  subCategory?: string;
  children?: ProductMenuItem[];
}

export interface ProductMenuGroup {
  label: ProductGroupKey;
  href: string;
  categories: string[];
  children?: ProductMenuItem[];
}

export const productMenu: ProductMenuGroup[] = [
  {
    label: 'Water Heating',
    href: '/products?group=Water%20Heating',
    categories: ['Heat Pumps', 'Solar Water Heaters', 'Water Heaters'],
    children: [
      {
        label: 'Heat Pump',
        href: '/products?category=Heat%20Pumps',
        category: 'Heat Pumps',
        children: [
          {
            label: 'Domestic Heat Pump',
            href: '/products?category=Heat%20Pumps&subCategory=Domestic',
            category: 'Heat Pumps',
            subCategory: 'Domestic',
          },
          {
            label: 'Commercial Heat Pump',
            href: '/products?category=Heat%20Pumps&subCategory=Commercial',
            category: 'Heat Pumps',
            subCategory: 'Commercial',
          },
        ],
      },
      {
        label: 'Solar Water Heater',
        href: '/products?category=Solar%20Water%20Heaters',
        category: 'Solar Water Heaters',
      },
      {
        label: 'Electric Geyser',
        href: '/products?category=Water%20Heaters',
        category: 'Water Heaters',
      },
    ],
  },
  {
    label: 'Pumping Systems',
    href: '/products?group=Pumping%20Systems',
    categories: ['Domestic Pumps', 'Pumping Segments'],
    children: [
      { label: 'Domestic Pumps', href: '/products?category=Domestic%20Pumps', category: 'Domestic Pumps' },
      { label: 'Pumping Segments', href: '/products?category=Pumping%20Segments', category: 'Pumping Segments' },
    ],
  },
  {
    label: 'Electric Motors',
    href: '/products?category=Electric%20Motors',
    categories: ['Electric Motors'],
  },
  {
    label: 'Water Treatment',
    href: '/products?category=Water%20Treatment',
    categories: ['Water Treatment'],
  },
  {
    label: 'Water Heaters',
    href: '/products?category=Water%20Heaters',
    categories: ['Water Heaters'],
  },
  {
    label: 'Swimming Pool',
    href: '/products?category=Swimming%20Pool',
    categories: ['Swimming Pool'],
  },
  {
    label: 'Solar Power',
    href: '/products?q=solar',
    categories: ['Solar Water Heaters'],
  },
];

export const topProductMenu = productMenu.slice(0, 4);

export function getCategoryImage(categoryName: string) {
  return categories.find((category) => category.name === categoryName)?.image ?? categories[0]?.image ?? '/logo.webp';
}

export function getProductGroup(label: string | null) {
  if (!label) return null;
  return productMenu.find((group) => group.label.toLowerCase() === label.toLowerCase()) ?? null;
}

export function productMatchesHierarchy(product: Product, filters: { group?: string | null; category?: string | null; subCategory?: string | null }) {
  const group = getProductGroup(filters.group ?? null);
  const matchesGroup = !group || group.categories.includes(product.category);
  const matchesCategory = !filters.category || product.category === filters.category;
  const matchesSubCategory = !filters.subCategory || product.subCategory === filters.subCategory;
  return matchesGroup && matchesCategory && matchesSubCategory;
}
