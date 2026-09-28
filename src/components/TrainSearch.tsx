'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Train, ArrowRight, Zap, X, MapPin } from 'lucide-react';
import { TrainDetails } from '@/types';
import { POPULAR_TRAINS } from '@/data/trainData';

interface TrainSearchProps {
  selectedTrain: TrainDetails;
  onSelectTrain: (train: TrainDetails) => void;
  onSearchTrainNumber?: (trainNumber: string) => void;
}

export default function TrainSearch({ selectedTrain, onSelectTrain, onSearchTrainNumber }: TrainSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTrains = POPULAR_TRAINS.filter(
    (t) =>
      t.trainNumber.toLowerCase().includes(query.toLowerCase()) ||
      t.trainName.toLowerCase().includes(query.toLowerCase()) ||
      t.sourceStation.toLowerCase().includes(query.toLowerCase()) ||
      t.destinationStation.toLowerCase().includes(query.toLowerCase()) ||
      t.sourceCode.toLowerCase().includes(query.toLowerCase()) ||
      t.destCode.toLowerCase().includes(query.toLowerCase())
  );

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    // Check if matched in preset
    const match = POPULAR_TRAINS.find(
      (t) =>
        t.trainNumber === cleanQuery ||
        t.trainName.toLowerCase().includes(cleanQuery.toLowerCase())
    );

    if (match) {
      onSelectTrain(match);
    } else if (onSearchTrainNumber) {
      onSearchTrainNumber(cleanQuery);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-2xl mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search input field with autocomplete */}
        <div className="relative flex-1" ref={dropdownRef}>
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search train by number (e.g. 22436, 12951) or station (e.g. Delhi, Mumbai)..."
              className="w-full pl-11 pr-28 py-3.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition shadow-inner font-medium"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setIsOpen(false);
                }}
                className="absolute right-24 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center space-x-1"
            >
              <span>Track Train</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-800">
              {filteredTrains.length > 0 ? (
                filteredTrains.map((train) => {
                  const isCurrent = train.trainNumber === selectedTrain.trainNumber;
                  return (
                    <div
                      key={train.trainNumber}
                      onClick={() => {
                        onSelectTrain(train);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className={`p-3.5 flex items-center justify-between hover:bg-blue-600/15 cursor-pointer transition ${
                        isCurrent ? 'bg-blue-950/50 border-l-4 border-cyan-400' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400">
                          <Train className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{train.trainNumber}</span>
                            <span className="text-slate-200 font-semibold text-sm">{train.trainName}</span>
                            <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-cyan-300 font-bold">
                              {train.trainType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {train.sourceStation} ({train.sourceCode}) &rarr; {train.destinationStation} ({train.destCode})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          {train.currentStatus.speedKmH} km/h
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  onClick={() => handleSubmit()}
                  className="p-4 text-center cursor-pointer hover:bg-slate-800 text-cyan-400 text-sm font-semibold"
                >
                  Press Enter or click here to track Train #{query} in real-time
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick select chips for prominent trains */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Featured:
          </span>
          {POPULAR_TRAINS.map((train) => {
            const isSelected = train.trainNumber === selectedTrain.trainNumber;
            return (
              <button
                key={train.trainNumber}
                onClick={() => onSelectTrain(train)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm shadow-blue-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80'
                }`}
              >
                {train.trainNumber} - {train.trainName.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
