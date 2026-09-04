import { DollarSign, ShieldCheck, Activity } from 'lucide-react';

interface MetricsGridProps {
  totalRecovered: number;
  successRate: number;
  totalLogs: number;
}

export default function MetricsGrid({ totalRecovered, successRate, totalLogs }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue Recovered</span>
          <DollarSign className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="text-3xl font-bold text-emerald-400">₹{totalRecovered.toLocaleString()}</div>
        <p className="text-xs text-slate-500 mt-1">Validated across active multi-agent pipelines</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">AI Policy Success Rate</span>
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="text-3xl font-bold text-indigo-400">{successRate}%</div>
        <p className="text-xs text-slate-500 mt-1">Deterministic guardrail approvals</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Processed Events</span>
          <Activity className="w-5 h-5 text-blue-400" />
        </div>
        <div className="text-3xl font-bold text-blue-400">{totalLogs}</div>
        <p className="text-xs text-slate-500 mt-1">Immutable webhook traces logged</p>
      </div>
    </div>
  );
}