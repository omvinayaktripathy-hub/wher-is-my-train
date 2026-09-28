'use client';

import React, { useState } from 'react';
import {
  Clock,
  Train,
  Share2,
  Bell,
  MapPin,
  RefreshCw,
  Edit2,
  ChevronDown,
  ArrowRight,
  Gauge,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { TrainDetails, StationStop } from '@/types';

interface UnifiedRouteTimelineProps {
  train: TrainDetails;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export default function UnifiedRouteTimeline({
  train,
  onRefresh,
  isRefreshing = false,
}: UnifiedRouteTimelineProps) {
  const [dayFilter, setDayFilter] = useState('All Days');
  const isDelayed = train.currentStatus.delayMinutes > 0;

  // Group stops by day
  const stopsByDay: Record<number, StationStop[]> = {};
  train.stops.forEach((stop) => {
    const day = stop.day || 1;
    if (!stopsByDay[day]) stopsByDay[day] = [];
    stopsByDay[day].push(stop);
  });

  const dayDates: Record<number, string> = {
    1: 'Day 1 (Departure Day)',
    2: 'Day 2 (En Route)',
    3: 'Day 3 (Arrival Day)',
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${train.trainNumber} - ${train.trainName}`,
        text: `Live status: Train ${train.trainNumber} is currently at ${train.currentStatus.currentStationName}, speed ${train.currentStatus.speedKmH} km/h.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Status link copied to clipboard!');
    }
  };

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden font-sans flex flex-col h-full">
      {/* Train Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 p-5 border-b border-white/10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-black text-cyan-400 text-lg sm:text-xl">
                {train.trainNumber}
              </span>
              <span className="font-extrabold text-white text-base sm:text-lg">
                {train.trainName}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
              <span className="font-semibold text-slate-200">{train.sourceStation} ({train.sourceCode})</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-slate-200">{train.destinationStation} ({train.destCode})</span>
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0 ${
              isDelayed
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isDelayed ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{train.currentStatus.delayMinutes}m Late</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>On Time</span>
              </>
            )}
          </span>
        </div>

        {/* Live Running Telemetry HUD */}
        <div className="grid grid-cols-3 gap-2.5 mt-4 p-3 rounded-2xl bg-slate-950/80 border border-white/5 text-center">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Live Velocity</span>
            <span className="font-mono font-extrabold text-cyan-400 text-sm sm:text-base">
              ⚡ {train.currentStatus.speedKmH} <span className="text-[10px] font-sans">km/h</span>
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Next Station</span>
            <span className="font-bold text-white text-xs sm:text-sm truncate block">
              {train.currentStatus.nextStationName}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">Next ETA</span>
            <span className="font-mono font-bold text-emerald-400 text-xs sm:text-sm">
              {train.currentStatus.estimatedArrivalNext}
            </span>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-white/5 text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => alert(`Alarm set for upcoming stoppage: ${train.currentStatus.nextStationName}`)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center space-x-1 border border-slate-700 transition"
            >
              <Bell className="w-3 h-3 text-cyan-400" />
              <span>Alarm</span>
            </button>
            <button
              onClick={() => alert(`Coach Arrangement:\n[Engine] [SLR] [GS] [S1] [S2] [S3] [B1] [B2] [B3] [A1] [GS] [SLR]`)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center space-x-1 border border-slate-700 transition"
            >
              <Train className="w-3 h-3 text-cyan-400" />
              <span>Coach</span>
            </button>
            <button
              onClick={handleShare}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold flex items-center space-x-1 border border-slate-700 transition"
            >
              <Share2 className="w-3 h-3 text-cyan-400" />
              <span>Share</span>
            </button>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 font-bold border border-blue-500/30 flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Subheader Column Legend */}
      <div className="bg-slate-950/90 px-4 py-2 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400 border-b border-white/5">
        <span className="w-16">Arrival</span>
        <span className="text-white text-xs">Route Timeline</span>
        <span className="w-16 text-right">Departure</span>
      </div>

      {/* Scrollable Timeline with Blue Railway Track */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 relative space-y-4 max-h-[580px]">
        {/* Continuous Solid Blue Vertical Track Line */}
        <div className="absolute left-[78px] sm:left-[86px] top-6 bottom-6 w-[4px] bg-[#0284c7] rounded-full shadow-sm z-0"></div>

        {Object.entries(stopsByDay).map(([dayStr, dayStops]) => {
          const dayNum = parseInt(dayStr, 10);

          return (
            <div key={dayNum} className="space-y-3 relative">
              {/* Day Divider */}
              <div className="flex items-center justify-center my-4 relative z-10">
                <div className="bg-slate-800/90 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-slate-300 border border-slate-700 shadow-lg">
                  {dayDates[dayNum] || `Day ${dayNum}`}
                </div>
              </div>

              {dayStops.map((stop: StationStop, idx: number) => {
                const isOrigin = idx === 0 && dayNum === 1;
                const isPassed = stop.status === 'passed';
                const isCurrent = stop.status === 'current';

                return (
                  <div
                    key={`${stop.stationCode}-${idx}`}
                    className="relative flex items-start py-2 group hover:bg-slate-800/30 rounded-2xl px-1.5 transition"
                  >
                    {/* Left: Scheduled / Actual Arrival Times */}
                    <div className="w-14 sm:w-16 text-right pr-2 shrink-0 font-mono text-xs">
                      {isOrigin ? (
                        <span className="text-slate-500 font-sans text-[11px] font-semibold">Origin</span>
                      ) : (
                        <>
                          <div className="text-slate-200 font-semibold">{stop.arrivalTime}</div>
                          <div className="text-rose-400 font-bold text-[11px]">
                            {stop.actualArrival || stop.arrivalTime}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Track Node on the Blue Line */}
                    <div className="relative z-10 flex items-center justify-center w-6 h-6 shrink-0 -ml-1 mr-3">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 border-white transition-all shadow-md ${
                          isCurrent
                            ? 'bg-cyan-400 scale-125 shadow-cyan-500 animate-pulse'
                            : isPassed
                            ? 'bg-[#0284c7]'
                            : 'bg-white'
                        }`}
                      ></div>
                    </div>

                    {/* Center: Station Name, Distance, Platform */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-sm font-bold text-white tracking-wide truncate">
                        {stop.stationName}
                      </h4>

                      <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                        <span>{stop.distanceKm} km</span>
                        <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 text-[10px] text-slate-300 font-mono">
                          <span>PF {stop.platform || '1'}</span>
                          <Edit2 className="w-2.5 h-2.5 text-slate-400" />
                        </div>
                      </div>

                      {/* Direction link for origin or current halt */}
                      {(isOrigin || isCurrent) && (
                        <div className="mt-1.5">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              stop.stationName + ' railway station'
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition text-[10px] font-semibold"
                          >
                            <span>📍 Get Directions</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Right: Scheduled / Actual Departure Times */}
                    <div className="w-14 sm:w-16 text-right shrink-0 font-mono text-xs">
                      {stop.departureTime === 'Destination' ? (
                        <span className="text-slate-500 font-sans text-[11px] font-semibold">Dest.</span>
                      ) : (
                        <>
                          <div className="text-slate-200 font-semibold">{stop.departureTime}</div>
                          <div className="text-rose-400 font-bold text-[11px]">
                            {stop.actualDeparture || stop.departureTime}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Live Tracking Status Strip */}
      <div className="bg-slate-950 px-5 py-3 border-t border-white/5 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block"></span>
            <span>{train.currentStatus.statusText}</span>
          </span>
          <span className="text-slate-500 text-[10px] block mt-0.5">{train.currentStatus.lastUpdated}</span>
        </div>

        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 font-mono font-bold text-cyan-400">
          {train.totalDistanceKm} km Total
        </span>
      </div>
    </div>
  );
}
