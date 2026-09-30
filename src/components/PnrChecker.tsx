'use client';

import React, { useState } from 'react';
import { PnrRecord } from '@/types';
import { Ticket, Search, CheckCircle2, Clock, User, Wifi, Loader2, AlertCircle, Copy, Share2, Sparkles, Train, ArrowRight } from 'lucide-react';

export default function PnrChecker() {
  const [pnrInput, setPnrInput] = useState('');
  const [currentPnr, setCurrentPnr] = useState<PnrRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSearch = async (targetPnr?: string) => {
    const target = (targetPnr || pnrInput).trim();
    if (!/^\d{10}$/.test(target)) {
      setErrorMsg('Please enter a valid 10-digit Indian Railways PNR number.');
      setCurrentPnr(null);
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    setSearched(true);
    if (targetPnr) setPnrInput(targetPnr);

    try {
      const res = await fetch(`/api/pnr?pnr=${target}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCurrentPnr(json.data);
        setIsRealTime(true);
      } else {
        setErrorMsg('No active reservation record found for this 10-digit PNR. Please check the number and retry.');
        setCurrentPnr(null);
      }
    } catch {
      setErrorMsg('Unable to retrieve PNR status at this moment. Please check your network and retry.');
      setCurrentPnr(null);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePnrs = [
    { pnr: '4521893710', label: 'Sample Confirmed (CNF)' },
    { pnr: '6834192051', label: 'Sample RAC / Waiting' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto relative">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="absolute top-2 right-2 z-50 bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xl border border-blue-400 flex items-center space-x-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Input Box Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-5 sm:p-7 shadow-2xl">
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 mb-2">
            <Ticket className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center space-x-2">
            <h2 className="text-2xl font-black text-white">Live PNR Status Check</h2>
            {isRealTime && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> LIVE IRCTC
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter your 10-digit PNR number printed on the top-left of your train ticket.
          </p>
        </div>

        {/* Quick Sample PNR buttons for immediate testing */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <span className="text-slate-500 text-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Test with:
          </span>
          {samplePnrs.map((s) => (
            <button
              key={s.pnr}
              type="button"
              onClick={() => handleSearch(s.pnr)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 text-cyan-300 border border-slate-800 text-xs font-mono font-semibold transition"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="max-w-xl mx-auto"
        >
          <div className="relative flex items-center shadow-lg">
            <input
              type="text"
              maxLength={10}
              value={pnrInput}
              onChange={(e) => {
                setPnrInput(e.target.value.replace(/\D/g, ''));
                setErrorMsg('');
              }}
              placeholder="Enter 10-Digit PNR Number"
              className="w-full pl-5 pr-32 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              type="submit"
              disabled={isLoading || pnrInput.length !== 10}
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-md shadow-blue-600/30 transition flex items-center space-x-1.5"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isLoading ? 'Checking...' : 'Check Status'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center justify-center space-x-1.5 text-xs text-rose-400 mt-3 text-center bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </form>
      </div>

      {/* PNR Details Card */}
      {searched && currentPnr && (
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-6">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">PNR NUMBER</span>
                <span className="font-mono text-xl font-extrabold text-white tracking-widest">
                  {currentPnr.pnrNumber}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentPnr.pnrNumber);
                    showToast('PNR copied!');
                  }}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                  title="Copy PNR"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-cyan-400 mt-1">
                {currentPnr.trainNumber} - {currentPnr.trainName}
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <span className="block text-[11px] text-slate-400 font-medium">Reservation Chart</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                    currentPnr.chartStatus === 'Prepared'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {currentPnr.chartStatus === 'Prepared' ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <Clock className="w-3.5 h-3.5" />
                  )}
                  {currentPnr.chartStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Journey Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-white/5 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Date of Journey</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{currentPnr.doj}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Class & Quota</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{currentPnr.classType}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">From Station</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{currentPnr.fromStation}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">To Station</span>
              <span className="text-white font-bold text-sm mt-0.5 block">{currentPnr.toStation}</span>
            </div>
          </div>

          {/* Passenger Status Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" /> Passenger Booking & Current Status
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Booking Status</th>
                    <th className="px-4 py-3">Current Status</th>
                    <th className="px-4 py-3">Coach</th>
                    <th className="px-4 py-3">Berth</th>
                    <th className="px-4 py-3 text-right">Confirmation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {currentPnr.passengers.map((p) => {
                    const isConfirmed = p.currentStatus.includes('CNF');
                    return (
                      <tr key={p.passengerNo} className="hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-semibold text-slate-400">{p.passengerNo}</td>
                        <td className="px-4 py-3 font-mono font-medium text-slate-300">{p.bookingStatus}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded ${
                              isConfirmed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {p.currentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-cyan-400">{p.coach}</td>
                        <td className="px-4 py-3 font-medium text-slate-200">
                          {p.berthNumber} ({p.berthType})
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-emerald-400 font-mono">
                            {p.confirmationProbability ?? 100}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
