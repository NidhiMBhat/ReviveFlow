'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import WarRoomHeader from '@/components/WarRoomHeader';
import MetricsGrid from '@/components/MetricsGrid';
import AuditTable from '@/components/AuditTable';
import RecoveryDrawer from '@/components/RecoveryDrawer';
import PlaybookModal from '@/components/PlaybookModal';
import AuthView from '@/components/AuthView';

interface AuditLog {
  id: string;
  subscriptionId: string;
  action: string;
  aiConfidence: number;
  policyDecision: string;
  outcome: string;
  revenueRecovered: number;
  complianceNote?: string;
  outreachMessage?: string;
  paymentLink?: string; // 👈 Added for real Razorpay short URL
  timestamp: string;
}

interface Merchant {
  id: string;
  name: string;
  email: string;
}

export default function WarRoomDashboard() {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const savedSession = localStorage.getItem('reviveflow_merchant_session');
    if (savedSession) {
      try {
        const { merchant: savedMerchant, expiresAt } = JSON.parse(savedSession);
        if (new Date().getTime() < expiresAt) {
          setMerchant(savedMerchant);
        } else {
          localStorage.removeItem('reviveflow_merchant_session');
        }
      } catch (e) {
        localStorage.removeItem('reviveflow_merchant_session');
      }
    }
    setLoading(false);
  }, []);

  const loadLogs = async () => {
    if (!merchant) return;
    try {
      const response = await axios.get(`${API_URL}/api/audit-logs`);
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    }
  };

  useEffect(() => {
    if (merchant) {
      loadLogs();
      const interval = setInterval(loadLogs, 4000);
      return () => clearInterval(interval);
    }
  }, [merchant]);

  const handleLogout = () => {
    localStorage.removeItem('reviveflow_merchant_session');
    setMerchant(null);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const startTestCheckout = async (amountInRupees = 3000, aiTone = "default") => {
    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay SDK. Check your internet connection.");
        return;
      }

      const amountInPaise = amountInRupees * 100;
      const res = await axios.post(`${API_URL}/api/create-order`, { 
        amount: amountInPaise,
        merchantId: merchant?.id,
        notes: { aiTone }
      });
      const { orderId, amount, currency } = res.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: merchant?.name || "ReviveFlow Test",
        description: "Autonomous Recovery Pipeline Test",
        order_id: orderId,
        handler: async function (response: any) {
          setIsProcessingAI(true);
          
          // Inform backend payment is successful to register audit trail
          try {
            await axios.post(`${API_URL}/api/simulate-success`, {
              orderId,
              paymentId: response.razorpay_payment_id,
              merchantId: merchant?.id,
              amount: amountInRupees
            });
          } catch (err) {
            console.error("Failed to sync success state", err);
          }

          const pollInterval = setInterval(async () => {
            await loadLogs();
          }, 1500);

          setTimeout(() => {
            clearInterval(pollInterval);
            setIsProcessingAI(false);
          }, 6000);
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#3b82f6",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Ensure your Razorpay Test API Keys are configured properly.");
    }
  };

  if (!merchant) {
    return <AuthView onLoginSuccess={(loggedInMerchant) => setMerchant(loggedInMerchant)} />;
  }

  const totalRecovered = logs.reduce((acc, log) => acc + (log.revenueRecovered || 0), 0);
  const successCount = logs.filter(l => l.policyDecision === 'APPROVED').length;
  const successRate = logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans relative">
      
      {isProcessingAI && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-950/90 border border-blue-500/50 text-blue-200 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-bounce">
          <span className="h-3 w-3 rounded-full bg-blue-400 animate-ping"></span>
          <div>
            <p className="text-sm font-bold text-white">Gemini Multi-Agent Pipeline Active</p>
            <p className="text-xs text-blue-300">Analyzing failure persona, evaluating safety policy & queuing merchant advisory...</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 text-xs text-slate-400 border-b border-slate-900 pb-3">
        <span>Logged in Organization: <strong className="text-blue-400">{merchant.name}</strong> ({merchant.email})</span>
        <button 
          onClick={handleLogout} 
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition"
        >
          Sign Out ↗
        </button>
      </div>

      <WarRoomHeader 
        onStartCheckout={startTestCheckout} 
        onRefresh={loadLogs} 
        onOpenPlaybook={() => setIsPlaybookOpen(true)}
        loading={loading} 
      />

      <MetricsGrid 
        totalRecovered={totalRecovered} 
        successRate={successRate} 
        totalLogs={logs.length} 
      />

      <AuditTable logs={logs} onRowClick={(log) => setSelectedLog(log)} />

      <RecoveryDrawer log={selectedLog} onClose={() => setSelectedLog(null)} />
      
      <PlaybookModal 
        isOpen={isPlaybookOpen} 
        onClose={() => setIsPlaybookOpen(false)} 
      />
    </main>
  );
}