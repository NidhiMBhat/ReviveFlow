'use client';

import React, { useState } from 'react';

interface WarRoomHeaderProps {
  onStartCheckout: (amountInRupees: number) => void;
  onRefresh: () => void;
  onOpenPlaybook?: () => void;
  loading: boolean;
}

export default function WarRoomHeader({ onStartCheckout, onRefresh, onOpenPlaybook, loading }: WarRoomHeaderProps) {
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [customAmount, setCustomAmount] = useState<number>(3000); // Default ₹3,000
const [customerPhone, setCustomerPhone] = useState('9999999999');
const [customerEmail, setCustomerEmail] = useState<string>('evaluator@reviveflow.ai');
  const handleLaunchCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAmountModal(false);
    onStartCheckout(customAmount);
  };

  return (
    <>
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              ReviveFlow <span className="text-blue-500 font-normal text-lg">Autonomous War Room</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Enterprise AI-driven payment recovery pipeline and guardrail engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Customize Playbook Button */}
          {onOpenPlaybook && (
            <button
              onClick={onOpenPlaybook}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 shadow-sm"
            >
              <span>⚙️</span> Customize Playbook
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl font-medium text-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            <span className={`${loading ? 'animate-spin' : ''}`}>🔄</span> 
            {loading ? 'Syncing...' : 'Sync Logs'}
          </button>

          {/* Test Checkout Button -> Opens Amount Modal */}
          <button
            onClick={() => setShowAmountModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
          >
            <span>⚡</span> Test Checkout
          </button>
        </div>
      </header>

      {/* Amount Entry Modal for Evaluators */}
      {showAmountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Simulate Failed Payment</h3>
              <button 
                onClick={() => setShowAmountModal(false)}
                className="text-slate-400 hover:text-white text-sm bg-slate-800 px-2.5 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Enter the transaction amount you want to simulate. Default is ₹3,000.
            </p>

           <form onSubmit={handleLaunchCheckout} className="space-y-4">
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Transaction Amount (₹)</label>
    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
      <span className="text-slate-400 mr-2 font-semibold">₹</span>
      <input 
        type="number"
        value={customAmount}
        onChange={(e) => setCustomAmount(Number(e.target.value))}
        className="w-full bg-transparent text-white text-lg font-bold focus:outline-none"
        placeholder="3000"
        min="50"
        required
        autoFocus
      />
    </div>
  </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-500/20"
                >
                  Launch Checkout ⚡
                </button>
                <button
                  type="button"
                  onClick={() => setShowAmountModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-3 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}