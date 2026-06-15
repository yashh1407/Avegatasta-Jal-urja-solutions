import crypto from 'crypto';
import { env } from './env';

const ALGORITHM = 'aes-256-cbc';

// Helper to derive a 32-byte key from NEXTAUTH_SECRET using sha256
const getSecretKey = () => {
  const secret = env.NEXTAUTH_SECRET || 'fallback-secret-at-least-32-chars-long';
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Encrypts CAPTCHA text and its expiration timestamp into a secure token.
 */
export function encryptCaptcha(text: string, expiresMs = 5 * 60 * 1000): string {
  const key = getSecretKey();
  const iv = crypto.randomBytes(16);
  const expiry = Date.now() + expiresMs;
  const payload = JSON.stringify({ text, expiry });
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(payload, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts a CAPTCHA token and returns the text if not expired and valid, or null.
 */
export function decryptCaptcha(token: string): string | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 2) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const key = getSecretKey();
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    const { text, expiry } = JSON.parse(decrypted);
    if (Date.now() > expiry) {
      return null; // Expired
    }
    return text;
  } catch (err) {
    return null;
  }
}

/**
 * Generates an SVG image containing randomized characters, rotations, noise lines, and dots.
 */
export function generateCaptchaSvg(text: string): string {
  const width = 150;
  const height = 50;
  let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
  
  // Background
  svg += `<rect width="100%" height="100%" fill="#f8fafc"/>`;
  
  // Noise lines
  for (let i = 0; i < 5; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const colors = ['#cbd5e1', '#94a3b8', '#64748b', '#94a3b8'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${1 + Math.random() * 1.5}" opacity="0.6"/>`;
  }

  // Noise dots
  for (let i = 0; i < 35; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const r = 1 + Math.random() * 1;
    svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#cbd5e1" opacity="0.5"/>`;
  }
  
  // Characters
  const len = text.length;
  const charWidth = width / (len + 1);
  for (let i = 0; i < len; i++) {
    const char = text[i];
    const fontSize = 22 + Math.floor(Math.random() * 8);
    const rotation = -25 + Math.floor(Math.random() * 50); // -25 to 25 degrees
    const x = charWidth * (i + 0.6) + (Math.random() * 4 - 2);
    const y = 32 + (Math.random() * 8 - 4);
    const colors = ['#1e293b', '#0f172a', '#020617', '#1d4ed8', '#0f766e', '#4338ca'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    svg += `<text x="${x}" y="${y}" font-family="monospace, Courier" font-size="${fontSize}" font-weight="900" fill="${color}" transform="rotate(${rotation}, ${x}, ${y})">${char}</text>`;
  }
  
  svg += `</svg>`;
  return svg;
}
