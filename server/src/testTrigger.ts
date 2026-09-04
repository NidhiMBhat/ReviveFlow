import crypto from 'crypto';

async function triggerTestWebhook() {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "nidhi_super_secret_buildathon_key_2026";

  // Simulate a realistic Razorpay payment.failed event payload
  const payload = {
    event: "payment.failed",
    payload: {
      payment: {
        entity: {
          id: "pay_test_" + Math.floor(Math.random() * 1000000),
          amount: 300000, // ₹3,000.00 in paisa
          currency: "INR",
          status: "failed",
          description: "Test subscription renewal failure"
        }
      }
    }
  };

  const bodyString = JSON.stringify(payload);

  // Generate a valid HMAC-SHA256 signature just like Razorpay does
  const signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(bodyString)
    .digest('hex');

  console.log("🚀 Sending simulated Razorpay webhook to local server...");

  try {
    const response = await fetch('http://localhost:5000/api/webhooks/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      body: bodyString
    });

    const data = await response.json();
    console.log("📥 Server Response:", data);
  } catch (error) {
    console.error("❌ Failed to reach local server. Is it running?", error);
  }
}

triggerTestWebhook();