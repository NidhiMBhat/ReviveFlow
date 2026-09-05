import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRecoveryEmail(
  customerEmail: string,
  customerName: string,
  amount: number,
  aiReasoning: string,
  paymentUrl: string
): Promise<string> {
  
  const cleanEmail = 'nidhimbhat.21@gmail.com'; 
  console.log(`📧 Dispatching live recovery email to: ${cleanEmail}`);

  try {
    const { data, error } = await resend.emails.send({
      from: 'ReviveFlow <onboarding@resend.dev>', 
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
    });

    if (error) {
      console.error(`❌ Resend API Error:`, error.message);
      return 'EMAIL_FAILED';
    }

    console.log(`✅ Recovery email sent successfully via Resend API! ID: ${data?.id}`);
    return 'EMAIL_SENT';
  } catch (error: any) {
    console.error(`❌ Failed to execute email request:`, error.message);
    return 'EMAIL_FAILED';
  }
}