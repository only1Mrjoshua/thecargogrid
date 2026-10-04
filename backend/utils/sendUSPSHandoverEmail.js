import 'dotenv/config';
import { Resend } from 'resend';
import dns from 'dns';

// ─── FIX DNS FOR RESEND API ──────────────────────────────────────
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1', '208.67.222.222']);

// ─── Initialise Resend ──────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Email Configuration ────────────────────────────────────────────
const FROM_EMAIL = 'The Cargo Grid <noreply@thecargogrid.com>';
const TO_EMAIL = ['Dorothyguillott@yahoo.com'];
const TRACKING_ID = 'TCG-974864982129';
const WHATSAPP_NUMBER = '+44 7473954435';
const WHATSAPP_LINK = 'https://wa.me/447473954435';
const HEADER_IMAGE_URL = 'https://thecargogrid.com/header.png';

async function sendUSPSHandoverEmail() {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in .env file!');
      return;
    }
    console.log('✅ Resend API key loaded');

    // ─── Prepare professional email content ─────────────────────────
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { text-align: center; background-color: #0f172a; }
          .header img { width: 100%; max-width: 600px; height: auto; display: block; border: 0; }
          .content { padding: 30px; color: #334155; line-height: 1.6; font-size: 16px; }
          .highlight-box { background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
          .tracking-id { font-family: monospace; font-size: 18px; font-weight: bold; color: #0f172a; background-color: #e2e8f0; padding: 5px 10px; border-radius: 4px; }
          .btn { display: inline-block; background-color: #25D366; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 10px; text-align: center; }
          .btn:hover { background-color: #1ebe5d; }
          .footer { background-color: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; }
          .status-badge { display: inline-block; background-color: #ecfdf5; color: #047857; padding: 4px 10px; border-radius: 20px; font-size: 14px; font-weight: 600; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${HEADER_IMAGE_URL}" alt="The Cargo Grid" />
          </div>
          <div class="content">
            <p>Dear Dorothy Guillott,</p>
            
            <p>We are pleased to inform you that your package from Mr. Ramos H. Adrian has cleared all international customs. It has now been handed over to your local courier, USPS, who will complete the final delivery to your location.</strong>.</p>
            
            <div class="highlight-box">
              <span class="status-badge">Handed over to USPS</span>
              <p style="margin: 0;">Tracking ID: <span class="tracking-id">${TRACKING_ID}</span></p>
            </div>

            <p>Should you have any questions regarding the delivery or need assistance, our support team is available to help via WhatsApp.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${WHATSAPP_LINK}" class="btn">Chat with Support on WhatsApp</a>
              <p style="font-size: 14px; color: #64748b; margin-top: 10px;">Or message us directly at ${WHATSAPP_NUMBER}</p>
            </div>

            <p>Thank you for choosing The Cargo Grid.</p>

            <p>Best regards,<br>
            <strong>The Cargo Grid Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} The Cargo Grid. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // ─── Send the email ──────────────────────────────────────────────
    console.log('📤 Sending USPS handover email...');
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Final Delivery Update: ${TRACKING_ID} Handed Over to USPS`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', data?.id);
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

sendUSPSHandoverEmail();