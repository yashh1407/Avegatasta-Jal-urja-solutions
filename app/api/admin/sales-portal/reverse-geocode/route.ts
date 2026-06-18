import { NextResponse, NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { resolveAddress } from '@/lib/geocoding';

export async function GET(req: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates parameter' }, { status: 400 });
  }

  try {
    const address = await resolveAddress(lat, lng);
    return NextResponse.json({
      success: true,
      address: address || 'Location resolved'
    });
  } catch (err: any) {
    console.error('[Reverse Geocode API] Error:', err);
    return NextResponse.json({ error: err.message || 'Geocoding error' }, { status: 500 });
  }
}
