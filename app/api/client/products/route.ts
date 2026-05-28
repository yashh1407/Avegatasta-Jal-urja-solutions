import { NextResponse } from 'next/server';
import { products } from '@/lib/data';
import { productMatchesHierarchy } from '@/lib/productHierarchy';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toLowerCase() || '';
  const category = searchParams.get('category')?.trim() || '';
  const brand = searchParams.get('brand')?.trim() || '';

  let result = products;

  if (q) {
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  if (category) {
    result = result.filter((p) => productMatchesHierarchy(p, category));
  }
  if (brand) {
    result = result.filter((p) => p.brand === brand);
  }

  return NextResponse.json(result);
}
