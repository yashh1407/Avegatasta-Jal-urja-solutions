import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import * as mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const options = {
        convertImage: mammoth.images.imgElement(async (image: any) => {
            const base64String = await image.read("base64");
            const imageBuffer = Buffer.from(base64String, 'base64');
            const hash = crypto.createHash('md5').update(imageBuffer).digest('hex');
            const ext = image.contentType.split('/')[1] || 'png';
            const filename = `${hash}.${ext}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'features');
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const filePath = path.join(uploadDir, filename);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, imageBuffer);
            }
            
            return { src: `/uploads/features/${filename}` };
        })
    };

    const result = await mammoth.convertToHtml({ buffer }, options);
    
    return NextResponse.json({ text: result.value });
  } catch (err) {
    console.error('Docx parsing error:', err);
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 });
  }
}
