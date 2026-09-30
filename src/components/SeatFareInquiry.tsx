'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MAJOR_STATIONS } from '@/data/trainData';
import { TrainFareResult } from '@/types';
import { Search, Sparkles, IndianRupee, Info, X, ExternalLink, Loader2 } from 'lucide-react';

export default function SeatFareInquiry() {
  const [fromCode, setFromCode] = useState('JSG');
  const [toCode, setToCode] = useState('SMVB');
  const [fromText, setFromText] = useState('Jharsuguda Junction (JSG)');
  const [toText, setToText] = useState('SMVT Bengaluru (SMVB)');
  const [travelDate, setTravelDate] = useState('2026-10-02');
  const [quota, setQuota] = useState('GENERAL');
  const [results, setResults] = useState<TrainFareResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Selected fare for breakup popup
  const [breakupClass, setBreakupClass] = useState<{
    trainName: string;
    className: string;
    code: string;
    fare: number;
  } | null>(null);

  // Autocomplete dropdowns
  const [fromSuggestions, setFromSuggestions] = useState<typeof MAJOR_STATIONS>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [toSuggestions, setToSuggestions] = useState<typeof MAJOR_STATIONS>([]);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/fares?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}&quota=${quota}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setResults(json.data);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Perform initial search
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwapStations = () => {
    const tempCode = fromCode;
    const tempText = fromText;
    setFromCode(toCode);
    setFromText(toText);
    setToCode(tempCode);
    setToText(tempText);
  };

  const handleFromChange = (val: string) => {
    setFromText(val);
    setFromCode(val.trim());
    if (!val.trim()) {
      setFromSuggestions([]);
      setShowFromDropdown(false);
      return;
    }
    const q = val.trim().toLowerCase();
    const matched = MAJOR_STATIONS.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
    setFromSuggestions(matched);
    setShowFromDropdown(matched.length > 0);
  };

  const handleToChange = (val: string) => {
    setToText(val);
    setToCode(val.trim());
    if (!val.trim()) {
      setToSuggestions([]);
      setShowToDropdown(false);
      return;
    }
    const q = val.trim().toLowerCase();
    const matched = MAJOR_STATIONS.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
    setToSuggestions(matched);
    setShowToDropdown(matched.length > 0);
  };

  const sampleCorridors = [
    { from: 'JSG', fromName: 'Jharsuguda', to: 'SMVB', toName: 'SMVT Bengaluru' },
    { from: 'NDLS', fromName: 'New Delhi', to: 'BSB', toName: 'Varanasi' },
    { from: 'MMCT', fromName: 'Mumbai Central', to: 'NDLS', toName: 'New Delhi' },
    { from: 'NDLS', fromName: 'New Delhi', to: 'RKMP', toName: 'Bhopal' },
  ];

  return (
    <div ref={containerRef} className="space-y-6 max-w-4xl mx-auto">
      {/* Search Filter Header */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Train Seat Availability & Live Fare Inquiry</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-5">
          Real-time berth quota inquiry, ticket fare calculation, and confirmation probability across Indian Railways.
        </p>

        {/* Quick Corridor Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-4 border-b border-white/5 scrollbar-none text-xs">
          <span className="text-slate-500 text-[11px] font-semibold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Quick Routes:
          </span>
          {sampleCorridors.map((c, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFromCode(c.from);
                setFromText(`${c.fromName} (${c.from})`);
                setToCode(c.to);
                setToText(`${c.toName} (${c.to})`);
              }}
              className="px-2.5 py-1 rounded-lg border text-[11px] font-medium bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800 transition shrink-0"
            >
              <span className="font-bold text-cyan-300">{c.from}</span>
              <span className="text-slate-500 mx-1">&rarr;</span>
              <span className="font-bold text-cyan-300">{c.to}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* From Station */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">From Station</label>
            <input
              type="text"
              value={fromText}
              onChange={(e) => handleFromChange(e.target.value)}
              onFocus={() => {
                if (fromSuggestions.length > 0) setShowFromDropdown(true);
              }}
              placeholder="e.g. JSG, NDLS..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner placeholder-slate-500"
            />

            {/* From Dropdown */}
            {showFromDropdown && fromSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-white/5">
                {fromSuggestions.map((s) => (
                  <div
                    key={s.code}
                    onClick={() => {
                      setFromCode(s.code);
                      setFromText(`${s.name} (${s.code})`);
                      setShowFromDropdown(false);
                    }}
                    className="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="text-white font-medium">{s.name}</span>
                    <span className="font-mono font-bold text-cyan-400">{s.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* To Station */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400">To Station</label>
              <button
                type="button"
                onClick={handleSwapStations}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 transition underline"
              >
                Swap
              </button>
            </div>
            <input
              type="text"
              value={toText}
              onChange={(e) => handleToChange(e.target.value)}
              onFocus={() => {
                if (toSuggestions.length > 0) setShowToDropdown(true);
              }}
              placeholder="e.g. SMVB, BSB..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner placeholder-slate-500"
            />

            {/* To Dropdown */}
            {showToDropdown && toSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-white/5">
                {toSuggestions.map((s) => (
                  <div
                    key={s.code}
                    onClick={() => {
                      setToCode(s.code);
                      setToText(`${s.name} (${s.code})`);
                      setShowToDropdown(false);
                    }}
                    className="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <span className="text-white font-medium">{s.name}</span>
                    <span className="font-mono font-bold text-cyan-400">{s.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Travel Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Date of Journey</label>
            <input
              type="date"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quota */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Quota</label>
            <select
              value={quota}
              onChange={(e) => setQuota(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GENERAL">General Quota (GN)</option>
              <option value="TATKAL">Tatkal Quota (TQ)</option>
              <option value="LADIES">Ladies Quota (LD)</option>
              <option value="SENIOR">Sr. Citizen / Lower Berth</option>
            </select>
          </div>

          {/* Search Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition flex items-center justify-center space-x-1.5"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{isLoading ? 'Checking...' : 'Check Seats'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Train Results List */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Found <strong className="text-white">{results.length} trains</strong> connecting {fromCode} &rarr; {toCode}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
              Quota: {quota}
            </span>
          </div>

          {results.length > 0 ? (
            results.map((train) => (
              <div
                key={train.trainNumber}
                className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-5 shadow-2xl hover:border-slate-700 transition"
              >
                {/* Train Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-extrabold text-cyan-400 text-base">{train.trainNumber}</span>
                      <span className="font-bold text-white text-base">{train.trainName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                      <span>Departs: <strong className="text-slate-200">{train.departureTime}</strong></span>
                      <span>&bull;</span>
                      <span>Arrives: <strong className="text-slate-200">{train.arrivalTime}</strong></span>
                      <span>&bull;</span>
                      <span>Duration: <strong className="text-slate-200">{train.duration}</strong></span>
                    </div>
                  </div>

                  <a
                    href="https://www.irctc.co.in/nget/train-search"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-1 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/30 text-xs font-semibold transition"
                  >
                    <span>Book on IRCTC</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Class & Availability Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  {train.classes.map((cls) => {
                    const isAvailable = cls.availability === 'AVAILABLE';
                    const isRac = cls.availability === 'RAC';

                    return (
                      <div
                        key={cls.code}
                        onClick={() =>
                          setBreakupClass({
                            trainName: train.trainName,
                            className: cls.name,
                            code: cls.code,
                            fare: cls.fare,
                          })
                        }
                        className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                          isAvailable
                            ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                            : isRac
                            ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60'
                            : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{cls.code}</span>
                          <span className="font-mono font-bold text-cyan-400 text-sm">₹{cls.fare}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{cls.name}</p>

                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                          <span
                            className={`text-xs font-extrabold ${
                              isAvailable ? 'text-emerald-400' : isRac ? 'text-amber-400' : 'text-rose-400'
                            }`}
                          >
                            {cls.availability}-{cls.seatsCount}
                          </span>
                          <span className="text-[10px] text-slate-500 underline flex items-center gap-0.5">
                            <Info className="w-2.5 h-2.5" /> Breakup
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-900/90 rounded-3xl border border-white/10 p-8 text-center text-slate-400 text-sm">
              No direct trains found between these stations for the selected date. Try searching popular hubs or changing dates.
            </div>
          )}
        </div>
      )}

      {/* Fare Breakup Modal */}
      {breakupClass && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">IRCTC Fare Breakup</h3>
              </div>
              <button onClick={() => setBreakupClass(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-white font-bold text-sm">{breakupClass.trainName}</p>
              <p className="text-cyan-400 text-xs font-semibold">{breakupClass.className} ({breakupClass.code})</p>
            </div>

            <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-white/5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Fare</span>
                <span className="font-mono">₹{Math.round(breakupClass.fare * 0.82)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Reservation Charge</span>
                <span className="font-mono">₹40</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Superfast Surcharge</span>
                <span className="font-mono">₹45</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GST (5%)</span>
                <span className="font-mono">₹{Math.round(breakupClass.fare * 0.05)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-2 border-t border-white/10 text-sm">
                <span>Total Ticket Amount</span>
                <span className="font-mono text-cyan-400">₹{breakupClass.fare}</span>
              </div>
            </div>

            <button
              onClick={() => setBreakupClass(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
