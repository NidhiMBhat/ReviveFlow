'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface AuthViewProps {
  onLoginSuccess: (merchant: { id: string; name: string; email: string }) => void;
}

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // Register Merchant
        const res = await axios.post(`${API_URL}/api/merchants/signup`, {
          name,
          email,
          webhookSecret: webhookSecret || 'whsec_default123',
          razorpayKeyId: razorpayKeyId || 'rzp_test_key123',
        });
        alert('Merchant account created successfully! Please log in.');
        setIsSignup(false);
      } else {
        // Login / Authenticate Merchant by email lookup
        const res = await axios.post(`${API_URL}/api/merchants/login`, { email });
        const merchant = res.data.merchant;

        // Save session for 24 hours
        const sessionData = {
          merchant,
          expiresAt: new Date().getTime() + 24 * 60 * 60 * 1000,
        };
        localStorage.setItem('reviveflow_merchant_session', JSON.stringify(sessionData));
        onLoginSuccess(merchant);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      alert(error.response?.data?.error || 'Authentication failed. Please check your credentials or backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <span className="h-3 w-3 inline-block rounded-full bg-emerald-500 animate-pulse mr-2"></span>
          <span className="text-xs uppercase tracking-wider text-blue-400 font-semibold">Multi-Tenant Gateway</span>
          <h1 className="text-2xl font-extrabold text-white mt-1">ReviveFlow War Room</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isSignup ? 'Register your merchant organization' : 'Sign in to access your recovery telemetry'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Organization Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
                required={isSignup}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Business Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@acmecorp.com"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {isSignup && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Razorpay Key ID</label>
                <input 
                  type="text"
                  value={razorpayKeyId}
                  onChange={(e) => setRazorpayKeyId(e.target.value)}
                  placeholder="rzp_test_..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Webhook Secret</label>
                <input 
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isSignup ? 'Register Organization' : 'Sign In to War Room')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-xs text-slate-400 hover:text-blue-400 transition"
          >
            {isSignup ? 'Already have an account? Sign In ↗' : "Don't have an account? Register Merchant ↗"}
          </button>
        </div>
      </div>
    </main>
  );
}