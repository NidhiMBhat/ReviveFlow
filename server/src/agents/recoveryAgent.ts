import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function runAdvancedRecoveryAnalysis(payload: {
  eventCategory?: string;
  entityId: string;
  amount: number;
  failureReason?: string;
  customerHistory?: {
    pastSuccessRate?: number;
    totalPreviousFailures?: number;
    preferredLanguage?: string;
  };
}) {
  const successRate = payload?.customerHistory?.pastSuccessRate ?? 0.8;
  const prevFailures = payload?.customerHistory?.totalPreviousFailures ?? 1;
  const lang = payload?.customerHistory?.preferredLanguage ?? "Hinglish";
  const reason = payload?.failureReason ?? "Insufficient funds or gateway timeout";

  try {
    const prompt = `
      You are the Multi-Agent Revenue Recovery Brain for an Indian enterprise platform "ReviveFlow". 
      A payment just failed. Analyze this revenue-at-risk event and generate two distinct messages:
      1. A customer-facing outreach message (polite, conversational, written directly to the customer in ${lang}).
      2. A merchant-facing dashboard advisory note (written directly to the merchant/operations team explaining the failure analysis and risk).

      Event Data:
      - Category: ${payload?.eventCategory || "SUBSCRIPTION_FAILURE"}
      - ID: ${payload.entityId}
      - Amount: ₹${payload.amount}
      - Failure Reason: ${reason}
      - Customer History: Success Rate ${successRate * 100}%, Previous Failures: ${prevFailures}

      Return a JSON object with:
      - intentPersona: "HIGH_INTENT", "MEDIUM_INTENT", or "LOW_RECOVERY_PROBABILITY"
      - successProbability: float between 0.0 and 1.0
      - recommendedAction: "EMAIL_HINGLISH_NUDGE", "EMAIL_URGENT_WARNING", "SILENT_RETRY", or "PROMISE_TO_PAY_TRACKER"
      - recommendedWindow: timeframe string for intervention
      - compliantEscalationNote: text stating compliance guardrails applied
      - internalReasoning: Internal backend logic
      - customerEmailBody: The email sent to the customer (e.g. "Namaste! Aapka ₹${payload.amount} ka payment fail ho gaya hai..."). Keep it 2-3 sentences.
      - merchantAdvisoryMessage: The operational note shown to the merchant on their dashboard (e.g. "Transaction of ₹${payload.amount} failed due to gateway timeout. Recommended automated UPI retry link queued."). Keep it 2-3 professional sentences.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intentPersona: { type: Type.STRING },
            successProbability: { type: Type.NUMBER },
            recommendedAction: { type: Type.STRING },
            recommendedWindow: { type: Type.STRING },
            compliantEscalationNote: { type: Type.STRING },
            internalReasoning: { type: Type.STRING },
            customerEmailBody: { type: Type.STRING },
            merchantAdvisoryMessage: { type: Type.STRING },
          },
          required: [
            "intentPersona",
            "successProbability",
            "recommendedAction",
            "recommendedWindow",
            "compliantEscalationNote",
            "internalReasoning",
            "customerEmailBody",
            "merchantAdvisoryMessage",
          ],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error in advanced recovery agent:", error);
    throw error;
  }
}