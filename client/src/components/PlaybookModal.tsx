'use client';

import React, { useState, useEffect } from 'react';

interface PlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaybookModal({ isOpen, onClose }: PlaybookModalProps) {
  const [selectedTone, setSelectedTone] = useState('Hinglish - Polite & Empathetic');

  useEffect(() => {
    const savedTone = localStorage.getItem('reviveflow_ai_tone');
    if (savedTone) setSelectedTone(savedTone);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('reviveflow_ai_tone', selectedTone);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Customize AI Playbook
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm bg-slate-800 px-2.5 py-1 rounded-lg">✕</button>
        </div>
        
        <p className="text-sm text-slate-400 mb-6">Select the tonal strategy Gemini should use when generating the customer recovery email.</p>

        <div className="space-y-3 mb-8">
          {[
            { id: 'Hinglish - Polite & Empathetic', label: 'Polite & Empathetic (Hinglish)', desc: 'Friendly nudge assuming it was a genuine mistake.' },
            { id: 'English - Urgent & Strict', label: 'Urgent & Strict (English)', desc: 'Firm warning about subscription cancellation.' },
            { id: 'Hinglish - Discount Driven', label: 'Discount Driven (Hinglish)', desc: 'Offers a 5% discount if they retry immediately.' }
          ].map((tone) => (
            <label key={tone.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${selectedTone === tone.id ? 'bg-blue-900/20 border-blue-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}>
              <input 
                type="radio" 
                name="tone" 
                value={tone.id}
                checked={selectedTone === tone.id}
                onChange={(e) => setSelectedTone(e.target.value)}
                className="mt-1 w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
              />
              <div>
                <p className={`text-sm font-semibold ${selectedTone === tone.id ? 'text-blue-400' : 'text-slate-200'}`}>{tone.label}</p>
                <p className="text-xs text-slate-500 mt-1">{tone.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-500/20"
        >
          Save Playbook Configuration
        </button>
      </div>
    </div>
  );
}