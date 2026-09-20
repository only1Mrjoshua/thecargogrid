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
const SENDER_NAME = 'Mr. Ramos H Adrian';
const WHATSAPP_NUMBER = '+44 7473954435';
const WHATSAPP_LINK = 'https://wa.me/447473954435';

// ─── Header Image URL ───────────────────────────────────────────────
// Make sure header.png is in your frontend's public folder!
const HEADER_IMAGE_URL = 'https://thecargogrid.com/header.png'; 

async function sendRecipientConfirmationEmail() {
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
          
          /* UPDATED HEADER STYLES FOR IMAGE */
          .header { text-align: center; background-color: #0f172a; }
          .header img { width: 100%; max-width: 600px; height: auto; display: block; border: 0; }
          
          .content { padding: 30px; color: #334155; line-height: 1.6; font-size: 16px; }
          .highlight-box { background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .tracking-id { font-family: monospace; font-size: 18px; font-weight: bold; color: #0f172a; background-color: #e2e8f0; padding: 5px 10px; border-radius: 4px; }
          .btn { display: inline-block; background-color: #25D366; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin-top: 10px; text-align: center; }
          .btn:hover { background-color: #1ebe5d; }
          .footer { background-color: #f1f5f9; padding: 20px 30px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          
          <!-- HEADER IMAGE REPLACED HERE -->
          <div class="header">
            <img src="${HEADER_IMAGE_URL}" alt="The Cargo Grid" />
          </div>

          <div class="content">
            <p>Dear Dorothy Guillott,</p>
            
            <p>We are writing to inform you that a package from <strong>${SENDER_NAME}</strong> is currently being processed for shipment to your location in <strong>Louisiana, USA</strong>.</p>
            
            <div class="highlight-box">
              <p style="margin: 0;">Tracking ID: <span class="tracking-id">${TRACKING_ID}</span></p>
            </div>

            <p>To ensure the secure and accurate delivery of this package, we require you to complete the following two steps:</p>
            
            <ol>
              <li><strong>Confirm Recipient:</strong> Please reply directly to this email to confirm that you are the intended recipient at this address. This step is mandatory to proceed with the delivery.</li>
              <li><strong>Open Communication:</strong> For faster communication, real-time updates, and expedited customs processing, we highly recommend contacting our support team via WhatsApp.</li>
            </ol>

            <p>You can start a chat with our logistics team immediately by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${WHATSAPP_LINK}" class="btn">Chat with Support on WhatsApp</a>
              <p style="font-size: 14px; color: #64748b; margin-top: 10px;">Or message us directly at ${WHATSAPP_NUMBER}</p>
            </div>

            <p>Thank you for your prompt attention to this matter.</p>

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
    console.log('📤 Sending confirmation request email...');
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Action Required: Confirm Shipment from ${SENDER_NAME} (${TRACKING_ID})`,
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

sendRecipientConfirmationEmail();