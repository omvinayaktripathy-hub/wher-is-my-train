'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MAJOR_STATIONS } from '@/data/trainData';
import { StationBoardTrain } from '@/types';
import {
  Radio,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle,
  AlertTriangle,
  Wifi,
  Loader2,
  Search,
  Sparkles,
  MapPin,
  Clock,
  Layers,
} from 'lucide-react';

export default function StationBoard() {
  const [selectedStation, setSelectedStation] = useState<string>('JSG');
  const [stationInput, setStationInput] = useState<string>('Jharsuguda Junction (JSG)');
  const [filterDirection, setFilterDirection] = useState<'All' | 'Departure' | 'Arrival'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [trains, setTrains] = useState<StationBoardTrain[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);

  // Station Autocomplete
  const [suggestions, setSuggestions] = useState<typeof MAJOR_STATIONS>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStationData = async (stationCode: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/station-board?stationCode=${stationCode}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTrains(json.data);
        setIsRealTime(true);
      } else {
        setTrains([]);
        setIsRealTime(false);
      }
    } catch {
      setTrains([]);
      setIsRealTime(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStationData(selectedStation);
  }, [selectedStation]);

  const handleInputChange = (val: string) => {
    setStationInput(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    const q = val.trim().toLowerCase();
    const matched = MAJOR_STATIONS.filter(
      (s) => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
    );
    setSuggestions(matched);
    setShowDropdown(matched.length > 0);
  };

  const handleSelectStation = (stn: (typeof MAJOR_STATIONS)[0]) => {
    setSelectedStation(stn.code);
    setStationInput(`${stn.name} (${stn.code})`);
    setShowDropdown(false);
  };

  const filteredTrains = trains.filter((t) => {
    const matchesDir = filterDirection === 'All' || t.direction === filterDirection;
    const matchesSearch =
      !searchTerm ||
      t.trainNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.trainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDir && matchesSearch;
  });

  const stationInfo = MAJOR_STATIONS.find((s) => s.code === selectedStation) || {
    code: selectedStation,
    name: selectedStation,
    state: 'Indian Railways',
  };

  const onTimeCount = trains.filter((t) => t.status === 'On Time').length;
  const onTimePercent = trains.length > 0 ? Math.round((onTimeCount / trains.length) * 100) : 95;

  const quickStations = [
    { code: 'JSG', name: 'Jharsuguda' },
    { code: 'SMVB', name: 'SMVT Bengaluru' },
    { code: 'NDLS', name: 'New Delhi' },
    { code: 'HWH', name: 'Howrah' },
    { code: 'MMCT', name: 'Mumbai' },
    { code: 'CNB', name: 'Kanpur' },
    { code: 'BSB', name: 'Varanasi' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header and Station Selector Card */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Radio className="w-6 h-6 text-cyan-400 animate-pulse" /> Live Station Display Board
              </h2>
              {isRealTime && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> REAL-TIME RTIS
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live electronic departure & arrival information system for Indian Railway terminals
            </p>
          </div>

          {/* Station Search Input with Dropdown */}
          <div ref={dropdownRef} className="relative w-full md:w-80">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={stationInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowDropdown(true);
                  }}
                  placeholder="Station code or name..."
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner placeholder-slate-500"
                />
              </div>

              <button
                type="button"
                onClick={() => loadStationData(selectedStation)}
                disabled={isRefreshing}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition flex items-center justify-center shadow-lg shadow-blue-900/30 shrink-0"
                title="Refresh Live Station Board"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Station Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-white/5">
                {suggestions.map((stn) => (
                  <div
                    key={stn.code}
                    onClick={() => handleSelectStation(stn)}
                    className="p-2.5 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-white font-bold block">{stn.name}</span>
                      <span className="text-slate-400 text-[10px]">{stn.city}, {stn.state}</span>
                    </div>
                    <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                      {stn.code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Station Select Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-4 pb-1 scrollbar-none text-xs border-t border-white/5 mt-4">
          <span className="text-slate-500 text-[11px] font-semibold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Major Hubs:
          </span>
          {quickStations.map((q) => (
            <button
              key={q.code}
              type="button"
              onClick={() => {
                setSelectedStation(q.code);
                setStationInput(`${q.name} (${q.code})`);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition shrink-0 ${
                selectedStation === q.code
                  ? 'bg-blue-600 text-white border-blue-400 font-bold shadow-md shadow-blue-600/30'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <span className="font-mono font-bold mr-1">{q.code}</span>
              <span className="text-slate-400">{q.name}</span>
            </button>
          ))}
        </div>

        {/* Station Stats Overview Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Terminal</span>
            <span className="text-white font-extrabold text-sm truncate block mt-0.5">{stationInfo.name}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Movements</span>
            <span className="text-cyan-400 font-mono font-extrabold text-sm block mt-0.5">{trains.length} Trains Listed</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">On-Time Accuracy</span>
            <span className="text-emerald-400 font-mono font-extrabold text-sm block mt-0.5">{onTimePercent}%</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Platforms</span>
            <span className="text-amber-400 font-mono font-extrabold text-sm block mt-0.5">PF 1 to 6 Active</span>
          </div>
        </div>

        {/* Direction Filter & In-Board Search */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-white/5 w-fit">
            {(['All', 'Departure', 'Arrival'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setFilterDirection(dir)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterDirection === dir
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {dir === 'All' ? 'All Movements' : `${dir}s`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by train no. or name..."
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl pl-8 pr-3 py-1.5 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Electronic Display Board Table */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-5 py-4">Train Details</th>
                <th className="px-4 py-4">Route</th>
                <th className="px-4 py-4">Scheduled</th>
                <th className="px-4 py-4">Expected</th>
                <th className="px-4 py-4 text-center">Platform</th>
                <th className="px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isRefreshing && trains.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                    <span>Loading real-time station display board...</span>
                  </td>
                </tr>
              ) : filteredTrains.length > 0 ? (
                filteredTrains.map((train, idx) => {
                  const isDeparture = train.direction === 'Departure';
                  const isLate = train.delayMinutes > 0;

                  return (
                    <tr key={`${train.trainNumber}-${idx}`} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-lg border shrink-0 ${
                              isDeparture
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {isDeparture ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-white">{train.trainNumber}</span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-slate-300">
                                {train.type}
                              </span>
                            </div>
                            <div className="font-medium text-slate-200 text-xs mt-0.5">{train.trainName}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs">
                        <div className="text-white font-medium">
                          {train.origin} &rarr; {train.destination}
                        </div>
                        <span className="text-slate-400 text-[11px] font-semibold">{train.direction}</span>
                      </td>

                      <td className="px-4 py-4 font-mono text-xs text-slate-300 font-semibold">
                        {train.scheduledTime}
                      </td>

                      <td className="px-4 py-4 font-mono text-xs font-bold">
                        <span className={isLate ? 'text-amber-400' : 'text-emerald-400'}>
                          {train.expectedTime}
                        </span>
                        {isLate && (
                          <span className="block text-[10px] text-amber-500 font-semibold font-sans">
                            +{train.delayMinutes}m Late
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-lg bg-blue-950/80 border border-cyan-500/30 font-mono font-extrabold text-cyan-400 text-sm shadow-inner">
                          PF {train.platform}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            train.status === 'Departed'
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : train.status === 'On Time'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : train.status === 'Delayed'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 animate-pulse'
                          }`}
                        >
                          {train.status === 'On Time' && <CheckCircle className="w-3 h-3" />}
                          {train.status === 'Delayed' && <AlertTriangle className="w-3 h-3" />}
                          {train.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                    No scheduled {filterDirection.toLowerCase()} movements matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
