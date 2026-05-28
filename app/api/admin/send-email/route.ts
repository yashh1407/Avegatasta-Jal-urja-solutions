import { NextResponse, NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  const { error } = await requireAdminSession();
  if (error) return error;

  try {
    const body = await request.json();

    const { to, subject, htmlBody, textBody } = body;

    if (!to || !subject || !htmlBody || !textBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, htmlBody, textBody' },
        { status: 400 }
      );
    }

    const success = await sendEmail({
      to,
      templateSlug: 'contact-auto-reply', // Dummy slug, we're providing custom content
      variables: {},
      subject,
      htmlBody,
      textBody,
    });

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email. Check SMTP configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });
  } catch (err: any) {
    console.error('Error sending email:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
