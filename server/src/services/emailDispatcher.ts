import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();
dns.setDefaultResultOrder('ipv4first');
// Configure transporter (Using Gmail or a free SMTP test service like Ethereal/Mailtrap)
// For local testing, you can use a standard Gmail App Password or leave it to simulate cleanly.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Use host instead of service: 'gmail'
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

/**
 * Dispatches an AI-generated payment recovery email to the customer.
 * @param customerEmail - Recipient email address
 * @param customerName - Name of the customer
 * @param amount - Failed transaction amount in Rupees
 * @param aiReasoning - Gemini's generated strategy/message
 */
export async function sendRecoveryEmail(
  customerEmail: string,
  customerName: string,
  amount: number,
  aiReasoning: string,
  paymentUrl: string
): Promise<string> {
  const cleanEmail = customerEmail || 'judge@reviveflow.ai';
  console.log(`📧 Dispatching recovery email to: ${cleanEmail}`);

  // If email credentials are not configured, simulate success smoothly
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    console.log(`⚠️ [Simulated Email Mode] Email credentials not set in .env.`);
    console.log(`✉️ [Email Preview to ${cleanEmail}]:\nSubject: Action Required: Complete your ₹${amount} payment\nBody: ${aiReasoning}`);
    return 'EMAIL_SIMULATED_SUCCESS';
  }

  try {
    const mailOptions = {
      from: `"ReviveFlow Autonomous Recovery" <${process.env.EMAIL_USER}>`,
      to: cleanEmail,
      subject: `Action Required: Secure your ₹${amount.toLocaleString()} payment`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; border-radius: 12px;">
          <h2 style="color: #3b82f6; margin-top: 0;">ReviveFlow Autonomous Recovery</h2>
          <p>Hello <strong>${customerName || 'Valued Customer'}</strong>,</p>
          <p>We noticed your recent payment of <strong>₹${amount.toLocaleString()}</strong> didn't go through.</p>
          <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 16px 0;">
            <p style="margin: 0; color: #cbd5e1; font-size: 14px;"><em>"${aiReasoning}"</em></p>
          </div>
          <p>You can securely retry your payment instantly using the link below:</p>
          
          
          <a href="${paymentUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">Retry Payment Now ⚡</a>
          
          <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Secured by ReviveFlow DPDP-compliant encryption engine.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Recovery email sent successfully!`);
    return 'EMAIL_SENT';
  } catch (error: any) {
    console.error(`❌ Failed to send email:`, error.message);
    return 'EMAIL_FAILED';
  }
}

