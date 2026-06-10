import { NextResponse } from 'next/server';
import pool, { initDB } from '@/lib/db';
import { requireAdminSession } from '@/lib/admin-auth';

// PUT update role
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminSession('employees');
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, permissions } = body;

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const normalizedName = name.trim().toLowerCase();

    // Prevent renaming to superadmin
    if (normalizedName === 'superadmin') {
      return NextResponse.json({ error: 'Cannot update role to superadmin' }, { status: 400 });
    }

    await initDB();

    // Verify role exists
    const [roleRow] = await pool.query('SELECT name FROM admin_roles WHERE id = ? LIMIT 1', [id]);
    if ((roleRow as any[]).length === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    const oldName = (roleRow as any[])[0].name;

    // Prevent renaming system-default roles
    if ((oldName === 'employee' || oldName === 'sales') && oldName !== normalizedName) {
      return NextResponse.json({ error: `Cannot rename the system-default role '${oldName}'` }, { status: 400 });
    }

    // Verify name is not already in use by another role
    const [existingName] = await pool.query('SELECT id FROM admin_roles WHERE name = ? AND id != ? LIMIT 1', [normalizedName, id]);
    if ((existingName as any[]).length > 0) {
      return NextResponse.json({ error: 'Role name already in use by another role' }, { status: 400 });
    }

    const permissionsJson = permissions ? JSON.stringify(permissions) : JSON.stringify([]);

    // Update role
    await pool.query(
      'UPDATE admin_roles SET name = ?, permissions = ? WHERE id = ?',
      [normalizedName, permissionsJson, id]
    );

    // Sync role and permissions to all users whose role matches the old name
    await pool.query(
      'UPDATE admin_users SET role = ?, permissions = ? WHERE role = ?',
      [normalizedName, permissionsJson, oldName]
    );

    return NextResponse.json({
      message: 'Role updated successfully',
      id,
      name: normalizedName,
      permissions
    });
  } catch (error: any) {
    console.error('Failed to update role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

// DELETE role
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdminSession('employees');
  if (error) return error;

  const { id } = await params;

  try {
    await initDB();

    // Verify role exists
    const [roleRow] = await pool.query('SELECT name FROM admin_roles WHERE id = ? LIMIT 1', [id]);
    if ((roleRow as any[]).length === 0) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    const roleName = (roleRow as any[])[0].name;

    // Prevent deleting system default roles
    if (roleName === 'employee' || roleName === 'sales') {
      return NextResponse.json({ error: 'Cannot delete system-default roles' }, { status: 400 });
    }

    // Delete role
    await pool.query('DELETE FROM admin_roles WHERE id = ?', [id]);

    // Reset users carrying this role back to the default 'employee' role and clear their permissions
    await pool.query(
      "UPDATE admin_users SET role = 'employee', permissions = ? WHERE role = ?",
      [JSON.stringify([]), roleName]
    );

    return NextResponse.json({ message: 'Role deleted successfully', id });
  } catch (error: any) {
    console.error('Failed to delete role:', error);
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
