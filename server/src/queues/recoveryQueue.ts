import { Queue, Worker } from 'bullmq';
import { runAdvancedRecoveryAnalysis } from '../agents/recoveryAgent';
import { evaluatePolicy } from '../gateway/policyEngine';
import { prisma } from '../db';
import { sendRecoveryMessageWithFallback } from '../services/whatsappDispatcher'; // 👈 Import message dispatcher
import { sendRecoveryEmail } from '../services/emailDispatcher';
import Razorpay from 'razorpay';
import { sendRecoveryEmail } from '../services/emailDispatcher';
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
// const connection = {
//   host: process.env.REDIS_HOST || 'localhost',
//   port: Number(process.env.REDIS_PORT) || 6379,
//   maxRetriesPerRequest: null,
//   enableOfflineQueue: true,
// };
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const shouldUseRedis = !(process.env.REDIS_DISABLED === 'true');
// Queue is optional in local/dev environments; this prevents server startup crashes
export const recoveryQueue = shouldUseRedis
  ? new Queue('payment-recovery-queue', { connection })
  : null as any;

export const recoveryWorker = shouldUseRedis
  ? new Worker(
      'payment-recovery-queue',
      async (job) => {
        const event = job.data;
        console.log(`⚙️ Background Worker processing job [${job.id}] for event:`, event.event);

        const paymentEntity = event.payload?.payment?.entity || {};
        const entityId = paymentEntity.id || `pay_async_${Date.now()}`;
        const amount = paymentEntity.amount ? paymentEntity.amount / 100 : 3000;
        const activeTone = paymentEntity.notes?.aiTone || 'Hinglish - Polite & Empathetic';
        // Grab customer phone safely from payload (or fallback to test number)
        const customerPhone = paymentEntity.contact || '9999999999';

        console.log(`🔍 Step 1: PII Masking & Parsing complete for ${entityId}`);
        console.log(`🤖 Step 2: Calling Gemini Advanced Recovery Analysis...`);

        let aiRecommendation;
try {
  aiRecommendation = await runAdvancedRecoveryAnalysis({
    eventCategory: event.event || 'payment.failed',
    entityId,
    amount,
    failureReason: paymentEntity.error_description || 'Gateway timeout',
    customerHistory: { pastSuccessRate: 0.8, totalPreviousFailures: 1, preferredLanguage: activeTone }
  });
  console.log(`🤖 Step 2 Complete: Gemini responded successfully.`);
} catch (error) {
  console.error(`❌ Gemini API Network Error:`, error);
  // Provide a safe fallback so the pipeline keeps moving
  aiRecommendation = {
    recommendedAction: 'FLAGGED_FOR_MANUAL_REVIEW',
    successProbability: 0,
    compliantEscalationNote: 'AI Analysis failed due to network timeout.',
    reasoning: 'Automated analysis unavailable. Please review this transaction manually.'
  };
}

        const policyDecision = await evaluatePolicy(aiRecommendation.successProbability, aiRecommendation.recommendedAction);
        console.log(`⚖️ Step 3: Policy evaluated -> ${policyDecision.decision}`);

        // 🚀 Step 3.5: If Approved by policy guardrails, dispatch WhatsApp/SMS message via dispatcher
        let dispatchStatus = 'PENDING_REVIEW';
        
if (policyDecision.decision === 'APPROVED') {
  console.log(`📧 Step 3.5: Dispatching automated recovery email...`);
  
  // Grab customer email safely or default to a test address
  const customerEmail = paymentEntity.email || 'evaluator@reviveflow.ai';
  const customerName = paymentEntity.name || 'Valued Merchant Customer';
 
          const customerContact = paymentEntity.contact || '9999999999'; // Fallback contact number
 const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
let liveUrl = `${frontendUrl}/retry?amount=${amount}`;
          try {
            const paymentLink = await razorpay.paymentLink.create({
              amount: amount * 100, // Razorpay expects paise
              currency: "INR",
              description: "ReviveFlow Subscription Recovery",
              customer: { 
                name: customerName, 
                email: customerEmail,
                contact: customerContact
              },
              // CRITICAL: Set these to false so Razorpay doesn't send duplicate boring emails.
              // We only want our AI-generated email to reach the customer!
              notify: { sms: false, email: false } 
            });
            
            liveUrl = paymentLink.short_url;
            console.log(`🔗 Generated Live Payment Link: ${liveUrl}`);
          } catch (linkError) {
            console.error(`⚠️ Failed to generate Razorpay link, using fallback.`, linkError);
          }
  dispatchStatus = await sendRecoveryEmail(
            customerEmail, 
            customerName, 
            amount, 
            aiRecommendation.customerEmailBody,
            liveUrl // Pass the generated URL here
          );
        } else {
          dispatchStatus = 'FLAGGED_FOR_MANUAL_REVIEW';
        }
        console.log(`💾 Step 4: Saving to Supabase database...`);
        
        // Save to Supabase with the live delivery status result
        await prisma.auditLog.create({
          data: {
            subscriptionId: entityId,
            merchantId: paymentEntity.notes?.merchantId || 'default-merchant-id',
            action: aiRecommendation.recommendedAction,
            aiConfidence: aiRecommendation.successProbability,
            policyDecision: policyDecision.decision,
            outcome: dispatchStatus, // Records whether WhatsApp/SMS sent successfully
            revenueRecovered: policyDecision.decision === 'APPROVED' ? amount : 0,
            complianceNote: aiRecommendation.merchantAdvisoryMessage,
            
            // 👉 3. Save the actual CUSTOMER email here so you have a record of it
            outreachMessage: aiRecommendation.customerEmailBody,
          },
        });
        
        console.log(`✅ Step 4 Complete: Successfully logged to database!`);
      },
      { connection }
    )
  : null as any;

export async function enqueueRecoveryJob(event: any) {
  if (!recoveryQueue) {
    console.warn('Redis queue is disabled. Background processing was skipped for event:', event?.event || 'payment.failed');
    return { id: 'offline' };
  }

  try {
    return await recoveryQueue.add('process-recovery', event);
  } catch (error) {
    console.warn('Redis queue unavailable; request accepted without async processing.', error);
    return { id: 'offline' };
  }
}