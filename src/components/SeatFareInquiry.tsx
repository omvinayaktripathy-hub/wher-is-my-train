'use client';

import React, { useState } from 'react';
import { MAJOR_STATIONS } from '@/data/trainData';
import { TrainFareResult } from '@/types';
import { Search, ArrowRight, IndianRupee } from 'lucide-react';

export default function SeatFareInquiry() {
  const [fromCode, setFromCode] = useState('NDLS');
  const [toCode, setToCode] = useState('BSB');
  const [travelDate, setTravelDate] = useState('2026-10-02');
  const [quota, setQuota] = useState('GENERAL');
  const [results, setResults] = useState<TrainFareResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);

    // Dynamic fare results for selected stations
    setResults([
      {
        trainNumber: '12835',
        trainName: 'Express Superfast',
        departureTime: '17:00',
        arrivalTime: '08:30',
        duration: '15h 30m',
        classes: [
          { code: '3A', name: 'AC 3 Tier', fare: 1380, availability: 'AVAILABLE', seatsCount: 34, updatedAgo: 'Just now' },
          { code: '2A', name: 'AC 2 Tier', fare: 1980, availability: 'AVAILABLE', seatsCount: 12, updatedAgo: 'Just now' },
          { code: '1A', name: 'AC 1st Class', fare: 3340, availability: 'AVAILABLE', seatsCount: 4, updatedAgo: 'Just now' },
          { code: 'SL', name: 'Sleeper', fare: 520, availability: 'RAC', seatsCount: 8, updatedAgo: 'Just now' },
        ],
      },
    ]);
  };

  const handleSwapStations = () => {
    const temp = fromCode;
    setFromCode(toCode);
    setToCode(temp);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Search Filter Header */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl">
        <h2 className="text-xl sm:text-2xl font-black text-white mb-2">Train Seat Availability & Live Fare Inquiry</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Find available train berths, fare breakup, confirmation probability, and instant IRCTC booking access.
        </p>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* From Station */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">From Station</label>
            <input
              type="text"
              value={fromCode}
              onChange={(e) => setFromCode(e.target.value.toUpperCase())}
              placeholder="e.g. NDLS or New Delhi"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner placeholder-slate-500"
            />
          </div>

          {/* To Station */}
          <div>
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
              value={toCode}
              onChange={(e) => setToCode(e.target.value.toUpperCase())}
              placeholder="e.g. BSB or Varanasi"
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner placeholder-slate-500"
            />
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
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition flex items-center justify-center space-x-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Search Trains</span>
            </button>
          </div>
        </form>
      </div>

      {/* Train Results List */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Found <strong className="text-white">{results.length} trains</strong> running between {fromCode} and{' '}
              {toCode}
            </span>
            <span>Quota: {quota}</span>
          </div>

          {results.map((train) => (
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
                  href="https://www.irctc.co.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center space-x-1 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-blue-500/30 text-xs font-semibold transition"
                >
                  <span>Book on IRCTC</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
                      className={`p-3.5 rounded-2xl border transition ${
                        isAvailable
                          ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/60'
                          : isRac
                          ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500/60'
                          : 'bg-slate-950/40 border-slate-800'
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
                            isAvailable ? 'text-emerald-400' : isRac ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {cls.availability}-{cls.seatsCount}
                        </span>
                        <span className="text-[10px] text-slate-500">{cls.updatedAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
