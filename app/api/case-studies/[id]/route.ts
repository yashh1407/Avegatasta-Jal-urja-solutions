import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await initDB();
    const [rows] = await pool.query(
      "SELECT * FROM case_studies WHERE id = ? AND status = 'published'",
      [id]
    );
    const caseStudy = (rows as unknown[])[0];
    if (!caseStudy) return NextResponse.json({ error: 'Case study not found' }, { status: 404 });
    return NextResponse.json(caseStudy);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch case study' }, { status: 500 });
  }
}
