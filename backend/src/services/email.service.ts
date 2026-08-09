import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../middleware/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

/** Escape HTML special characters to prevent XSS in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const sendContactNotification = async (data: ContactEmailData): Promise<void> => {
  await transporter.sendMail({
    from: `"ViviDev.id Website" <${env.SMTP_USER}>`,
    to: env.CONTACT_EMAIL_TO,
    replyTo: data.email,
    subject: `[Contact Form] ${escapeHtml(data.subject)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Pesan Baru dari Website ViviDev.id</h2>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 120px;">Nama</td>
            <td style="padding: 8px;">${escapeHtml(data.name)}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding: 8px; font-weight: bold;">Email</td>
            <td style="padding: 8px;">${escapeHtml(data.email)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Telepon</td>
            <td style="padding: 8px;">${escapeHtml(data.phone || '-')}</td>
          </tr>
          <tr style="background:#f9fafb;">
            <td style="padding: 8px; font-weight: bold;">Subjek</td>
            <td style="padding: 8px;">${escapeHtml(data.subject)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; vertical-align: top;">Pesan</td>
            <td style="padding: 8px; white-space: pre-wrap;">${escapeHtml(data.message)}</td>
          </tr>
        </table>
        <hr style="margin-top: 24px;"/>
        <p style="color: #6b7280; font-size: 12px;">Email ini dikirim otomatis dari form kontak vividev.id</p>
      </div>
    `,
  });
  logger.info(`Contact email sent from ${data.email}`);
};

export const sendContactAutoReply = async (data: ContactEmailData): Promise<void> => {
  await transporter.sendMail({
    from: `"ViviDev.id" <${env.SMTP_USER}>`,
    to: data.email,
    subject: `Terima kasih telah menghubungi ViviDev.id`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Halo ${escapeHtml(data.name)},</h2>
        <p>Terima kasih telah menghubungi ViviDev.id. Kami telah menerima pesan Anda dan akan segera merespons dalam 1x24 jam kerja.</p>
        <p><strong>Ringkasan pesan Anda:</strong><br/>${escapeHtml(data.message)}</p>
        <hr/>
        <p>Salam,<br/><strong>Tim ViviDev.id</strong><br/>
        <a href="https://vividev.id">vividev.id</a> | 
        <a href="https://wa.me/6285798112370">WhatsApp</a></p>
      </div>
    `,
  });
};
