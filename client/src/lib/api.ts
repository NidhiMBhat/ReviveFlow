import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AuditLog {
  id: string;
  subscriptionId: string;
  action: string;
  aiConfidence: number;
  policyDecision: string;
  outcome: string;
  revenueRecovered: number;
  timestamp: string;
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const response = await axios.get(`${API_URL}/api/audit-logs`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    return [];
  }
}