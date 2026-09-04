'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function RetryContent() {
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '3000';

  const handleSimulatePayment = () => {
    alert(`Success! ₹${amount} payment recovered successfully.\n\nIn a real app, this would open Razorpay to complete the transaction.`);
    window.location.href = '/';
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl text-center">
        <div className="h-16 w-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🔄</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Secure Checkout Retry</h1>
        <p className="text-slate-400 text-sm mb-8">
          Complete your pending payment of <strong className="text-white">₹{amount}</strong> safely. Your session has been restored.
        </p>

        <button 
          onClick={handleSimulatePayment}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-blue-500/20"
        >
          Pay ₹{amount} Now
        </button>
        
        <p className="text-xs text-slate-500 mt-6 flex items-center justify-center gap-1">
          <span>🔒</span> Secured by ReviveFlow
        </p>
      </div>
    </main>
  );
}

export default function RetryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <RetryContent />
    </Suspense>
  );
}
