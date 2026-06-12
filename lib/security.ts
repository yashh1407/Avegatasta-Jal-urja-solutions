/**
 * Validates a password against strong password policy rules:
 * - Minimum 8 characters.
 * - At least one uppercase letter.
 * - At least one lowercase letter.
 * - At least one numerical digit.
 * - At least one special character (e.g. @, $, !, %, *, ?, &).
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one digit' };
  }
  if (!/[@$!%*?&#]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (e.g. @$!%*?&#)' };
  }
  return { isValid: true };
}
