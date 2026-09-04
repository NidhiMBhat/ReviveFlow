import { Request, Response } from 'express';
import { enqueueRecoveryJob } from '../queues/recoveryQueue';

export async function handleWebhook(req: Request, res: Response) {
  try {
    const event = req.body;
    console.log(`⚡ Instant Webhook Received: [ ${event.event || 'payment.failed'} ]`);

    await enqueueRecoveryJob(event);

    return res.status(200).json({ 
      status: 'success', 
      message: 'Webhook accepted and processed.' 
    });
  } catch (error: any) {
    console.error('❌ Error queueing webhook:', error);
    return res.status(500).json({ error: error.message });
  }
}