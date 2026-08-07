import { Resend } from 'resend';

let resendInstance = null;

// Lazy init – only create Resend if key exists
const getResend = () => {
  if (resendInstance) return resendInstance;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY is missing. Email sending will be disabled.');
    return null;
  }
  resendInstance = new Resend(apiKey);
  return resendInstance;
};

export const sendEmail = async ({ to, subject, html, from = 'notifications@thecargogrid.com' }) => {
  const resend = getResend();
  if (!resend) {
    console.warn('⚠️ Email not sent – missing RESEND_API_KEY.');
    return { success: false, error: 'Missing API key' };
  }

  try {
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};