import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';
import bcrypt from 'bcryptjs';
import { validatePassword } from '@/lib/security';
import { logAdminAction, getIpAddress } from '@/lib/audit';

// PUT update employee
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminSession('employees');
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, email, mobile_number, role, permissions, password } = body;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    await initDB();

    // Verify user exists
    const [existing] = await pool.query('SELECT id, role FROM admin_users WHERE id = ? LIMIT 1', [id]);
    if ((existing as any[]).length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Verify email is not already in use by another user
    const [existingEmail] = await pool.query('SELECT id FROM admin_users WHERE email = ? AND id != ? LIMIT 1', [email, id]);
    if ((existingEmail as any[]).length > 0) {
      return NextResponse.json({ error: 'Email address already in use by another account' }, { status: 400 });
    }

    // Build update query
    let query = 'UPDATE admin_users SET name = ?, email = ?, mobile_number = ?, role = ?, permissions = ?';
    const paramsList: any[] = [name, email, mobile_number, role, permissions ? JSON.stringify(permissions) : null];

    if (password) {
      const pwdCheck = validatePassword(password);
      if (!pwdCheck.isValid) {
        return NextResponse.json({ error: pwdCheck.error }, { status: 400 });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      query += ', password_hash = ?';
      paramsList.push(passwordHash);
    }

    query += ' WHERE id = ?';
    paramsList.push(id);

    await pool.query(query, paramsList);

    // Log the admin action
    const adminUser = session.user as any;
    await logAdminAction(
      adminUser.id ? Number(adminUser.id) : null,
      adminUser.email || null,
      'UPDATE_EMPLOYEE',
      { employee_id: id, employee_email: email, role },
      getIpAddress(request)
    );

    return NextResponse.json({
      message: 'Employee updated successfully',
      id,
      name,
      email,
      mobile_number,
      role,
      permissions
    });
  } catch (error: any) {
    console.error('Failed to update employee:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

// DELETE employee
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminSession('employees');
  if (error) return error;

  const { id } = await params;

  try {
    await initDB();

    const currentUser = session.user as any;
    const sessionUserId = currentUser?.id || currentUser?.sub;
    
    // Query db to get the employee role to make sure we don't delete a superadmin if there's only one,
    // and prevent deleting self.
    const [rows] = await pool.query('SELECT id, role, email FROM admin_users WHERE id = ? LIMIT 1', [id]);
    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const employeeToDelete = (rows as any[])[0];

    if (String(employeeToDelete.id) === String(sessionUserId)) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // If deleting a superadmin, ensure there is at least one other superadmin remaining
    if (employeeToDelete.role === 'superadmin') {
      const [superadmins] = await pool.query("SELECT COUNT(*) as count FROM admin_users WHERE role = 'superadmin'");
      const count = (superadmins as any[])[0].count;
      if (count <= 1) {
        return NextResponse.json({ error: 'Cannot delete the only remaining superadmin' }, { status: 400 });
      }
    }

    await pool.query('DELETE FROM admin_users WHERE id = ?', [id]);

    // Log the admin action
    const adminUser = session.user as any;
    await logAdminAction(
      adminUser.id ? Number(adminUser.id) : null,
      adminUser.email || null,
      'DELETE_EMPLOYEE',
      { employee_id: id, employee_email: employeeToDelete.email },
      getIpAddress(request)
    );

    return NextResponse.json({ message: 'Employee deleted successfully', id });
  } catch (error: any) {
    console.error('Failed to delete employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}
