import pool from '@/lib/db';

/**
 * Extracts the client IP address from a Next.js Request object.
 */
export function getIpAddress(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Logs a critical admin action to the database.
 */
export async function logAdminAction(
  adminId: number | null,
  adminEmail: string | null,
  action: string,
  details: any,
  ipAddress?: string
) {
  try {
    const detailsJson = details ? JSON.stringify(details) : null;
    await pool.query(
      'INSERT INTO admin_audit_logs (admin_id, admin_email, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [adminId, adminEmail, action, detailsJson, ipAddress || 'unknown']
    );
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
}
