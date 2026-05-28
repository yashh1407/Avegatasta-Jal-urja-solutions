import nodemailer from 'nodemailer';
import pool, { initDB } from '@/lib/db';
import { createDecipheriv, scryptSync } from 'crypto';
import { getCached } from '@/lib/cache';

const ENCRYPTION_KEY = 'smtp-settings-key-please-use-env';
const ALGORITHM = 'aes-256-cbc';

function decryptPassword(encrypted: string): string {
  const buffer = Buffer.from(encrypted, 'base64');
  const salt = buffer.slice(0, 32);
  const iv = buffer.slice(32, 48);
  const encryptedText = buffer.slice(48);
  const key = scryptSync(ENCRYPTION_KEY, salt, 32);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  html_body: string;
  text_body: string;
  variables: string[] | null;
  is_active: number;
}

interface SMTPSettings {
  id: number;
  host: string;
  port: number;
  username: string;
  password_encrypted: string;
  from_email: string;
  from_name: string;
  enabled: number;
}

function renderTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  });
  return result;
}

interface SendEmailOptions {
  to: string;
  templateSlug: string;
  variables: Record<string, string>;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    await initDB();

    // Get SMTP settings
    const [smtpRows] = await pool.query('SELECT * FROM smtp_settings LIMIT 1');
    const smtpSettings = (smtpRows as SMTPSettings[])[0];

    if (!smtpSettings || !smtpSettings.enabled) {
      console.warn('[Email] SMTP not configured or disabled');
      return false;
    }

    // Decrypt password
    const decryptedPassword = decryptPassword(smtpSettings.password_encrypted);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.port === 465,
      auth: {
        user: smtpSettings.username,
        pass: decryptedPassword,
      },
    });

    // If custom subject/body provided, use those; otherwise load from template
    let subject = options.subject;
    let htmlBody = options.htmlBody;
    let textBody = options.textBody;

    if (!subject || !htmlBody || !textBody) {
      const [templateRows] = await pool.query(
        'SELECT * FROM email_templates WHERE name = ? AND is_active = 1',
        [options.templateSlug]
      );

      const template = (templateRows as EmailTemplate[])[0];
      if (!template) {
        console.error(`[Email] Template not found: ${options.templateSlug}`);
        return false;
      }

      subject = options.subject || renderTemplate(template.subject, options.variables);
      htmlBody = options.htmlBody || renderTemplate(template.html_body, options.variables);
      textBody = options.textBody || renderTemplate(template.text_body, options.variables);
    } else {
      // Render custom body with variables
      htmlBody = renderTemplate(htmlBody, options.variables);
      textBody = renderTemplate(textBody, options.variables);
    }

    // Send email
    const info = await transporter.sendMail({
      from: `${smtpSettings.from_name || 'Avegatasta'} <${smtpSettings.from_email}>`,
      to: options.to,
      subject,
      html: htmlBody,
      text: textBody,
    });

    console.log(`[Email] Sent to ${options.to}, messageId: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error('[Email] Failed to send email:', err);
    return false;
  }
}

export async function getEmailTemplate(templateSlug: string): Promise<EmailTemplate | null> {
  try {
    await initDB();
    const [rows] = await pool.query(
      'SELECT * FROM email_templates WHERE name = ? AND is_active = 1',
      [templateSlug]
    );

    return (rows as EmailTemplate[])[0] || null;
  } catch (err) {
    console.error('[Email] Failed to get template:', err);
    return null;
  }
}

export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    return await getCached('site-settings:email-all', 5 * 60 * 1000, async () => {
      await initDB();
      const [rows] = await pool.query('SELECT `key`, value FROM site_settings');

      const map: Record<string, string> = {};
      for (const row of rows as Array<{ key: string; value: string }>) {
        map[row.key] = row.value || '';
      }
      return map;
    });
  } catch (err) {
    console.error('[Email] Failed to get site settings:', err);
    return {};
  }
}
