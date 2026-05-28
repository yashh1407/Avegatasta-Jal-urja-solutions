import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendOwnerNotification(subject: string, html: string): Promise<void> {
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (!notifyEmail || !process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[mailer] SMTP not configured — skipping notification');
    return;
  }

  const transport = createTransport();
  await transport.sendMail({
    from: `"Avegatasta Website" <${process.env.SMTP_USER}>`,
    to: notifyEmail,
    subject,
    html,
  });
}

export function contactNotificationHtml(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  submittedAt: string;
}): string {
  return `
    <h2 style="color:#1e3a5f">New Contact Form Submission</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Name</td><td style="padding:8px;background:#f8fafc">${esc(data.name)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Email</td><td style="padding:8px;background:#f8fafc">${esc(data.email)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Phone</td><td style="padding:8px;background:#f8fafc">${esc(data.phone ?? '—')}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Subject</td><td style="padding:8px;background:#f8fafc">${esc(data.subject ?? '—')}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Message</td><td style="padding:8px;background:#f8fafc;white-space:pre-wrap">${esc(data.message)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Submitted At</td><td style="padding:8px;background:#f8fafc">${esc(data.submittedAt)}</td></tr>
    </table>
  `;
}

export function productInquiryNotificationHtml(data: {
  name: string;
  phone: string;
  email?: string;
  message: string;
  productName: string;
  submittedAt: string;
}): string {
  return `
    <h2 style="color:#1e3a5f">New Product Inquiry</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Product</td><td style="padding:8px;background:#f8fafc">${esc(data.productName)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Name</td><td style="padding:8px;background:#f8fafc">${esc(data.name)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Phone</td><td style="padding:8px;background:#f8fafc">${esc(data.phone)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Email</td><td style="padding:8px;background:#f8fafc">${esc(data.email ?? '—')}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Message</td><td style="padding:8px;background:#f8fafc;white-space:pre-wrap">${esc(data.message)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Submitted At</td><td style="padding:8px;background:#f8fafc">${esc(data.submittedAt)}</td></tr>
    </table>
  `;
}

export function registrationNotificationHtml(data: {
  firstName: string;
  lastName: string;
  phone: string;
  submittedAt: string;
}): string {
  return `
    <h2 style="color:#1e3a5f">New Customer Registration</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">First Name</td><td style="padding:8px;background:#f8fafc">${esc(data.firstName)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Last Name</td><td style="padding:8px;background:#f8fafc">${esc(data.lastName)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Phone</td><td style="padding:8px;background:#f8fafc">${esc(data.phone)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Submitted At</td><td style="padding:8px;background:#f8fafc">${esc(data.submittedAt)}</td></tr>
    </table>
  `;
}

export function enterpriseInquiryNotificationHtml(data: {
  name: string;
  company: string;
  designation?: string;
  phone: string;
  email: string;
  project_type?: string;
  scale?: string;
  message: string;
  submittedAt: string;
}): string {
  return `
    <h2 style="color:#1e3a5f">New Enterprise Inquiry</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Name</td><td style="padding:8px;background:#f8fafc">${esc(data.name)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Company</td><td style="padding:8px;background:#f8fafc">${esc(data.company)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Designation</td><td style="padding:8px;background:#f8fafc">${esc(data.designation ?? '—')}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Phone</td><td style="padding:8px;background:#f8fafc">${esc(data.phone)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Email</td><td style="padding:8px;background:#f8fafc">${esc(data.email)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Project Type</td><td style="padding:8px;background:#f8fafc">${esc(data.project_type ?? '—')}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Scale</td><td style="padding:8px;background:#f8fafc">${esc(data.scale ?? '—')}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Message</td><td style="padding:8px;background:#f8fafc;white-space:pre-wrap">${esc(data.message)}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;background:#f1f5f9">Submitted At</td><td style="padding:8px;background:#f8fafc">${esc(data.submittedAt)}</td></tr>
    </table>
  `;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
