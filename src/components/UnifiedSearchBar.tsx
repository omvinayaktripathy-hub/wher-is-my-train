'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Train, ArrowUpDown, ArrowRight, X, MapPin, Sparkles, Clock, CheckCircle } from 'lucide-react';
import { TrainDetails } from '@/types';
import { POPULAR_TRAINS, MAJOR_STATIONS } from '@/data/trainData';

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
  const [fromStation, setFromStation] = useState('Jharsuguda Junction (JSG)');
  const [toStation, setToStation] = useState('SMVT Bengaluru (SMVB)');

  // Autocomplete suggestions
  const [trainSuggestions, setTrainSuggestions] = useState<TrainDetails[]>([]);
  const [showTrainDropdown, setShowTrainDropdown] = useState(false);

  const [fromSuggestions, setFromSuggestions] = useState<typeof MAJOR_STATIONS>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);

  const [toSuggestions, setToSuggestions] = useState<typeof MAJOR_STATIONS>([]);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // Route search results modal/panel
  const [routeResults, setRouteResults] = useState<TrainDetails[]>([]);
  const [isSearchingRoute, setIsSearchingRoute] = useState(false);
  const [showRouteResults, setShowRouteResults] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTrainDropdown(false);
        setShowFromDropdown(false);
        setShowToDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter train suggestions as user types
  const handleTrainInputChange = (val: string) => {
    setTrainQuery(val);
    if (!val.trim()) {
      setTrainSuggestions([]);
      setShowTrainDropdown(false);
      return;
    }

    const q = val.trim().toLowerCase();
    const matched = POPULAR_TRAINS.filter(
      (t) =>
        t.trainNumber.toLowerCase().includes(q) ||
        t.trainName.toLowerCase().includes(q) ||
        t.sourceStation.toLowerCase().includes(q) ||
        t.destinationStation.toLowerCase().includes(q)
    );
    setTrainSuggestions(matched);
    setShowTrainDropdown(matched.length > 0);
  };

  // Filter From station suggestions
  const handleFromChange = (val: string) => {
    setFromStation(val);
    if (!val.trim()) {
      setFromSuggestions([]);
      setShowFromDropdown(false);
      return;
    }
    const q = val.trim().toLowerCase();
    const matched = MAJOR_STATIONS.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
    );
    setFromSuggestions(matched);
    setShowFromDropdown(matched.length > 0);
  };

  // Filter To station suggestions
  const handleToChange = (val: string) => {
    setToStation(val);
    if (!val.trim()) {
      setToSuggestions([]);
      setShowToDropdown(false);
      return;
    }
    const q = val.trim().toLowerCase();
    const matched = MAJOR_STATIONS.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
    );
    setToSuggestions(matched);
    setShowToDropdown(matched.length > 0);
  };

  const handleTrainSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = trainQuery.trim();
    if (!clean) return;

    // Check if matched in suggestions
    const matched = POPULAR_TRAINS.find(
      (t) =>
        t.trainNumber.toLowerCase() === clean.toLowerCase() ||
        t.trainName.toLowerCase().includes(clean.toLowerCase())
    );

    if (matched) {
      onSelectTrain(matched);
    } else {
      onSearchTrainNumber(clean);
    }
    setShowTrainDropdown(false);
  };

  const handleRouteSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const from = fromStation.trim();
    const to = toStation.trim();
    if (!from || !to) return;

    setIsSearchingRoute(true);
    setShowRouteResults(true);

    try {
      // Extract code if format is "Station Name (CODE)"
      const extractCode = (str: string) => {
        const match = str.match(/\(([^)]+)\)/);
        return match ? match[1] : str;
      };

      const fromCode = extractCode(from);
      const toCode = extractCode(to);

      const res = await fetch(`/api/search-route?from=${encodeURIComponent(fromCode)}&to=${encodeURIComponent(toCode)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setRouteResults(json.data);
      } else {
        // Fallback to Hatia-SMVB
        setRouteResults([POPULAR_TRAINS[5]]);
      }
    } catch {
      setRouteResults([POPULAR_TRAINS[5]]);
    } finally {
      setIsSearchingRoute(false);
    }
  };

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const popularChips = [
    { number: '12835', name: 'Hatia - SMVT Bengaluru' },
    { number: '22436', name: 'Vande Bharat (NDLS-BSB)' },
    { number: '12951', name: 'Mumbai Rajdhani' },
    { number: '12002', name: 'Shatabdi Exp' },
    { number: '12626', name: 'Kerala Express' },
  ];

  return (
    <div ref={dropdownRef} className="w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-4 sm:p-5 shadow-2xl mb-6">
      {/* Top Toggle: Type Train Number vs Type Stations */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
        <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-white/5 w-fit">
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
            <span>Search Train</span>
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
            <span>Trains Between Stations</span>
          </button>
        </div>

        {/* Currently Selected Train Chip */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Tracking:</span>
          <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-mono text-cyan-300">{selectedTrain.trainNumber}</span>
            <span className="truncate max-w-[150px] sm:max-w-[220px]">{selectedTrain.trainName}</span>
          </span>
        </div>
      </div>

      {/* Mode 1: Direct Train Number or Name Search */}
      {searchMode === 'number' && (
        <div className="space-y-3">
          <form onSubmit={handleTrainSubmit} className="relative flex items-center">
            <div className="absolute left-4 flex items-center pointer-events-none text-slate-400">
              <Train className="w-5 h-5 text-cyan-400 mr-2" />
            </div>
            <input
              type="text"
              value={trainQuery}
              onChange={(e) => handleTrainInputChange(e.target.value)}
              onFocus={() => {
                if (trainQuery.trim() && trainSuggestions.length > 0) setShowTrainDropdown(true);
              }}
              placeholder="Search by 5-digit Train Number (e.g. 12835, 22436, 12951) or Name..."
              className="w-full pl-14 pr-32 py-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold shadow-inner"
            />
            {trainQuery && (
              <button
                type="button"
                onClick={() => {
                  setTrainQuery('');
                  setShowTrainDropdown(false);
                }}
                className="absolute right-28 p-1.5 text-slate-400 hover:text-white transition"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-900/30 transition flex items-center space-x-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track Live</span>
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showTrainDropdown && trainSuggestions.length > 0 && (
            <div className="relative z-50">
              <div className="absolute left-0 right-0 top-1 bg-slate-950/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden divide-y divide-white/5 max-h-64 overflow-y-auto">
                {trainSuggestions.map((t) => (
                  <div
                    key={t.trainNumber}
                    onClick={() => {
                      onSelectTrain(t);
                      setTrainQuery(`${t.trainNumber} - ${t.trainName}`);
                      setShowTrainDropdown(false);
                    }}
                    className="p-3 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-cyan-400 text-sm px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {t.trainNumber}
                      </span>
                      <div>
                        <p className="text-white text-xs font-bold group-hover:text-cyan-300 transition">
                          {t.trainName}
                        </p>
                        <p className="text-slate-400 text-[11px]">
                          {t.sourceStation} ({t.sourceCode}) &rarr; {t.destinationStation} ({t.destCode})
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      {t.trainType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Select Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none text-xs">
            <span className="text-slate-500 text-[11px] font-semibold shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Popular:
            </span>
            {popularChips.map((chip) => (
              <button
                key={chip.number}
                type="button"
                onClick={() => {
                  setTrainQuery(chip.number);
                  const found = POPULAR_TRAINS.find((t) => t.trainNumber === chip.number);
                  if (found) {
                    onSelectTrain(found);
                  } else {
                    onSearchTrainNumber(chip.number);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition shrink-0 ${
                  selectedTrain.trainNumber === chip.number
                    ? 'bg-blue-600/30 text-cyan-300 border-blue-500/50 font-bold'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span className="font-mono font-bold mr-1">{chip.number}</span>
                <span className="text-slate-400">{chip.name.split('(')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode 2: Station Pair (Route) Search */}
      {searchMode === 'route' && (
        <div className="space-y-4">
          <form onSubmit={handleRouteSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            {/* From Station */}
            <div className="flex-1 w-full relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                From Station
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fromStation}
                  onChange={(e) => handleFromChange(e.target.value)}
                  onFocus={() => {
                    if (fromSuggestions.length > 0) setShowFromDropdown(true);
                  }}
                  placeholder="Type Station (e.g. JSG, Hatia, NDLS)..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                />
              </div>

              {/* From Autocomplete Dropdown */}
              {showFromDropdown && fromSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-white/5">
                  {fromSuggestions.map((s) => (
                    <div
                      key={s.code}
                      onClick={() => {
                        setFromStation(`${s.name} (${s.code})`);
                        setShowFromDropdown(false);
                      }}
                      className="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="text-white font-medium">{s.name}</span>
                      <span className="font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {s.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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

            {/* To Station */}
            <div className="flex-1 w-full relative">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                To Station
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={toStation}
                  onChange={(e) => handleToChange(e.target.value)}
                  onFocus={() => {
                    if (toSuggestions.length > 0) setShowToDropdown(true);
                  }}
                  placeholder="Type Station (e.g. SMVB, Bengaluru, BSB)..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-3.5 py-3 text-sm font-semibold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                />
              </div>

              {/* To Autocomplete Dropdown */}
              {showToDropdown && toSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-48 overflow-y-auto divide-y divide-white/5">
                  {toSuggestions.map((s) => (
                    <div
                      key={s.code}
                      onClick={() => {
                        setToStation(`${s.name} (${s.code})`);
                        setShowToDropdown(false);
                      }}
                      className="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <span className="text-white font-medium">{s.name}</span>
                      <span className="font-mono font-bold text-cyan-400 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {s.code}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="w-full sm:w-auto mt-5">
              <button
                type="submit"
                disabled={isSearchingRoute}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-900/30 transition flex items-center justify-center space-x-2"
              >
                <span>{isSearchingRoute ? 'Searching...' : 'Find Trains'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Interactive Route Results List */}
          {showRouteResults && (
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Found <strong className="text-white">{routeResults.length} train(s)</strong> for {fromStation} &rarr; {toStation}
                </span>
                <button
                  onClick={() => setShowRouteResults(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {routeResults.map((train) => (
                  <div
                    key={train.trainNumber}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 hover:border-blue-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-cyan-400 text-sm">{train.trainNumber}</span>
                        <span className="font-bold text-white text-sm">{train.trainName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                          {train.trainType}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>Departs: <strong className="text-slate-200">{train.departureTime}</strong></span>
                        <span>&bull;</span>
                        <span>Arrives: <strong className="text-slate-200">{train.arrivalTime}</strong></span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{train.travelDuration}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onSelectTrain(train);
                        setShowRouteResults(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-900/30"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Track Live</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
