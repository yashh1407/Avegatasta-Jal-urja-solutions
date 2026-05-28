import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import exifr from 'exifr';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'case-study-images');

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdminSession();
  if (error) return error;

  const { id } = await params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'file is required' }, { status: 422 });
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 422 });
  }

  try {
    await initDB();

    // Verify case study exists
    const [rows] = await pool.query('SELECT id FROM case_studies WHERE id = ?', [id]);
    if ((rows as unknown[]).length === 0) {
      return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract GPS from EXIF
    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      const gps = await exifr.gps(buffer);
      if (gps?.latitude != null && gps?.longitude != null) {
        latitude = gps.latitude;
        longitude = gps.longitude;
      }
    } catch {
      // GPS extraction is best-effort; continue without it
    }

    // Save file
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = `case-study-${id}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    await writeFile(filePath, buffer);

    const imageUrl = `/case-study-images/${filename}`;

    // If GPS found, update case study coordinates
    if (latitude !== null && longitude !== null) {
      await pool.query(
        'UPDATE case_studies SET latitude = ?, longitude = ? WHERE id = ?',
        [latitude, longitude, id]
      );
    }

    return NextResponse.json({
      url: imageUrl,
      gps: latitude !== null ? { latitude, longitude } : null,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
