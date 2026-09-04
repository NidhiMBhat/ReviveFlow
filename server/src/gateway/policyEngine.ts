import { prisma } from "../db";


export async function evaluatePolicy(
  subscriptionId: string, 
  amount: number, 
  aiRecommendation: string
) {
  // Fetch active policy rules from the database (or defaults)
  let policy = await prisma.policyRule.findFirst();
  
  if (!policy) {
    policy = {
      id: "default",
      maxAutoRecoveryAmount: 5000,
      maxRetryAttempts: 2,
      requireApprovalHighRisk: true,
      autonomyMode: "AUTONOMOUS"
    };
  }

  // Check 1: Kill switch / Autonomy Mode check
  if (policy.autonomyMode === "OBSERVE_ONLY") {
    return { decision: "BLOCKED", reason: "Autonomy mode is set to Observe Only." };
  }

  // Check 2: Max Auto-Recovery Amount boundary check
  if (amount > policy.maxAutoRecoveryAmount) {
    return { 
      decision: "BLOCKED", 
      reason: `Amount (₹${amount}) exceeds maximum autonomous recovery limit of ₹${policy.maxAutoRecoveryAmount}. Routed to Human Approval Queue.` 
    };
  }

  // Check 3: If AI says halt
  if (aiRecommendation === "HALT_AND_ESCALATE") {
    return { decision: "BLOCKED", reason: "AI agent recommended escalation due to high risk." };
  }

  return { decision: "APPROVED", reason: "Passed all deterministic safety and policy checks." };
}