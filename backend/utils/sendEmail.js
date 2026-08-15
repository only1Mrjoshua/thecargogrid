import 'dotenv/config';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// ─── FIX DNS FOR RESEND API ──────────────────────────────────────
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1', '208.67.222.222']);

// ─── Get __dirname in ES modules ────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Initialise Resend ──────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Email details ──────────────────────────────────────────────────
// Display name now shows "The Cargo Grid" instead of "noreply"
const FROM_EMAIL = 'The Cargo Grid <noreply@thecargogrid.com>';
const TO_EMAIL = ['eluisatbean@gmail.com', 'eluisatbeanlive@mail.com'];
const TRACKING_ID = 'TCG-428831589476';

// ─── PDF filename ────────────────────────────────────────────────────
const PDF_FILENAME = 'International Shipping & Freight Forwarding _ The Cargo Grid - Global Logistics.pdf';
const PDF_PATH = path.join(__dirname, PDF_FILENAME);

async function sendShipmentEmail() {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in .env file!');
      return;
    }
    console.log('✅ Resend API key loaded');

    // ─── Prepare email content ──────────────────────────────────────
    // Increased font size, removed clickable link, added instruction
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; color: #333;">
        <p><strong>Dear Customer,</strong></p>

        <p>Thank you for choosing <strong>The Cargo Grid</strong>.</p>

        <p>Your shipment tracking ID is: <strong>${TRACKING_ID}</strong></p>

        <p>
          To track your package, please visit our website at 
          <strong>thecargogrid.com</strong> and enter your tracking ID.
        </p>

        <p><strong>Note:</strong> Your tracking ID is same as your tracking number</p>

        <p>Please find attached your receipt below.</p>

        <p>If you have any questions, feel free to contact support.</p>

        <p>Best regards,<br>
        <strong>The Cargo Grid Team</strong></p>
      </div>
    `;

    // ─── Read the PDF attachment ────────────────────────────────────
    let attachment = null;
    if (fs.existsSync(PDF_PATH)) {
      const fileBuffer = fs.readFileSync(PDF_PATH);
      attachment = {
        filename: PDF_FILENAME,
        content: fileBuffer.toString('base64'),
      };
      console.log(`📎 Attached: ${PDF_FILENAME}`);
    } else {
      console.warn(`⚠️ PDF not found at: ${PDF_PATH}`);
      console.warn('📧 Sending email without attachment.');
    }

    // ─── Send the email ──────────────────────────────────────────────
    console.log('📤 Sending email...');
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Your Shipment Tracking & Receipt (${TRACKING_ID})`,
      html: htmlContent,
      attachments: attachment ? [attachment] : [],
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', data?.id);
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    console.log('\n🔍 Debugging tips:');
    console.log('1. Check your internet connection');
    console.log('2. Try running: npx resend domains list');
    console.log('3. Verify your Resend API key is correct');
    console.log('4. Make sure thecargogrid.com is verified in Resend dashboard');
  }
}

sendShipmentEmail();