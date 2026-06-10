import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

// GET all roles
export async function GET() {
  const { session, error } = await requireAdminSession('employees');
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query(
      'SELECT id, name, permissions, created_at FROM admin_roles ORDER BY id ASC'
    );

    const formatted = (rows as any[]).map((row) => {
      let parsedPermissions = [];
      if (row.permissions) {
        try {
          parsedPermissions = typeof row.permissions === 'string'
            ? JSON.parse(row.permissions)
            : row.permissions;
        } catch (e) {
          console.error('Failed to parse permissions:', e);
        }
      }
      return {
        ...row,
        permissions: parsedPermissions
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('Failed to fetch roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

// POST create role
export async function POST(request: Request) {
  const { session, error } = await requireAdminSession('employees');
  if (error) return error;

  try {
    const body = await request.json();
    const { name, permissions } = body;

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const normalizedName = name.trim().toLowerCase();

    // Prevent creating superadmin role since it's hardcoded and reserved
    if (normalizedName === 'superadmin') {
      return NextResponse.json({ error: 'Cannot create superadmin role' }, { status: 400 });
    }

    await initDB();

    // Check if role name already exists
    const [existing] = await pool.query('SELECT id FROM admin_roles WHERE name = ? LIMIT 1', [normalizedName]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'Role name already exists' }, { status: 400 });
    }

    const permissionsJson = permissions ? JSON.stringify(permissions) : JSON.stringify([]);

    const [result] = await pool.query(
      'INSERT INTO admin_roles (name, permissions) VALUES (?, ?)',
      [normalizedName, permissionsJson]
    );

    const insertId = (result as any).insertId;

    return NextResponse.json({
      id: insertId,
      name: normalizedName,
      permissions
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create role:', error);
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
}
