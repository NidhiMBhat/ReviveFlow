import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function verifyRazorpayWebhook(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
  const signature = req.headers['x-razorpay-signature'] as string;

  if (!signature) {
    // If testing locally via testTrigger.ts without headers, you can allow a bypass or check
    if (process.env.NODE_ENV === 'development' && !req.headers['x-razorpay-signature']) {
      return next();
    }
    return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
  }

  try {
    const shasum = crypto.createHmac('sha256', secret);
    // Ensure raw body is captured or stringified payload matches
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.warn('⚠️ HMAC-SHA256 Signature Mismatch! Webhook rejected.');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    next();
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return res.status(500).json({ error: 'Webhook signature verification failed' });
  }
}