import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client using environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
const authToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Default Twilio Sandbox number

const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Dispatches an automated recovery message via WhatsApp with an automatic SMS fallback.
 * @param customerPhone - Recipient phone number (e.g., "9876543210")
 * @param messageText - The AI-generated recovery strategy message
 */
export async function sendRecoveryMessageWithFallback(customerPhone: string, messageText: string): Promise<string> {
  // Format phone number to E.164 standard (defaulting to Indian +91 context if country code is missing)
  const cleanPhone = customerPhone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('91') && cleanPhone.length === 12 
    ? `+${cleanPhone}` 
    : `+91${cleanPhone.slice(-10)}`;

  console.log(`🚀 Dispatching recovery message to target: ${formattedPhone}`);

  // If Twilio credentials are not set yet, simulate success for local buildathon testing
  if (!twilioClient || !accountSid || accountSid === 'your_account_sid') {
    console.log(`⚠️ [Simulated Dispatch Mode] Twilio credentials not configured.`);
    console.log(`💬 [Simulated WhatsApp / SMS to ${formattedPhone}]:\n${messageText}`);
    return 'SIMULATED_DISPATCH_SUCCESS';
  }

  try {
    // Attempt 1: Send via WhatsApp Business API
    console.log(`💬 Attempting primary WhatsApp dispatch...`);
    await twilioClient.messages.create({
      from: twilioWhatsAppNumber,
      to: `whatsapp:${formattedPhone}`,
      body: messageText,
    });
    console.log(`✅ Recovery message successfully sent via WhatsApp!`);
    return 'WHATSAPP_SENT';

  } catch (whatsappError: any) {
    console.warn(`⚠️ WhatsApp delivery failed (${whatsappError.message || 'Not on WhatsApp'}). Falling back to standard SMS...`);

    try {
      // Attempt 2: Fallback to Standard SMS
      if (!twilioPhoneNumber) {
        throw new Error('TWILIO_PHONE_NUMBER is not set in environment variables for SMS fallback.');
      }

      await twilioClient.messages.create({
        from: twilioPhoneNumber,
        to: formattedPhone,
        body: messageText,
      });
      console.log(`✅ Recovery message successfully sent via SMS Fallback!`);
      return 'SMS_FALLBACK_SENT';

    } catch (smsError: any) {
      console.error(`❌ Both WhatsApp and SMS delivery failed:`, smsError.message);
      return 'DELIVERY_FAILED';
    }
  }
}