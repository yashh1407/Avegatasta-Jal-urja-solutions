import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { requireAdminSession } from '@/lib/admin-auth';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'testimonial-images');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function cleanFilenamePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40) || 'testimonial';
}

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 422 });
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: 'Only JPG, PNG, and WebP images are allowed' }, { status: 422 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Image size must be below 5 MB' }, { status: 422 });
  }

  try {
    await mkdir(UPLOAD_DIR, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalName = file.name.replace(/\.[^.]+$/, '');
    const filename = `${cleanFilenamePart(originalName)}-${Date.now()}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      url: `/testimonial-images/${filename}`,
    });
  } catch (err) {
    console.error('Testimonial image upload error:', err);
    return NextResponse.json({ error: 'Failed to upload testimonial image' }, { status: 500 });
  }
}
