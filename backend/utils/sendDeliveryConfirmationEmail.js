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
const HEADER_IMAGE_URL = 'https://thecargogrid.com/header.png';

async function sendStyledDeliveryEmail() {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in .env file!');
      return;
    }
    console.log('✅ Resend API key loaded');

    // ─── Prepare styled email content with a single sentence body ────
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
          .content { padding: 40px 30px; color: #334155; line-height: 1.6; font-size: 16px; }
          .footer { background-color: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${HEADER_IMAGE_URL}" alt="The Cargo Grid" />
          </div>
          <div class="content">
            <p>Dear Dorothy Guillott,</p>
            
            <p>We received an update from USPS that your package (Tracking ID: ${TRACKING_ID}) has been delivered to your location in Louisiana, please reply to this email to confirm you have received it.</p>

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
    console.log('📤 Sending styled delivery confirmation email...');
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Delivery Confirmation: ${TRACKING_ID}`,
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

sendStyledDeliveryEmail();