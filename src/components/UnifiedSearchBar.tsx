'use client';

import React, { useState } from 'react';
import { Search, Train, ArrowUpDown, ArrowRight, X, MapPin } from 'lucide-react';
import { TrainDetails } from '@/types';

interface UnifiedSearchBarProps {
  selectedTrain: TrainDetails;
  onSelectTrain: (train: TrainDetails) => void;
  onSearchTrainNumber: (trainNumber: string) => void;
}

export default function UnifiedSearchBar({
  selectedTrain,
  onSelectTrain,
  onSearchTrainNumber,
}: UnifiedSearchBarProps) {
  const [searchMode, setSearchMode] = useState<'number' | 'route'>('number');
  const [trainQuery, setTrainQuery] = useState('');
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');

  const handleTrainSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = trainQuery.trim();
    if (!clean) return;
    onSearchTrainNumber(clean);
  };

  const handleRouteSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const from = fromStation.trim();
    const to = toStation.trim();
    if (!from || !to) return;
    onSearchTrainNumber(`${from} to ${to}`);
  };

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-4 sm:p-5 shadow-2xl mb-6">
      {/* Top Toggle: Type Train Number vs Type Stations */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setSearchMode('number')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              searchMode === 'number'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Type Train Number</span>
          </button>
          <button
            type="button"
            onClick={() => setSearchMode('route')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              searchMode === 'route'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Type Stations</span>
          </button>
        </div>

        {/* Currently Selected Train Chip */}
        <div className="hidden sm:flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Tracking:</span>
          <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            {selectedTrain.trainNumber} - {selectedTrain.trainName}
          </span>
        </div>
      </div>

      {/* Mode 1: Direct Train Number Typing (Default) */}
      {searchMode === 'number' && (
        <form onSubmit={handleTrainSubmit} className="relative flex items-center">
          <div className="absolute left-4 flex items-center pointer-events-none text-slate-400">
            <Train className="w-5 h-5 text-cyan-400 mr-2" />
          </div>
          <input
            type="text"
            value={trainQuery}
            onChange={(e) => setTrainQuery(e.target.value)}
            placeholder="Type any 5-digit Train Number (e.g. 12835, 12424, 22436, 12951) or Name..."
            autoFocus
            className="w-full pl-14 pr-32 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold shadow-inner"
          />
          {trainQuery && (
            <button
              type="button"
              onClick={() => setTrainQuery('')}
              className="absolute right-28 p-1.5 text-slate-400 hover:text-white transition"
              title="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition flex items-center space-x-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track Live</span>
          </button>
        </form>
      )}

      {/* Mode 2: Type Station Names or Codes (No dropdown lists!) */}
      {searchMode === 'route' && (
        <form onSubmit={handleRouteSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              From Station
            </label>
            <input
              type="text"
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value)}
              placeholder="Type Station Name or Code (e.g. Hatia or HTE)..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
          </div>

          {/* Swap Button */}
          <button
            type="button"
            onClick={handleSwapStations}
            className="w-10 h-10 mt-5 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-400 flex items-center justify-center border border-slate-600 transition shrink-0 shadow-md"
            title="Swap Stations"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>

          <div className="flex-1 w-full relative">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              To Station
            </label>
            <input
              type="text"
              value={toStation}
              onChange={(e) => setToStation(e.target.value)}
              placeholder="Type Station Name or Code (e.g. SMVT Bengaluru or SMVB)..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
          </div>

          <div className="w-full sm:w-auto mt-5">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition flex items-center justify-center space-x-2"
            >
              <span>Find Trains</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
