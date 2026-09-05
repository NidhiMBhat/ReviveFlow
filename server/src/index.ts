

import express, { Request, Response } from 'express'; // 👈 Added Response import
import cors from 'cors';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { handleWebhook } from './controllers/webhookController';
import { verifyRazorpayWebhook } from './middlewares/verifyWebhook';
import { prisma } from './db';
import { requireRole, AuthenticatedRequest } from './middlewares/authMiddleware';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5000;
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

app.use(cors({
  origin: '*', // The safest/fastest setting for a buildathon to avoid blocked requests
  credentials: true
}));
app.use(express.json());

// Secure Webhook Route with HMAC-SHA256 Middleware
app.post('/api/webhooks/razorpay', verifyRazorpayWebhook, handleWebhook);

// Audit Logs Route (Filtered by Merchant ID if provided)
app.get('/api/audit-logs', async (req, res) => {
  try {
    const { merchantId } = req.query;
    const logs = await prisma.auditLog.findMany({
      where: merchantId ? { merchantId: String(merchantId) } : undefined,
      orderBy: { timestamp: 'desc' },
      take: 20,
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Merchant Signup Route
app.post('/api/merchants/signup', async (req, res) => {
  try {
    const { name, email, webhookSecret, razorpayKeyId } = req.body;
    
    const existing = await prisma.merchant.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Merchant with this email already exists.' });
    }

    const merchant = await prisma.merchant.create({
      data: { name, email, webhookSecret, razorpayKeyId }
    });

    return res.status(201).json({ status: 'success', merchant });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Merchant Login Route
app.post('/api/merchants/login', async (req, res) => {
  try {
    const { email } = req.body;
    const merchant = await prisma.merchant.findUnique({ where: { email } });
    if (!merchant) return res.status(404).json({ error: 'Merchant account not found. Please sign up first.' });

    return res.json({ status: 'success', merchant }); // 👈 Fixed missing 'res'
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Test order creation route for frontend checkout
app.post('/api/create-order', async (req, res) => {
  try {
    const amount = Number(req.body?.amount) || 300000;
    const merchantId = req.body?.merchantId;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        error: 'Razorpay credentials are not configured on the backend.'
      });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { merchantId: merchantId || 'default' }
    });

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Failed to create Razorpay order:', error);
    return res.status(400).json({
      error: error?.message || 'Razorpay order creation failed.'
    });
  }
});

app.post('/api/admin/override-recovery', requireRole(['ADMIN', 'FINANCE_AGENT']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { subscriptionId, forcedAction } = req.body;
    console.log(`🛡️ RBAC Authorized: User role [${req.user?.role}] forced action ${forcedAction} for ${subscriptionId}`);
    
    return res.json({ success: true, message: `Manual override executed by ${req.user?.role}` });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ReviveFlow enterprise backend server running on port ${PORT}`);
});
