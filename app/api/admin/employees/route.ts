import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/security';
import { logAdminAction, getIpAddress } from '@/lib/audit';

// GET all employees
export async function GET() {
  const { session, error } = await requireAdminSession('employees');
  if (error) return error;

  try {
    await initDB();
    const [rows] = await pool.query(
      'SELECT id, name, email, mobile_number, role, permissions, last_login, failed_login_attempts, lockout_until, created_at FROM admin_users ORDER BY id ASC'
    );

    const formatted = (rows as any[]).map((row) => {
      let parsedPermissions = null;
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
    console.error('Failed to fetch employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

// POST create employee
export async function POST(request: Request) {
  const { session, error } = await requireAdminSession('employees');
  if (error) return error;

  try {
    const body = await request.json();
    const { name, email, mobile_number, password, role, permissions } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required' }, { status: 400 });
    }

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.isValid) {
      return NextResponse.json({ error: pwdCheck.error }, { status: 400 });
    }

    await initDB();

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM admin_users WHERE email = ? LIMIT 1', [email]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'Email address already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const permissionsJson = permissions ? JSON.stringify(permissions) : null;

    const [result] = await pool.query(
      'INSERT INTO admin_users (name, email, mobile_number, password_hash, role, permissions) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, mobile_number, passwordHash, role, permissionsJson]
    );

    const insertId = (result as any).insertId;

    // Log the admin action
    const adminUser = session.user as any;
    await logAdminAction(
      adminUser.id ? Number(adminUser.id) : null,
      adminUser.email || null,
      'CREATE_EMPLOYEE',
      { employee_id: insertId, employee_email: email, employee_name: name, role },
      getIpAddress(request)
    );

    return NextResponse.json({
      id: insertId,
      name,
      email,
      mobile_number,
      role,
      permissions
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
