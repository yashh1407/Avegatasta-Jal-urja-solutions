import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';

export async function GET() {
  try {
    await initDB();
    const [rows] = await pool.query(
      "SELECT * FROM case_studies WHERE status = 'published' ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch case studies' }, { status: 500 });
  }
}
