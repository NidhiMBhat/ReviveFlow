'use client';

import React from 'react';

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

interface AuditTableProps {
  logs: AuditLog[];
  onRowClick?: (log: AuditLog) => void; // 👈 Added onRowClick handler prop
}

export default function AuditTable({ logs, onRowClick }: AuditTableProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
      <h2 className="text-xl font-bold mb-4 text-slate-200">Immutable Audit Ledger & Compliance Traces</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">ID / Vector</th>
              <th className="py-3 px-4">Agent Action</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Policy Decision</th>
              <th className="py-3 px-4 text-right">Recovered Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">
                  No recovery events logged yet. Trigger a test checkout or webhook!
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => onRowClick && onRowClick(log)} // 👈 Triggers drawer selection on click
                  className="hover:bg-slate-800/40 cursor-pointer transition border-b border-slate-900/80"
                >
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-indigo-400">{log.subscriptionId}</td>
                  <td className="py-3 px-4 font-medium text-slate-200">{log.action}</td>
                  <td className="py-3 px-4 text-slate-300">{Math.round(log.aiConfidence * 100)}%</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      log.policyDecision === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {log.policyDecision}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-400">
                    ₹{log.revenueRecovered.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}