'use client';

import React, { useState, useEffect } from 'react';
import { MAJOR_STATIONS } from '@/data/trainData';
import { StationBoardTrain } from '@/types';
import { Radio, RefreshCw, ArrowDownLeft, ArrowUpRight, CheckCircle, AlertTriangle, Wifi, Loader2 } from 'lucide-react';

export default function StationBoard() {
  const [selectedStation, setSelectedStation] = useState<string>('NDLS');
  const [filterDirection, setFilterDirection] = useState<'All' | 'Departure' | 'Arrival'>('All');
  const [trains, setTrains] = useState<StationBoardTrain[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRealTime, setIsRealTime] = useState(false);

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

  const filteredTrains = trains.filter((t) => {
    if (filterDirection === 'All') return true;
    return t.direction === filterDirection;
  });

  const stationInfo = MAJOR_STATIONS.find((s) => s.code === selectedStation);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header and Station Selector */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Radio className="w-6 h-6 text-cyan-400 animate-pulse" /> Live Station Display Board
              </h2>
              {isRealTime && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> REAL-TIME LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live electronic departure & arrival information system for Indian Railway terminals
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadStationData(selectedStation);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value.toUpperCase())}
              placeholder="Type Station Code (e.g. NDLS, HTE)..."
              aria-label="Enter Railway Station Code"
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-inner placeholder-slate-500 w-56"
            />

            <button
              type="submit"
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition flex items-center justify-center shadow-lg shadow-blue-900/30"
              title="Refresh / Load Station Board"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </form>
        </div>

        {/* Station Details & Direction Filter */}
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-bold text-white text-base">{stationInfo?.name}</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 text-xs font-bold border border-blue-500/30">
              {stationInfo?.code}
            </span>
            <span className="text-slate-400 text-xs">&bull; {stationInfo?.state}</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-white/5">
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
        </div>
      </div>

      {/* Electronic Board Table */}
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
                            className={`p-2 rounded-lg border ${
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
                        <span className="inline-block px-3 py-1 rounded-lg bg-blue-950/80 border border-cyan-500/30 font-mono font-extrabold text-cyan-400 text-sm">
                          {train.platform}
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
                    No scheduled {filterDirection.toLowerCase()} movements currently listed for this station.
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
