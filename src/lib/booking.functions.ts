import { createServerFn } from '@tanstack/react-start';

export type BookingEmailPayload = {
  bookingCode: string;
  customerName: string;
  phone: string;
  email?: string | null;
  serviceName: string;
  date: string;
  time: string;
  notes?: string;
};

export const notifyBooking = createServerFn({ method: 'POST' })
  .inputValidator((payload: BookingEmailPayload) => payload)
  .handler(async ({ data }) => {
    const apiKey = process.env['RESEND_API_KEY'];
    const to = process.env['KAARAS_NOTIFICATION_EMAIL'];
    const from = process.env['KAARAS_FROM_EMAIL'] || 'Kaaras Website <onboarding@resend.dev>';
    if (!apiKey || !to) return { sent: false, configured: false };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New Kaaras booking ${data.bookingCode} — ${data.serviceName}`,
        html: `<h2>New Kaaras booking</h2><p><b>Booking:</b> ${escapeHtml(data.bookingCode)}</p><p><b>Customer:</b> ${escapeHtml(data.customerName)}</p><p><b>Phone:</b> ${escapeHtml(data.phone)}</p><p><b>Service:</b> ${escapeHtml(data.serviceName)}</p><p><b>Date:</b> ${escapeHtml(data.date)}</p><p><b>Time:</b> ${escapeHtml(data.time)}</p><p><b>Notes:</b> ${escapeHtml(data.notes || '—')}</p>`,
      }),
    });
    if (!response.ok) return { sent: false, configured: true, error: await response.text() };
    return { sent: true, configured: true };
  });

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] || char);
}
