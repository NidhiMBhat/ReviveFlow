'use client';

import React, { useState } from 'react';
import axios from 'axios';

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
  timestamp: string;
}

interface RecoveryDrawerProps {
  log: AuditLog | null;
  onClose: () => void;
}

export default function RecoveryDrawer({ log, onClose }: RecoveryDrawerProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  if (!log) return null;

  const handleManualRetry = async () => {
    setIsRetrying(true);
    try {
      await axios.post(`${API_URL}/api/admin/override-recovery`, {
        subscriptionId: log.subscriptionId,
        forcedAction: 'MANUAL_RETRY_DISPATCH'
      });
      alert('🚀 Recovery message re-sent successfully to the customer!');
    } catch (error) {
      console.error('Manual retry failed:', error);
      alert('Failed to re-send message.');
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 p-6 text-slate-100 shadow-2xl overflow-y-auto flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Payment Recovery Status</span>
              <h2 className="text-xl font-bold text-white mt-1">Transaction ID: {log.subscriptionId}</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium transition"
            >
              Close ✕
            </button>
          </div>

          {/* Core Business Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Chances of Recovery</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{(log.aiConfidence * 100).toFixed(0)}%</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400">Stuck Amount at Risk</span>
              <p className="text-2xl font-bold text-white mt-1">₹{log.revenueRecovered?.toLocaleString()}</p>
            </div>
          </div>
              <div className="bg-blue-950/30 p-4 rounded-xl border border-blue-900/50 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-2 flex items-center gap-2">
              <span>🧠</span> AI Merchant Advisory 
            </h3>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              {log.complianceNote || 'No advisory generated.'}
            </p>
          </div>
          
          

          {/* Customer Recovery Progress Timeline */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 mb-6">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">Customer Recovery Progress</h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
              
              <div className="flex items-start gap-3 relative">
                <span className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs flex items-center justify-center font-bold z-10">✓</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Payment Failed</p>
                  <p className="text-xs text-slate-400">Transaction dropped or declined at checkout.</p>
                </div>
              </div>

              {/* 👉 UPDATED: Customer Email Node */}
              <div className="flex items-start gap-3 relative">
                <span className="h-6 w-6 rounded-full bg-blue-500/20 border border-blue-500 text-blue-400 text-xs flex items-center justify-center font-bold z-10 animate-pulse">✉️</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">AI Recovery Email Sent to Customer</p>
                  <p className="text-xs text-slate-300 mt-1 bg-slate-900 p-3 rounded-lg border border-slate-800 leading-relaxed italic">
                    "{log.outreachMessage || 'Personalized nudge sent via Email with a secure one-click retry link.'}"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs flex items-center justify-center font-bold z-10">✓</span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Current Status</p>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">
                    Active Recovery In Progress — Waiting for customer to click and pay.
                  </p>
                </div>
              </div>
                
            </div>
          </div>

          {/* Clean Summary Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Summary Details</h3>
            <div className="flex justify-between text-sm py-1 border-b border-slate-900">
              <span className="text-slate-400">Outreach Channel</span>
              <span className="text-blue-400 font-medium">Email</span>
            </div>
            <div className="flex justify-between text-sm py-1 border-b border-slate-900">
              <span className="text-slate-400">Approval Status</span>
              <span className="text-emerald-400 font-medium">Approved & Sent</span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-400">Failure Time</span>
              <span className="text-slate-300">{new Date(log.timestamp).toLocaleString()}</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-4 flex gap-3">
          <button 
            onClick={handleManualRetry}
            disabled={isRetrying}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-medium text-sm transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isRetrying ? 'Re-sending...' : 'Re-send Recovery Message'}
          </button>
          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xl font-medium text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}