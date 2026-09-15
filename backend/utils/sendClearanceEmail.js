import dotenv from 'dotenv';
import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// ─── Get __dirname first ────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Load .env from the parent folder (backend/) ───────────────────
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ─── FIX DNS FOR RESEND API ──────────────────────────────────────
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1', '208.67.222.222']);

// ─── Initialise Resend ──────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Email details ──────────────────────────────────────────────────
const FROM_EMAIL = 'The Cargo Grid <noreply@thecargogrid.com>';
const TO_EMAIL = 'sorochijoshua22@gmail.com';
const SHIPMENT_REFERENCE = 'TCG-CLR-2026-001'; // change as needed

// ─── PDF filename ────────────────────────────────────────────────────
const PDF_FILENAME = 'Clearance Invoice _ The Cargo Grid.pdf';
const PDF_PATH = path.join(__dirname, PDF_FILENAME);

async function sendClearanceEmail() {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('❌ RESEND_API_KEY not found in .env file!');
      return;
    }
    console.log('✅ Resend API key loaded');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; color: #333;">
        <p><strong>Dear Eluisa,</strong></p>
        <p><strong>Shipment Clearance Notification</strong></p>
        <p>
          This is to inform you that your shipment is currently undergoing the required 
          Import License/Permit and Port/Terminal Clearance procedures.
        </p>
        <p>
          The Import License/Permit Clearance is required for the shipment to receive 
          approval for importation. Following this, the cargo will be processed through 
          the relevant port/terminal, including the settlement of applicable terminal 
          handling and processing charges, before it can proceed to final release and delivery.
        </p>
        <p><strong>Clearance Fee Breakdown:</strong></p>
        <ul>
          <li>Import License/Permit Clearance: USD (United State Dollars) $1,800</li>
          <li>Port/Terminal Clearance: USD (United State Dollars) $3,700</li>
        </ul>
        <p><strong>Total Clearance Fee:</strong> USD (United States Dollars) $5,500</p>
        <p><strong>Shipment Reference:</strong> ${SHIPMENT_REFERENCE || 'Not provided'}</p>
        <p>
          We are actively monitoring the clearance process and will provide further updates 
          as the shipment progresses toward release.
        </p>
        <p>Thank you for your prompt attention and cooperation.</p>
        <p>Best regards,<br><strong>The Cargo Grid Team</strong></p>
      </div>
    `;

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

    console.log('📤 Sending clearance email...');

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: TO_EMAIL,
      subject: `Shipment Clearance Notification (${SHIPMENT_REFERENCE || 'No Ref'})`,
      html: htmlContent,
      attachments: attachment ? [attachment] : [],
    });

    if (error) {
      console.error('❌ Error sending email:', error);
      return;
    }

    console.log('✅ Clearance email sent successfully!');
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

sendClearanceEmail();