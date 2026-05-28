import { NextResponse, NextRequest } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET() {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query('SELECT * FROM email_templates ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch email templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const body = await request.json();

    const { name, subject, html_body, text_body, variables, is_active } = body;

    if (!name || !subject || !html_body || !text_body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const variablesJson = variables ? JSON.stringify(variables) : null;

    const [result] = await pool.query(
      'INSERT INTO email_templates (name, subject, html_body, text_body, variables, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [name, subject, html_body, text_body, variablesJson, is_active ? 1 : 0]
    ) as [{ insertId: number }, unknown];

    const [newTemplate] = await pool.query(
      'SELECT * FROM email_templates WHERE id = ?',
      [result.insertId]
    );

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (err: any) {
    console.error('Database error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Template name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create email template' }, { status: 500 });
  }
}
