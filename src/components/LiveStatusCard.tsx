'use client';

import React from 'react';
import { TrainDetails, StationStop } from '@/types';
import {
  Gauge,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Radio,
  Share2,
  BellRing,
} from 'lucide-react';

interface LiveStatusCardProps {
  train: TrainDetails;
}

export default function LiveStatusCard({ train }: LiveStatusCardProps) {
  const { currentStatus, stops } = train;
  const isDelayed = currentStatus.delayMinutes > 0;

  return (
    <div className="space-y-6">
      {/* High-Level Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/60 rounded-2xl border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {train.trainNumber} - {train.trainName}
              </h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDelayed
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {isDelayed ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" /> Delayed by {currentStatus.delayMinutes} mins
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Right Time (On Schedule)
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
              <span className="font-semibold text-cyan-400">{train.sourceStation} ({train.sourceCode})</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-semibold text-cyan-400">{train.destinationStation} ({train.destCode})</span>
              <span className="text-slate-600">&bull;</span>
              <span>Runs: <strong className="text-slate-200">{train.runsOn.join(', ')}</strong></span>
              <span className="text-slate-600">&bull;</span>
              <span>Total Distance: <strong className="text-slate-200">{train.totalDistanceKm} km</strong></span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${train.trainNumber} - ${train.trainName} Live Status`,
                    text: `Train ${train.trainNumber} is currently at ${currentStatus.currentStationName}, speed ${currentStatus.speedKmH} km/h.`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Status link copied to clipboard!');
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Status</span>
            </button>
            <button
              onClick={() => alert(`Subscribed to live WhatsApp/SMS alerts for Train ${train.trainNumber}!`)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 text-xs font-medium transition"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Get Alerts</span>
            </button>
          </div>
        </div>

        {/* Live Running Description */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start space-x-3">
          <Radio className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1 text-sm">
            <p className="text-white font-medium">{currentStatus.statusText}</p>
            <p className="text-xs text-slate-400 mt-0.5">Updated: {currentStatus.lastUpdated}</p>
          </div>
        </div>

        {/* Route Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Route Progress</span>
            <span className="text-cyan-400 font-bold">{currentStatus.progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${currentStatus.progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Speedometer & Next Halt Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Speedometer Card */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl flex items-center space-x-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-cyan-400 shrink-0">
            <Gauge className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Live GPS Speed</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-3xl font-extrabold text-white tracking-tight">{currentStatus.speedKmH}</span>
              <span className="text-xs font-semibold text-cyan-400">km/h</span>
            </div>
            <p className="text-[11px] text-emerald-400 mt-1">High-Speed Corridor Active</p>
          </div>
        </div>

        {/* Next Station Card */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl flex items-center space-x-4">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
            <Navigation className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Next Halting Station</span>
            <h4 className="text-base font-bold text-white mt-0.5 line-clamp-1">{currentStatus.nextStationName}</h4>
            <p className="text-xs text-slate-300 mt-1">
              Distance: <strong className="text-cyan-400">{currentStatus.distanceToNextKm} km</strong> &bull; ETA:{' '}
              <strong className="text-emerald-400">{currentStatus.estimatedArrivalNext}</strong>
            </p>
          </div>
        </div>

        {/* Departure Station Card */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 shadow-xl flex items-center space-x-4 sm:col-span-2 lg:col-span-1">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Origin & Destination</span>
            <div className="text-xs text-slate-300 space-y-0.5 mt-1">
              <p>Dep: <span className="font-semibold text-white">{train.departureTime}</span> from {train.sourceCode}</p>
              <p>Arr: <span className="font-semibold text-white">{train.arrivalTime}</span> at {train.destCode}</p>
            </div>
            <p className="text-[11px] text-purple-300 mt-1">Duration: {train.travelDuration}</p>
          </div>
        </div>
      </div>

      {/* Complete Route & Station Halts Timeline */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-cyan-400" /> Complete Schedule & Station Halts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Scheduled vs actual arrival, platform allocation, and stoppage duration
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            {stops.length} Stoppages
          </span>
        </div>

        {/* Vertical Timeline Stepper */}
        <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {stops.map((stop: StationStop, idx: number) => {
            const isPassed = stop.status === 'passed';
            const isCurrent = stop.status === 'current';
            const isUpcoming = stop.status === 'upcoming';

            return (
              <div key={stop.stationCode} className="relative flex items-start group">
                {/* Stepper Node Indicator */}
                <div
                  className={`absolute -left-6 sm:-left-8 mt-1 flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    isPassed
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-md shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-cyan-500 border-white text-white shadow-lg shadow-cyan-500/50 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-white' : 'bg-slate-600'}`} />
                  )}
                </div>

                {/* Stop Card */}
                <div
                  className={`flex-1 rounded-xl p-4 border transition-all ${
                    isCurrent
                      ? 'bg-blue-950/40 border-cyan-500/50 shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm sm:text-base">{stop.stationName}</span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-cyan-300">
                          {stop.stationCode}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Current Location
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Distance: <strong className="text-slate-200">{stop.distanceKm} km</strong> &bull; Day {stop.day}{' '}
                        {stop.haltMinutes > 0 && `&bull; Halt: ${stop.haltMinutes} mins`}
                      </p>
                    </div>

                    {/* Platform & Arrival / Departure Times */}
                    <div className="flex items-center sm:text-right space-x-4 sm:space-x-6">
                      <div className="bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-center">
                        <span className="block text-[10px] text-slate-400 font-medium">Platform</span>
                        <span className="font-mono font-bold text-cyan-400 text-sm">{stop.platform}</span>
                      </div>

                      <div className="text-xs space-y-0.5">
                        <div className="text-slate-300">
                          <span className="text-slate-500">Arr:</span>{' '}
                          <strong className="text-white font-mono">{stop.actualArrival || stop.arrivalTime}</strong>
                        </div>
                        <div className="text-slate-300">
                          <span className="text-slate-500">Dep:</span>{' '}
                          <strong className="text-white font-mono">{stop.actualDeparture || stop.departureTime}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
