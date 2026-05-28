import { NextResponse, NextRequest } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const { id } = await params;
    const [rows] = await pool.query('SELECT * FROM email_templates WHERE id = ?', [parseInt(id)]);

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to fetch email template' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const { id } = await params;
    const body = await request.json();

    const { name, subject, html_body, text_body, variables, is_active } = body;

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (subject !== undefined) {
      updates.push('subject = ?');
      values.push(subject);
    }
    if (html_body !== undefined) {
      updates.push('html_body = ?');
      values.push(html_body);
    }
    if (text_body !== undefined) {
      updates.push('text_body = ?');
      values.push(text_body);
    }
    if (variables !== undefined) {
      updates.push('variables = ?');
      values.push(variables ? JSON.stringify(variables) : null);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(parseInt(id));

    await pool.query(
      `UPDATE email_templates SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    const [updated] = await pool.query('SELECT * FROM email_templates WHERE id = ?', [parseInt(id)]);

    if (!Array.isArray(updated) || updated.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (err: any) {
    console.error('Database error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Template name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update email template' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    await initDB();
    const { id } = await params;

    const [existing] = await pool.query('SELECT id FROM email_templates WHERE id = ?', [parseInt(id)]);

    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await pool.query('DELETE FROM email_templates WHERE id = ?', [parseInt(id)]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    return NextResponse.json({ error: 'Failed to delete email template' }, { status: 500 });
  }
}
